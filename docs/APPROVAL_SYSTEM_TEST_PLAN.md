# TMS Approval System - Test Plan

**Test Date**: November 15, 2025  
**Module**: Transporter Admin User Approval  
**Approval Levels**: Level 1 (Product Owner Cross-Approval)

---

## Test Prerequisites

### 1. Database Setup

- [ ] Migrations executed successfully:
  - `20251115000002_update_approval_system_additive.js`
  - `20251115000003_seed_product_owner_2.js`
- [ ] Product Owner users exist:
  - PO001: productowner1@tms.com / ProductOwner@123
  - PO002: productowner2@tms.com / ProductOwner@123
- [ ] Approval configuration exists: AC0001 (Level 1, Product Owner role)

### 2. Backend Server

- [ ] Backend server running on http://localhost:3000
- [ ] All approval routes registered in server.js
- [ ] Authentication middleware working

### 3. Frontend Application

- [ ] Frontend running on http://localhost:5173
- [ ] Redux store includes `approvalSlice`
- [ ] No console errors on page load

---

## Test Scenarios

### Scenario 1: Create Transporter as PO1 - User Auto-Creation

**Objective**: Verify that creating a transporter automatically creates a Transporter Admin user with "Pending for Approval" status.

**Steps**:

1. Login as Product Owner 1 (PO001 / ProductOwner@123)
2. Navigate to Transporter Maintenance page
3. Click "Create New Transporter"
4. Fill in transporter details:
   - Business Name: "Test Logistics Pvt Ltd"
   - Primary Address with email and mobile
   - At least one serviceable area
   - At least one document
5. Click "Create Transporter"

**Expected Results**:

- [ ] Transporter created successfully
- [ ] Success toast shows: "Transporter created successfully. Transporter Admin user created and pending approval."
- [ ] Response includes:
  - `userId`: TA0001 (or next available)
  - `userEmail`: From primary address
  - `initialPassword`: BusinessName@#### format
  - `approvalStatus`: "Pending for Approval"
  - `pendingWith`: "Product Owner 2"

**Database Verification**:

```sql
-- Check transporter creation
SELECT * FROM transporter_general_info WHERE business_name = 'Test Logistics Pvt Ltd';

-- Check user creation
SELECT * FROM user_master WHERE user_id LIKE 'TA%' ORDER BY created_at DESC LIMIT 1;
-- Expected: status = 'Pending for Approval', is_active = false

-- Check approval flow
SELECT * FROM approval_flow_trans WHERE user_id = [TA ID from above];
-- Expected: status = 'Pending for Approval', pending_with_user_id = 'PO002'
```

---

### Scenario 2: View Transporter Details as PO1 (Creator)

**Objective**: Verify that creator (PO1) sees approval status but NO approval action buttons.

**Steps**:

1. Still logged in as PO001
2. Navigate to Transporter Maintenance
3. Click on the newly created transporter

**Expected Results**:

- [ ] Transporter Details page loads
- [ ] Top header shows:
  - Yellow "Pending Approval" badge with Clock icon
  - Text: "Pending with: Product Owner 2"
  - NO "Approve User" button visible
  - NO "Reject User" button visible
  - "Edit Details" button visible

**Screenshot Checkpoint**: Capture approval bar showing pending status (creator view)

---

### Scenario 3: View Transporter Details as PO2 (Assigned Approver)

**Objective**: Verify that assigned approver (PO2) sees approval status AND action buttons.

**Steps**:

1. Logout from PO001
2. Login as Product Owner 2 (PO002 / ProductOwner@123)
3. Navigate to Transporter Maintenance
4. Click on the same transporter created by PO1

**Expected Results**:

- [ ] Transporter Details page loads
- [ ] Top header shows:
  - Yellow "Pending Approval" badge with Clock icon
  - Text: "Pending with: Product Owner 2"
  - Green "Approve User" button visible
  - Red "Reject User" button visible
  - "Edit Details" button visible

**Screenshot Checkpoint**: Capture approval bar with action buttons (approver view)

---

### Scenario 4: Approve User as PO2

**Objective**: Verify that approving a user changes status to "Active" and enables login.

**Steps**:

1. Still on Transporter Details page as PO002
2. Click "Approve User" button
3. Wait for processing

**Expected Results**:

- [ ] Loading spinner appears on button ("Approving...")
- [ ] Success toast: "User approved successfully"
- [ ] Page refreshes automatically
- [ ] Approval bar updates:
  - Badge changes to green "Approved" with CheckCircle icon
  - "Pending with" text disappears
  - Approve/Reject buttons disappear

**Database Verification**:

```sql
-- Check user status
SELECT user_id, status, is_active FROM user_master WHERE user_id = [TA ID];
-- Expected: status = 'Active', is_active = true

-- Check approval flow
SELECT status, approved_rejected_by, approved_rejected_at, remarks
FROM approval_flow_trans WHERE user_id = [TA ID];
-- Expected: status = 'Approve', approved_rejected_by = 'PO002', approved_rejected_at = [timestamp]
```

**Screenshot Checkpoint**: Capture green "Approved" badge after approval

---

### Scenario 5: Reject User - Validation Check

**Objective**: Verify that rejection requires mandatory remarks.

**Preparation**:

1. Create another transporter as PO001 (to generate new pending user)
2. Login as PO002
3. Open new transporter details

**Steps**:

1. Click "Reject User" button
2. Rejection modal opens
3. Leave remarks field empty
4. Click "Confirm Rejection"

**Expected Results**:

- [ ] Rejection modal opens with:
  - Red gradient header: "Reject User Approval"
  - Textarea for remarks (empty)
  - "Cancel" and "Confirm Rejection" buttons
- [ ] Error toast: "Remarks are required when rejecting a user"
- [ ] Modal remains open
- [ ] Rejection not submitted

**Screenshot Checkpoint**: Capture rejection modal with validation error

---

### Scenario 6: Reject User - With Remarks

**Objective**: Verify that rejection with remarks changes status to "Sent Back".

**Steps**:

1. Click "Reject User" button again
2. Enter remarks: "Incomplete documentation. Please resubmit with valid PAN card."
3. Click "Confirm Rejection"

**Expected Results**:

- [ ] Loading state shows: "Rejecting..."
- [ ] Success toast: "User rejected successfully"
- [ ] Page refreshes automatically
- [ ] Approval bar updates:
  - Badge changes to red "Rejected" with XCircle icon
  - "Pending with" text disappears
  - Approve/Reject buttons disappear

**Database Verification**:

```sql
-- Check user status
SELECT user_id, status, is_active FROM user_master WHERE user_id = [TA ID];
-- Expected: status = 'Sent Back', is_active = false

-- Check approval flow with remarks
SELECT status, approved_rejected_by, approved_rejected_at, remarks
FROM approval_flow_trans WHERE user_id = [TA ID];
-- Expected:
--   status = 'Sent Back'
--   approved_rejected_by = 'PO002'
--   remarks = 'Incomplete documentation...'
```

**Screenshot Checkpoint**: Capture red "Rejected" badge after rejection

---

### Scenario 7: API Endpoint Testing

**Objective**: Test all approval API endpoints directly.

#### Test 7.1: Get Pending Approvals

```bash
# Login as PO002 first to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user_id":"PO002","password":"ProductOwner@123"}'

# Use token in Authorization header
curl -X GET http://localhost:3000/api/approval/pending \
  -H "Authorization: Bearer [JWT_TOKEN]"
```

**Expected**:

- [ ] Status 200
- [ ] Returns array of pending approvals for PO002
- [ ] Includes transporter business name, user email, created_by details

#### Test 7.2: Get Approval History

```bash
curl -X GET http://localhost:3000/api/approval/history/TA0001 \
  -H "Authorization: Bearer [JWT_TOKEN]"
```

**Expected**:

- [ ] Status 200
- [ ] Returns approval flow history for TA0001
- [ ] Shows creation, approval/rejection events

#### Test 7.3: Approve User

```bash
curl -X POST http://localhost:3000/api/approval/approve/TA0001 \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Approved via API test"}'
```

**Expected**:

- [ ] Status 200
- [ ] Success message: "User approved successfully"
- [ ] Returns userId, status, approvedBy, approvedAt

#### Test 7.4: Reject User

```bash
curl -X POST http://localhost:3000/api/approval/reject/TA0002 \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"remarks":"Documentation incomplete"}'
```

**Expected**:

- [ ] Status 200
- [ ] Success message: "User rejected successfully"
- [ ] Returns userId, status, rejectedBy, rejectedAt, remarks

---

### Scenario 8: Permission & Security Testing

#### Test 8.1: Non-Product Owner Access

**Steps**:

1. Create a different user type (not Product Owner)
2. Try to access approval endpoints

**Expected**:

- [ ] Status 403
- [ ] Error: "Only product owners can access approval functions"

#### Test 8.2: Self-Approval Prevention (Backend)

**Steps**:

1. Login as PO001
2. Try to approve a user created by PO001 via API

**Expected**:

- [ ] Status 403
- [ ] Error: "You cannot approve your own creation"

#### Test 8.3: Unauthenticated Access

**Steps**:

1. Call approval endpoints without JWT token

**Expected**:

- [ ] Status 401
- [ ] Error: "Unauthorized" or "Token required"

---

### Scenario 9: Cross-Approval Logic Verification

**Objective**: Ensure that approval routing works correctly for both Product Owners.

#### Test 9.1: PO1 Creates → PO2 Approves

- [ ] Create transporter as PO001
- [ ] Check `approval_flow_trans`: `pending_with_user_id` = 'PO002'
- [ ] Login as PO002
- [ ] Verify Approve/Reject buttons visible

#### Test 9.2: PO2 Creates → PO1 Approves

- [ ] Create transporter as PO002
- [ ] Check `approval_flow_trans`: `pending_with_user_id` = 'PO001'
- [ ] Login as PO001
- [ ] Verify Approve/Reject buttons visible

---

### Scenario 10: Edge Cases & Error Handling

#### Test 10.1: Transporter Without Email

**Steps**:

1. Create transporter with address but NO email

**Expected**:

- [ ] User still created (email can be null or use default)
- [ ] No crash or validation error

#### Test 10.2: Transporter Without Mobile

**Steps**:

1. Create transporter with address but NO mobile

**Expected**:

- [ ] User still created (mobile can be null)
- [ ] No crash or validation error

#### Test 10.3: Duplicate Approval Attempt

**Steps**:

1. Approve a user via UI
2. Try to approve the same user again via API

**Expected**:

- [ ] Status 400
- [ ] Error: "No pending approval found for this user"

#### Test 10.4: Backend Server Restart

**Steps**:

1. Create transporter as PO1
2. Restart backend server
3. Login as PO2 and approve

**Expected**:

- [ ] Approval works correctly
- [ ] No session or state issues

---

## Performance Testing

### Test P1: Large Pending Approvals List

**Steps**:

1. Create 50+ transporters as PO001
2. Login as PO002
3. Call `GET /api/approval/pending`

**Expected**:

- [ ] Response time < 2 seconds
- [ ] All 50+ items returned
- [ ] No timeout errors

### Test P2: Concurrent Approvals

**Steps**:

1. Open 2 browser tabs as PO002
2. Click "Approve" in both tabs simultaneously for different users

**Expected**:

- [ ] Both approvals process successfully
- [ ] No database lock errors
- [ ] Both status updates correctly

---

## Regression Testing

### Test R1: Existing Transporter CRUD

- [ ] Create transporter (without approval system) still works
- [ ] Update transporter still works
- [ ] Delete transporter still works
- [ ] List transporters still works

### Test R2: Existing UI Not Broken

- [ ] Transporter list page loads without errors
- [ ] Transporter create page loads without errors
- [ ] Transporter edit mode still works
- [ ] Document upload still works

---

## Test Sign-Off

**Tested By**: ********\_\_\_********  
**Date**: ********\_\_\_********  
**Overall Result**: ⬜ PASS ⬜ FAIL

**Critical Issues Found**: ********\_\_\_********  
**Minor Issues Found**: ********\_\_\_********

---

## Notes

- All tests should be performed in a clean test environment
- Database should be backed up before testing
- Use separate test data for each scenario
- Document any unexpected behavior
- Take screenshots for approval UI states

---

**Test Plan Version**: 1.0  
**Last Updated**: November 15, 2025
