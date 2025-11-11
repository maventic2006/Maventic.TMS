# TMS Driver Bulk Upload Guidelines

> **Comprehensive Bulk Upload Functionality Specifications for Driver Management**

This document establishes the detailed requirements, technical specifications, and implementation standards for the bulk upload functionality for drivers in the TMS (Transportation Management System) project.

---

##  **FUNCTIONAL REQUIREMENTS**

### 1. Core Features

#### **Upload Functionality**

- **Location**: Driver List page (DriverMaintenance)
- **Access**: Product Owner role only
- **Capacity**: Support for 1000+ drivers per upload batch
- **File Format**: Excel files (.xlsx, .xls) with relational structure
- **Validation**: Same validation rules as manual driver creation (all mandatory fields required)
- **Document Handling**: Skip document file uploads in bulk mode (metadata only)
- **Status Workflow**: Bulk uploaded drivers  "Pending Approval"  User uploads documents  "Active"

#### **Download Functionality**

- **Template Download**: Excel template with all required columns
- **Error Report Download**: Failed validation rows with highlighted errors
- **Batch History Download**: Upload history with success/error details

### 2. User Interface Requirements

#### **Driver List Page Integration**

- **Bulk Upload Button**: Add Bulk Upload button next to Create button
- **Modal Popup**: Dedicated modal with file picker for upload interface
- **Progress Indicator**: Real-time upload progress with live processing log
- **Batch History Section**: Track all upload batches with details
- **Processing Strategy**: Asynchronous background processing for large batches (1000+ records)

#### **Upload Interface Components**

\\\

 Bulk Upload Driver Data                         [X] 

 [ Download Template] [ Upload History]          
-
  
   Drop Excel file here or click to browse      
  Supports 1000+ drivers                          
  Format: .xlsx, .xls                             
  

 Processing Progress: 45%                            
                           ¦
                                                     
  Live Processing Log:                            
  
   Row 1: DRV001 - John Doe created             
   Row 2: DRV002 - Jane Smith created           
   Row 3: Invalid phone number format           
   Row 4: DRV003 - Bob Wilson created           
  ... (scrollable log)                            
  
¦
 Results:                                            
  945 Valid Created |  55 Invalid (Errors)       
 [ Download Error Report] [ Close]               

\\\

---

##  **EXCEL TEMPLATE STRUCTURE**

### **Relational Structure Approach**

The Excel file uses a **parent-child relational structure** where:
- Each driver has a unique \Driver_Ref_ID\ in the Basic Info sheet
- Child records (Addresses, Documents, History, Accidents) reference the parent via \Driver_Ref_ID\
- Multiple child records can exist for one driver
- **Excluded**: Transporter Mapping, Vehicle Mapping, Blacklist Mapping tabs (not part of bulk upload)

### **Sheet 1: Basic Information**

\\\
Column | Field Name              | Type      | Required | Format/Values
-------|------------------------|-----------|----------|------------------
A      | Driver_Ref_ID          | Text      | Yes      | DR001, DR002, etc.
B      | Full_Name              | Text      | Yes      | Min 2 characters
C      | Date_Of_Birth          | Date      | Yes      | YYYY-MM-DD (Age 18-65)
D      | Gender                 | Text      | No       | Male/Female/Other
E      | Blood_Group            | Text      | No       | A+, A-, B+, B-, AB+, AB-, O+, O-
F      | Phone_Number           | Text      | Yes      | 10 digits starting with 6-9
G      | Email_ID               | Text      | No       | Valid email format
H      | Emergency_Contact      | Text      | Yes      | 10 digits starting with 6-9
I      | Alternate_Phone_Number | Text      | No       | 10 digits starting with 6-9

Note: 
- Phone_Number must be unique across all drivers
- Email_ID must be unique if provided
- Emergency_Contact is mandatory
- Date_Of_Birth must result in age between 18-65 years
\\\

### **Sheet 2: Addresses**

\\\
Column | Field Name              | Type      | Required | Format/Values
-------|------------------------|-----------|----------|------------------
A      | Driver_Ref_ID          | Text      | Yes      | DR001 (links to Sheet 1)
B      | Address_Type_ID        | Text      | Yes      | Must exist in master data
C      | Street_1               | Text      | Yes      | Address line 1
D      | Street_2               | Text      | No       | Address line 2
E      | City                   | Text      | Yes      | Valid city name
F      | District               | Text      | No       | District name
G      | State                  | Text      | Yes      | Valid state code (e.g., MH, DL)
H      | Country                | Text      | Yes      | Country ISO code (IN, US, etc.)
I      | Postal_Code            | Text      | Yes      | Postal/ZIP code
J      | Is_Primary             | Text      | Yes      | Y/N (One must be Y per driver)

Note: 
- Each row represents one address
- Multiple rows can have same Driver_Ref_ID
- At least one address must be marked as primary (Is_Primary = Y)
- Only one address can be primary per driver
\\\

### **Sheet 3: Documents** (Metadata Only - No File Upload)

\\\
Column | Field Name              | Type      | Required | Format/Values
-------|------------------------|-----------|----------|------------------
A      | Driver_Ref_ID          | Text      | Yes      | DR001 (links to Sheet 1)
B      | Document_Type          | Text      | Yes      | Must exist in document_name_master
C      | Document_Number        | Text      | Yes      | Unique document identifier
D      | Issuing_Country        | Text      | No       | Country ISO code
E      | Issuing_State          | Text      | No       | State ISO code
F      | Valid_From             | Date      | No       | YYYY-MM-DD
G      | Valid_To               | Date      | No       | YYYY-MM-DD
H      | Remarks                | Text      | No       | Additional notes
I      | Active_Flag            | Text      | No       | Y/N (Default: Y)

Note: 
- Only document metadata is captured
- Actual file upload happens later through driver update UI
- Document_Number must be unique for each document type
- Valid document number format is validated based on document type
- Driver status remains "Pending Approval" until documents are uploaded via UI
\\\

### **Sheet 4: Employment History** (Optional)

\\\
Column | Field Name              | Type      | Required | Format/Values
-------|------------------------|-----------|----------|------------------
A      | Driver_Ref_ID          | Text      | Yes      | DR001 (links to Sheet 1)
B      | Employer               | Text      | No       | Previous employer name
C      | Employment_Status      | Text      | No       | Full-time/Part-time/Contract
D      | From_Date              | Date      | No       | YYYY-MM-DD
E      | To_Date                | Date      | No       | YYYY-MM-DD
F      | Job_Title              | Text      | No       | Position/Role

Note: 
- Employment history is completely optional
- Multiple rows can have same Driver_Ref_ID
- To_Date can be NULL for current employment
- From_Date should be earlier than To_Date if both are provided
\\\

### **Sheet 5: Accident & Violation Records** (Optional)

\\\
Column | Field Name                  | Type      | Required | Format/Values
--------|-----------------------------|-----------|----------|------------------
A       | Driver_Ref_ID              | Text      | Yes      | DR001 (links to Sheet 1)
B       | Type                       | Text      | No       | Must exist in violation_type_master
C       | Description                | Text      | No       | Details of accident/violation
D       | Date                       | Date      | No       | YYYY-MM-DD
E       | Vehicle_Registration_Number| Text      | No       | Vehicle reg number

Note: 
- Accident & Violation records are completely optional
- Multiple rows can have same Driver_Ref_ID
- All fields are optional in bulk upload
- Type must be a valid violation type if provided
\\\

---

##  **EXCEL TEMPLATE EXAMPLES**

### **Example: Single Driver with Multiple Addresses and Documents**

**Sheet 1 - Basic Information:**
\\\
Driver_Ref_ID | Full_Name    | DOB        | Gender | Blood_Group | Phone_Number  | Email_ID          | Emergency_Contact | Alt_Phone
DR001        | John Doe     | 1990-05-15 | Male   | O+         | 9876543210   | john.doe@mail.com | 9876543211       | 9876543212
\\\

**Sheet 2 - Addresses:**
\\\
Driver_Ref_ID | Address_Type_ID | Street_1      | City    | District | State | Country | Postal_Code | Is_Primary
DR001        | AT001           | 123 Main St   | Mumbai  | Mumbai   | MH    | IN      | 400001      | Y
DR001        | AT002           | 456 Park Ave  | Pune    | Pune     | MH    | IN      | 411001      | N
\\\

**Sheet 3 - Documents:**
\\\
Driver_Ref_ID | Document_Type    | Document_Number | Issuing_Country | Issuing_State | Valid_From | Valid_To   | Active
DR001        | Driver License   | MH0120230001234 | IN              | MH           | 2023-01-01 | 2043-01-01 | Y
DR001        | Aadhaar Card     | 123456789012    | IN              | MH           | 2015-01-01 | NULL       | Y
\\\

**Sheet 4 - Employment History:** (Optional)
\\\
Driver_Ref_ID | Employer         | Employment_Status | From_Date  | To_Date    | Job_Title
DR001        | ABC Transport    | Full-time        | 2020-01-01 | 2023-12-31 | Driver
DR001        | XYZ Logistics    | Contract         | 2018-01-01 | 2019-12-31 | Delivery Driver
\\\

**Sheet 5 - Accident & Violation Records:** (Optional)
\\\
Driver_Ref_ID | Type            | Description                  | Date       | Vehicle_Reg_Number
DR001        | Minor Accident  | Minor fender bender         | 2022-05-10 | MH01AB1234
DR001        | Traffic Violation| Overspeeding on highway    | 2023-03-15 | MH01AB1234
\\\

### **Example: Minimal Driver (Only Required Fields)**

**Sheet 1 - Basic Information:**
\\\
Driver_Ref_ID | Full_Name    | DOB        | Phone_Number  | Emergency_Contact
DR002        | Jane Smith   | 1985-08-20 | 9123456789   | 9123456790
\\\

**Sheet 2 - Addresses:**
\\\
Driver_Ref_ID | Address_Type_ID | Street_1      | City     | State | Country | Postal_Code | Is_Primary
DR002        | AT001           | 789 Elm St    | Delhi    | DL    | IN      | 110001      | Y
\\\

**Sheet 3 - Documents:**
\\\
Driver_Ref_ID | Document_Type    | Document_Number
DR002        | Driver License   | DL0720230009876
\\\

**Sheet 4 - Employment History:** (Empty - Optional)

**Sheet 5 - Accident & Violation Records:** (Empty - Optional)

---

##  **TECHNICAL ARCHITECTURE**

### 1. Database Schema

#### **Bulk Upload Tracking Tables**

\\\sql
-- Driver bulk upload batches
CREATE TABLE driver_bulk_upload_batches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  batch_id VARCHAR(50) UNIQUE NOT NULL,
  uploaded_by INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  total_rows INT NOT NULL,
  valid_rows INT NOT NULL,
  invalid_rows INT NOT NULL,
  status ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
  upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_timestamp TIMESTAMP NULL,
  error_file_path VARCHAR(500) NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Individual driver upload records
CREATE TABLE driver_bulk_upload_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  batch_id VARCHAR(50) NOT NULL,
  driver_ref_id VARCHAR(50) NOT NULL,
  excel_row_number INT NOT NULL,
  validation_status ENUM('valid', 'invalid') NOT NULL,
  validation_errors JSON NULL,
  created_driver_id VARCHAR(50) NULL,
  FOREIGN KEY (batch_id) REFERENCES driver_bulk_upload_batches(batch_id),
  FOREIGN KEY (created_driver_id) REFERENCES driver_general_info(driver_id)
);
\\\

#### **Approval Flow Integration**

- **Initial Status**: Bulk uploaded drivers  "Pending for Approval" status
- **Document Upload Required**: User must upload actual document files via driver update UI
- **Status Progression**: "Pending Approval"  (Documents Uploaded)  "Active"
- **Approval Requirement**: Different Product Owner than uploader
- **Individual Approval**: Each driver approved separately
- **Batch Tracking**: Maintain batch association throughout approval

### 2. Frontend Architecture

#### **Redux State Management**

\\\javascript
// driverSlice.js additions
const initialState = {
  // Existing state...

  // Bulk upload state
  bulkUpload: {
    isUploading: false,
    uploadProgress: 0,
    validationResults: null,
    currentBatch: null,
    uploadHistory: [],
    errors: null
  }
};

// New async thunks
export const uploadDriverBulk = createAsyncThunk(...)
export const downloadDriverTemplate = createAsyncThunk(...)
export const fetchDriverUploadHistory = createAsyncThunk(...)
export const downloadDriverErrorReport = createAsyncThunk(...)
\\\

#### **Component Structure**

\\\
src/features/driver/
 components/
    BulkUploadModal.jsx
    BulkUploadHistory.jsx
    ValidationResults.jsx
    ErrorReportViewer.jsx
 utils/
    driverExcelTemplateGenerator.js
    driverExcelValidator.js
    driverBulkUploadHelpers.js
\\\

### 3. Backend Architecture

#### **API Endpoints**

\\\
POST   /api/driver/bulk-upload
GET    /api/driver/bulk-upload/template
GET    /api/driver/bulk-upload/history/:userId
GET    /api/driver/bulk-upload/error-report/:batchId
POST   /api/driver/bulk-upload/validate
GET    /api/driver/bulk-upload/status/:batchId
\\\

#### **Processing Flow**

1. **File Upload**: Receive and store Excel file
2. **Structure Validation**: Verify Excel structure (5 sheets) and columns
3. **Data Validation**: Validate each row against driver creation rules
4. **Batch Creation**: Create driver_bulk_upload_batches record
5. **Driver Creation**: Create valid drivers with "Pending for Approval" status
6. **Error Report**: Generate Excel file with validation errors
7. **Notification**: Trigger approval workflow notifications

---

##  **WORKFLOW SPECIFICATIONS**

### 1. Upload Process Flow

\\\mermaid
graph TD
    A[User Clicks Bulk Upload] --> B[Open Upload Modal]
    B --> C[Download Template Option]
    B --> D[Upload Excel File]
    D --> E[Validate File Structure]
    E --> F{Structure Valid?}
    F -->|No| G[Show Structure Errors]
    F -->|Yes| H[Validate Row Data]
    H --> I[Generate Validation Results]
    I --> J{Any Valid Rows?}
    J -->|No| K[Show All Errors, Stop]
    J -->|Yes| L[Show Results Preview]
    L --> M[User Confirms Upload]
    M --> N[Create Valid Drivers - Pending Status]
    N --> O[Generate Error Report]
    O --> P[Update Batch Status]
    P --> Q[Trigger Approval Notifications]
    Q --> R[User Uploads Documents via Update UI]
    R --> S[Driver Status: Pending  Active]
\\\

### 2. Validation Rules

#### **File Structure Validation**

- All 5 sheets present (Basic Information, Addresses, Documents, Employment History, Accident & Violation)
- Required columns present in each sheet
- Column headers match template exactly
- Support for 1000+ data rows
- File format compatibility (.xlsx, .xls)

#### **Row Data Validation**

##### **Basic Information Validation**

- **Full_Name**: Required, min 2 characters
- **Date_Of_Birth**: Required, valid date, age 18-65 years
- **Gender**: Optional, must be valid value if provided (Male/Female/Other)
- **Blood_Group**: Optional, must be valid value if provided (A+, A-, B+, B-, AB+, AB-, O+, O-)
- **Phone_Number**: Required, exactly 10 digits, starts with 6-9, unique across system
- **Email_ID**: Optional, valid email format, unique if provided
- **Emergency_Contact**: Required, exactly 10 digits, starts with 6-9
- **Alternate_Phone_Number**: Optional, exactly 10 digits, starts with 6-9

##### **Address Validation**

- At least one address required per driver
- One and only one address must be marked as primary (Is_Primary = Y)
- **Address_Type_ID**: Must exist in address_type_master table
- **Street_1**: Required
- **City**: Required
- **State**: Required, valid state code
- **Country**: Required, valid country ISO code
- **Postal_Code**: Required
- **Country-State-City**: Relationship must be valid against master data

##### **Document Validation**

- **Document_Type**: Must exist in document_name_master table
- **Document_Number**: Required, unique for each document type, valid format based on type
  - Driver License: Alphanumeric format validation
  - Aadhaar: 12 digits
  - PAN: 10 alphanumeric characters
  - Passport: Alphanumeric format validation
- **Valid_From/Valid_To**: Optional, Valid_From must be before Valid_To
- **Issuing_Country/State**: Optional, must be valid codes if provided
- **No File Upload**: Only metadata captured, files uploaded later via UI

##### **Employment History Validation** (All Optional)

- **Employer**: Optional text field
- **Employment_Status**: Optional, must be valid value if provided
- **From_Date**: Optional date
- **To_Date**: Optional date, must be after From_Date if both provided
- **Job_Title**: Optional text field

##### **Accident & Violation Validation** (All Optional)

- **Type**: Optional, must exist in violation_type_master if provided
- **Description**: Optional text field
- **Date**: Optional date
- **Vehicle_Registration_Number**: Optional text field

#### **Business Rules Validation**

- **Duplicate Prevention**: Phone number and email uniqueness
- **Age Validation**: Must be between 18-65 years
- **Date Logic**: From dates before To dates
- **Master Data References**: All type IDs must exist in respective master tables
- **Document Format**: Validate document numbers based on document type
- **Primary Address**: Exactly one primary address per driver
- **Emergency Contact**: Must be different from primary phone number (warning only)

### 3. Error Handling & Reporting

#### **Error Types**

\\\javascript
const DRIVER_ERROR_TYPES = {
  STRUCTURE: "File structure invalid",
  REQUIRED_FIELD: "Required field missing",
  INVALID_FORMAT: "Invalid data format",
  DUPLICATE_DATA: "Duplicate data found",
  MASTER_DATA_MISMATCH: "Invalid master data reference",
  BUSINESS_RULE: "Business rule validation failed",
  RELATIONAL_INTEGRITY: "Child record without parent reference",
  AGE_VALIDATION: "Age must be between 18-65 years",
  PHONE_FORMAT: "Invalid phone number format",
  EMAIL_FORMAT: "Invalid email format",
  DOCUMENT_FORMAT: "Invalid document number format",
  PRIMARY_ADDRESS: "Must have exactly one primary address",
  DATE_LOGIC: "Invalid date range",
};
\\\

#### **Error Report Format**

- **Excel File**: Separate error report with failed records only
- **Error Highlighting**: Red cell backgrounds for invalid data
- **Error Columns**: Additional columns with specific error messages
- **Summary Sheet**: Overview of validation errors with statistics
- **Sheet-wise Errors**: Each sheet has its own error section
- **Row References**: Clear indication of which rows failed validation

**Error Report Structure:**
\\\
Sheet 1: Error Summary
- Total Drivers: 1000
- Valid Drivers: 945
- Invalid Drivers: 55
- Error Breakdown by Type
- Common Errors

Sheet 2: Basic Information Errors (if any)
Sheet 3: Address Errors (if any)
Sheet 4: Document Errors (if any)
Sheet 5: Employment History Errors (if any)
Sheet 6: Accident & Violation Errors (if any)
\\\

---

##  **APPROVAL WORKFLOW INTEGRATION**

### 1. Status Management

#### **Driver Statuses**

\\\javascript
const DRIVER_STATUS = {
  PENDING_APPROVAL: "pending_approval",    // Initial status after bulk upload
  DOCUMENTS_PENDING: "documents_pending",  // Documents metadata added, files pending
  APPROVED: "approved",                    // Approved by Product Owner
  ACTIVE: "active",                        // Documents uploaded + approved
  INACTIVE: "inactive",
  REJECTED: "rejected",
};
\\\

#### **Status Progression Flow**

\\\mermaid
graph LR
    A[Bulk Upload] --> B[Pending Approval]
    B --> C{Approved?}
    C -->|Yes| D[Documents Pending]
    C -->|No| E[Rejected]
    D --> F{Files Uploaded?}
    F -->|Yes| G[Active]
    F -->|No| D
\\\

#### **Bulk Upload Specific Rules**

- **Initial Status**: "Pending for Approval" (documents metadata captured)
- **Approval Requirement**: Different Product Owner than uploader must approve
- **Document Upload**: User must upload actual files via driver update UI
- **Status Update**: Only after document files are uploaded, status changes to "Active"
- **Individual Approval**: Each driver approved separately
- **Batch Tracking**: Maintain batch association throughout approval
- **Rejection Handling**: Rejected drivers can be edited and resubmitted

### 2. Approval Interface Enhancements

#### **Driver List Modifications**

\\\javascript
// Additional columns
{
  key: 'batchInfo',
  label: 'Batch Info',
  render: (driver) => (
    driver.bulk_batch_id ?
    <BatchPill batchId={driver.bulk_batch_id} /> :
    <span>Manual Entry</span>
  )
}

{
  key: 'uploadedBy',
  label: 'Uploaded By',
  render: (driver) => driver.uploaded_by_name || 'N/A'
}

{
  key: 'documentsStatus',
  label: 'Documents',
  render: (driver) => (
    driver.documents_uploaded ?
    <span className="text-green-600"> Uploaded</span> :
    <span className="text-orange-600"> Pending</span>
  )
}
\\\

#### **Approval Actions**

- **Individual Approval**: Approve/Reject single driver
- **Batch Context**: Show other drivers from same batch
- **Document Check**: Verify all required documents are uploaded before activation
- **Approval History**: Track approval decisions per batch
- **Notification System**: Alert uploaders of approval decisions
- **Document Upload Reminder**: Notify users to upload document files

### 3. Role-Based Permissions

#### **Product Owner Restrictions**

\\\javascript
const DRIVER_BULK_UPLOAD_RULES = {
  MIN_APPROVERS: 2,
  SELF_APPROVAL: false,
  CROSS_APPROVAL: true, // PO1 uploads, PO2 approves
  DOCUMENT_UPLOAD_ROLE: ['product_owner', 'admin'],
};
\\\

---

##  **TRACKING & ANALYTICS**

### 1. Upload History

#### **History Information**

\\\javascript
const DRIVER_UPLOAD_HISTORY_FIELDS = {
  batchId: "Unique batch identifier",
  uploadedBy: "User who performed upload",
  uploadTimestamp: "When upload was initiated",
  filename: "Original Excel filename",
  totalRows: "Total drivers in file",
  validRows: "Successfully validated drivers",
  invalidRows: "Failed validation drivers",
  approvedCount: "Drivers approved so far",
  rejectedCount: "Drivers rejected so far",
  pendingCount: "Drivers still pending approval",
  documentsUploadedCount: "Drivers with documents uploaded",
  activeCount: "Drivers in active status",
  status: "Overall batch status",
};
\\\

#### **History Interface**

\\\jsx
<DriverBulkUploadHistory>
  <HistoryTable>
    <Column field="batchId" />
    <Column field="uploadTimestamp" />
    <Column field="uploadedBy" />
    <Column field="filename" />
    <Column field="validRows" />
    <Column field="invalidRows" />
    <Column field="approvalStatus" />
    <Column field="documentsStatus" />
    <ActionColumn>
      <DownloadErrorReport />
      <ViewBatchDetails />
      <ViewDocumentsPending />
    </ActionColumn>
  </HistoryTable>
</DriverBulkUploadHistory>
\\\

### 2. Performance Metrics

#### **Upload Metrics**

- Average processing time per batch
- Validation success rates
- Common validation errors
- Upload frequency by user
- Documents upload completion rate

#### **Approval Metrics**

- Average approval time
- Approval/rejection rates
- Batch completion rates
- Document upload time
- Cross-approver patterns
- Time from approval to active status

---

##  **SECURITY & VALIDATION**

### 1. File Security

#### **Upload Security**

- File type validation (.xlsx, .xls only)
- File size limits (max 10MB)
- Virus scanning (if applicable)
- Temporary file cleanup after processing
- Secure file storage with access control

#### **Data Security**

- Input sanitization for all text fields
- SQL injection prevention
- XSS protection
- Audit trail maintenance
- PII data encryption at rest

### 2. Business Logic Validation

#### **Duplicate Prevention**

\\\javascript
const DRIVER_DUPLICATE_CHECKS = [
  "phone_number",      // Strict - must be unique
  "email_id",          // Strict - must be unique if provided
  "document_number",   // Strict - per document type
];
\\\

#### **Master Data Validation**

- Country/State/City relationships
- Document type requirements from document_name_master
- Address type validations from address_type_master
- Gender and blood group validations
- Violation type validations from violation_type_master

#### **Age Validation**

\\\javascript
const validateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 18 && age <= 65;
};
\\\

#### **Document Number Validation**

\\\javascript
const validateDocumentNumber = (documentNumber, documentType) => {
  const patterns = {
    'Driver License': /^[A-Z]{2}[0-9]{13}$/,           // Example: MH0120230001234
    'Aadhaar': /^[0-9]{12}$/,                          // 12 digits
    'PAN': /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,              // Example: ABCDE1234F
    'Passport': /^[A-Z]{1}[0-9]{7}$/,                  // Example: A1234567
  };
  
  const pattern = patterns[documentType];
  return pattern ? pattern.test(documentNumber) : true; // Allow if no pattern defined
};
\\\

---

##  **IMPLEMENTATION PHASES**

### Phase 1: Foundation & Backend Setup (Week 1)

- [ ] Database schema creation (driver_bulk_upload_batches, driver_bulk_upload_records)
- [ ] Excel template generation with 5 sheets
- [ ] Install required packages (multer, exceljs, bull, socket.io)
- [ ] File upload API endpoint setup
- [ ] Basic Excel parsing logic for 5 sheets

### Phase 2: Validation Engine (Week 2)

- [ ] Multi-sheet Excel parsing with relational integrity
- [ ] Basic information validation (name, DOB, phone, email, age)
- [ ] Address validation (primary address check, country-state-city)
- [ ] Document metadata validation (type, number format, dates)
- [ ] Employment history validation (optional fields)
- [ ] Accident & violation validation (optional fields)
- [ ] Duplicate checking (phone, email, document numbers)
- [ ] Error collection and categorization
- [ ] Error report Excel generation

### Phase 3: Frontend UI (Week 3)

- [ ] Add Bulk Upload button to Driver List page
- [ ] Create Driver Bulk Upload Modal component
- [ ] File picker with drag-and-drop
- [ ] Progress bar and real-time log display
- [ ] Template download functionality
- [ ] Upload history interface
- [ ] Error report download interface
- [ ] Batch details viewer

### Phase 4: Processing & Integration (Week 4)

- [ ] Asynchronous batch processing with Bull queue
- [ ] Transaction management (process valid, collect invalid)
- [ ] Real-time WebSocket updates for progress
- [ ] Driver creation with "Pending for Approval" status
- [ ] Error report download endpoint
- [ ] Batch status tracking API
- [ ] Notification system for approvers

### Phase 5: Approval Workflow (Week 5)

- [ ] Cross-Product Owner approval logic
- [ ] Batch tracking in driver records
- [ ] Driver list UI updates (batch info, uploaded by)
- [ ] Document upload reminder system
- [ ] Status progression: Pending  Documents Pending  Active
- [ ] Rejection and resubmission workflow
- [ ] Approval history tracking

### Phase 6: Testing & Optimization (Week 6)

- [ ] Test with 1000+ driver Excel files
- [ ] Performance optimization for large batches
- [ ] Error handling and edge cases
- [ ] Validation rule testing (all field types)
- [ ] Document upload workflow testing
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] Comprehensive end-to-end testing

---

##  **TESTING REQUIREMENTS**

### 1. Test Scenarios

#### **Happy Path Testing**

- [ ] Valid Excel upload with all fields (1000+ rows)
- [ ] Valid Excel upload with only required fields
- [ ] Mixed valid/invalid rows
- [ ] Multiple addresses per driver (2-5 addresses)
- [ ] Multiple documents per driver (2-5 documents)
- [ ] Employment history records (0-10 records)
- [ ] Accident & violation records (0-5 records)
- [ ] Template download functionality
- [ ] Approval workflow end-to-end
- [ ] Document upload after approval

#### **Error Scenarios**

- [ ] Invalid file format (.csv, .txt, .pdf)
- [ ] Missing required sheets
- [ ] Missing required columns
- [ ] Exceeded row limit test (>1000)
- [ ] Duplicate phone numbers
- [ ] Duplicate email addresses
- [ ] Duplicate document numbers
- [ ] Invalid phone number formats
- [ ] Invalid email formats
- [ ] Invalid date formats
- [ ] Age less than 18 years
- [ ] Age greater than 65 years
- [ ] Invalid country/state/city combinations
- [ ] Invalid document number formats
- [ ] Missing primary address
- [ ] Multiple primary addresses
- [ ] Invalid master data references
- [ ] Date logic errors (From > To)
- [ ] Empty required fields
- [ ] Child records without parent (orphan addresses/documents)

#### **Approval Flow Testing**

- [ ] Cross-Product Owner approval
- [ ] Self-approval prevention
- [ ] Batch association maintenance
- [ ] Individual driver approval
- [ ] Batch rejection handling
- [ ] Document upload before activation
- [ ] Status progression validation
- [ ] Notification triggers

### 2. Performance Testing

#### **Load Testing**

- [ ] 1000-row file processing time (target: < 5 minutes)
- [ ] Concurrent uploads (5 users simultaneously)
- [ ] Large file handling (10MB Excel file)
- [ ] Database performance under load
- [ ] Memory usage monitoring
- [ ] CPU usage monitoring

#### **Stress Testing**

- [ ] Maximum row limit (2000+ rows)
- [ ] Maximum addresses per driver (10+)
- [ ] Maximum documents per driver (10+)
- [ ] Continuous uploads over time
- [ ] Queue processing capacity

---

##  **TECHNICAL IMPLEMENTATION SPECIFICATIONS**

### **Backend Processing Strategy for 1000+ Records**

#### **Asynchronous Processing with Job Queue**

\\\javascript
// Recommended Architecture
const processDriverBulkUpload = async (file, userId) => {
  // 1. Quick file validation (structure check)
  const isValidStructure = await validateDriverExcelStructure(file);
  
  // 2. Create batch record with "processing" status
  const batchId = await createDriverBatchRecord(file, userId, 'processing');
  
  // 3. Queue the processing job (non-blocking)
  await driverBulkUploadQueue.add({
    batchId,
    filePath: file.path,
    userId
  });
  
  // 4. Return immediately with batch ID
  return {
    batchId,
    status: 'processing',
    message: 'Driver upload queued for processing'
  };
};
\\\

#### **Processing Flow**

\\\javascript
// Worker process handling the queue
driverBulkUploadQueue.process(async (job) => {
  const { batchId, filePath, userId } = job.data;
  
  try {
    // Parse all 5 sheets
    const data = await parseDriverExcelFile(filePath);
    // data = { basicInfo: [], addresses: [], documents: [], history: [], accidents: [] }
    
    // Validate relational integrity
    const validationResults = await validateAllDriverData(data);
    
    // Process valid drivers in batches of 50
    const chunks = chunkArray(validationResults.valid, 50);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Process chunk in parallel (10 concurrent)
      await Promise.all(
        chunk.map(record => createDriverFromBulk(record, batchId))
      );
      
      // Update progress via WebSocket
      await emitProgress(batchId, {
        processed: (i + 1) * 50,
        total: validationResults.valid.length,
        currentDriver: chunk[0].basicInfo.fullName
      });
    }
    
    // Generate error report for invalid records
    if (validationResults.invalid.length > 0) {
      await generateDriverErrorReport(validationResults.invalid, batchId);
    }
    
    // Update batch status to completed
    await updateDriverBatchStatus(batchId, 'completed');
    
    // Send notification to approvers
    await notifyApprovers(batchId, validationResults.valid.length);
    
  } catch (error) {
    await updateDriverBatchStatus(batchId, 'failed', error.message);
    throw error;
  }
});
\\\

### **Driver Creation from Bulk Data**

\\\javascript
const createDriverFromBulk = async (record, batchId) => {
  const trx = await knex.transaction();
  
  try {
    // 1. Generate driver ID
    const driverId = await generateDriverId();
    
    // 2. Insert driver_general_info with "Pending Approval" status
    await trx('driver_general_info').insert({
      driver_id: driverId,
      full_name: record.basicInfo.fullName,
      date_of_birth: record.basicInfo.dateOfBirth,
      gender: record.basicInfo.gender || null,
      blood_group: record.basicInfo.bloodGroup || null,
      phone_number: record.basicInfo.phoneNumber,
      email_id: record.basicInfo.emailId || null,
      emergency_contact: record.basicInfo.emergencyContact,
      alternate_phone_number: record.basicInfo.alternatePhoneNumber || null,
      status: 'pending_approval',
      bulk_batch_id: batchId,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // 3. Insert addresses (tms_address table)
    for (const addr of record.addresses) {
      const addressId = await generateAddressId(trx);
      await trx('tms_address').insert({
        address_id: addressId,
        user_reference_id: driverId,
        user_type: 'DRIVER',
        address_type_id: addr.addressTypeId,
        street_1: addr.street1,
        street_2: addr.street2 || null,
        city: addr.city,
        district: addr.district || null,
        state: addr.state,
        country: addr.country,
        postal_code: addr.postalCode,
        is_primary: addr.isPrimary,
        status: 'ACTIVE',
        created_by: userId,
        created_at: new Date()
      });
    }
    
    // 4. Insert documents (metadata only - driver_documents table)
    for (const doc of record.documents) {
      const documentId = await generateDocumentId(trx);
      const documentUniqueId = \\-\\;
      
      await trx('driver_documents').insert({
        document_unique_id: documentUniqueId,
        driver_id: driverId,
        document_id: documentId,
        document_type_id: doc.documentTypeId,
        document_number: doc.documentNumber,
        issuing_country: doc.issuingCountry || null,
        issuing_state: doc.issuingState || null,
        valid_from: doc.validFrom || null,
        valid_to: doc.validTo || null,
        active_flag: doc.activeFlag !== false,
        remarks: doc.remarks || null,
        status: 'ACTIVE',
        created_by: userId,
        created_at: new Date()
      });
      // Note: No document_upload entry - files will be uploaded later via UI
    }
    
    // 5. Insert employment history (if provided - driver_history_information)
    if (record.history && record.history.length > 0) {
      for (const hist of record.history) {
        const historyId = await generateHistoryId(trx);
        await trx('driver_history_information').insert({
          driver_history_id: historyId,
          driver_id: driverId,
          employer: hist.employer || null,
          employment_status: hist.employmentStatus || null,
          from_date: hist.fromDate || null,
          to_date: hist.toDate || null,
          job_title: hist.jobTitle || null,
          status: 'ACTIVE',
          created_by: userId,
          created_at: new Date()
        });
      }
    }
    
    // 6. Insert accident/violation records (if provided - driver_accident_violation)
    if (record.accidents && record.accidents.length > 0) {
      for (const accident of record.accidents) {
        const violationId = await generateViolationId(trx);
        await trx('driver_accident_violation').insert({
          driver_violation_id: violationId,
          driver_id: driverId,
          type: accident.type || null,
          description: accident.description || null,
          date: accident.date || null,
          vehicle_regn_number: accident.vehicleRegistrationNumber || null,
          status: 'ACTIVE',
          created_by: userId,
          created_at: new Date()
        });
      }
    }
    
    // 7. Create bulk upload record
    await trx('driver_bulk_upload_records').insert({
      batch_id: batchId,
      driver_ref_id: record.basicInfo.driverRefId,
      excel_row_number: record.rowNumber,
      validation_status: 'valid',
      created_driver_id: driverId
    });
    
    await trx.commit();
    return driverId;
    
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};
\\\

### **Validation Engine**

\\\javascript
const validateAllDriverData = async (data) => {
  const valid = [];
  const invalid = [];
  
  // Group data by Driver_Ref_ID
  const driverGroups = groupByDriverRefId(data);
  
  for (const [refId, driverData] of Object.entries(driverGroups)) {
    const errors = [];
    
    // 1. Validate basic info
    const basicInfoErrors = await validateBasicInfo(driverData.basicInfo);
    errors.push(...basicInfoErrors);
    
    // 2. Validate addresses
    const addressErrors = await validateAddresses(driverData.addresses);
    errors.push(...addressErrors);
    
    // 3. Validate documents
    const documentErrors = await validateDocuments(driverData.documents);
    errors.push(...documentErrors);
    
    // 4. Validate employment history (optional - only format checks)
    const historyErrors = await validateHistory(driverData.history);
    errors.push(...historyErrors);
    
    // 5. Validate accidents (optional - only format checks)
    const accidentErrors = await validateAccidents(driverData.accidents);
    errors.push(...accidentErrors);
    
    // 6. Check for duplicates in database
    const duplicateErrors = await checkDriverDuplicates(driverData.basicInfo);
    errors.push(...duplicateErrors);
    
    if (errors.length === 0) {
      valid.push({
        basicInfo: driverData.basicInfo,
        addresses: driverData.addresses,
        documents: driverData.documents,
        history: driverData.history || [],
        accidents: driverData.accidents || [],
        rowNumber: driverData.rowNumber
      });
    } else {
      invalid.push({
        ...driverData,
        errors
      });
    }
  }
  
  return { valid, invalid };
};
\\\

### **NPM Packages Required**

\\\json
{
  "dependencies": {
    "multer": "^1.4.5-lts.1",        // File upload handling
    "exceljs": "^4.4.0",              // Excel parsing and generation
    "bull": "^4.12.0",                // Background job queue with Redis
    "socket.io": "^4.6.0",            // Real-time progress updates
    "date-fns": "^2.30.0",            // Date validation and formatting
    "validator": "^13.11.0",          // Email, phone validation
    "country-state-city": "^3.2.1"    // Already installed - country/state/city data
  }
}
\\\

### **Database Indexes for Performance**

\\\sql
-- Speed up batch queries
CREATE INDEX idx_driver_batch_uploaded_by ON driver_bulk_upload_batches(uploaded_by);
CREATE INDEX idx_driver_batch_status ON driver_bulk_upload_batches(status);
CREATE INDEX idx_driver_batch_timestamp ON driver_bulk_upload_batches(upload_timestamp);

-- Speed up driver bulk record lookups
CREATE INDEX idx_driver_bulk_record_batch ON driver_bulk_upload_records(batch_id);
CREATE INDEX idx_driver_bulk_record_status ON driver_bulk_upload_records(validation_status);

-- Speed up driver status queries
CREATE INDEX idx_driver_status ON driver_general_info(status);
CREATE INDEX idx_driver_bulk_batch ON driver_general_info(bulk_batch_id);
\\\

### **WebSocket Real-time Updates**

\\\javascript
// Backend: Emit progress updates
io.to(\driver-bulk-upload-\\).emit('progress', {
  batchId,
  status: 'processing',
  processed: 450,
  total: 1000,
  successCount: 425,
  errorCount: 25,
  currentDriver: 'DRV450 - John Doe'
});

// Frontend: Listen for updates
socket.on('progress', (data) => {
  updateProgressBar(data.processed / data.total * 100);
  appendToLog(\ \ created successfully\);
  updateCounters(data.successCount, data.errorCount);
});
\\\

---

##  **USER DOCUMENTATION**

### 1. User Guide Topics

#### **How to Use Driver Bulk Upload**

1. **Download Excel Template**
   - Click "Bulk Upload" button on Driver List page
   - Click "Download Template" in the modal
   - Save the template file to your computer

2. **Fill Template with Driver Data**
   - **Sheet 1 (Basic Information)**: Enter driver personal details
     - Use unique Driver_Ref_ID for each driver (e.g., DR001, DR002)
     - Ensure phone numbers are unique and 10 digits
     - Verify date of birth results in age 18-65
   - **Sheet 2 (Addresses)**: Add address information
     - Link to Driver_Ref_ID from Sheet 1
     - Mark exactly one address as primary (Is_Primary = Y)
     - Use valid country and state codes
   - **Sheet 3 (Documents)**: Add document metadata
     - Link to Driver_Ref_ID from Sheet 1
     - Use correct document number formats
     - Note: Actual files uploaded later via UI
   - **Sheet 4 (Employment History)**: Optional employment details
   - **Sheet 5 (Accident & Violation)**: Optional accident records

3. **Upload Filled Template**
   - Click "Browse" or drag-and-drop the Excel file
   - Wait for validation to complete
   - Review validation results

4. **Review Validation Results**
   - Check success/error counts
   - Review processing log
   - Identify any validation errors

5. **Proceed with Valid Records**
   - Click "Confirm Upload" to create valid drivers
   - Valid drivers created with "Pending Approval" status

6. **Download Error Report (if needed)**
   - Download Excel file with detailed errors
   - Fix errors in original template
   - Re-upload corrected data

7. **Upload Document Files**
   - After drivers are approved
   - Use "Update Driver" functionality
   - Upload actual document files (PDF, images)
   - Driver status changes to "Active"

#### **Excel Template Guide**

##### **Column Descriptions**

**Basic Information Sheet:**
- **Driver_Ref_ID**: Unique identifier for each driver in this upload (e.g., DR001, DR002)
- **Full_Name**: Driver's complete name (minimum 2 characters)
- **Date_Of_Birth**: Birth date in YYYY-MM-DD format (age must be 18-65)
- **Gender**: Male, Female, or Other (optional)
- **Blood_Group**: A+, A-, B+, B-, AB+, AB-, O+, or O- (optional)
- **Phone_Number**: 10-digit mobile number starting with 6-9 (must be unique)
- **Email_ID**: Valid email address (must be unique if provided)
- **Emergency_Contact**: 10-digit emergency contact number (mandatory)
- **Alternate_Phone_Number**: Alternative contact number (optional)

**Addresses Sheet:**
- **Driver_Ref_ID**: Links to Basic Information sheet
- **Address_Type_ID**: Reference to address type master data
- **Street_1, Street_2**: Address lines
- **City, District, State, Country**: Location details (use valid codes)
- **Postal_Code**: ZIP/Postal code
- **Is_Primary**: Y for primary address, N otherwise (exactly one must be Y)

**Documents Sheet:**
- **Driver_Ref_ID**: Links to Basic Information sheet
- **Document_Type**: Type of document (Driver License, Aadhaar, PAN, Passport)
- **Document_Number**: Document identifier (must be valid format)
- **Issuing_Country, Issuing_State**: Where document was issued
- **Valid_From, Valid_To**: Validity dates
- **Active_Flag**: Y/N (default Y)

##### **Required vs Optional Fields**

**Strictly Required:**
- Basic Info: Driver_Ref_ID, Full_Name, Date_Of_Birth, Phone_Number, Emergency_Contact
- Addresses: At least one address with all required fields, exactly one marked as primary
- Documents: Document_Type, Document_Number

**Optional:**
- Basic Info: Gender, Blood_Group, Email_ID, Alternate_Phone_Number
- Documents: Issuing details, validity dates
- Employment History: All fields
- Accident & Violation: All fields

##### **Data Format Requirements**

**Dates:**
- Format: YYYY-MM-DD
- Example: 2025-01-15

**Phone Numbers:**
- Format: 10 digits, no spaces or special characters
- Must start with 6, 7, 8, or 9
- Example: 9876543210

**Email:**
- Standard email format
- Example: john.doe@example.com

**Country/State Codes:**
- Use ISO codes
- Examples: IN (India), US (United States), MH (Maharashtra), CA (California)

**Document Numbers:**
- Driver License: Alphanumeric (e.g., MH0120230001234)
- Aadhaar: 12 digits (e.g., 123456789012)
- PAN: 10 alphanumeric (e.g., ABCDE1234F)
- Passport: Alphanumeric (e.g., A1234567)

##### **Multiple Records Handling**

**Multiple Addresses:**
\\\
Driver_Ref_ID | Address_Type_ID | Street_1 | Is_Primary
DR001        | AT001           | 123 Main | Y
DR001        | AT002           | 456 Park | N
DR001        | AT003           | 789 Elm  | N
\\\

**Multiple Documents:**
\\\
Driver_Ref_ID | Document_Type    | Document_Number
DR001        | Driver License   | MH0120230001234
DR001        | Aadhaar Card     | 123456789012
DR001        | PAN Card         | ABCDE1234F
\\\

#### **Troubleshooting Guide**

##### **Common Validation Errors**

**1. "Phone number already exists"**
- **Cause**: Phone number is already registered to another driver
- **Solution**: Verify phone number is correct, use unique number

**2. "Invalid phone number format"**
- **Cause**: Phone number doesn't match required format
- **Solution**: Use exactly 10 digits, start with 6-9, no spaces/special characters

**3. "Age must be between 18-65 years"**
- **Cause**: Date of birth results in age outside allowed range
- **Solution**: Verify date of birth is correct, driver must be 18-65 years old

**4. "Email already exists"**
- **Cause**: Email is already registered to another driver
- **Solution**: Use unique email address or leave blank

**5. "Invalid document number format"**
- **Cause**: Document number doesn't match expected format for document type
- **Solution**: 
  - Driver License: Check state code and number format
  - Aadhaar: Use exactly 12 digits
  - PAN: Use exactly 10 alphanumeric characters
  - Passport: Verify passport number format

**6. "No primary address found"**
- **Cause**: No address marked as primary (Is_Primary = Y)
- **Solution**: Mark exactly one address as primary for each driver

**7. "Multiple primary addresses"**
- **Cause**: More than one address marked as primary
- **Solution**: Only one address can be primary per driver

**8. "Invalid country/state/city combination"**
- **Cause**: State code doesn't belong to specified country
- **Solution**: Verify state code is valid for the country

**9. "Child record without parent reference"**
- **Cause**: Address/Document/History record has Driver_Ref_ID not found in Basic Info sheet
- **Solution**: Ensure Driver_Ref_ID exists in Basic Information sheet

**10. "Missing required field"**
- **Cause**: Required field is empty
- **Solution**: Fill all mandatory fields marked as "Required"

##### **Template Formatting Issues**

**1. "Invalid file structure"**
- **Cause**: Missing sheets or incorrect sheet names
- **Solution**: Download fresh template, don't rename or delete sheets

**2. "Column headers mismatch"**
- **Cause**: Column headers modified or missing
- **Solution**: Don't modify column headers, use template as-is

**3. "File too large"**
- **Cause**: Excel file exceeds 10MB
- **Solution**: Split into multiple batches, each under 10MB

##### **File Upload Problems**

**1. "Upload failed"**
- **Cause**: Network issue or server error
- **Solution**: Check internet connection, try again

**2. "Processing timeout"**
- **Cause**: Large file taking too long to process
- **Solution**: Split into smaller batches (500 drivers per file)

**3. "Invalid file format"**
- **Cause**: Uploaded file is not .xlsx or .xls
- **Solution**: Save file as Excel format (.xlsx)

##### **Approval Process Questions**

**1. "Why is driver status 'Pending Approval'?"**
- **Answer**: All bulk uploaded drivers require approval by a different Product Owner

**2. "How do I upload document files?"**
- **Answer**: After driver is approved, use "Update Driver" functionality to upload actual document files

**3. "When does driver become 'Active'?"**
- **Answer**: After approval AND after all required document files are uploaded

**4. "Can I edit a rejected driver?"**
- **Answer**: Yes, rejected drivers can be edited and resubmitted for approval

### 2. Technical Documentation

#### **API Documentation**

##### **Endpoints**

\\\
POST /api/driver/bulk-upload
Description: Upload Excel file for bulk driver creation
Request: multipart/form-data with Excel file
Response: { batchId, status, message }

GET /api/driver/bulk-upload/template
Description: Download Excel template
Response: Excel file download

GET /api/driver/bulk-upload/history/:userId
Description: Get upload history for user
Response: { batches: [], pagination: {} }

GET /api/driver/bulk-upload/error-report/:batchId
Description: Download error report for batch
Response: Excel file download

GET /api/driver/bulk-upload/status/:batchId
Description: Get batch processing status
Response: { batch, statusCounts }
\\\

#### **Database Documentation**

##### **Table Relationships**

\\\
driver_bulk_upload_batches (1)  (N) driver_bulk_upload_records
driver_bulk_upload_records (N)  (1) driver_general_info
driver_general_info (1)  (N) tms_address
driver_general_info (1)  (N) driver_documents
driver_general_info (1)  (N) driver_history_information
driver_general_info (1)  (N) driver_accident_violation
\\\

##### **Index Strategies**

- Batch queries: Index on uploaded_by, status, upload_timestamp
- Driver queries: Index on status, bulk_batch_id
- Performance: Composite indexes on frequently queried combinations

##### **Data Retention Policies**

- **Batch Records**: Retain for 1 year
- **Error Reports**: Retain for 6 months
- **Processing Logs**: Retain for 3 months
- **Archived Batches**: Move to archive after 1 year

##### **Backup Procedures**

- Daily automated backups of bulk_upload tables
- Pre-processing snapshot of uploaded Excel files
- Error reports backed up with batch data

---

##  **FINALIZED REQUIREMENTS SUMMARY**

### **Confirmed Specifications**

1.  **Relational Structure**: Multi-sheet Excel (5 sheets) with parent-child relationships
2.  **Error Handling**: Process valid records, generate error report for invalid
3.  **Documents**: Skip file uploads, metadata only in bulk mode
4.  **Capacity**: Support 1000+ drivers per upload
5.  **Error Report**: Downloadable Excel with detailed errors per sheet
6.  **UI Location**: Add Bulk Upload button on Driver List page
7.  **UI Pattern**: Modal popup with file picker and progress tracking
8.  **Progress**: Real-time progress bar with live processing log
9.  **Validation**: All driver creation validation rules apply
10.  **Status Workflow**: Pending Approval  Documents Uploaded  Active
11.  **Optional Sections**: Employment History and Accident/Violation are optional
12.  **Excluded Mappings**: Transporter, Vehicle, and Blacklist mappings NOT in bulk upload
13.  **Age Validation**: Strict 18-65 years requirement
14.  **Phone Uniqueness**: Strict uniqueness check across all drivers
15.  **Primary Address**: Exactly one primary address required per driver

---

##  **COMPARISON WITH TRANSPORTER BULK UPLOAD**

### **Similarities**

- Relational multi-sheet Excel structure
- Parent-child data relationships
- 1000+ record capacity
- Asynchronous processing with job queue
- Real-time progress updates via WebSocket
- Error report generation
- "Pending for Approval" initial status
- Cross-Product Owner approval requirement
- Template download functionality
- Batch tracking and history

### **Differences**

| Aspect | Transporter | Driver |
|--------|------------|--------|
| **Sheets** | 5 (General, Address, Contact, Service Area, Document) | 5 (Basic Info, Address, Document, History, Accident) |
| **Required Sheets** | All 5 | 3 (Basic Info, Address, Document) |
| **Optional Sheets** | None | 2 (History, Accident) |
| **Age Validation** | N/A | 18-65 years required |
| **Unique Fields** | Business name, Email, Phone | Phone, Email |
| **Primary Address** | Required | Required (exactly one) |
| **Contact Info** | Separate Contact sheet linked to Address | Part of Basic Info |
| **Service Areas** | Included | Not applicable |
| **Document Activation** | Documents  Pending Approval  Active | Documents  Pending Approval  Upload Files  Active |
| **Mappings** | Not in bulk upload | Not in bulk upload |

---

**This document serves as the comprehensive specification for the TMS Driver Bulk Upload functionality and should be referenced throughout the development lifecycle.**
