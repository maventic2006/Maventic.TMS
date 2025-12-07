import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { getPageTheme } from "../../theme.config";
import { CustomSelect } from "../../components/ui/Select";
import {
  createAlert,
  updateAlert,
  fetchAlerts,
  fetchHdrById,
} from "../../redux/slices/transporterVehicleConfigSlice";

const AlertFormModal = ({ isOpen, onClose, hdrId, editData = null }) => {
  const dispatch = useDispatch();
  const theme = getPageTheme("general");

  const { users, loading } = useSelector(
    (state) => state.transporterVehicleConfig
  );

  const [formData, setFormData] = useState({
    user_id: "",
    mobile_number: "",
    email_id: "",
    alert_type: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        user_id: editData.user_id || "",
        mobile_number: editData.mobile_number || "",
        email_id: editData.email_id || "",
        alert_type: editData.alert_type || "",
        status: editData.status || "active",
      });
    } else {
      setFormData({
        user_id: "",
        mobile_number: "",
        email_id: "",
        alert_type: "",
        status: "active",
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.alert_type) newErrors.alert_type = "Alert type is required";
    if (!formData.mobile_number && !formData.email_id) {
      newErrors.mobile_number = "Either mobile or email is required";
      newErrors.email_id = "Either mobile or email is required";
    }

    if (
      formData.email_id &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_id)
    ) {
      newErrors.email_id = "Invalid email format";
    }

    if (formData.mobile_number && !/^\d{10,15}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = "Invalid mobile number (10-15 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editData) {
        await dispatch(
          updateAlert({
            hdrId,
            alertId: editData.transporter_alert_itm_id,
            data: formData,
          })
        ).unwrap();
      } else {
        await dispatch(
          createAlert({
            hdrId,
            data: formData,
          })
        ).unwrap();
      }

      // Refresh alerts
      dispatch(fetchHdrById(hdrId));

      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors({ submit: error || "Failed to save alert" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="rounded-lg w-full max-w-lg"
        style={{
          backgroundColor: theme.colors.card.background,
          padding: theme.layout.card.padding,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-bold"
            style={{ color: theme.colors.text.primary }}
          >
            {editData ? "Edit Alert" : "Add New Alert"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-opacity-10"
            style={{
              color: theme.colors.text.secondary,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = `${theme.colors.text.secondary}20`)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Alert Type */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.text.secondary }}
              >
                Alert Type <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={formData.alert_type}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, alert_type: value }));
                  if (errors.alert_type) {
                    setErrors((prev) => ({ ...prev, alert_type: null }));
                  }
                }}
                options={[
                  { label: "SMS", value: "SMS" },
                  { label: "Email", value: "Email" },
                  { label: "Both (SMS & Email)", value: "Both" },
                  { label: "Push Notification", value: "Push" },
                ]}
                placeholder="Select Alert Type"
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                className="w-full text-sm"
                error={errors.alert_type}
              />
              {errors.alert_type && (
                <p
                  className="text-xs mt-1"
                  style={{ color: theme.colors.status.error.text }}
                >
                  {errors.alert_type}
                </p>
              )}
            </div>

            {/* User Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.text.secondary }}
              >
                User
              </label>
              <CustomSelect
                value={formData.user_id}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, user_id: value }));
                }}
                options={users || []}
                placeholder="Select User (Optional)"
                getOptionLabel={(option) => option.user_name || "Unknown"}
                getOptionValue={(option) => option.user_id}
                className="w-full text-sm"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.text.secondary }}
              >
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.mobile_number
                    ? theme.colors.status.error.border
                    : theme.colors.input.border.default,
                  backgroundColor: theme.colors.input.background,
                }}
                placeholder="Enter mobile number"
              />
              {errors.mobile_number && (
                <p
                  className="text-xs mt-1"
                  style={{ color: theme.colors.status.error.text }}
                >
                  {errors.mobile_number}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.text.secondary }}
              >
                Email
              </label>
              <input
                type="email"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.email_id
                    ? theme.colors.status.error.border
                    : theme.colors.input.border.default,
                  backgroundColor: theme.colors.input.background,
                }}
                placeholder="Enter email address"
              />
              {errors.email_id && (
                <p
                  className="text-xs mt-1"
                  style={{ color: theme.colors.status.error.text }}
                >
                  {errors.email_id}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.text.secondary }}
              >
                Status
              </label>
              <CustomSelect
                value={formData.status}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, status: value }));
                }}
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                placeholder="Select Status"
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                className="w-full text-sm"
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div
                className="p-3 rounded text-sm"
                style={{
                  backgroundColor: theme.colors.status.error.background,
                  color: theme.colors.status.error.text,
                }}
              >
                {errors.submit}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded font-medium"
              style={{
                backgroundColor: theme.colors.button.secondary.background,
                borderColor: theme.colors.button.secondary.border,
                color: theme.colors.button.secondary.text,
                border: `1px solid ${theme.colors.button.secondary.border}`,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded font-medium"
              style={{
                backgroundColor: theme.colors.button.primary.background,
                color: theme.colors.button.primary.text,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Saving..." : editData ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertFormModal;
