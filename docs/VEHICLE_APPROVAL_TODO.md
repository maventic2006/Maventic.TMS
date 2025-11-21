#  VEHICLE APPROVAL FLOW - IMPLEMENTATION TODO

##  COMPLETED: Requirements Analysis
- User Type: UT005 (Independent Vehicle Owner)
- Approval Type: AT004 (Vehicle User Creation) - NEW  
- Approval Pattern: Cross-approval by Product Owners (PO001  PO002)
- User ID Format: VO0001, VO0002, VO0003, etc.
- Status Flow: Pending for Approval  Approve/Sent Back

---

##  IMPLEMENTATION PHASES

### Phase 1: Database Schema Updates
- [ ] Create migration file for AT004 approval type
- [ ] Insert approval_type_master record (AT004)
- [ ] Insert approval_configuration record (AC0004)
- [ ] Run migration

### Phase 2: Backend Implementation  
- [ ] Add helper: generateVehicleOwnerUserId()
- [ ] Add helper: generateApprovalFlowId()
- [ ] Add helper: generateVehicleOwnerPassword()
- [ ] Update createVehicle() - auto-create user
- [ ] Update createVehicle() - create approval flow
- [ ] Update getVehicleById() - fetch userApprovalStatus
- [ ] Test backend endpoints

### Phase 3: Frontend Redux
- [ ] Update vehicleSlice.js - include userApprovalStatus in destructuring
- [ ] Test data flow from API to component

### Phase 4: Frontend UI
- [ ] Create VehicleApprovalActionBar.jsx component
- [ ] Update VehicleDetailsPage.jsx - add approval bar to header
- [ ] Test conditional rendering (creator vs approver)
- [ ] Test approve flow
- [ ] Test reject flow with validation

### Phase 5: Testing
- [ ] Create vehicle as PO001  Verify VO user created
- [ ] View as PO001  Verify no buttons shown
- [ ] View as PO002  Verify buttons shown
- [ ] Approve as PO002  Verify status updated
- [ ] Test rejection flow
- [ ] Verify database updates

### Phase 6: Documentation & Cleanup
- [ ] Complete implementation guide
- [ ] Complete flowchart documentation
- [ ] Complete test plan
- [ ] Remove debug console.log statements
- [ ] Code review

---

##  QUICK START COMMANDS

### 1. Run Database Migration
\\\powershell
cd "d:\tms developement 11 nov\Maventic.TMS\tms-backend"
npx knex migrate:latest
\\\

### 2. Verify Database Changes
\\\sql
SELECT * FROM approval_type_master WHERE approval_type_id = 'AT004';
SELECT * FROM approval_configuration WHERE approval_configuration_id = 'AC0004';
\\\

### 3. Test Backend
\\\powershell
# Start backend
npm run dev

# Create test vehicle
# POST http://localhost:5000/api/vehicle
# Check response for userApproval object
\\\

### 4. Test Frontend
\\\powershell
# Start frontend
cd "d:\tms developement 11 nov\Maventic.TMS\frontend"
npm run dev

# Navigate to vehicle details page
# Verify approval bar appears
\\\

---

##  FILES TO CREATE/MODIFY

### New Files (4)
1. \	ms-backend/migrations/20251117000001_add_vehicle_approval_type.js\
2. \rontend/src/components/approval/VehicleApprovalActionBar.jsx\
3. \docs/VEHICLE_APPROVAL_IMPLEMENTATION_GUIDE.md\
4. \docs/VEHICLE_APPROVAL_FLOWCHART.md\

### Files to Modify (3)
1. \	ms-backend/controllers/vehicleController.js\ (add helpers, update create/get)
2. \rontend/src/redux/slices/vehicleSlice.js\ (add userApprovalStatus)
3. \rontend/src/features/vehicle/VehicleDetailsPage.jsx\ (add approval bar)

---

##  TIME ESTIMATE
**Total**: 8-9 hours  
**Phase 1**: 30 min  
**Phase 2**: 2 hours  
**Phase 3**: 30 min  
**Phase 4**: 2 hours  
**Phase 5**: 2 hours  
**Phase 6**: 1 hour

---

##  SUCCESS CRITERIA
- Vehicle creation auto-creates VO user
- User status: Pending for Approval, is_active: false
- Creator sees status badge only (no buttons)
- Approver sees status badge + Approve/Reject buttons
- Approval updates user_master and approval_flow_trans
- Rejection requires mandatory remarks
- UI matches consignor approval design

---

**Ready to implement!** 
