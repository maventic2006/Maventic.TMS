# Consignor Approval System Implementation Plan

**Implementation Date**: November 16, 2025  
**Module**: Consignor Admin User Approval  
**Based On**: Transporter Approval System (Exact Same Pattern)  
**Approval Levels**: Level 1 Only (Product Owner Cross-Approval)

---

## 📋 Overview

This document outlines the complete implementation of the approval system for Consignor Admin users, following the **exact same pattern** as the Transporter approval system. The implementation ensures that every Consignor Admin user created in TMS must be approved by a Product Owner before accessing the system.

---

## 🎯 Implementation Goals

1. ✅ **Database Schema**: Approval configuration already exists for Consignor Admin (AT002)
2. ⏳ **Backend Integration**: Add user creation + approval flow to consignor creation
3. ⏳ **Approval Controller**: Reuse existing `/api/approval` endpoints
4. ⏳ **Frontend Integration**: Add approval bar to Consignor Details page
5. ⏳ **Testing**: Comprehensive test plan for end-to-end approval flow

---

## 🗄️ Database Architecture (Already Exists)

### Approval Type Master
```sql
AT002 | Consignor Admin | User Create | ACTIVE
```

### Approval Configuration (Need to Add)
```sql
AC0002 | AT002 | Level 1 | RL001 (Product Owner) | NULL
```

### User Type Master
```sql
UT006 | Consignor Admin | ACTIVE
```

### Role Master
```sql
RL006 | Consignor Admin | ACTIVE
```

### Approval Flow Transaction Table
```sql
approval_flow_trans (already exists, will store consignor approval flows)
```

---

## 🔧 Implementation Steps

### Phase 1: Database Configuration ✅ EXISTING

**No database changes needed!** The tables and approval type master already exist from transporter implementation.

**Only Need to Add**:
- Approval configuration entry for Consignor Admin (AC0002)

```sql
INSERT INTO approval_configuration (
  approval_config_id,
  approval_type_id,
  approver_level,
  role_id,
  user_id,
  status,
  created_by
) VALUES (
  'AC0002',
  'AT002', -- Consignor Admin
  1,
  'RL001', -- Product Owner
  NULL,
  'ACTIVE',
  'SYSTEM'
);
```

---

### Phase 2: Backend Integration ⏳ TO IMPLEMENT

#### File to Modify: `tms-backend/controllers/consignorController.js`

#### New Helper Functions to Add

```javascript
/**
 * Generate Consignor Admin User ID (format: CA0001, CA0002, etc.)
 */
const generateConsignorAdminUserId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("user_master")
      .where("user_id", "like", "CA%")
      .orderBy("user_id", "desc")
      .first();

    let nextNumber = 1;
    if (result && result.user_id) {
      const currentNumber = parseInt(result.user_id.substring(2));
      nextNumber = currentNumber + 1;
    }

    const newId = `CA${nextNumber.toString().padStart(4, "0")}`;

    // Check if ID already exists
    const exists = await trx("user_master").where("user_id", newId).first();
    if (!exists) {
      return newId;
    }

    attempts++;
  }

  throw new Error("Failed to generate unique Consignor Admin user ID");
};

/**
 * Generate Approval Flow Transaction ID (reuse existing function or import)
 */
const generateApprovalFlowId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("approval_flow_trans").count("* as count").first();
    const count = parseInt(result.count) + 1;
    const newId = `AF${(count + attempts).toString().padStart(4, "0")}`;

    const existsInDb = await trx("approval_flow_trans")
      .where("approval_flow_trans_id", newId)
      .first();

    if (!existsInDb) {
      return newId;
    }

    attempts++;
  }

  throw new Error("Failed to generate unique approval flow ID");
};
```

#### Update `createConsignor` Function

**Add after successful consignor creation** (inside the transaction, before commit):

```javascript
// ========================================
// PHASE 5: CREATE CONSIGNOR ADMIN USER & APPROVAL WORKFLOW
// ========================================

console.log("📝 Creating Consignor Admin user for approval workflow...");

// Generate user ID for Consignor Admin
const consignorAdminUserId = await generateConsignorAdminUserId(trx);
console.log(`  Generated user ID: ${consignorAdminUserId}`);

// Get creator details from request (current logged-in Product Owner)
const creatorUserId = req.user?.user_id || "SYSTEM";
const creatorName = req.user?.user_full_name || "System";

// Generate initial password (based on customer name + random number)
const customerNameClean = general.customer_name.replace(/[^a-zA-Z0-9]/g, "");
const randomNum = Math.floor(1000 + Math.random() * 9000);
const initialPassword = `${customerNameClean}@${randomNum}`;
const hashedPassword = await bcrypt.hash(initialPassword, 10);

// Extract contact details from first contact
const primaryContact = contacts && contacts.length > 0 ? contacts[0] : null;
const userEmail = primaryContact?.email || `${general.customer_id.toLowerCase()}@consignor.com`;
const userMobile = primaryContact?.number || "0000000000";

// Create user in user_master with Pending for Approval status
await trx("user_master").insert({
  user_id: consignorAdminUserId,
  user_type_id: "UT006", // Consignor Admin
  user_full_name: `${general.customer_name} - Admin`,
  email_id: userEmail,
  mobile_number: userMobile,
  consignor_id: general.customer_id, // Link to consignor
  is_active: false, // Inactive until approved
  created_by_user_id: creatorUserId,
  password: hashedPassword,
  password_type: "initial",
  status: "Pending for Approval", // Critical: Set to pending
  created_by: creatorUserId,
  updated_by: creatorUserId,
  created_at: knex.fn.now(),
  updated_at: knex.fn.now(),
});

console.log(`  ✅ Created user: ${consignorAdminUserId} (Pending for Approval)`);

// Get approval configuration for Consignor Admin (Level 1 only)
const approvalConfig = await trx("approval_configuration")
  .where({
    approval_type_id: "AT002", // Consignor Admin
    approver_level: 1,
    status: "ACTIVE",
  })
  .first();

if (!approvalConfig) {
  throw new Error("Approval configuration not found for Consignor Admin");
}

// Determine pending approver (Product Owner who did NOT create this)
// If PO001 created, pending with PO002; if PO002 created, pending with PO001
let pendingWithUserId = null;
let pendingWithName = null;

if (creatorUserId === "PO001") {
  const po2 = await trx("user_master").where("user_id", "PO002").first();
  pendingWithUserId = "PO002";
  pendingWithName = po2?.user_full_name || "Product Owner 2";
} else if (creatorUserId === "PO002") {
  const po1 = await trx("user_master").where("user_id", "PO001").first();
  pendingWithUserId = "PO001";
  pendingWithName = po1?.user_full_name || "Product Owner 1";
} else {
  // If creator is neither PO1 nor PO2, default to PO001
  const po1 = await trx("user_master").where("user_id", "PO001").first();
  pendingWithUserId = "PO001";
  pendingWithName = po1?.user_full_name || "Product Owner 1";
}

// Generate approval flow trans ID
const approvalFlowId = await generateApprovalFlowId(trx);

// Create approval flow transaction entry
await trx("approval_flow_trans").insert({
  approval_flow_trans_id: approvalFlowId,
  approval_config_id: approvalConfig.approval_config_id,
  approval_type_id: "AT002", // Consignor Admin
  user_id_reference_id: consignorAdminUserId,
  s_status: "Pending for Approval",
  approver_level: 1,
  pending_with_role_id: "RL001", // Product Owner role
  pending_with_user_id: pendingWithUserId,
  pending_with_name: pendingWithName,
  created_by_user_id: creatorUserId,
  created_by_name: creatorName,
  created_by: creatorUserId,
  updated_by: creatorUserId,
  created_at: knex.fn.now(),
  updated_at: knex.fn.now(),
  status: "ACTIVE",
});

console.log(`  ✅ Created approval workflow: ${approvalFlowId}`);
console.log(`  📧 Pending with: ${pendingWithName} (${pendingWithUserId})`);
console.log(`  🔑 Initial Password: ${initialPassword} (MUST BE SHARED SECURELY)`);
```

#### Update `getConsignorById` Function

**Add user approval status to response**:

```javascript
// At the end of getConsignorById, before return

// Get user approval status if exists
let userApprovalStatus = null;
const consignorUser = await knex("user_master")
  .where("consignor_id", customerId)
  .where("user_type_id", "UT006") // Consignor Admin
  .first();

if (consignorUser) {
  // Get approval flow information
  const approvalFlow = await knex("approval_flow_trans")
    .where("user_id_reference_id", consignorUser.user_id)
    .where("approval_type_id", "AT002")
    .orderBy("created_at", "desc")
    .first();

  userApprovalStatus = {
    userId: consignorUser.user_id,
    userEmail: consignorUser.email_id,
    userMobile: consignorUser.mobile_number,
    userStatus: consignorUser.status,
    isActive: consignorUser.is_active,
    currentApprovalStatus: approvalFlow?.s_status || "Not in Approval Flow",
    pendingWith: approvalFlow?.pending_with_name || null,
    pendingWithUserId: approvalFlow?.pending_with_user_id || null,
  };
}

// Return with approval status
return {
  general: {...},
  contacts: [...],
  organization: {...},
  documents: [...],
  userApprovalStatus // Add this
};
```

#### Update API Response

**Success response after creation**:

```javascript
res.status(201).json({
  success: true,
  data: {
    customerId: general.customer_id,
    userId: consignorAdminUserId,
    userEmail: userEmail,
    initialPassword: initialPassword,
    message: "Consignor created successfully. Consignor Admin user created and pending approval.",
    approvalStatus: "Pending for Approval",
    pendingWith: pendingWithName,
  },
  timestamp: new Date().toISOString(),
});
```

---

### Phase 3: Frontend Integration ⏳ TO IMPLEMENT

#### File 1: Update Redux Slice

**File**: `frontend/src/redux/slices/consignorSlice.js`

No changes needed! The approval slice is already created and can be reused.

#### File 2: Create Approval Action Bar Component

**File**: `frontend/src/components/approval/ConsignorApprovalActionBar.jsx`

**Copy from**: `frontend/src/components/approval/ApprovalActionBar.jsx`

**Changes needed**:
- Update prop names: `transporterId` → `consignorId`
- Update labels: "Transporter Admin" → "Consignor Admin"
- Everything else stays the same (uses same approval API endpoints)

#### File 3: Update Consignor Details Page

**File**: `frontend/src/features/consignor/pages/ConsignorDetailsPage.jsx`

**Add imports**:
```javascript
import ConsignorApprovalActionBar from "../../../components/approval/ConsignorApprovalActionBar";
```

**Add approval status to component** (same as TransporterDetailsPage):
```jsx
{/* Approval Action Bar */}
{currentConsignor?.userApprovalStatus && (
  <ConsignorApprovalActionBar
    userApprovalStatus={currentConsignor.userApprovalStatus}
    consignorId={id}
  />
)}
```

---

### Phase 4: Migration File ⏳ TO CREATE

**File**: `tms-backend/migrations/YYYYMMDD_add_consignor_approval_config.js`

```javascript
exports.up = async function (knex) {
  // Add Consignor Admin approval configuration
  await knex('approval_configuration').insert({
    approval_config_id: 'AC0002',
    approval_type_id: 'AT002', // Consignor Admin
    approver_level: 1,
    role_id: 'RL001', // Product Owner
    user_id: null,
    status: 'ACTIVE',
    created_by: 'SYSTEM',
    created_at: knex.fn.now(),
    updated_at: knex.fn.now(),
  });
  
  console.log('✅ Added Consignor Admin approval configuration');
};

exports.down = async function (knex) {
  await knex('approval_configuration')
    .where('approval_config_id', 'AC0002')
    .del();
};
```

---

## 🧪 Testing Checklist

### Backend Testing

- [ ] Create consignor as PO001 → Verify user CA0001 created with status "Pending for Approval"
- [ ] Verify approval_flow_trans entry created with pending_with = PO002
- [ ] Check user_master.is_active = false
- [ ] Check user_master.password is hashed
- [ ] Check user_master.password_type = 'initial'
- [ ] Verify consignor_id is set in user_master

### API Testing

- [ ] GET /api/consignors/:id returns userApprovalStatus object
- [ ] POST /api/consignors returns approval information
- [ ] GET /api/approval/pending shows consignor admin user (when logged in as PO002)
- [ ] POST /api/approval/approve/:userId works for consignor admin user
- [ ] POST /api/approval/reject/:userId works with mandatory remarks

### Frontend Testing

- [ ] Consignor create page shows success with approval message
- [ ] Consignor details page shows approval action bar
- [ ] Yellow "Pending Approval" badge visible
- [ ] Creator (PO001) sees status but NO action buttons
- [ ] Assigned approver (PO002) sees "Approve" and "Reject" buttons
- [ ] Approve button updates status to "Active"
- [ ] Reject button shows modal with remarks field (mandatory)
- [ ] Toast notifications work for approve/reject actions

---

## 📊 Implementation Comparison

| Feature | Transporter | Consignor |
|---------|------------|-----------|
| User Type ID | UT002 | UT006 |
| User ID Format | TA0001 | CA0001 |
| Approval Type ID | AT001 | AT002 |
| Approval Config ID | AC0001 | AC0002 |
| Role ID | RL002 | RL006 |
| Backend Controller | transporterController.js | consignorController.js |
| Frontend Component | ApprovalActionBar.jsx | ConsignorApprovalActionBar.jsx |
| Details Page | TransporterDetailsPage.jsx | ConsignorDetailsPage.jsx |

---

## 🔐 Security Considerations

1. **Password Generation**: Format `CustomerName@RandomNumber` (e.g., `ABCCorp@3421`)
2. **Password Hashing**: bcrypt with 10 rounds
3. **Password Type**: 'initial' (forces change on first login)
4. **Cross-Approval**: Creator cannot approve own creation
5. **JWT Authentication**: All approval endpoints require authentication
6. **Product Owner Only**: Only UT001 can access approval endpoints

---

## 📝 Files to Create/Modify

### Backend (4 files)

1. ✅ `tms-backend/migrations/YYYYMMDD_add_consignor_approval_config.js` - NEW
2. ⏳ `tms-backend/controllers/consignorController.js` - MODIFY
3. ⏳ `tms-backend/services/consignorService.js` - MODIFY (if service layer exists)
4. ✅ `tms-backend/controllers/approvalController.js` - NO CHANGE (reuse existing)

### Frontend (2 files)

1. ⏳ `frontend/src/components/approval/ConsignorApprovalActionBar.jsx` - NEW
2. ⏳ `frontend/src/features/consignor/pages/ConsignorDetailsPage.jsx` - MODIFY
3. ✅ `frontend/src/redux/slices/approvalSlice.js` - NO CHANGE (reuse existing)

### Documentation (2 files)

1. ✅ `docs/CONSIGNOR_APPROVAL_IMPLEMENTATION_PLAN.md` - NEW (this file)
2. ⏳ `docs/CONSIGNOR_APPROVAL_TEST_PLAN.md` - NEW

**Total**: 8 files (4 new, 3 modified, 1 reused)

---

## 🎯 Success Criteria

✅ **Implementation Complete When**:

1. Consignor creation automatically creates Consignor Admin user
2. User created with "Pending for Approval" status
3. Approval flow entry created in approval_flow_trans
4. Cross-approval logic works (PO1 ↔ PO2)
5. Consignor Details page shows approval status
6. Assigned approver sees Approve/Reject buttons
7. Approve action activates user (status = "Active", is_active = true)
8. Reject action keeps user inactive with "Sent Back" status
9. Toast notifications work for all actions
10. No breaking changes to existing consignor functionality

---

## 🚀 Implementation Order

1. ✅ Create migration file for AC0002 approval config
2. ⏳ Run migration to add config
3. ⏳ Add helper functions to consignorController.js
4. ⏳ Update createConsignor function
5. ⏳ Update getConsignorById function
6. ⏳ Test backend with Postman
7. ⏳ Create ConsignorApprovalActionBar component
8. ⏳ Update ConsignorDetailsPage with approval bar
9. ⏳ Test complete flow end-to-end
10. ⏳ Create test documentation

---

**Next Action**: Proceed with implementation starting with migration file creation.

**Estimated Time**: 2-3 hours for complete implementation and testing.

---

*Last Updated: November 16, 2025*