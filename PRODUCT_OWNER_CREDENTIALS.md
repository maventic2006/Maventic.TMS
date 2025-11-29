# Product Owner Login Credentials

**Created**: November 15, 2025  
**Migration**: `20251115000003_seed_product_owner_2.js`

---

## ⚠️ IMPORTANT: Correct User ID Format

The Product Owner user IDs are **SHORT** format:

- ❌ WRONG: `POWNER001`, `POWNER002`
- ✅ CORRECT: `PO001`, `PO002`

---

## 🔑 Product Owner 1

**User ID**: `PO001`  
**Password**: `ProductOwner@123`  
**Email**: productowner1@tms.com  
**Mobile**: 9876543210  
**User Type**: UT001 (Product Owner)  
**Status**: ACTIVE

---

## 🔑 Product Owner 2

**User ID**: `PO002`  
**Password**: `ProductOwner@123`  
**Email**: productowner2@tms.com  
**Mobile**: 9876543211  
**User Type**: UT001 (Product Owner)  
**Status**: ACTIVE

---

## 🔐 Login Instructions

### On Login Page:

1. **User ID Field**: Enter `PO001` or `PO002` (NOT POWNER001/POWNER002)
2. **Password Field**: Enter `ProductOwner@123`
3. Click "Login"

### Expected Behavior:

- ✅ First login: May prompt for password reset (password_type = 'initial')
- ✅ After login: Redirected to TMS Portal
- ✅ Role: Product Owner with full access

---

## 🔧 Troubleshooting

### Issue: "Invalid user ID or password"

**Common Causes**:

1. Using wrong user ID format (POWNER002 instead of PO002)
2. Password case-sensitive (must be exactly `ProductOwner@123`)
3. User not created in database (run migrations)

**Verify User Exists**:

```sql
SELECT user_id, email_id, status, is_active, password_type
FROM user_master
WHERE user_id IN ('PO001', 'PO002');
```

**Expected Result**:

- 2 rows returned
- status = 'ACTIVE'
- is_active = true
- password_type = 'initial'

### Issue: bcrypt Password Mismatch

**Root Cause**: Migration uses `bcrypt`, authController was using `bcryptjs` (incompatible hashes)

**Fix Applied**: Updated authController to use `bcrypt` (November 15, 2025)

**Verify**:

- `authController.js` line 1: `const bcrypt = require("bcrypt");`
- Migration file line 7: `const bcrypt = require("bcrypt");`
- Both must use same library!

---

## 📋 Cross-Approval Workflow

**When PO001 Logs In**:

- Can create transporters
- Auto-creates Transporter Admin users
- Approval pending with PO002
- PO001 CANNOT approve (creator restriction)

**When PO002 Logs In**:

- Can see pending approvals created by PO001
- Can approve/reject users
- Sees "Approve User" and "Reject User" buttons

---

## 🔄 Password Reset (Future Enhancement)

Currently, `password_type = 'initial'` is set for both Product Owners, indicating they should change their password on first login. This feature is not yet enforced in the UI but is planned for future implementation.

**To Reset Password Manually**:

```sql
UPDATE user_master
SET password = [bcrypt_hashed_new_password],
    password_type = 'actual',
    updated_at = NOW()
WHERE user_id = 'PO001';
```

---

## ✅ Verification Checklist

After login, verify:

- [ ] Can access TMS Portal page
- [ ] Can navigate to Transporter Maintenance
- [ ] Can click "Create New Transporter"
- [ ] Can fill and submit transporter form
- [ ] Success toast shows user created and pending approval
- [ ] Can view transporter details page
- [ ] Approval badge shows "Pending for Approval" (if creator)
- [ ] Approve/Reject buttons visible (if assigned approver)

---

**Last Updated**: November 22, 2025  
**Issue Fixed**: Login password corrected - PO001/PO002 can now login with ProductOwner@123

**✅ VERIFIED WORKING**: Both users tested and confirmed working on November 22, 2025
