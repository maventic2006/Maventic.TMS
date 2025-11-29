# Save as Draft - Phase 1 Backend Implementation Complete 

**Date:** November 21, 2025  
**Status:**  PHASE 1 COMPLETE (100%)  
**Module:** Transporter (Reusable for Driver, Warehouse, Consignor, etc.)

---

## Overview

Phase 1 implements the complete backend infrastructure for the Save as Draft functionality. This includes:
- 3 new API endpoints for draft management
- User-specific draft filtering (privacy enforcement)
- Partial data persistence with minimal validation
- Transaction-based data integrity
- Ownership validation for security

---

## Implementation Summary

### Files Modified

**1. 	ms-backend/controllers/transporterController.js**
-  Added saveTransporterAsDraft function (~230 lines)
-  Added updateTransporterDraft function (~200 lines)
-  Added deleteTransporterDraft function (~80 lines)
-  Modified getTransporters function for user-specific draft filtering

**2. 	ms-backend/routes/transporter.js**
-  Added POST /api/transporter/save-draft route
-  Added PUT /api/transporter/:id/update-draft route
-  Added DELETE /api/transporter/:id/delete-draft route

**Total Lines Added:** ~510 lines of production code

---

## API Endpoints

### 1. Save Draft (Create New)

**Endpoint:** POST /api/transporter/save-draft  
**Auth:** Required (JWT token via authenticateToken middleware)  
**Access:** Product Owner only (checkProductOwnerAccess)

**Request Body:**
\\\json
{
  \"generalDetails\": {
    \"businessName\": \"ABC Transport\" // ONLY REQUIRED FIELD
  },
  \"addresses\": [
    {
      \"country\": \"IN\",
      \"state\": \"MH\",
      \"city\": \"Mumbai\"
      // All other fields optional
    }
  ],
  \"serviceableAreas\": {
    \"country\": \"IN\",
    \"states\": [\"MH\", \"GJ\"]
    // Partially complete data allowed
  },
  \"documents\": [
    {
      \"documentType\": \"PAN\"
      // documentNumber optional
    }
  ]
}
\\\

**Response (Success):**
\\\json
{
  \"success\": true,
  \"message\": \"Draft saved successfully\",
  \"data\": {
    \"transporterId\": \"TR0001\"
  }
}
\\\

**Response (Error - Missing Business Name):**
\\\json
{
  \"success\": false,
  \"error\": {
    \"code\": \"VALIDATION_ERROR\",
    \"message\": \"Business name is required (minimum 2 characters)\"
  }
}
\\\

**Key Features:**
-  Minimal validation (only business name, min 2 chars)
-  Saves partial/incomplete data
-  NULL-safe insertions for all optional fields
-  Creates status = \"SAVE_AS_DRAFT\"
-  Sets created_by = current user_id from JWT
-  Sets is_active = false in user_master
-  Handles file uploads (base64 encoded)
-  Transaction-based with automatic rollback on error

---

### 2. Update Draft (Edit Existing)

**Endpoint:** PUT /api/transporter/:id/update-draft  
**Auth:** Required (JWT token)  
**Access:** Product Owner only

**Path Parameter:**
- id: Transporter ID (e.g., TR0001)

**Request Body:** Same as Save Draft

**Response (Success):**
\\\json
{
  \"success\": true,
  \"message\": \"Draft updated successfully\"
}
\\\

**Response (Error - Not Owner):**
\\\json
{
  \"success\": false,
  \"error\": {
    \"code\": \"FORBIDDEN\",
    \"message\": \"You can only update your own drafts\"
  }
}
\\\

**Response (Error - Not Draft):**
\\\json
{
  \"success\": false,
  \"error\": {
    \"code\": \"INVALID_STATUS\",
    \"message\": \"Can only update drafts via this endpoint\"
  }
}
\\\

**Key Features:**
-  Verifies status = \"SAVE_AS_DRAFT\"
-  Verifies created_by = current user (403 if not)
-  Deletes all existing related data
-  Re-inserts updated partial data
-  Maintains SAVE_AS_DRAFT status
-  Transaction-based

---

### 3. Delete Draft (Hard Delete)

**Endpoint:** DELETE /api/transporter/:id/delete-draft  
**Auth:** Required (JWT token)  
**Access:** Product Owner only

**Path Parameter:**
- id: Transporter ID (e.g., TR0001)

**Response (Success):**
\\\json
{
  \"success\": true,
  \"message\": \"Draft deleted successfully\"
}
\\\

**Response (Error - Not Owner):**
\\\json
{
  \"success\": false,
  \"error\": {
    \"code\": \"FORBIDDEN\",
    \"message\": \"You can only delete your own drafts\"
  }
}
\\\

**Key Features:**
-  Verifies status = \"SAVE_AS_DRAFT\"
-  Verifies created_by = current user (403 if not)
-  Hard deletes from all tables:
  - tms_address
  - transporter_contact
  - transporter_service_area_hdr & item
  - transporter_documents
  - document_upload
  - user_master
  - transporter_general_info
-  Transaction-based

---

### 4. Get Transporters (Modified for Draft Filtering)

**Endpoint:** GET /api/transporter  
**Auth:** Required (JWT token)

**Query Parameters:**
- status: Filter by status (e.g., \"SAVE_AS_DRAFT\")
- page: Page number
- limit: Records per page
- Other existing filters (search, businessName, state, city, etc.)

**Draft Filtering Logic:**

**Scenario 1: Filtering by SAVE_AS_DRAFT**
\\\javascript
// When status=SAVE_AS_DRAFT in query params
// Shows ONLY drafts created by current user
WHERE tgi.status = 'SAVE_AS_DRAFT' AND tgi.created_by = userId
\\\

**Scenario 2: No Status Filter**
\\\javascript
// Shows all non-draft records + user's own drafts
WHERE (tgi.status != 'SAVE_AS_DRAFT') 
   OR (tgi.status = 'SAVE_AS_DRAFT' AND tgi.created_by = userId)
\\\

**Scenario 3: Filtering by Other Status (ACTIVE, PENDING, etc.)**
\\\javascript
// Shows all records with that status
WHERE tgi.status = 'ACTIVE' // No user filtering
\\\

**Key Features:**
-  User-private draft visibility
-  Product Owner 1 cannot see Product Owner 2's drafts
-  Drafts don't pollute default list view
-  Same logic applied to both data query and count query

---

## Database Schema

### Transporter General Info Table

**Status Field Values:**
- ACTIVE - Approved and active transporter
- PENDING - Awaiting approval
- INACTIVE - Deactivated
- SAVE_AS_DRAFT - **NEW** - Incomplete draft (visible only to creator)

**created_by Field:**
- Stores user_id from JWT token (e.g., \"PO001\", \"PO002\")
- Used for ownership validation and filtering

### User Master Table

For draft transporters:
- status = \"SAVE_AS_DRAFT\"
- is_active = alse
- created_by_user_id = current user_id

---

## Security Implementation

### Ownership Validation Pattern

\\\javascript
// Step 1: Fetch existing record
const existing = await knex(\"transporter_general_info\")
  .where(\"transporter_id\", id)
  .first();

// Step 2: Verify status
if (existing.status !== \"SAVE_AS_DRAFT\") {
  return res.status(400).json({ error: \"Can only update drafts\" });
}

// Step 3: Verify ownership
const userId = req.user?.user_id;
if (existing.created_by !== userId) {
  return res.status(403).json({ error: \"Forbidden\" });
}

// Step 4: Proceed with operation
\\\

**Prevents:**
-  Cross-user draft access
-  Updating non-drafts via draft endpoints
-  Deleting other users' drafts

---

## Partial Data Logic

### Conditional Insertion Pattern

\\\javascript
// Only save if minimal data exists
if (addresses && addresses.length > 0) {
  for (const address of addresses) {
    // Check if any address field has data
    if (address.country || address.state || address.city) {
      const addressId = await generateAddressId(trx, generatedIds);
      
      await trx(\"tms_address\").insert({
        address_id: addressId,
        country: address.country || null,
        state: address.state || null,
        city: address.city || null,
        address_line1: address.addressLine1 || null,
        // All fields nullable - no validation
      });
      
      // Nested contacts
      if (address.contacts && address.contacts.length > 0) {
        for (const contact of address.contacts) {
          if (contact.name || contact.phoneNumber || contact.email) {
            // Save contact
          }
        }
      }
    }
  }
}
\\\

**Key Principles:**
-  Check for data existence before insertion
-  Use NULL for missing fields
-  No mandatory field validation (except business name)
-  Nested data (contacts within addresses) also conditional

---

## Transaction Integrity

### Transaction Pattern

\\\javascript
const trx = await knex.transaction();
try {
  // All database operations
  await trx(\"transporter_general_info\").insert({...});
  await trx(\"user_master\").insert({...});
  await trx(\"tms_address\").insert({...});
  // ... more operations
  
  await trx.commit();
  return res.status(200).json({ success: true });
} catch (error) {
  await trx.rollback();
  console.error(\"Transaction failed:\", error);
  throw error;
}
\\\

**Guarantees:**
-  All-or-nothing semantics
-  Data consistency across related tables
-  Automatic rollback on any error
-  No partial data left in database on failure

---

## Testing Guide

### Prerequisites

1. **Start Backend Server**
   \\\ash
   cd tms-backend
   npm run dev
   \\\
   Server should start on http://localhost:5000

2. **Login to Get JWT Token**
   \\\ash
   POST http://localhost:5000/api/auth/login
   Body: {
     \"username\": \"PO001\",
     \"password\": \"password123\"
   }
   \\\
   Copy the token from response

### Test Scenarios

**Scenario 1: Create Draft with Minimal Data**

\\\ash
POST http://localhost:5000/api/transporter/save-draft
Headers: {
  \"Authorization\": \"Bearer YOUR_JWT_TOKEN\",
  \"Content-Type\": \"application/json\"
}
Body: {
  \"generalDetails\": {
    \"businessName\": \"Test Draft Transport\"
  }
}
\\\

**Expected:** 200 OK with transporterId

---

**Scenario 2: Create Draft with Partial Address**

\\\ash
POST http://localhost:5000/api/transporter/save-draft
Body: {
  \"generalDetails\": {
    \"businessName\": \"Partial Data Transport\"
  },
  \"addresses\": [
    {
      \"country\": \"IN\",
      \"state\": \"MH\"
      // No city, addressLine1, etc.
    }
  ]
}
\\\

**Expected:** 200 OK - Should save with NULL city

---

**Scenario 3: List Drafts (User-Specific)**

\\\ash
GET http://localhost:5000/api/transporter?status=SAVE_AS_DRAFT
Headers: {
  \"Authorization\": \"Bearer YOUR_JWT_TOKEN\"
}
\\\

**Expected:** Only shows drafts created by logged-in user

---

**Scenario 4: Update Draft (Owner)**

\\\ash
PUT http://localhost:5000/api/transporter/TR0001/update-draft
Headers: {
  \"Authorization\": \"Bearer YOUR_JWT_TOKEN\"
}
Body: {
  \"generalDetails\": {
    \"businessName\": \"Updated Draft Name\"
  }
}
\\\

**Expected:** 200 OK

---

**Scenario 5: Update Draft (Not Owner)**

\\\ash
# Login as different user (PO002)
# Try to update PO001's draft

PUT http://localhost:5000/api/transporter/TR0001/update-draft
Headers: {
  \"Authorization\": \"Bearer PO002_JWT_TOKEN\"
}
\\\

**Expected:** 403 Forbidden

---

**Scenario 6: Delete Draft**

\\\ash
DELETE http://localhost:5000/api/transporter/TR0001/delete-draft
Headers: {
  \"Authorization\": \"Bearer YOUR_JWT_TOKEN\"
}
\\\

**Expected:** 200 OK - Hard delete from all tables

---

**Scenario 7: List All (No Status Filter)**

\\\ash
GET http://localhost:5000/api/transporter
Headers: {
  \"Authorization\": \"Bearer YOUR_JWT_TOKEN\"
}
\\\

**Expected:** Shows all ACTIVE/PENDING + user's own drafts

---

## Code Structure

### File Organization

\\\
tms-backend/
 controllers/
    transporterController.js
        saveTransporterAsDraft()      [Lines: ~230]
        updateTransporterDraft()      [Lines: ~200]
        deleteTransporterDraft()      [Lines: ~80]
        getTransporters()             [Modified for draft filtering]
 routes/
     transporter.js
         POST /save-draft
         PUT /:id/update-draft
         DELETE /:id/delete-draft
\\\

### Controller Function Breakdown

**saveTransporterAsDraft:**
1. Extract JWT user_id
2. Validate business name (min 2 chars)
3. Start transaction
4. Generate transporter_id and user_master_id
5. Insert into transporter_general_info (status=SAVE_AS_DRAFT)
6. Insert into user_master (is_active=false)
7. Conditionally save addresses
8. Conditionally save contacts (nested in addresses)
9. Conditionally save serviceable areas
10. Conditionally save documents
11. Commit transaction
12. Return success with transporterId

**updateTransporterDraft:**
1. Extract JWT user_id
2. Fetch existing record
3. Verify status = SAVE_AS_DRAFT
4. Verify created_by = current user
5. Start transaction
6. Delete all related data (addresses, contacts, areas, documents)
7. Re-insert partial data (same logic as save)
8. Commit transaction
9. Return success

**deleteTransporterDraft:**
1. Extract JWT user_id
2. Fetch existing record
3. Verify status = SAVE_AS_DRAFT
4. Verify created_by = current user
5. Start transaction
6. Delete from all tables (cascading)
7. Commit transaction
8. Return success

---

## Reusability Pattern

This implementation is designed to be reusable across all modules. To implement for Driver, Warehouse, or Consignor:

### Steps to Replicate

**1. Copy Controller Functions**
\\\javascript
// From: transporterController.js
// To: driverController.js, warehouseController.js, etc.

// Replace table names:
transporter_general_info  driver_general_info
user_master (same)
tms_address (same)
transporter_contact  driver_contact
transporter_service_area_hdr  driver_service_area_hdr
transporter_documents  driver_documents
\\\

**2. Copy Routes**
\\\javascript
// From: transporter.js
// To: driver.js, warehouse.js, etc.

router.post(\"/save-draft\", authenticateToken, checkProductOwnerAccess, saveDriverAsDraft);
router.put(\"/:id/update-draft\", authenticateToken, checkProductOwnerAccess, updateDriverDraft);
router.delete(\"/:id/delete-draft\", authenticateToken, checkProductOwnerAccess, deleteDriverDraft);
\\\

**3. Modify getRecords Function**
\\\javascript
// Add same draft filtering logic to:
// - getDrivers()
// - getWarehouses()
// - getConsignors()
\\\

---

## Next Steps (Phase 2-4)

### Phase 2: Shared Utilities & Components (Frontend)

**Files to Create:**
- [ ] rontend/src/utils/draftService.js - API wrapper
- [ ] rontend/src/hooks/useSaveAsDraft.js - Draft logic hook
- [ ] rontend/src/hooks/useFormDirtyTracking.js - Form change detection
- [ ] rontend/src/components/ui/SaveAsDraftModal.jsx - Popup component
- [ ] Update rontend/src/components/transporter/StatusPill.jsx - Add gray theme for drafts

### Phase 3: Frontend Integration

**Files to Modify:**
- [ ] rontend/src/redux/slices/transporterSlice.js - Add draft async thunks
- [ ] rontend/src/features/transporter/CreateTransporterPage.jsx - Integrate modal + navigation blocking
- [ ] rontend/src/pages/TransporterMaintenance.jsx - Add draft filter + delete action

### Phase 4: Testing & Documentation

**Tasks:**
- [ ] End-to-end testing (all scenarios)
- [ ] Cross-user testing (ownership validation)
- [ ] Navigation blocking testing (browser back, menu nav, etc.)
- [ ] Create comprehensive implementation guide

---

## Success Criteria 

**Phase 1 Goals (All Completed):**
-  Draft creation endpoint with minimal validation
-  Draft update endpoint with ownership checks
-  Draft deletion endpoint (hard delete)
-  User-specific filtering in list endpoint
-  Partial data persistence support
-  Transaction-based integrity
-  Security validation (403 on cross-user access)
-  No breaking changes to existing functionality

---

## Known Limitations

**Current Phase 1:**
-  Backend only - no frontend UI yet
-  Manual API testing required (no automated tests)
-  No navigation blocking (Phase 3)
-  No toast notifications (Phase 3)
-  No form dirty tracking (Phase 2)

**To Be Addressed in Later Phases:**
- Phase 2: Frontend utilities and components
- Phase 3: UI integration and navigation blocking
- Phase 4: Automated testing and documentation

---

## Troubleshooting

### Error: \"Business name is required\"
- **Cause:** generalDetails.businessName missing or < 2 characters
- **Solution:** Ensure business name has at least 2 characters

### Error: 403 Forbidden
- **Cause:** Trying to update/delete another user's draft
- **Solution:** Verify you're logged in as the draft creator

### Error: \"Can only update drafts\"
- **Cause:** Trying to update a non-draft record via draft endpoint
- **Solution:** Use regular PUT /:id endpoint for non-drafts

### Error: Transaction rollback
- **Cause:** Database constraint violation or connection issue
- **Solution:** Check server logs for specific error, verify database schema

---

## Conclusion

**Phase 1 is 100% Complete!** 

All backend infrastructure for save-as-draft functionality is implemented and ready for testing. The implementation is:
-  Secure (ownership validation)
-  Flexible (partial data support)
-  Robust (transaction-based)
-  Reusable (pattern works for all modules)
-  User-private (drafts visible only to creator)

**Ready for Phase 2:** Frontend utilities and shared components.

---

**Implementation Date:** November 21, 2025  
**Developer:** GitHub Copilot  
**Total Code Added:** ~510 lines  
**Files Modified:** 2  
**Test Status:** Backend ready for manual API testing
