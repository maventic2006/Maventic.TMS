# Vehicle Mandatory Documents Update

##  **CHANGE SUMMARY**

**User Request**: Reduce mandatory vehicle documents from **5 to 2** for vehicle creation.

**Mandatory Documents (NOW)**:
1.  **Vehicle Registration Certificate** (DN001)
2.  **Fitness Certificate** (DN012)

**Previously Mandatory (NOW OPTIONAL)**:
-  Vehicle Insurance (DN009) - Changed to optional
-  PUC Certificate (DN010) - Changed to optional
-  Tax Certificate (DN005) - Changed to optional

---

##  **BUSINESS RATIONALE**

**Current Requirement**: Only 2 mandatory documents needed for vehicle creation
**Future Flexibility**: May revert back to 5 mandatory documents based on business needs
**Implementation**: Database configuration allows easy toggle of mandatory flags

---

##  **CHANGES MADE**

### Backend Changes

#### 1. Database Migration

**File**: 	ms-backend/migrations/20251110133308_add_vehicle_document_configurations.js

**Purpose**: Add VEHICLE-specific document configurations with proper mandatory flags

**New Document Type IDs Created**:
- VDT001 - Vehicle Registration Certificate (MANDATORY)
- VDT002 - Vehicle Insurance (OPTIONAL)
- VDT003 - PUC Certificate (OPTIONAL)
- VDT004 - Fitness Certificate (MANDATORY)
- VDT005 - Tax Certificate (OPTIONAL)
- VDT006 - Permit Certificate (OPTIONAL)
- VDT007 - Service Bill (OPTIONAL)
- VDT008 - Inspection Report (OPTIONAL)

**Migration Status**:  **Successfully Applied (Batch 144)**

#### 2. Controller Fallback Data Update

**File**: 	ms-backend/controllers/vehicleController.js

**Line**: 1163-1179 (getMasterData function)

**Change**: Updated fallback data to match new mandatory document configuration

`javascript
// Updated fallback with only 2 mandatory documents
{ value: 'DN001', label: 'Vehicle Registration Certificate', isMandatory: true, ... },  //  MANDATORY
{ value: 'DN012', label: 'Fitness Certificate', isMandatory: true, ... },              //  MANDATORY
{ value: 'DN009', label: 'Vehicle Insurance', isMandatory: false, ... },               //  Optional
{ value: 'DN010', label: 'PUC certificate', isMandatory: false, ... },                 //  Optional
{ value: 'DN005', label: 'Tax Certificate', isMandatory: false, ... },                 //  Optional
`

---

##  **DOCUMENT CONFIGURATION TABLE**

| Document Name | Doc ID | Mandatory | Expiry Required | Verification Required |
|--------------|--------|-----------|-----------------|----------------------|
| **Vehicle Registration Certificate** | DN001 |  **YES** |  No |  Yes |
| **Fitness Certificate** | DN012 |  **YES** |  Yes |  No |
| Vehicle Insurance | DN009 |  No |  Yes |  Yes |
| PUC Certificate | DN010 |  No |  Yes |  No |
| Tax Certificate | DN005 |  No |  Yes |  No |
| Permit Certificate | DN011 |  No |  Yes |  No |
| Service Bill | DN006 |  No |  No |  No |
| Inspection Report | DN007 |  No |  Yes |  No |

---

##  **HOW TO REVERT TO 5 MANDATORY DOCUMENTS**

If business requirements change and you need to make all 5 documents mandatory again:

### Option 1: Database Update (Recommended)

`sql
-- Make Vehicle Insurance mandatory
UPDATE doc_type_configuration 
SET is_mandatory = true 
WHERE doc_name_master_id = 'DN009' AND user_type = 'VEHICLE';

-- Make PUC Certificate mandatory
UPDATE doc_type_configuration 
SET is_mandatory = true 
WHERE doc_name_master_id = 'DN010' AND user_type = 'VEHICLE';

-- Make Tax Certificate mandatory
UPDATE doc_type_configuration 
SET is_mandatory = true 
WHERE doc_name_master_id = 'DN005' AND user_type = 'VEHICLE';
`

### Option 2: Create New Migration

`ash
cd tms-backend
npx knex migrate:make revert_vehicle_mandatory_documents
`

Then update the migration file to toggle mandatory flags.

---

##  **TESTING STEPS**

### 1. Verify Master Data API

`ash
GET http://localhost:5000/api/vehicle/master-data
`

**Expected Response**:
`json
{
  "documentTypes": [
    {
      "value": "DN001",
      "label": "Vehicle Registration Certificate",
      "isMandatory": true,
      "isExpiryRequired": false,
      "isVerificationRequired": true
    },
    {
      "value": "DN012",
      "label": "Fitness Certificate",
      "isMandatory": true,
      "isExpiryRequired": true,
      "isVerificationRequired": false
    },
    {
      "value": "DN009",
      "label": "Vehicle Insurance",
      "isMandatory": false,
      ...
    }
  ]
}
`

### 2. Frontend Display Test

1. Navigate to: **Vehicle Master  Create Vehicle  Documents Tab**
2. Click **"Upload Documents"** button
3. **Verify** in UI:
   - "Vehicle Registration Certificate" shows **(Required)** label
   - "Fitness Certificate" shows **(Required)** label
   - "Vehicle Insurance" shows NO (Required) label
   - "PUC Certificate" shows NO (Required) label
   - "Tax Certificate" shows NO (Required) label

### 3. Validation Test

**Test Case 1**: Submit without mandatory documents
- **Expected**: Validation error - "Vehicle Registration Certificate and Fitness Certificate are required"

**Test Case 2**: Submit with only 2 mandatory documents
- **Expected**:  Success - Vehicle created

**Test Case 3**: Submit with all documents
- **Expected**:  Success - Vehicle created with all documents

---

##  **FILES MODIFIED**

### Backend
1.  	ms-backend/migrations/20251110133308_add_vehicle_document_configurations.js (NEW)
2.  	ms-backend/controllers/vehicleController.js (Lines 1163-1179)

### Documentation
3.  docs/VEHICLE_MANDATORY_DOCUMENTS_UPDATE.md (NEW - This file)

---

##  **TECHNICAL NOTES**

### Database Schema

**Table**: doc_type_configuration

**Key Columns**:
- document_type_id (PK) - Unique ID for each config (VDT001-VDT008 for vehicles)
- doc_name_master_id (FK) - References document_name_master table
- user_type - 'VEHICLE', 'TRANSPORTER', 'DRIVER', etc.
- is_mandatory - Boolean flag for required documents
- is_expiry_required - Boolean flag for documents with expiry dates
- is_verification_required - Boolean flag for documents needing verification

### API Response Structure

The getMasterData() API in vehicle controller:
1. Queries doc_type_configuration table with LEFT JOIN to document_name_master
2. Filters by user_type = 'VEHICLE'
3. Returns array of document types with mandatory flags
4. Falls back to hardcoded data if database unavailable

### Frontend Implementation

**File**: rontend/src/features/vehicle/components/DocumentUploadModal.jsx

The modal displays document types from masterData.documentTypes and automatically shows "(Required)" label for documents where isMandatory === true.

---

##  **STATUS**

 **COMPLETE - READY FOR USE**

**Summary**:
- Database migration applied successfully (Batch 144)
- Backend controller updated with new fallback data
- Only 2 documents now mandatory for vehicle creation
- Easy revert path documented for future changes

---

**Date**: November 10, 2025  
**Change Type**: Business Logic Update - Mandatory Document Reduction  
**Database Impact**: New vehicle-specific document configurations added  
**Migration Batch**: 144
