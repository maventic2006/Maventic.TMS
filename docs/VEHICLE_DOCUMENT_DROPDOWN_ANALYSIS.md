# Vehicle Document Upload & Dropdown Analysis

##  Current Implementation Status

### Document Upload Flow

#### Frontend (Create Page)
**Component**: DocumentsTab.jsx uses ThemeTable.jsx

**Upload Process**:
1. User clicks file upload icon in ThemeTable
2. File selected triggers \handleFileUpload\ function
3. **File Validation**:
   - Max size: 5MB
   - Allowed types: JPEG, PNG, GIF, PDF, DOC, DOCX
4. **Base64 Conversion**: Uses FileReader API
   \\\javascript
   reader.onload = () => {
     updatedData[rowIndex] = {
       fileName: file.name,
       fileType: file.type,
       fileData: reader.result.split(',')[1], // Base64 without prefix
     };
   };
   \\\
5. **Storage in State**: Document stored in \ormData.documents\ array
6. **Preview Available**: Eye icon button triggers preview modal (added recently)

#### Backend Storage
**Controller**: \ehicleController.js\ - \createVehicle\ function

**Current Status**:  **DISABLED** - Document insertion commented out

**Reason**: Database schema mismatch
- \ehicle_documents\ table lacks \ehicle_id_code\ column
- No foreign key relationship to vehicles
- Current table is generic, not vehicle-specific

**What Would Happen** (if enabled):
\\\javascript
// TODO: Document insertion - vehicle_documents table needs migration
// Current table structure doesn't support vehicle_id_code or vehicle_maintenance_id columns
// Skipping document insertion for now
\\\

**Required for Storage**:
1. Database migration to add \ehicle_id_code\ column
2. Add foreign key: \ehicle_id_code\  \ehicle_basic_information_hdr.vehicle_id_code_hdr\
3. Re-enable insertion code in \createVehicle\ function

#### Document Display in Details Page
**Component**: \DocumentsViewTab.jsx\

**Current Status**:  **UI READY** - Backend returns empty array

**Features Implemented**:
- View button with preview modal (PDF/images)
- Download button with Base64 to Blob conversion
- Document cards with metadata
- Status badges (Valid/Expiring/Expired)

**What Happens**: Documents array is empty because backend can't query them

---

##  Database Storage Schema (When Implemented)

### Two-Table Storage Pattern

#### 1. \ehicle_documents\ Table (Metadata)
**Current Structure** (needs migration):
\\\sql
-- Current (MISSING vehicle_id_code)
CREATE TABLE vehicle_documents (
  document_unique_id INT AUTO_INCREMENT PRIMARY KEY,
  document_id VARCHAR(20),
  document_type_id VARCHAR(20),
  reference_number VARCHAR(100),
  permit_category VARCHAR(100),
  permit_code VARCHAR(50),
  document_provider VARCHAR(200),
  coverage_type_id VARCHAR(10),
  premium_amount DECIMAL(10,2),
  valid_from DATE,
  valid_to DATE,
  remarks TEXT,
  -- MISSING: vehicle_id_code VARCHAR(20),
  -- MISSING: vehicle_maintenance_id VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(10) DEFAULT 'ACTIVE'
);
\\\

**Required Migration**:
\\\sql
ALTER TABLE vehicle_documents 
ADD COLUMN vehicle_id_code VARCHAR(20) AFTER document_id,
ADD COLUMN vehicle_maintenance_id VARCHAR(20) AFTER reference_number,
ADD FOREIGN KEY (vehicle_id_code) 
  REFERENCES vehicle_basic_information_hdr(vehicle_id_code_hdr);
\\\

#### 2. \document_upload\ Table (Binary Data)
**Existing Structure** (ready to use):
\\\sql
CREATE TABLE document_upload (
  document_id VARCHAR(20) PRIMARY KEY,  -- DU0001, DU0002, etc.
  file_name VARCHAR(255),
  file_type VARCHAR(100),              -- MIME type
  file_xstring_value LONGTEXT,         -- Base64 encoded file
  system_reference_id VARCHAR(20),     -- FK to vehicle_documents.document_id
  is_verified BOOLEAN DEFAULT FALSE,
  valid_from DATE,
  valid_to DATE,
  created_by VARCHAR(10),
  updated_by VARCHAR(10),
  created_at DATETIME,
  updated_at DATETIME,
  status VARCHAR(10) DEFAULT 'ACTIVE'
);
\\\

### Storage Workflow (When Enabled)

\\\mermaid
graph TD
    A[User Uploads File] --> B[Convert to Base64]
    B --> C[Store in formData.documents]
    C --> D[User Submits Form]
    D --> E[POST /api/vehicles]
    E --> F{Loop Through Documents}
    F --> G[Generate document_id: DOC0001]
    G --> H[Insert vehicle_documents<br/>metadata record]
    H --> I{Has File Data?}
    I -->|Yes| J[Generate doc_upload_id: DU0001]
    J --> K[Insert document_upload<br/>binary record]
    K --> L[Link via system_reference_id]
    I -->|No| M[Skip Binary Storage]
    L --> N[Transaction Commit]
    M --> N
    N --> O[Return Success]
\\\

**Database Relationships**:
\\\
vehicle_basic_information_hdr (vehicle_id_code_hdr)
   (1:N)
vehicle_documents (vehicle_id_code, document_id)
   (1:1)
document_upload (system_reference_id  document_id, file_xstring_value)
\\\

---

##  Preview & Download Capabilities

### Preview During Upload (Create Page)
**Status**:  **IMPLEMENTED**

**How It Works**:
1. ThemeTable has Eye icon next to uploaded file
2. Click triggers \handlePreviewDocument(row)\
3. Modal opens with:
   - **PDFs**: Displayed in iframe with base64 data URL
   - **Images**: Displayed in img tag with base64 data URL
   - **Others**: Fallback message

**Code**:
\\\javascript
// ThemeTable.jsx
<button onClick={() => handlePreviewDocument(row)}>
  <Eye className="w-3 h-3" />
</button>

// Preview Modal
{previewDocument && (
  <div className="fixed inset-0 z-50 ...">
    {fileType?.startsWith("image/") ? (
      <img src={\data:\;base64,\\} />
    ) : fileType === "application/pdf" ? (
      <iframe src={\data:application/pdf;base64,\\} />
    ) : (
      <p>Preview not available</p>
    )}
  </div>
)}
\\\

### Download from Details Page
**Status**:  **IMPLEMENTED** (UI ready, backend returns empty)

**How It Would Work**:
\\\javascript
// DocumentsViewTab.jsx
const handleDownloadDocument = (doc) => {
  // Convert Base64 to Blob
  const byteCharacters = atob(doc.fileData);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: doc.fileType });
  
  // Trigger Download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = doc.fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};
\\\

---

##  Dropdown Data Sources

### Master Data API
**Endpoint**: \GET /api/vehicles/master-data\

**Backend Query**:
\\\javascript
// vehicleController.js - getMasterData()
const vehicleTypes = await db('vehicle_type_master')
  .where('status', 'ACTIVE')
  .select('vehicle_type_id as value', 'vehicle_type_description as label');
\\\

### Dropdown Sources Verification

####  Using Master Tables (Database)

1. **Vehicle Type** - \BasicInformationTab.jsx\
   - Source: \ehicle_type_master\ table
   - Query: \ehicleTypes\ from \masterData\
   -  **Confirmed**: Database-backed

2. **Fuel Type** - \SpecificationsTab.jsx\
   - Source: Hardcoded array in \getMasterData\
   - Options: PETROL, DIESEL, CNG, ELECTRIC, HYBRID, LPG
   -  **Hardcoded** but centralized in backend

3. **Transmission Type** - \SpecificationsTab.jsx\
   - Source: Hardcoded array in \getMasterData\
   - Options: MANUAL, AUTOMATIC, AMT, CVT, DCT
   -  **Hardcoded** but centralized in backend

4. **Document Type** - \DocumentsTab.jsx\
   - Source: Hardcoded array in component AND in \getMasterData\
   -  **DUPLICATED** - Defined twice

5. **Emission Standards** - \SpecificationsTab.jsx\
   - Source: Hardcoded array in \getMasterData\
   - Options: BS4, BS6, EURO4, EURO5, EURO6
   -  **Hardcoded** but centralized in backend

6. **Usage Type** - \BasicInformationTab.jsx\
   - Source: Hardcoded array in \getMasterData\
   -  **Hardcoded** but centralized in backend

7. **Suspension Type** - \SpecificationsTab.jsx\
   - Source: Hardcoded array in \getMasterData\
   -  **Hardcoded** but centralized in backend

8. **Vehicle Condition** - \CapacityDetailsTab.jsx\
   - Source: Hardcoded array in \getMasterData\
   -  **Hardcoded** but centralized in backend

####  Using Country-State-City Package

9. **Country** - \OwnershipDetailsTab.jsx\, \DocumentsTab.jsx\
   - Source: \country-state-city\ npm package
   - \\\javascript
   const allCountries = Country.getAllCountries();
   \\\
   -  **External Library** (standard geographic data)

10. **State** - \OwnershipDetailsTab.jsx\
    - Source: \country-state-city\ package
    - Dynamic based on selected country
    -  **External Library**

11. **City** - \OwnershipDetailsTab.jsx\
    - Source: \country-state-city\ package
    - Dynamic based on selected state
    -  **External Library**

####  Local Hardcoded (Need to Migrate to Master Data)

12. **Loading Capacity Unit** - \CapacityDetailsTab.jsx\
    - Hardcoded: \['CBM', 'CFT', 'SQM', 'SQF']\
    -  **Should use master data**

13. **Door Type** - \CapacityDetailsTab.jsx\
    - Hardcoded: \['Roll-up', 'Swing', 'Sliding', 'None']\
    -  **Should use master data**

### Summary Table

| Dropdown | Source | Status | Master Table | Action Needed |
|----------|--------|--------|--------------|---------------|
| Vehicle Type | vehicle_type_master |  Database | Yes | None |
| Fuel Type | Backend hardcode |  Centralized | No | Consider master table |
| Transmission | Backend hardcode |  Centralized | No | Consider master table |
| Document Type | **DUPLICATED** |  Inconsistent | No | Use getMasterData only |
| Emission Std | Backend hardcode |  Centralized | No | Consider master table |
| Usage Type | Backend hardcode |  Centralized | No | Consider master table |
| Suspension | Backend hardcode |  Centralized | No | Consider master table |
| Condition | Backend hardcode |  Centralized | No | Consider master table |
| Country | country-state-city |  External | N/A | None |
| State | country-state-city |  External | N/A | None |
| City | country-state-city |  External | N/A | None |
| Load Unit | Component hardcode |  Local | No | **FIX: Use master data** |
| Door Type | Component hardcode |  Local | No | **FIX: Use master data** |

---

##  Issues Identified

### Critical Issues

1. **Document Upload Disabled**
   - Backend can't store documents (schema mismatch)
   - Users can upload files but they won't be saved
   - **Fix**: Database migration required

2. **Document Type Duplication**
   - Defined in \DocumentsTab.jsx\ component
   - Also defined in \getMasterData\ backend
   - **Fix**: Remove from component, use \masterData.documentTypes\

### Medium Issues

3. **Hardcoded Dropdowns in Components**
   - Loading Capacity Unit (CBM, CFT, etc.)
   - Door Type (Roll-up, Swing, etc.)
   - **Fix**: Add to backend \getMasterData\, fetch in Redux

4. **Missing Master Tables**
   - Fuel types should have \uel_type_master\ table
   - Transmission should have \	ransmission_type_master\ table
   - Emission standards should have \emission_standard_master\ table
   - **Fix**: Create master tables if standardization needed

---

##  What Works Currently

### Upload Flow (Frontend Only)
1.  User can select files in DocumentsTab
2.  File validation (size, type) works
3.  Base64 conversion works
4.  Files stored in \ormData.documents\ array
5.  Preview modal works (Eye icon)
6.  Form submission sends documents to backend
7.  Backend doesn't store documents (commented out)

### Display Flow (UI Ready)
1.  DocumentsViewTab component exists
2.  Preview modal implemented
3.  Download function implemented
4.  Backend returns empty documents array

### Dropdown Flow
1.  Vehicle Type fetched from database
2.  Other dropdowns work from backend \getMasterData\
3.  Some dropdowns hardcoded in components (needs fix)

---

##  Recommendations

### Immediate Actions

1. **Fix Document Type Duplication**
   \\\javascript
   // DocumentsTab.jsx - REMOVE local definition
   // const documentTypes = [... ] // DELETE THIS
   
   // USE masterData instead
   const { masterData } = useSelector((state) => state.vehicle);
   const documentTypes = masterData.documentTypes || [];
   \\\

2. **Move Hardcoded Dropdowns to Master Data**
   \\\javascript
   // Backend: vehicleController.js - getMasterData()
   const loadingCapacityUnits = [
     { value: 'CBM', label: 'Cubic Meter (CBM)' },
     { value: 'CFT', label: 'Cubic Feet (CFT)' },
     { value: 'SQM', label: 'Square Meter (SQM)' },
     { value: 'SQF', label: 'Square Feet (SQF)' },
   ];
   
   const doorTypes = [
     { value: 'ROLL_UP', label: 'Roll-up' },
     { value: 'SWING', label: 'Swing' },
     { value: 'SLIDING', label: 'Sliding' },
     { value: 'NONE', label: 'None' },
   ];
   \\\

3. **Create Database Migration for Documents**
   - Add \ehicle_id_code\ column to \ehicle_documents\
   - Add foreign key constraint
   - Test insertion and retrieval

### Future Enhancements

4. **Consider Master Tables for Static Data**
   - Fuel types, transmission types, etc.
   - Pros: Easier to manage via admin panel
   - Cons: More complex queries, overkill for static lists

5. **Implement Popup-Based Document Upload**
   - Similar to Transporter Bulk Upload modal
   - Better UX for file management
   - Separate preview area

---

##  Current State Summary

**Document Upload**:  Frontend ready, backend disabled
**Document Preview**:  Fully implemented (create & details)
**Document Download**:  Implemented (waiting for backend data)
**Dropdowns**:  Mostly centralized, 2 need fixing
**Database Schema**:  Needs migration for document storage

**Overall Status**: 70% Complete
- Frontend: 95% complete
- Backend: 30% complete (needs migration)
- Dropdowns: 85% standardized
