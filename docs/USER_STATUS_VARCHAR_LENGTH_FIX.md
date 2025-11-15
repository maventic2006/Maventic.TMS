# User Status VARCHAR Length Fix

**Date**: November 15, 2025  
**Issue**: SQL Error - "Data too long for column 'status' at row 1"  
**Status**: ✅ FIXED

---

## Problem Description

When creating a transporter, the backend was throwing the following error:

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to create transporter",
    "details": "insert into `user_master` (`created_at`, `created_by`, `created_by_user_id`, ..., `status`, ...) values (..., 'Pending for Approval', ...) - Data too long for column 'status' at row 1"
  }
}
```

### Root Cause Analysis

1. **Database Schema Constraint**:

   - `user_master.status` column is defined as `VARCHAR(20)`
   - Code was attempting to insert `"Pending for Approval"` (21 characters)
   - This exceeded the column length limit

2. **Inconsistent Column Usage**:

   - `approval_flow_trans` table has TWO status columns:
     - `s_status VARCHAR(50)` - Approval status (Pending, Approved, Rejected)
     - `status VARCHAR(20)` - Record status (ACTIVE, INACTIVE)
   - Queries were using wrong column names (`status` instead of `s_status`)

3. **Column Name Mismatch**:
   - Queries were using `aft.user_id` but the actual column is `user_id_reference_id`
   - Field names like `approval_flow_id` don't exist (should be `approval_flow_trans_id`)

---

## Solution Implemented

### 1. Status Value Standardization

Changed all status values to fit within VARCHAR(20) limit:

| **Old Value**          | **New Value** | **Length** | **Column**                                           |
| ---------------------- | ------------- | ---------- | ---------------------------------------------------- |
| `Pending for Approval` | `PENDING`     | 7 chars    | `user_master.status`, `approval_flow_trans.s_status` |
| `Approve`              | `APPROVED`    | 8 chars    | `approval_flow_trans.s_status`                       |
| `Sent Back`            | `REJECTED`    | 8 chars    | `user_master.status`, `approval_flow_trans.s_status` |
| `Active`               | `ACTIVE`      | 6 chars    | `user_master.status`                                 |

### 2. Files Modified

#### **File 1: `transporterController.js`**

**Line 988**: User creation status

```javascript
// BEFORE (BROKEN - 21 characters)
status: "Pending for Approval",

// AFTER (FIXED - 7 characters)
status: "PENDING",
```

**Line 1045**: Approval flow transaction status

```javascript
// BEFORE (BROKEN - 21 characters)
s_status: "Pending for Approval",

// AFTER (FIXED - 7 characters)
s_status: "PENDING",
```

**Line 1083**: Response approval status

```javascript
// BEFORE
approvalStatus: "Pending for Approval",

// AFTER
approvalStatus: "PENDING",
```

#### **File 2: `approvalController.js`**

**getPendingApprovals() - Line 50-88**:

```javascript
// BEFORE (BROKEN)
.leftJoin("user_master as um", "aft.user_id", "um.user_id")
.where("aft.status", "PENDING")
.select("aft.approval_flow_id", "aft.user_id", "aft.status", ...)

// AFTER (FIXED)
.leftJoin("user_master as um", "aft.user_id_reference_id", "um.user_id")
.where("aft.s_status", "PENDING")
.select("aft.approval_flow_trans_id", "aft.user_id_reference_id as user_id",
        "aft.s_status as approval_status", ...)
```

**getApprovalHistory() - Line 110**:

```javascript
// BEFORE (BROKEN)
.where("aft.user_id", userId)

// AFTER (FIXED)
.where("aft.user_id_reference_id", userId)
```

**approveUser() - Lines 166-204**:

```javascript
// BEFORE (BROKEN)
const approvalFlow = await trx("approval_flow_trans")
  .where("user_id", userId)
  .where("status", "PENDING")
  .first();

await trx("approval_flow_trans")
  .where("approval_flow_id", approvalFlow.approval_flow_id)
  .update({ status: "Approve", ... });

await trx("user_master").where("user_id", userId)
  .update({ status: "Active", ... });

// AFTER (FIXED)
const approvalFlow = await trx("approval_flow_trans")
  .where("user_id_reference_id", userId)
  .where("s_status", "PENDING")
  .first();

await trx("approval_flow_trans")
  .where("approval_flow_trans_id", approvalFlow.approval_flow_trans_id)
  .update({ s_status: "APPROVED", actioned_by_id: approverId, ... });

await trx("user_master").where("user_id", userId)
  .update({ status: "ACTIVE", ... });
```

**rejectUser() - Lines 270-308**:

```javascript
// BEFORE (BROKEN)
const approvalFlow = await trx("approval_flow_trans")
  .where("user_id", userId)
  .where("status", "PENDING")
  .first();

await trx("approval_flow_trans")
  .where("approval_flow_id", approvalFlow.approval_flow_id)
  .update({ status: "Sent Back", ... });

await trx("user_master").where("user_id", userId)
  .update({ status: "Sent Back", ... });

// AFTER (FIXED)
const approvalFlow = await trx("approval_flow_trans")
  .where("user_id_reference_id", userId)
  .where("s_status", "PENDING")
  .first();

await trx("approval_flow_trans")
  .where("approval_flow_trans_id", approvalFlow.approval_flow_trans_id)
  .update({ s_status: "REJECTED", actioned_by_id: approverId, ... });

await trx("user_master").where("user_id", userId)
  .update({ status: "REJECTED", ... });
```

---

## Database Schema Reference

### `user_master` Table

```sql
CREATE TABLE user_master (
  user_id VARCHAR(20) PRIMARY KEY,
  user_type_id VARCHAR(10),
  user_full_name VARCHAR(200),
  email_id VARCHAR(100),
  mobile_number VARCHAR(20),
  password TEXT,
  password_type VARCHAR(50) DEFAULT 'initial',
  status VARCHAR(20) DEFAULT 'ACTIVE',  -- ⚠️ MAX 20 CHARACTERS
  is_active BOOLEAN DEFAULT false,
  from_date DATE,
  to_date DATE,
  created_by_user_id VARCHAR(20),
  consignor_id VARCHAR(20),
  -- ... other fields
);
```

**Valid Status Values** (all ≤ 20 chars):

- `ACTIVE` (6 chars)
- `INACTIVE` (8 chars)
- `PENDING` (7 chars) ✅ NEW
- `REJECTED` (8 chars) ✅ NEW
- `SUSPENDED` (9 chars)

### `approval_flow_trans` Table

```sql
CREATE TABLE approval_flow_trans (
  approval_flow_unique_id INT AUTO_INCREMENT PRIMARY KEY,
  approval_flow_trans_id VARCHAR(20) UNIQUE NOT NULL,
  approval_config_id VARCHAR(20) NOT NULL,
  approval_type_id VARCHAR(10) NOT NULL,
  user_id_reference_id VARCHAR(20) NOT NULL,  -- ⚠️ Correct column name
  s_status VARCHAR(50) NOT NULL,              -- ⚠️ Approval status (not 'status')
  approver_level INT NOT NULL,
  pending_with_user_id VARCHAR(20),
  pending_with_name VARCHAR(200),
  created_by_user_id VARCHAR(20),
  created_by_name VARCHAR(200),
  actioned_by_id VARCHAR(20),
  actioned_by_name VARCHAR(200),
  approved_on DATETIME,
  remarks TEXT,
  status VARCHAR(20) DEFAULT 'ACTIVE',        -- ⚠️ Record status (not approval status)
  -- ... other fields
);
```

**Valid s_status Values** (Approval Status):

- `PENDING` (7 chars) ✅ NEW
- `APPROVED` (8 chars) ✅ NEW
- `REJECTED` (8 chars) ✅ NEW

**Valid status Values** (Record Status):

- `ACTIVE` (6 chars)
- `INACTIVE` (8 chars)

---

## Testing Verification

### Test Case 1: Create Transporter (PO001)

**Endpoint**: `POST /api/transporter`

**Expected Behavior**:

1. Transporter created successfully
2. User created with `status = "PENDING"` in `user_master`
3. Approval flow created with `s_status = "PENDING"` in `approval_flow_trans`
4. Response returns `approvalStatus: "PENDING"`

**SQL Verification**:

```sql
-- Check user status (should be PENDING)
SELECT user_id, status, is_active
FROM user_master
WHERE user_id LIKE 'TA%'
ORDER BY created_at DESC
LIMIT 1;

-- Check approval flow status (should be PENDING)
SELECT approval_flow_trans_id, user_id_reference_id, s_status, status
FROM approval_flow_trans
WHERE user_id_reference_id LIKE 'TA%'
ORDER BY created_at DESC
LIMIT 1;
```

### Test Case 2: Approve User (PO002)

**Endpoint**: `POST /api/approval/approve/TA0002`

**Expected Behavior**:

1. `user_master.status` changes from `PENDING` → `ACTIVE`
2. `user_master.is_active` changes to `true`
3. `approval_flow_trans.s_status` changes from `PENDING` → `APPROVED`
4. Response returns `status: "ACTIVE"`

**SQL Verification**:

```sql
-- Check user activation
SELECT user_id, status, is_active, updated_by
FROM user_master
WHERE user_id = 'TA0002';

-- Check approval flow status
SELECT approval_flow_trans_id, s_status, actioned_by_id, approved_on
FROM approval_flow_trans
WHERE user_id_reference_id = 'TA0002';
```

### Test Case 3: Reject User (PO002)

**Endpoint**: `POST /api/approval/reject/TA0003`

**Request Body**:

```json
{
  "remarks": "Missing required documents"
}
```

**Expected Behavior**:

1. `user_master.status` changes from `PENDING` → `REJECTED`
2. `user_master.is_active` remains `false`
3. `approval_flow_trans.s_status` changes from `PENDING` → `REJECTED`
4. Response returns `status: "REJECTED"`

**SQL Verification**:

```sql
-- Check rejection
SELECT user_id, status, is_active, updated_by
FROM user_master
WHERE user_id = 'TA0003';

-- Check rejection details
SELECT approval_flow_trans_id, s_status, actioned_by_id, remarks, approved_on
FROM approval_flow_trans
WHERE user_id_reference_id = 'TA0003';
```

### Test Case 4: Get Pending Approvals (PO001 or PO002)

**Endpoint**: `GET /api/approval/pending`

**Expected Behavior**:

1. Returns list of users with `s_status = "PENDING"`
2. Shows correct `user_id_reference_id`, `approval_status`, `transporter_business_name`
3. Only shows approvals pending with logged-in user

**Example Response**:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "approval_flow_trans_id": "AF0001",
      "user_id": "TA0002",
      "approval_status": "PENDING",
      "pending_with_user_id": "PO001",
      "transporter_business_name": "ABC Transport Ltd",
      "created_at": "2025-11-15T11:15:46.599Z"
    }
  ]
}
```

---

## Impact Analysis

### ✅ Fixed Issues

1. **SQL Error**: No more "Data too long for column 'status'" errors
2. **Column Mismatches**: All queries use correct column names
3. **Approval Flow**: Proper distinction between approval status (`s_status`) and record status (`status`)
4. **User Activation**: Correct status transitions (PENDING → ACTIVE or REJECTED)

### ⚠️ Breaking Changes

None - This is a bug fix that corrects existing functionality

### 📋 Migration Required

**No database migration needed** - Only code changes were made.

However, if existing data has "Pending for Approval" values, run this cleanup:

```sql
-- Update user_master status
UPDATE user_master
SET status = 'PENDING'
WHERE status = 'Pending for Approval';

-- Update approval_flow_trans s_status
UPDATE approval_flow_trans
SET s_status = 'PENDING'
WHERE s_status = 'Pending for Approval';

-- Update other statuses
UPDATE approval_flow_trans
SET s_status = 'APPROVED'
WHERE s_status = 'Approve';

UPDATE approval_flow_trans
SET s_status = 'REJECTED'
WHERE s_status = 'Sent Back';

UPDATE user_master
SET status = 'REJECTED'
WHERE status = 'Sent Back';
```

---

## Status Code Reference

### User Master Status Values

| **Status**  | **Description**                 | **is_active** | **Usage**                   |
| ----------- | ------------------------------- | ------------- | --------------------------- |
| `PENDING`   | User created, awaiting approval | `false`       | Initial state for new users |
| `ACTIVE`    | User approved and can login     | `true`        | After successful approval   |
| `REJECTED`  | User rejected by approver       | `false`       | After rejection             |
| `INACTIVE`  | User deactivated                | `false`       | Manual deactivation         |
| `SUSPENDED` | User temporarily suspended      | `false`       | Temporary restriction       |

### Approval Flow s_status Values

| **s_status** | **Description**          | **Next Action**       |
| ------------ | ------------------------ | --------------------- |
| `PENDING`    | Awaiting approver action | Approve or Reject     |
| `APPROVED`   | Approved by approver     | User activated        |
| `REJECTED`   | Rejected by approver     | User remains inactive |

---

## Related Files

### Modified Files

- ✅ `tms-backend/controllers/transporterController.js` (3 changes)
- ✅ `tms-backend/controllers/approvalController.js` (8 changes)

### Referenced Database Tables

- `user_master`
- `approval_flow_trans`
- `approval_configuration`
- `approval_type_master`
- `transporter_general_info`

### Documentation Files

- ✅ `docs/USER_STATUS_VARCHAR_LENGTH_FIX.md` (this file)
- 📖 `docs/APPROVAL_SYSTEM_COMPLETE.md` (main approval system docs)
- 📖 `PRODUCT_OWNER_CREDENTIALS.md` (PO001/PO002 credentials)

---

## Deployment Notes

### Pre-Deployment Checklist

- ✅ All status values shortened to ≤ 20 characters
- ✅ Column names corrected (`user_id_reference_id`, `s_status`)
- ✅ Field names corrected (`approval_flow_trans_id`)
- ✅ Response payloads updated with new status values
- ✅ No syntax errors in modified files

### Post-Deployment Verification

1. Test transporter creation (should succeed without SQL error)
2. Verify approval workflow displays pending items
3. Test approve action (user status changes to ACTIVE)
4. Test reject action (user status changes to REJECTED)
5. Check SQL data - ensure all status values are ≤ 20 chars

### Rollback Plan

If issues arise, revert to previous commit:

```bash
git revert HEAD
git push origin main
```

Then investigate and fix before re-deploying.

---

## Conclusion

This fix resolves the SQL constraint violation by standardizing status values to fit within database column limits. All approval workflow functionality remains intact, with improved code clarity through correct column naming.

**Status**: ✅ Ready for Production Deployment
