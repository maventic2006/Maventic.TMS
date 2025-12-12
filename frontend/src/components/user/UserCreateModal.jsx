import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Label } from '../ui/Input';
import { StatusSelect } from '../ui/Select';
import { Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from '../../redux/slices/userSlice';
import { addUserRole } from '../../utils/api/users';
import { addToast } from '../../redux/slices/uiSlice';
import { TOAST_TYPES } from '../../utils/constants';
import { fetchMasterRoles } from '../../utils/api/users';
import { mapUserTypeToRole } from '../../utils/userTypes';
import { fetchUserTypes } from '../../redux/slices/userSlice';

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/;

const UserCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { userTypes } = useSelector((state) => state.user);
  const { user: authUser } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    userType: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    alternateMobile: '',
    whatsapp: '',
    fromDate: '',
    toDate: '',
    createdByUserId: authUser?.userId || authUser?.user_id || '',
    customerId: '',
    approvalCycle: '',
    password: '',
    role: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const authRole = useSelector((state) => state.auth.role);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && (!userTypes || userTypes.length === 0)) {
      // Fetch user types if not present
      dispatch(fetchUserTypes());
    }

    // Load master roles from backend and filter based on logged-in user's role
    (async () => {
      try {
        const roles = await fetchMasterRoles();
        console.debug('Fetched master roles:', roles);
        console.debug('Auth user, authRole:', authUser, authRole);
        // roles is an array of objects { role_id, role }
        let effectiveAuthRole = authRole;
        if (!effectiveAuthRole && authUser?.user_type_id) {
          // Map user_type_id to role using user_type_master mapping
          try {
            effectiveAuthRole = await mapUserTypeToRole(authUser.user_type_id);
          } catch (err) {
            console.warn('Failed to map auth user type to role:', err);
          }
        }
        const auth = (effectiveAuthRole || '').toLowerCase();
        const filtered = (roles || []).filter((r) => {
          const name = (r.role || '').toLowerCase();
          if (!auth) return true; // no auth role, show all
          if (auth === 'product_owner') {
            return !name.includes('admin');
          }
          if (auth === 'consignor') {
            // show only Consignor roles (excluding admin)
            return name.startsWith('consignor') && !name.includes('admin');
          }
          if (auth === 'transporter') {
            return name.startsWith('transporter');
          }
          // default: hide admin roles
          return !name.includes('admin');
        });
        setAvailableRoles(filtered);
        console.debug('Available roles after filtering:', filtered);
      } catch (err) {
        console.error('Error fetching roles', err);
        dispatch(addToast({ type: TOAST_TYPES.ERROR, message: 'Failed to load roles' }));
      }
    })();
  }, [isOpen, userTypes, dispatch, authRole]);

  useEffect(() => {
    // Reset when opening
    if (isOpen) {
      setForm((f) => ({ ...f, createdByUserId: authUser?.userId || authUser?.user_id || '' }));
      setErrors({});
    }
  }, [isOpen, authUser]);

  const isConsignorType = useMemo(() => {
    const t = userTypes?.find((ut) => ut.user_type_id === form.userType);
    const name = t?.user_type_name?.toLowerCase() || '';
    return name.includes('consignor');
  }, [form.userType, userTypes]);

  const validate = () => {
    const err = {};
    if (!form.userType) err.userType = 'User type is required';
    if (!form.firstName) err.firstName = 'First name is required';
    if (!form.lastName) err.lastName = 'Last name is required';
    if (!form.email) err.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = 'Invalid email';
    if (!form.mobile) err.mobile = 'Mobile number is required';
    else if (!/^\d{10}$/.test(form.mobile)) err.mobile = 'Mobile number must be 10 digits';
    if (form.alternateMobile && !/^\d{10}$/.test(form.alternateMobile)) err.alternateMobile = 'Alternate mobile must be 10 digits';
    if (form.whatsapp && !/^\d{10}$/.test(form.whatsapp)) err.whatsapp = 'WhatsApp number must be 10 digits';
    if (isConsignorType && !form.customerId) err.customerId = 'Customer ID is required for Consignor users';
    if (!form.password) err.password = 'Password is required';
    else if (!PASSWORD_REGEX.test(form.password)) err.password = 'Password must be at least 8 characters, include a digit and special character';

    if (!form.role) err.role = 'Role is required';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // Help format date from yyyy-mm-dd to dd-mm-yyyy (backend expects dd-mm-yyyy)
  const formatToDDMMYYYY = (val) => {
    if (!val) return val;
    const [y, m, d] = val.split('-');
    return `${d}-${m}-${y}`;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Build create user payload that backend expects
      const payload = {
        userType: form.userType,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        mobile: form.mobile,
        alternateMobile: form.alternateMobile,
        whatsapp: form.whatsapp,
        fromDate: formatToDDMMYYYY(form.fromDate),
        toDate: formatToDDMMYYYY(form.toDate),
        active: true,
        createdByUserId: form.createdByUserId,
        customerId: form.customerId || undefined,
        approvalCycle: form.approvalCycle || undefined,
        password: form.password,
      };

      const result = await dispatch(createUser(payload)).unwrap();
      const createdUserId = result?.data?.userId || result?.userId || result?.data?.id;

      // If role selected, call addUserRole
      if (form.role) {
        try {
          // Map role to roleName as string if it's one from availableRoles
          const rolePayload = {
            role: form.role,
          };
          await addUserRole(createdUserId, rolePayload);
        } catch (err) {
          // Show toast but proceed
          console.error('Error assigning role', err);
          dispatch(addToast({ type: TOAST_TYPES.ERROR, message: 'User created but failed to assign role' }));
          // We don't return; allow user creation succeeded
        }
      }

      dispatch(addToast({ type: TOAST_TYPES.SUCCESS, message: 'User created successfully' }));

      setForm({
        userType: '',
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        alternateMobile: '',
        whatsapp: '',
        fromDate: '',
        toDate: '',
        createdByUserId: authUser?.userId || authUser?.user_id || '',
        customerId: '',
        approvalCycle: '',
        password: '',
        role: '',
      });

      if (onSuccess) onSuccess(result);
      onClose();
    } catch (error) {
      console.error('Error creating user', error);
      dispatch(addToast({ type: TOAST_TYPES.ERROR, message: error?.message || 'Failed to create user' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New User" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>User Type</Label>
            <StatusSelect
              value={form.userType}
              onChange={(value) => setForm((s) => ({ ...s, userType: value }))}
              options={[{ value: '', label: 'Select user type' }, ...(userTypes || []).map((ut) => ({ value: ut.user_type_id, label: ut.user_type_name }))]}
            />
            {errors.userType && <p className="text-red-600 text-xs mt-1">{errors.userType}</p>}
          </div>

          <div>
            <Label>Role</Label>
            <select
              value={form.role}
              onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
              className="w-full px-3 py-2 rounded border"
            >
              <option value="">Select a role</option>
              {availableRoles.map((r) => (
                <option key={r.role_id} value={r.role}>{r.role}</option>
              ))}
            </select>
            {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
          </div>

          <div>
            <Label>First Name</Label>
            <Input value={form.firstName} onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))} />
            {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <Label>Last Name</Label>
            <Input value={form.lastName} onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))} />
            {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label>Mobile Number</Label>
            <Input value={form.mobile} onChange={(e) => setForm((s) => ({ ...s, mobile: e.target.value }))} />
            {errors.mobile && <p className="text-red-600 text-xs mt-1">{errors.mobile}</p>}
          </div>

          <div>
            <Label>Alternate Mobile</Label>
            <Input value={form.alternateMobile} onChange={(e) => setForm((s) => ({ ...s, alternateMobile: e.target.value }))} />
            {errors.alternateMobile && <p className="text-red-600 text-xs mt-1">{errors.alternateMobile}</p>}
          </div>

          <div>
            <Label>WhatsApp Number</Label>
            <Input value={form.whatsapp} onChange={(e) => setForm((s) => ({ ...s, whatsapp: e.target.value }))} />
            {errors.whatsapp && <p className="text-red-600 text-xs mt-1">{errors.whatsapp}</p>}
          </div>

          <div>
            <Label>From Date</Label>
            <Input type="date" value={form.fromDate} onChange={(e) => setForm((s) => ({ ...s, fromDate: e.target.value }))} />
          </div>

          <div>
            <Label>To Date</Label>
            <Input type="date" value={form.toDate} onChange={(e) => setForm((s) => ({ ...s, toDate: e.target.value }))} />
          </div>

          <div>
            <Label>Customer ID</Label>
            <Input value={form.customerId} onChange={(e) => setForm((s) => ({ ...s, customerId: e.target.value }))} />
            {errors.customerId && <p className="text-red-600 text-xs mt-1">{errors.customerId}</p>}
          </div>

          <div>
            <Label>Approval Cycle</Label>
            <Input value={form.approvalCycle} onChange={(e) => setForm((s) => ({ ...s, approvalCycle: e.target.value }))} />
          </div>

          <div>
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} />
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <Label>Created By User ID</Label>
            <Input value={form.createdByUserId} disabled />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              'Create User'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UserCreateModal;
