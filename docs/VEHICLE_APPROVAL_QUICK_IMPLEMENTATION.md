# Vehicle Approval Flow - Quick Implementation Guide

##  Phase 1 COMPLETE - Database Setup

**DONE:**
- Created AT004 approval type (Vehicle Owner User Creation)
- Created AC0004 approval configuration (Level 1, Product Owner)
- Database verified and ready

---

##  Phase 2: Backend Implementation - IN PROGRESS

### Step 1: Add Helper Functions to vehicleController.js

Add these 3 helper functions after the existing helper functions (around line 150):

\\\javascript
/**
 * Generate unique Vehicle Owner User ID
 * Format: VO0001, VO0002, etc.
 */
const generateVehicleOwnerUserId = async () => {
  try {
    const result = await db('user_master')
      .where('user_id', 'like', 'VO%')
      .max('user_id as max_id')
      .first();
    
    if (!result.max_id) {
      return 'VO0001';
    }
    
    const numPart = parseInt(result.max_id.substring(2)) + 1;
    return 'VO' + numPart.toString().padStart(4, '0');
  } catch (error) {
    console.error('Error generating vehicle owner user ID:', error);
    throw new Error('Failed to generate vehicle owner user ID');
  }
};

/**
 * Generate unique Approval Flow ID
 * Format: AF0001, AF0002, etc.
 */
const generateApprovalFlowId = async () => {
  try {
    const result = await db('approval_flow_trans')
      .max('approval_flow_trans_id as max_id')
      .first();
    
    if (!result.max_id) {
      return 'AF0001';
    }
    
    const numPart = parseInt(result.max_id.substring(2)) + 1;
    return 'AF' + numPart.toString().padStart(4, '0');
  } catch (error) {
    console.error('Error generating approval flow ID:', error);
    throw new Error('Failed to generate approval flow ID');
  }
};

/**
 * Generate initial password for vehicle owner
 * Format: {RegistrationNumber}@{Random4Digits}
 */
const generateVehicleOwnerPassword = (registrationNumber) => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const cleanRegNo = registrationNumber.replace(/\s+/g, '').substring(0, 15);
  return \\@\\;
};
\\\

### Step 2: Update createVehicle Function

Find the line \wait trx.commit();\ in createVehicle function (around line 680).

**BEFORE that line**, add this code:

\\\javascript
// ========================================================================
// CREATE VEHICLE OWNER USER (NEW)
// ========================================================================

const bcrypt = require('bcrypt');
const currentUser = req.user;
const creatorUserId = currentUser?.user_id || 'SYSTEM';
const creatorName = currentUser?.name || currentUser?.user_id || 'System';

// Generate vehicle owner user ID
const vehicleOwnerUserId = await generateVehicleOwnerUserId();

// Generate initial password
const initialPassword = generateVehicleOwnerPassword(
  vehicleData.vehicle_registration_number || \VEH\\
);
const hashedPassword = await bcrypt.hash(initialPassword, 10);

// Cross-approval logic
let pendingWithUserId, pendingWithName;
if (creatorUserId === 'PO001') {
  pendingWithUserId = 'PO002';
  pendingWithName = 'Product Owner 2';
} else if (creatorUserId === 'PO002') {
  pendingWithUserId = 'PO001';
  pendingWithName = 'Product Owner 1';
} else {
  pendingWithUserId = 'PO001';
  pendingWithName = 'Product Owner 1';
}

// Insert vehicle owner user
await trx('user_master').insert({
  user_id: vehicleOwnerUserId,
  email: \\@vehicle.tms.com\,
  password: hashedPassword,
  mobile: '0000000000',
  user_type_id: 'UT005',
  vehicle_id: vehicleId,
  status: 'Pending for Approval',
  is_active: false,
  password_type: 'initial',
  created_by_user_id: creatorUserId,
  created_by_name: creatorName,
  created_at: db.fn.now(),
  updated_at: db.fn.now(),
});

console.log(\ Vehicle Owner user created: \\);

// Create approval flow entry
const approvalFlowId = await generateApprovalFlowId();

await trx('approval_flow_trans').insert({
  approval_flow_trans_id: approvalFlowId,
  approval_config_id: 'AC0004',
  approval_type_id: 'AT004',
  user_id_reference_id: vehicleOwnerUserId,
  s_status: 'Pending for Approval',
  approver_level: 1,
  pending_with_role_id: 'RL001',
  pending_with_user_id: pendingWithUserId,
  pending_with_name: pendingWithName,
  created_by_user_id: creatorUserId,
  created_by_name: creatorName,
  created_at: db.fn.now(),
  updated_at: db.fn.now(),
});

console.log(\ Approval flow created: \\);
\\\

**Then UPDATE the response** (after \wait trx.commit();\):

\\\javascript
await trx.commit();

res.status(201).json({
  success: true,
  message: 'Vehicle created successfully. Vehicle Owner user created and pending approval.',
  data: {
    vehicleId: vehicleId,
    userApproval: {
      userId: vehicleOwnerUserId,
      userType: 'Independent Vehicle Owner',
      initialPassword: initialPassword,
      status: 'Pending for Approval',
      pendingWith: pendingWithName,
    }
  }
});
\\\

### Step 3: Update getVehicleById Function

Find the \const response = { ... }\ section (around line 920).

**BEFORE that section**, add:

\\\javascript
// ========================================================================
// FETCH USER APPROVAL STATUS (NEW)
// ========================================================================

let userApprovalStatus = null;

const vehicleOwnerUser = await db('user_master')
  .where('vehicle_id', id)
  .where('user_type_id', 'UT005')
  .orderBy('created_at', 'desc')
  .first();

if (vehicleOwnerUser) {
  const approvalFlow = await db('approval_flow_trans')
    .where('user_id_reference_id', vehicleOwnerUser.user_id)
    .where('approval_type_id', 'AT004')
    .orderBy('created_at', 'desc')
    .first();

  if (approvalFlow) {
    userApprovalStatus = {
      userId: vehicleOwnerUser.user_id,
      userType: 'Independent Vehicle Owner',
      currentStatus: approvalFlow.s_status,
      approvalLevel: approvalFlow.approver_level,
      pendingWithUserId: approvalFlow.pending_with_user_id,
      pendingWithName: approvalFlow.pending_with_name,
      createdByUserId: approvalFlow.created_by_user_id,
      createdByName: approvalFlow.created_by_name,
      actionedById: approvalFlow.actioned_by_id,
      actionedByName: approvalFlow.actioned_by_name,
      approvedOn: approvalFlow.approved_on,
      remarks: approvalFlow.remarks,
    };
  }
}
\\\

**Then ADD to response object**:

\\\javascript
const response = {
  vehicleId: vehicle.vehicle_id_code_hdr,
  basicInformation: { ... },
  // ... other fields ...
  createdAt: vehicle.created_at,
  updatedAt: vehicle.updated_at,
  userApprovalStatus: userApprovalStatus,  //  ADD THIS LINE
};
\\\

---

##  Phase 3: Frontend Redux - Simple Update

### File: frontend/src/redux/slices/vehicleSlice.js

Find \etchVehicleById.fulfilled\ reducer (around line 180).

**ADD userApprovalStatus to destructuring**:

\\\javascript
.addCase(fetchVehicleById.fulfilled, (state, action) => {
  state.isFetching = false;
  
  const { 
    vehicleId, 
    basicInformation, 
    specifications, 
    capacityDetails, 
    ownershipDetails, 
    maintenanceHistory, 
    serviceFrequency, 
    documents, 
    status, 
    blacklistStatus, 
    createdAt, 
    updatedAt,
    userApprovalStatus  //  ADD THIS
  } = action.payload;

  const flattenedData = {
    vehicleId,
    ...basicInformation,
    ...specifications,
    ...capacityDetails,
    ownershipDetails,
    maintenanceHistory,
    serviceFrequency,
    documents,
    status,
    blacklistStatus,
    createdAt,
    updatedAt,
    userApprovalStatus,  //  ADD THIS
  };

  state.currentVehicle = flattenedData;
  state.error = null;
})
\\\

---

##  Phase 4: Frontend UI Components

### Step 1: Create VehicleApprovalActionBar Component

Create new file: \rontend/src/components/approval/VehicleApprovalActionBar.jsx\

**Copy the entire content from ConsignorApprovalActionBar.jsx and make these changes:**
1. Change component name to \VehicleApprovalActionBar\
2. Update text "Vehicle Owner" instead of "Consignor Admin"
3. Keep all logic exactly the same

### Step 2: Update VehicleDetailsPage

File: \rontend/src/features/vehicle/VehicleDetailsPage.jsx\

**Import at top**:
\\\javascript
import VehicleApprovalActionBar from "../../components/approval/VehicleApprovalActionBar";
\\\

**Find header section** (around line 530) and update to:

\\\javascript
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-4">
    <button onClick={handleBack} className="...">
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
    <h1>Vehicle Details - {currentVehicle.vehicleId}</h1>
  </div>

  <div className="flex items-center gap-2">
    {/* APPROVAL BAR */}
    {currentVehicle.userApprovalStatus && (
      <VehicleApprovalActionBar
        userApprovalStatus={currentVehicle.userApprovalStatus}
        vehicleId={id}
      />
    )}

    {/* EDIT BUTTONS */}
    {isEditMode ? (
      <div className="flex gap-2">
        <button onClick={handleCancelEdit}>Cancel</button>
        <button onClick={handleSaveChanges}>Save Changes</button>
      </div>
    ) : (
      <button onClick={handleEditToggle}>Edit Details</button>
    )}
  </div>
</div>
\\\

---

##  Testing Checklist

### Test 1: Create Vehicle as PO001
- [ ] Login as PO001
- [ ] Create vehicle VEH0001
- [ ] Check response has userApproval object
- [ ] Verify VO0001 user created in database

### Test 2: View as Creator (PO001)
- [ ] Open VEH0001 details
- [ ] See yellow "Pending Approval" badge
- [ ] NO Approve/Reject buttons visible

### Test 3: View as Approver (PO002)
- [ ] Logout, login as PO002
- [ ] Open VEH0001 details
- [ ] See yellow "Pending Approval" badge
- [ ] See  Approve and  Reject buttons

### Test 4: Approve User
- [ ] As PO002, click Approve
- [ ] See green "Approved" badge
- [ ] Buttons disappear
- [ ] Check database: user_master status = 'Active', is_active = 1

### Test 5: Rejection Flow
- [ ] Create another vehicle as PO001
- [ ] As PO002, click Reject
- [ ] Enter remarks (required)
- [ ] See red "Rejected" badge

---

##  Summary

**Files Modified**: 3
1. \	ms-backend/controllers/vehicleController.js\ (3 helpers + 2 function updates)
2. \rontend/src/redux/slices/vehicleSlice.js\ (add userApprovalStatus)
3. \rontend/src/features/vehicle/VehicleDetailsPage.jsx\ (add approval bar)

**Files Created**: 1
1. \rontend/src/components/approval/VehicleApprovalActionBar.jsx\ (copy from consignor)

**Database**:  Already set up (AT004, AC0004)

**Pattern**: Exact copy of consignor approval flow

**Time**: ~2-3 hours to implement + test

---

##  Quick Commands

### Verify Database
\\\powershell
cd "d:\tms developement 11 nov\Maventic.TMS\tms-backend"
node -e "const knex=require('./config/database'); (async()=>{const at=await knex('approval_type_master').where('approval_type_id','AT004').first(); console.log('AT004:',at?'EXISTS':'NOT FOUND'); const ac=await knex('approval_configuration').where('approval_config_id','AC0004').first(); console.log('AC0004:',ac?'EXISTS':'NOT FOUND'); await knex.destroy();})()"
\\\

### Test Backend
\\\powershell
# Start backend
cd "d:\tms developement 11 nov\Maventic.TMS\tms-backend"
npm run dev
\\\

### Test Frontend
\\\powershell
# Start frontend
cd "d:\tms developement 11 nov\Maventic.TMS\frontend"
npm run dev
\\\

---

**Ready to implement! Follow the steps above in order.** 
