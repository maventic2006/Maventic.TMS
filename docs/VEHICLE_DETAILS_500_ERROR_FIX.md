# Vehicle Details Page 500 Error - Fix Documentation

##  Error Description

**Error**: 500 Internal Server Error when navigating to vehicle details page
**Endpoint**: GET /api/vehicles/VEH0011
**Location**: Backend API - vehicleController.js, getVehicleById function

### Error Messages

\\\
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Server error: Failed to fetch vehicle details
 Error fetching vehicle details: AxiosError
\\\

---

##  Root Cause Analysis

### The Problem

The error occurred because I recently added document retrieval code to the \getVehicleById\ function that attempted to query columns that **don't exist** in the database:

**What I tried to do:**
\\\javascript
const documents = await db('vehicle_documents as vd')
  .leftJoin('document_upload as du', 'vd.document_id', 'du.system_reference_id')
  .where('vd.vehicle_id_code', id)  //  THIS COLUMN DOESN'T EXIST
  .select(/* ... */);
\\\

### Database Schema Investigation

**Actual \ehicle_documents\ table structure:**
- Primary Key: \document_unique_id\ (auto_increment)
- Has: \document_id\, \document_type_id\, \eference_number\, \permit_category\, etc.
- **Missing**: \ehicle_id_code\ column - NO foreign key to vehicles!
- **Missing**: \ehicle_maintenance_id\ column

**This is a GENERIC documents table**, not vehicle-specific!

### Why This Happened

1. I assumed \ehicle_documents\ was vehicle-specific (following Transporter/Driver pattern)
2. I added code to query non-existent columns (\ehicle_id_code\)
3. The SQL query failed causing 500 error
4. The entire \getVehicleById\ function crashed, preventing page load

---

##  The Fix

### Changes Made to vehicleController.js

#### 1. Fixed getVehicleById Function (Line ~694)

**BEFORE (Broken):**
\\\javascript
const documents = await db('vehicle_documents as vd')
  .leftJoin('document_upload as du', 'vd.document_id', 'du.system_reference_id')
  .where('vd.vehicle_id_code', id)  //  Column doesn't exist
  .select(/* ... */);
\\\

**AFTER (Fixed):**
\\\javascript
// Get documents - TODO: Need to create vehicle-specific document relationship
// Current vehicle_documents table doesn't have vehicle_id_code column
// For now, returning empty array until proper migration is created
const documents = [];
\\\

#### 2. Commented Out Document Insertion in createVehicle (Line ~477)

**BEFORE (Would fail on insert):**
\\\javascript
await trx('vehicle_documents').insert({
  document_id: documentId,
  vehicle_id_code: vehicleId,  //  Column doesn't exist
  vehicle_maintenance_id: doc.vehicleMaintenanceId,  //  Column doesn't exist
  /* ... */
});
\\\

**AFTER (Disabled):**
\\\javascript
// TODO: Document insertion - vehicle_documents table needs migration
// Current table structure doesn't support vehicle_id_code or vehicle_maintenance_id columns
// Need to create proper migration before implementing document upload
// Skipping document insertion for now
\\\

---

##  Result

###  Fixed
- Vehicle details page now loads without 500 error
- \getVehicleById\ returns empty documents array
- No SQL errors in backend logs

###  Still Needed (Future Work)

**Option 1: Create Migration to Add Columns**
\\\sql
ALTER TABLE vehicle_documents 
ADD COLUMN vehicle_id_code VARCHAR(20) AFTER document_id,
ADD COLUMN vehicle_maintenance_id VARCHAR(20) AFTER reference_number,
ADD FOREIGN KEY (vehicle_id_code) REFERENCES vehicle_basic_information_hdr(vehicle_id_code_hdr);
\\\

**Option 2: Create New Vehicle-Specific Document Table**
\\\sql
CREATE TABLE vehicle_document_mapping (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id_code VARCHAR(20) NOT NULL,
  document_unique_id INT NOT NULL,
  FOREIGN KEY (vehicle_id_code) REFERENCES vehicle_basic_information_hdr(vehicle_id_code_hdr),
  FOREIGN KEY (document_unique_id) REFERENCES vehicle_documents(document_unique_id)
);
\\\

**Option 3: Use Existing vehicle_basic_information_itm Table**
- Check if this table already handles vehicle documents
- May already have proper structure

---

##  Database Tables Found

Related tables in the database:
- \ehicle_documents\ - Generic documents (no vehicle FK)
- \ehicle_basic_information_hdr\ - Vehicle header data
- \ehicle_basic_information_itm\ - Vehicle items/details (check this!)
- \ehicle_special_permit\ - Special permits
- \document_upload\ - Binary file storage
- \	ransporter_documents\ - Has proper transporter FK
- \driver_documents\ - Has proper driver FK

---

##  Testing

### How to Verify Fix

1. **Start backend server**: \
pm run dev\ in tms-backend
2. **Start frontend**: \
pm run dev\ in frontend
3. **Login** to the application
4. **Navigate to Vehicles** list page
5. **Click on any vehicle** (e.g., VEH0011)
6. **Verify**: Details page loads without errors
7. **Check**: Documents tab shows "No documents" message (empty state)

### Expected Behavior

-  No 500 errors in browser console
-  No SQL errors in backend logs
-  Vehicle details display correctly (Basic Info, Specifications, etc.)
-  Documents tab displays empty state message
-  No crashes when navigating between tabs

---

##  Lessons Learned

### What Went Wrong

1. **Assumption without verification**: Assumed table structure without checking schema
2. **No defensive coding**: Didn't wrap query in try-catch initially
3. **No migration check**: Should have verified table structure before coding
4. **Copy-paste from docs**: Used code from documentation that assumed ideal schema

### Best Practices Moving Forward

1.  **Always check database schema first** before writing queries
2.  **Use defensive coding** with try-catch for database operations
3.  **Verify foreign key relationships** before writing JOIN queries
4.  **Test with existing data** before pushing to frontend
5.  **Check if migrations are needed** for new features

### Correct Development Flow

\\\mermaid
graph TD
    A[Feature Request] --> B[Check Database Schema]
    B --> C{Columns Exist?}
    C -->|No| D[Create Migration]
    C -->|Yes| E[Write Query Code]
    D --> E
    E --> F[Test with curl/Postman]
    F --> G{Works?}
    G -->|No| H[Debug with logs]
    G -->|Yes| I[Integrate with Frontend]
    H --> E
\\\

---

##  Next Steps

### Immediate (DONE )
- [x] Fix getVehicleById to return empty documents array
- [x] Comment out document insertion in createVehicle
- [x] Document the issue and fix

### Short-term (TODO)
- [ ] Investigate \ehicle_basic_information_itm\ table structure
- [ ] Determine best approach for vehicle documents (migration vs new table)
- [ ] Create database migration if needed
- [ ] Re-implement document upload with correct schema
- [ ] Update frontend to handle documents properly

### Long-term
- [ ] Standardize document handling across all modules (Transporter, Driver, Vehicle)
- [ ] Create reusable document storage pattern
- [ ] Add database schema validation in CI/CD

---

##  Related Files

**Backend:**
- \	ms-backend/controllers/vehicleController.js\ (lines 477-530, 694-715)

**Frontend:**
- \rontend/src/features/vehicle/VehicleDetailsPage.jsx\
- \rontend/src/features/vehicle/components/DocumentsViewTab.jsx\
- \rontend/src/redux/slices/vehicleSlice.js\

**Documentation:**
- \docs/VEHICLE_DOCUMENT_UPLOAD_IMPLEMENTATION.md\ (needs updating)
- \docs/VEHICLE_DOCUMENT_PREVIEW_DOWNLOAD_IMPLEMENTATION.md\ (needs updating)

---

##  Summary

**Issue**: 500 error due to querying non-existent columns in vehicle_documents table
**Fix**: Return empty array for documents until proper migration is created
**Status**:  FIXED - Vehicle details page now loads correctly
**Follow-up**: Database migration needed to properly support vehicle document uploads

**Date Fixed**: November 7, 2025  
**Time to Fix**: ~15 minutes  
**Severity**: High (broke entire details page)  
**Impact**: Now resolved, page functional

---

**Important Note**: The document upload feature is temporarily disabled until the database schema is updated. The UI components are ready (ThemeTable, DocumentsViewTab), but the backend cannot store documents without proper foreign key relationships.
