# TMS Approval System Implementation

**Implementation Date**: November 15, 2025  
**Module**: Transporter Admin User Approval  
**Approval Levels**: Level 1 Only (Product Owner Cross-Approval)

---

## Overview

The approval system ensures that every Transporter Admin user created in the TMS must be approved by a Product Owner before they can access the system. This implements a cross-approval workflow where Product Owner 1 and Product Owner 2 approve each other's creations.

---

## Implementation Status

### ✅ Phase 1: Database Schema (COMPLETED)

**Migration Files Created:**

- `20251115000002_update_approval_system_additive.js` - Updates approval tables (additive only, no drops)
- `20251115000003_seed_product_owner_2.js` - Creates Product Owner 1 and Product Owner 2 users

**Database Changes:**

1. **user_master** table updated with:

   - `user_type_id` (VARCHAR 10) - Links to user_type_master
   - `password` (TEXT) - Hashed password storage
   - `password_type` (VARCHAR 50) - 'initial' or 'actual'
   - `consignor_id` (VARCHAR 20) - For consignor associations

2. **Product Owner Users Created:**

   - **PO001** - Product Owner 1
     - Email: productowner1@tms.com
     - Password: ProductOwner@123 (hashed, initial)
   - **PO002** - Product Owner 2
     - Email: productowner2@tms.com
     - Password: ProductOwner@123 (hashed, initial)

3. **Approval Configuration:**
   - Level 1 approval for Transporter Admin (AT001)
   - Approver Role: Product Owner (RL001)
   - No specific user ID (any Product Owner can approve)

---

### ✅ Phase 2: Backend Integration (COMPLETED)

**File Updated:** `tms-backend/controllers/transporterController.js`

**New Helper Functions Added:**

1. `generateTransporterAdminUserId()` - Generates TA0001, TA0002, etc.
2. `generateApprovalFlowId()` - Generates AF0001, AF0002, etc.

**Transporter Creation Flow Updated:**

When a Product Owner creates a Transporter:

1. **Transporter Business Created** (as before - no changes to existing flow)

   - Transporter General Info
   - Addresses
   - Serviceable Areas
   - Documents

2. **NEW: Transporter Admin User Created** (automatic)

   - User ID: Auto-generated (TA0001, TA0002, etc.)
   - User Type: Transporter Admin (UT002)
   - Email: From primary address
   - Mobile: From primary address
   - Password: Auto-generated (`BusinessName@1234`)
   - Status: **"Pending for Approval"**
   - is_active: **false** (inactive until approved)

3. **NEW: Approval Workflow Initialized**
   - Creates entry in `approval_flow_trans`
   - Status: "Pending for Approval"
   - Approver Level: 1
   - Pending With: The OTHER Product Owner (cross-approval)
   - Stores creator details

**Cross-Approval Logic:**

- If PO001 creates → Pending with PO002
- If PO002 creates → Pending with PO001

**API Response Updated:**

```json
{
  "success": true,
  "data": {
    "transporterId": "T001",
    "userId": "TA0001",
    "userEmail": "transporter@example.com",
    "initialPassword": "TransporterName@1234",
    "message": "Transporter created successfully. Transporter Admin user created and pending approval.",
    "approvalStatus": "Pending for Approval",
    "pendingWith": "Product Owner 2"
  }
}
```

---

### ✅ Phase 3: Approval Controller (COMPLETED)

**Files Created:**

- `tms-backend/controllers/approvalController.js` - Complete approval management logic
- `tms-backend/routes/approval.js` - RESTful approval endpoints

**Files Updated:**

- `tms-backend/server.js` - Added approval routes to Express app
- `tms-backend/controllers/transporterController.js` - Updated getTransporterById to include approval status

**API Endpoints Implemented:**

1. **GET /api/approval/config/:approvalTypeId**

   - Get approval configuration by approval type
   - Requires: Product Owner authentication
   - Returns: Approval levels and required approvers

2. **GET /api/approval/pending**

   - Get all pending approvals for current user
   - Requires: Product Owner authentication
   - Returns: List of users pending approval with transporter details
   - Filters by: `pending_with_user_id = current_user_id`

3. **GET /api/approval/history/:userId**

   - Get approval history for a specific user
   - Requires: Product Owner authentication
   - Returns: Complete approval flow history with timestamps

4. **POST /api/approval/approve/:userId**

   - Approve a pending user
   - Requires: Product Owner authentication
   - Body: `{ remarks: "Optional approval remarks" }`
   - Validations:
     - User exists and is pending
     - Current user is the assigned approver
     - Approver is NOT the creator (cross-approval check)
   - Actions:
     - Updates `approval_flow_trans.status` to "Approve"
     - Updates `user_master.status` to "Active"
     - Sets `user_master.is_active` to `true`
     - Records approver details and timestamp

5. **POST /api/approval/reject/:userId**
   - Reject a pending user
   - Requires: Product Owner authentication
   - Body: `{ remarks: "Rejection reason (REQUIRED)" }`
   - Validations:
     - Remarks are mandatory
     - User exists and is pending
     - Current user is the assigned approver
     - Approver is NOT the creator (cross-approval check)
   - Actions:
     - Updates `approval_flow_trans.status` to "Sent Back"
     - Updates `user_master.status` to "Sent Back"
     - Keeps `user_master.is_active` as `false`
     - Records rejector details and timestamp

**Security Features:**

- All endpoints require JWT authentication via `authenticateToken` middleware
- Product Owner access check: Only `user_type_id = UT001` can access
- Cross-approval enforcement: Creator cannot approve/reject own creation
- Transaction-based updates to ensure data consistency

**Transporter Details Enhancement:**

- `getTransporterById` now includes user approval information
- Finds associated Transporter Admin user created at same time
- Returns approval status, pending approver, and approval history
- Response format:

```json
{
  "userApprovalStatus": {
    "userId": "TA0001",
    "userEmail": "transporter@example.com",
    "userMobile": "9876543210",
    "userStatus": "Pending for Approval",
    "isActive": false,
    "currentApprovalStatus": "Pending for Approval",
    "pendingWith": "Product Owner 2",
    "pendingWithUserId": "PO002"
  },
  "approvalHistory": [...]
}
```

---

### � Phase 4: Frontend Integration (IN PROGRESS)

**Next Steps:**

1. Create Redux `approvalSlice.js`
2. Create `ApprovalActionBar` component for Transporter Details page
3. Integrate approval UI
4. Add approval history modal

---

## Key Design Decisions

### 1. No User-Transporter Foreign Key

- Transporter table does NOT have a `user_id` field
- User is created AFTER transporter creation succeeds
- Link is conceptual (admin user manages the transporter business)

### 2. Additive Migrations Only

- No tables dropped during migration
- All changes are additive to preserve existing data
- Existing functionality remains intact

### 3. Level 1 Approval Only

- Currently implemented: Single approval level
- Future: Can extend to 2-4 levels by updating approval_configuration

### 4. Password Generation

- Format: `BusinessName@RandomNumber` (e.g., `ABCLogistics@3421`)
- Hashed with bcrypt (10 rounds)
- Type: 'initial' (user must change on first login)

---

## Database Schema Details

### approval_type_master

```sql
AT001 | Transporter Admin | User Create
AT002 | Consignor Admin   | User Create
AT003 | Driver User       | User Create
... (more types for future modules)
```

### approval_configuration

```sql
AC0001 | AT001 | Level 1 | RL001 (Product Owner) | NULL (any PO)
```

### approval_flow_trans (Example)

```sql
AF0001 | AC0001 | AT001 | TA0001 | Pending for Approval |
  Level 1 | RL001 | PO002 | Product Owner 2 |
  Created by: PO001 (Product Owner 1)
```

---

## Testing Checklist

- [ ] Create transporter as PO001 → Check user created with status "Pending for Approval"
- [ ] Verify approval_flow_trans entry created with pending_with = PO002
- [ ] Login as PO002 → See pending approval
- [ ] Approve user → Check status changes to "Active" and is_active = true
- [ ] Test rejection flow
- [ ] Verify existing transporter list/create functionality still works
- [ ] Check no UI breaking changes

---

## Security Notes

1. **Initial Password**: Must be shared securely with transporter admin
2. **Password Type**: Set to 'initial' - forces password change on first login
3. **Approval Required**: User CANNOT login until approved by Product Owner
4. **Cross-Approval**: Creator cannot approve their own creation

---

## Future Enhancements

1. Multi-level approval (2-4 levels) configuration
2. Email notifications for pending approvals
3. Approval delegation
4. Bulk approval functionality
5. Approval analytics dashboard

---

## Files Modified

### Backend

- `tms-backend/controllers/transporterController.js` - Added user creation logic
- `tms-backend/migrations/20251115000002_update_approval_system_additive.js`
- `tms-backend/migrations/20251115000003_seed_product_owner_2.js`

### Documentation

- `docs/APPROVAL_SYSTEM_IMPLEMENTATION.md` (this file)

---

## Dependencies Added

- `bcrypt` - Already installed (used for password hashing)

---

## API Endpoints

### Approval Management

- ✅ `GET /api/approval/pending` - Get pending approvals for current user
- ✅ `GET /api/approval/history/:userId` - Get approval history for a user
- ✅ `POST /api/approval/approve/:userId` - Approve a user
- ✅ `POST /api/approval/reject/:userId` - Reject/send back a user
- ✅ `GET /api/approval/config/:approvalTypeId` - Get approval configuration

### User Management

- ✅ `POST /api/transporter` - Creates user automatically with transporter
- ✅ `GET /api/transporter/:id` - Returns user approval status

---

## Phase 4: Frontend Integration - COMPLETED

**Files Created:**

- `frontend/src/redux/slices/approvalSlice.js` - Redux state management
- `frontend/src/components/approval/ApprovalActionBar.jsx` - Approval UI component

**Files Updated:**

- `frontend/src/redux/store.js` - Added approval slice
- `frontend/src/features/transporter/TransporterDetailsPage.jsx` - Integrated approval bar

**Features Implemented:**

- Redux state management with async thunks
- Approval action bar with status badge
- Approve/Reject buttons (only for assigned approver)
- Rejection modal with mandatory remarks
- Toast notifications for success/error
- Conditional rendering based on user permissions
- Framer Motion animations
- Theme-compliant design

---

## Notes

- **IMPORTANT**: No existing functionality broken
- All transporter creation logic remains the same
- User creation is an ADDITIONAL step in the same transaction
- If user creation fails, entire transaction rolls back (including transporter)
- Approval system is transparent to existing UI until approval features are added

---

**Last Updated**: November 15, 2025 - Phase 4 Complete
