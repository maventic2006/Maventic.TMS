# TMS Vehicle Bulk Upload Guidelines

> **Comprehensive Bulk Upload Functionality Specifications for Vehicle Management**

This document establishes the detailed requirements, technical specifications, and implementation standards for the vehicle bulk upload functionality in the TMS (Transportation Management System) project.

**Reference Implementation**: Transporter Bulk Upload (located in `/features/transporter/components/`)

---

## 📋 **FUNCTIONAL REQUIREMENTS**

### 1. Core Features

#### **Upload Functionality**

- **Location**: Vehicle List page (VehicleMaintenance)
- **Access**: Product Owner role only
- **Capacity**: Support for 500+ vehicles per upload batch
- **File Format**: Excel files (.xlsx, .xls) with multi-sheet structure
- **Validation**: Same validation rules as manual vehicle creation (all mandatory fields required)
- **Document Handling**: Skip document file uploads in bulk mode (metadata only - users can upload files later via edit)

#### **Download Functionality**

- **Template Download**: Excel template with all required columns and sheets
- **Error Report Download**: Failed validation rows with highlighted errors
- **Batch History Download**: Upload history with success/error details

### 2. User Interface Requirements

#### **Vehicle List Page Integration**

- **Bulk Upload Button**: Add new "Bulk Upload" button next to "Create New" button in TopActionBar
- **Modal Popup**: Dedicated modal with drag-drop file picker interface
- **Progress Indicator**: Real-time upload progress with live processing log
- **Batch History Section**: Track all upload batches with details
- **Processing Strategy**: Asynchronous background processing using Bull Queue + Redis

#### **Upload Interface Components**

```
┌───────────────────────────────────────────────────────┐
│ Bulk Upload Vehicle Data                          [X] │
├───────────────────────────────────────────────────────┤
│ [📥 Download Template] [📜 Upload History]            │
├───────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🚗 Drop Excel file here or click to browse     │   │
│ │ Supports 500+ vehicles                          │   │
│ │ Format: .xlsx, .xls                            │   │
│ └─────────────────────────────────────────────────┘   │
├───────────────────────────────────────────────────────┤
│ Processing Progress: 65%                              │
│ ██████████████████░░░░░░░░░                           │
│                                                       │
│ 📋 Live Processing Log:                              │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ✅ Row 1: VEH0001 - Tata LPT 1918 created      │   │
│ │ ✅ Row 2: VEH0002 - Ashok Leyland Partner      │   │
│ │ ❌ Row 3: Invalid VIN/Chassis Number           │   │
│ │ ✅ Row 4: VEH0003 - Mahindra Bolero created    │   │
│ │ ... (scrollable log)                           │   │
│ └─────────────────────────────────────────────────┘   │
├───────────────────────────────────────────────────────┤
│ Results:                                              │
│ ✅ 465 Valid Created | ❌ 35 Invalid (Errors)         │
│ [📄 Download Error Report] [✓ Close]                 │
└───────────────────────────────────────────────────────┘
```

---

## 📊 **EXCEL TEMPLATE STRUCTURE**

### **Multi-Sheet Structure**

The Excel file uses a **parent-child relational structure** with 5 sheets:

1. **Basic Information** (Parent) - Core vehicle details
2. **Specifications** - Engine, transmission, emission details
3. **Capacity Details** - Load capacity, dimensions, weights
4. **Ownership Details** - Owner, registration, purchase details
5. **Documents** - Document metadata (NO file upload)

**Key Design Principle**: Each vehicle has a unique `Vehicle_Ref_ID` that links all related records.

---

### **Sheet 1: Basic Information** (PARENT SHEET)

```
Column | Field Name                   | Type   | Required | Format/Values                    | Validation Rules
-------|------------------------------|--------|----------|----------------------------------|------------------
A      | Vehicle_Ref_ID               | Text   | Yes      | VR001, VR002, etc.               | Unique per batch
B      | Make_Brand                   | Text   | Yes      | Tata, Ashok Leyland, etc.        | Min 2 characters
C      | Model                        | Text   | Yes      | LPT 1918, Partner, etc.          | Min 2 characters
D      | VIN_Chassis_Number           | Text   | Yes      | 17-character VIN                 | Must be unique globally
E      | Vehicle_Type_ID              | Text   | Yes      | VT001, VT002, etc.               | Must exist in master data
F      | Vehicle_Category             | Text   | No       | HCV, MCV, LCV, etc.              | -
G      | Manufacturing_Month_Year     | Date   | Yes      | YYYY-MM-DD or YYYY-MM            | Valid date format
H      | GPS_IMEI_Number              | Text   | Yes      | 15-digit IMEI                    | Must be unique globally
I      | GPS_Active_Flag              | Text   | No       | Y/N (Default: Y)                 | Y or N only
J      | Leasing_Flag                 | Text   | No       | Y/N (Default: N)                 | Y or N only
K      | Usage_Type_ID                | Text   | Yes      | UT001, UT002, etc.               | Must exist in master data
L      | Registration_Number          | Text   | No       | MH12AB1234, etc.                 | Unique if provided
M      | Vehicle_Color                | Text   | No       | White, Blue, etc.                | -
N      | Body_Type_Description        | Text   | No       | Container, Flatbed, etc.         | -
O      | Safety_Inspection_Date       | Date   | No       | YYYY-MM-DD                       | Valid date
P      | Taxes_And_Fees               | Number | No       | 50000.00                         | Numeric >= 0
Q      | Road_Tax                     | Number | No       | 25000.00                         | Numeric >= 0
R      | Avg_Running_Speed            | Number | No       | 45.5 (km/h)                      | Numeric >= 0
S      | Max_Running_Speed            | Number | No       | 80.0 (km/h)                      | Numeric >= 0
T      | Status                       | Text   | No       | ACTIVE, INACTIVE, etc.           | Default: ACTIVE

Notes:
- Vehicle_Ref_ID is used to link records across all sheets
- VIN_Chassis_Number must be globally unique (check existing DB records)
- GPS_IMEI_Number must be globally unique (check existing DB records)
- Registration_Number must be unique if provided
```

---

### **Sheet 2: Specifications** (CHILD OF BASIC INFO)

```
Column | Field Name                   | Type   | Required | Format/Values                    | Validation Rules
-------|------------------------------|--------|----------|----------------------------------|------------------
A      | Vehicle_Ref_ID               | Text   | Yes      | VR001 (links to Sheet 1)         | Must exist in Sheet 1
B      | Engine_Type_ID               | Text   | Yes      | ET001, ET002, etc.               | Must exist in master data
C      | Engine_Number                | Text   | Yes      | ENG123456789                     | Min 5 characters
D      | Fuel_Type_ID                 | Text   | Yes      | FT001, FT002, etc.               | Must exist in master data
E      | Transmission_Type            | Text   | Yes      | MANUAL, AUTOMATIC, AMT, CVT, DCT | One of allowed values
F      | Emission_Standard            | Text   | No       | BS6, BS4, EURO6, etc.            | -
G      | Financer                     | Text   | Yes      | Bank name or "Self"              | Min 2 characters
H      | Suspension_Type              | Text   | Yes      | LEAF_SPRING, AIR_SUSPENSION, etc.| One of allowed values
I      | Weight_Dimensions            | Text   | No       | Combined weight/dimension info   | -

Notes:
- One specification record per vehicle
- All master data IDs must be validated against database
```

---

### **Sheet 3: Capacity Details** (CHILD OF BASIC INFO)

```
Column | Field Name                   | Type   | Required | Format/Values                    | Validation Rules
-------|------------------------------|--------|----------|----------------------------------|------------------
A      | Vehicle_Ref_ID               | Text   | Yes      | VR001 (links to Sheet 1)         | Must exist in Sheet 1
B      | Unloading_Weight_KG          | Number | No       | 7500.50                          | Numeric >= 0
C      | Gross_Vehicle_Weight_KG      | Number | No       | 18000.00                         | Numeric >= 0
D      | Payload_Capacity_KG          | Number | No       | Auto-calculated                  | GVW - Unloading Weight
E      | Volume_Capacity_CBM          | Number | No       | 45.5 (cubic meters)              | Numeric >= 0
F      | Cargo_Width_M                | Number | No       | 2.5 (meters)                     | Numeric >= 0
G      | Cargo_Height_M               | Number | No       | 3.0 (meters)                     | Numeric >= 0
H      | Cargo_Length_M               | Number | No       | 8.0 (meters)                     | Numeric >= 0
I      | Towing_Capacity_KG           | Number | No       | 5000.00                          | Numeric >= 0
J      | Tire_Load_Rating             | Text   | No       | 3750 kg                          | -
K      | Vehicle_Condition            | Text   | No       | EXCELLENT, GOOD, FAIR, POOR      | One of allowed values
L      | Fuel_Tank_Capacity_L         | Number | No       | 400.0 (liters)                   | Numeric >= 0
M      | Seating_Capacity             | Number | No       | 2                                | Integer >= 0
N      | Load_Capacity_TON            | Number | No       | 18.0 (tons)                      | Numeric >= 0

Notes:
- One capacity record per vehicle
- Payload Capacity = GVW - Unloading Weight (auto-calculated if both provided)
```

---

### **Sheet 4: Ownership Details** (CHILD OF BASIC INFO)

```
Column | Field Name                   | Type   | Required | Format/Values                    | Validation Rules
-------|------------------------------|--------|----------|----------------------------------|------------------
A      | Vehicle_Ref_ID               | Text   | Yes      | VR001 (links to Sheet 1)         | Must exist in Sheet 1
B      | Ownership_Name               | Text   | No       | ABC Transport Pvt Ltd            | -
C      | Valid_From                   | Date   | No       | YYYY-MM-DD                       | Valid date
D      | Valid_To                     | Date   | No       | YYYY-MM-DD                       | Must be > Valid_From
E      | Registration_Number          | Text   | No       | MH12AB1234                       | Unique if provided
F      | Registration_Date            | Date   | No       | YYYY-MM-DD                       | Valid date
G      | Registration_Upto            | Date   | No       | YYYY-MM-DD                       | Must be > Registration_Date
H      | Purchase_Date                | Date   | No       | YYYY-MM-DD                       | Valid date
I      | Owner_Sr_Number              | Text   | No       | Owner serial number              | -
J      | State_Code                   | Text   | No       | MH, DL, GJ, etc.                 | Valid state ISO code
K      | RTO_Code                     | Text   | No       | MH12, DL05, etc.                 | -
L      | Sale_Amount                  | Number | No       | 2500000.00                       | Numeric >= 0

Notes:
- One ownership record per vehicle
- Date validations: Valid_To > Valid_From, Registration_Upto > Registration_Date
```

---

### **Sheet 5: Documents** (METADATA ONLY - NO FILE UPLOAD)

```
Column | Field Name                   | Type   | Required | Format/Values                    | Validation Rules
-------|------------------------------|--------|----------|----------------------------------|------------------
A      | Vehicle_Ref_ID               | Text   | Yes      | VR001 (links to Sheet 1)         | Must exist in Sheet 1
B      | Document_Type_ID             | Text   | Yes      | DN001, DN002, etc.               | Must exist in master data
C      | Document_Type_Name           | Text   | Yes      | Registration Certificate, etc.   | Must exist in master data
D      | Reference_Number             | Text   | Yes      | Unique document number           | Unique per document type
E      | Document_Provider            | Text   | No       | Issuing authority                | -
F      | Coverage_Type_ID             | Text   | No       | CT001, CT002, etc.               | Must exist if provided
G      | Premium_Amount               | Number | No       | 25000.00                         | Numeric >= 0
H      | Valid_From                   | Date   | No       | YYYY-MM-DD                       | Valid date
I      | Valid_To                     | Date   | No       | YYYY-MM-DD                       | Must be > Valid_From
J      | Remarks                      | Text   | No       | Additional notes                 | Max 500 characters

Notes:
- Multiple document records allowed per vehicle
- Only document metadata is stored during bulk upload
- Actual file upload happens later through UI (edit mode in details page)
- Document reference numbers must be unique per document type
```

---

## 📝 **EXCEL TEMPLATE EXAMPLES**

### **Example 1: Single Vehicle with Complete Data**

**Sheet 1 - Basic Information:**
```
Vehicle_Ref_ID | Make_Brand | Model      | VIN_Chassis_Number | Vehicle_Type_ID | Manufacturing_Month_Year | GPS_IMEI_Number | GPS_Active | Usage_Type_ID | Registration_Number
VR001          | Tata       | LPT 1918   | VIN1234567890ABCD  | VT001           | 2023-06-15               | 123456789012345 | Y          | UT001         | MH12AB1234
```

**Sheet 2 - Specifications:**
```
Vehicle_Ref_ID | Engine_Type_ID | Engine_Number  | Fuel_Type_ID | Transmission_Type | Emission_Standard | Financer      | Suspension_Type
VR001          | ET001          | ENG123456789   | FT001        | MANUAL            | BS6               | HDFC Bank     | LEAF_SPRING
```

**Sheet 3 - Capacity Details:**
```
Vehicle_Ref_ID | Unloading_Weight_KG | Gross_Vehicle_Weight_KG | Volume_Capacity_CBM | Cargo_Width_M | Cargo_Height_M | Cargo_Length_M | Towing_Capacity_KG
VR001          | 7500.00             | 18000.00                | 45.5                | 2.5           | 3.0            | 8.0            | 5000.00
```

**Sheet 4 - Ownership Details:**
```
Vehicle_Ref_ID | Ownership_Name      | Valid_From | Valid_To   | Registration_Number | Registration_Date | Purchase_Date | State_Code | RTO_Code | Sale_Amount
VR001          | ABC Transport Ltd   | 2023-06-01 | 2025-05-31 | MH12AB1234          | 2023-06-15        | 2023-06-10    | MH         | MH12     | 2500000.00
```

**Sheet 5 - Documents:**
```
Vehicle_Ref_ID | Document_Type_ID | Document_Type_Name              | Reference_Number | Document_Provider    | Valid_From | Valid_To   | Remarks
VR001          | DN001            | Vehicle Registration Certificate| RC123456789      | RTO Maharashtra     | 2023-06-15 | 2038-06-14 | Original RC
VR001          | DN009            | Vehicle Insurance               | INS987654321     | HDFC ERGO Insurance | 2023-06-15 | 2024-06-14 | Comprehensive
```

---

### **Example 2: Multiple Vehicles**

**Sheet 1 - Basic Information:**
```
Vehicle_Ref_ID | Make_Brand      | Model          | VIN_Chassis_Number | Vehicle_Type_ID | Manufacturing_Month_Year | GPS_IMEI_Number | GPS_Active | Usage_Type_ID
VR001          | Tata            | LPT 1918       | VIN1234567890ABCD  | VT001           | 2023-06-15               | 123456789012345 | Y          | UT001
VR002          | Ashok Leyland   | Partner        | VIN9876543210WXYZ  | VT002           | 2021-03-20               | 987654321098765 | Y          | UT001
VR003          | Mahindra        | Bolero Pickup  | VIN5555666677778   | VT003           | 2023-11-10               | 555566667777888 | N          | UT002
```

**(Corresponding records in Sheets 2-5 for VR001, VR002, VR003...)**

---

## 🔍 **VALIDATION RULES**

### 1. Field-Level Validations

#### **Required Fields (Must be present)**
- **Basic Info**: Vehicle_Ref_ID, Make_Brand, Model, VIN_Chassis_Number, Vehicle_Type_ID, Manufacturing_Month_Year, GPS_IMEI_Number, Usage_Type_ID
- **Specifications**: Vehicle_Ref_ID, Engine_Type_ID, Engine_Number, Fuel_Type_ID, Transmission_Type, Financer, Suspension_Type
- **Documents**: Vehicle_Ref_ID, Document_Type_ID, Document_Type_Name, Reference_Number

#### **Unique Constraints (No duplicates allowed)**
- VIN_Chassis_Number (globally unique across all vehicles in DB)
- GPS_IMEI_Number (globally unique across all vehicles in DB)
- Registration_Number (unique if provided)
- Document Reference_Number (unique per document type per vehicle)

#### **Data Type Validations**
- Dates: Must be valid YYYY-MM-DD format
- Numbers: Must be numeric, >= 0 for amounts/capacities
- Text: Min/max character limits as specified
- Enums: Must match allowed values (Y/N, MANUAL/AUTOMATIC, etc.)

### 2. Relational Integrity Validations

#### **Parent-Child Relationships**
```
Basic Information (Parent)
    └── Specifications (Child) - Vehicle_Ref_ID must exist in Sheet 1
    └── Capacity Details (Child) - Vehicle_Ref_ID must exist in Sheet 1
    └── Ownership Details (Child) - Vehicle_Ref_ID must exist in Sheet 1
    └── Documents (Child) - Vehicle_Ref_ID must exist in Sheet 1
```

#### **Orphan Record Detection**
- **Error**: Child records with Vehicle_Ref_ID not in Basic Information sheet
- **Example**: Specifications for VR999 when VR999 doesn't exist in Sheet 1

#### **Missing Child Records (Warnings)**
- Vehicles without specifications → Warning (not error)
- Vehicles without ownership → Warning
- Vehicles without capacity details → Warning
- Vehicles without documents → Allowed (documents are optional)

### 3. Business Rules Validations

#### **Master Data Validation**
- Vehicle_Type_ID must exist in `vehicle_type_master` table
- Engine_Type_ID must exist in `engine_type_master` table
- Fuel_Type_ID must exist in `fuel_type_master` table
- Usage_Type_ID must exist in `usage_type_master` table
- Document_Type_ID must exist in `document_name_master` table
- Coverage_Type_ID must exist in `coverage_type_master` table (if provided)

#### **Date Logic Validations**
- Valid_To > Valid_From (ownership dates)
- Registration_Upto > Registration_Date
- Document Valid_To > Valid_From
- Manufacturing date must be in the past

#### **Calculated Field Validations**
- If Gross_Vehicle_Weight_KG and Unloading_Weight_KG provided:
  - Payload_Capacity_KG = GVW - Unloading Weight
  - GVW must be > Unloading Weight

### 4. Duplicate Detection Rules

#### **Intra-Batch Duplicates (Within Excel)**
- **Error**: Same Vehicle_Ref_ID appears multiple times in Sheet 1
- **Error**: Same VIN_Chassis_Number used for different vehicles
- **Error**: Same GPS_IMEI_Number used for different vehicles
- **Error**: Same Registration_Number used for different vehicles (if provided)

#### **Inter-Batch Duplicates (Against Database)**
- **Error**: VIN_Chassis_Number already exists in database
- **Error**: GPS_IMEI_Number already exists in database
- **Error**: Registration_Number already exists in database (if provided)

---

## 🛠️ **TECHNICAL IMPLEMENTATION PLAN**

### **Phase 1: Database Setup**

#### **1.1 Create Bulk Upload Tables**

```sql
-- Batch tracking table
CREATE TABLE tms_bulk_upload_vehicle_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id VARCHAR(50) UNIQUE NOT NULL,
  uploaded_by INT UNSIGNED NOT NULL,
  filename VARCHAR(255) NOT NULL,
  total_rows INT NOT NULL,
  total_valid INT DEFAULT 0,
  total_invalid INT DEFAULT 0,
  total_created INT DEFAULT 0,
  total_creation_failed INT DEFAULT 0,
  status ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
  upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_timestamp TIMESTAMP NULL,
  error_report_path VARCHAR(500),
  error_message TEXT,
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_status (status),
  INDEX idx_upload_timestamp (upload_timestamp),
  FOREIGN KEY (uploaded_by) REFERENCES user_master(id)
);

-- Vehicle records table (for tracking validation and creation)
CREATE TABLE tms_bulk_upload_vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  batch_id VARCHAR(50) NOT NULL,
  vehicle_ref_id VARCHAR(50),
  excel_row_number INT NOT NULL,
  validation_status ENUM('valid', 'invalid') NOT NULL,
  validation_errors JSON,
  data JSON,
  created_vehicle_id VARCHAR(10),
  INDEX idx_batch_id (batch_id),
  INDEX idx_validation_status (validation_status),
  FOREIGN KEY (batch_id) REFERENCES tms_bulk_upload_vehicle_batches(batch_id) ON DELETE CASCADE,
  FOREIGN KEY (created_vehicle_id) REFERENCES vehicle_basic_information_hdr(vehicle_id_code_hdr)
);
```

#### **1.2 Database Migration Script**

**File**: `backend/create-vehicle-bulk-upload-tables.js`

```javascript
require('dotenv').config();
const knex = require('knex')(require('./knexfile').development);

async function createVehicleBulkUploadTables() {
  try {
    console.log('Creating vehicle bulk upload tables...\n');

    // Check if tables exist
    const batchesExists = await knex.schema.hasTable('tms_bulk_upload_vehicle_batches');
    const vehiclesExists = await knex.schema.hasTable('tms_bulk_upload_vehicles');

    if (!batchesExists) {
      console.log('Creating tms_bulk_upload_vehicle_batches...');
      await knex.schema.createTable('tms_bulk_upload_vehicle_batches', (table) => {
        table.increments('id').primary();
        table.string('batch_id', 50).notNullable().unique();
        table.integer('uploaded_by').unsigned().notNullable();
        table.string('filename', 255).notNullable();
        table.integer('total_rows').notNullable();
        table.integer('total_valid').defaultTo(0);
        table.integer('total_invalid').defaultTo(0);
        table.integer('total_created').defaultTo(0);
        table.integer('total_creation_failed').defaultTo(0);
        table.enum('status', ['processing', 'completed', 'failed']).defaultTo('processing');
        table.timestamp('upload_timestamp').defaultTo(knex.fn.now());
        table.timestamp('processed_timestamp').nullable();
        table.string('error_report_path', 500).nullable();
        table.text('error_message').nullable();
        
        table.foreign('uploaded_by').references('id').inTable('user_master');
        table.index('uploaded_by');
        table.index('status');
        table.index('upload_timestamp');
      });
      console.log('✓ tms_bulk_upload_vehicle_batches created\n');
    }

    if (!vehiclesExists) {
      console.log('Creating tms_bulk_upload_vehicles...');
      await knex.schema.createTable('tms_bulk_upload_vehicles', (table) => {
        table.increments('id').primary();
        table.string('batch_id', 50).notNullable();
        table.string('vehicle_ref_id', 50).nullable();
        table.integer('excel_row_number').notNullable();
        table.enum('validation_status', ['valid', 'invalid']).notNullable();
        table.json('validation_errors').nullable();
        table.json('data').nullable();
        table.string('created_vehicle_id', 10).nullable();
        
        table.foreign('batch_id').references('batch_id').inTable('tms_bulk_upload_vehicle_batches').onDelete('CASCADE');
        table.foreign('created_vehicle_id').references('vehicle_id_code_hdr').inTable('vehicle_basic_information_hdr');
        table.index('batch_id');
        table.index('validation_status');
      });
      console.log('✓ tms_bulk_upload_vehicles created\n');
    }

    console.log('All vehicle bulk upload tables ready!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

createVehicleBulkUploadTables();
```

---

### **Phase 2: Backend Implementation**

#### **2.1 File Structure**

```
backend/
├── controllers/
│   └── bulkUpload/
│       ├── vehicleBulkUploadController.js    (Main controller - NEW)
├── services/
│   └── vehicleBulkUpload/
│       ├── excelParserService.js             (Parse Excel sheets - NEW)
│       ├── validationService.js              (Validate all data - NEW)
│       ├── errorReportService.js             (Generate error Excel - NEW)
│       ├── vehicleCreationService.js         (Batch create vehicles - NEW)
│       └── templateGeneratorService.js       (Generate Excel template - NEW)
├── queues/
│   ├── vehicleBulkUploadQueue.js             (Bull queue definition - NEW)
│   └── vehicleBulkUploadProcessor.js         (Process batch job - NEW)
├── routes/
│   └── vehicleBulkUploadRoutes.js            (API routes - NEW)
└── utils/
    └── vehicleBulkUpload/
        └── excelTemplateGenerator.js         (Template generation utility - NEW)
```

#### **2.2 API Endpoints**

```javascript
// vehicleBulkUploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const vehicleBulkUploadController = require('../controllers/bulkUpload/vehicleBulkUploadController');

// Configure multer
const upload = multer({
  dest: 'uploads/vehicle-bulk-upload/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files allowed'));
    }
  }
});

// Routes
router.get('/template', vehicleBulkUploadController.downloadTemplate);
router.post('/upload', upload.single('file'), vehicleBulkUploadController.uploadFile);
router.get('/status/:batchId', vehicleBulkUploadController.getBatchStatus);
router.get('/history', vehicleBulkUploadController.getUploadHistory);
router.get('/error-report/:batchId', vehicleBulkUploadController.downloadErrorReport);

module.exports = router;
```

#### **2.3 Controller Methods**

```javascript
// vehicleBulkUploadController.js

/**
 * Download Excel template
 * GET /api/vehicle/bulk-upload/template
 */
exports.downloadTemplate = async (req, res) => {
  // Generate Excel template with 5 sheets
  // Return as downloadable file
};

/**
 * Upload Excel file and queue for processing
 * POST /api/vehicle/bulk-upload/upload
 */
exports.uploadFile = async (req, res) => {
  // 1. Validate file exists
  // 2. Create batch record in DB
  // 3. Queue processing job (Bull)
  // 4. Return batch ID immediately
};

/**
 * Get batch processing status
 * GET /api/vehicle/bulk-upload/status/:batchId
 */
exports.getBatchStatus = async (req, res) => {
  // Return current status, progress, counts
};

/**
 * Get upload history for user
 * GET /api/vehicle/bulk-upload/history
 */
exports.getUploadHistory = async (req, res) => {
  // Return paginated list of user's batches
};

/**
 * Download error report for failed validations
 * GET /api/vehicle/bulk-upload/error-report/:batchId
 */
exports.downloadErrorReport = async (req, res) => {
  // Generate Excel with errors highlighted
  // Return as downloadable file
};
```

#### **2.4 Processing Pipeline (Bull Queue)**

```javascript
// vehicleBulkUploadProcessor.js

async function processVehicleBulkUpload(job, io) {
  const { batchId, filePath, userId, originalName } = job.data;
  
  try {
    // Step 1: Parse Excel file (all 5 sheets)
    io.emit('progress', { progress: 20, message: 'Parsing Excel...' });
    const parsedData = await parseExcelFile(filePath);
    
    // Step 2: Validate all data
    io.emit('progress', { progress: 40, message: 'Validating data...' });
    const validationResults = await validateAllData(parsedData);
    
    // Step 3: Store validation results in DB
    io.emit('progress', { progress: 60, message: 'Storing results...' });
    await storeValidationResults(batchId, validationResults);
    
    // Step 4: Generate error report (if errors exist)
    if (validationResults.invalid.length > 0) {
      io.emit('progress', { progress: 75, message: 'Generating error report...' });
      await generateErrorReport(batchId, validationResults.invalid);
    }
    
    // Step 5: Create valid vehicles in DB
    io.emit('progress', { progress: 85, message: 'Creating vehicles...' });
    const creationResults = await createVehiclesBatch(validationResults.valid);
    
    // Step 6: Update batch status
    io.emit('progress', { progress: 100, message: 'Complete!' });
    await updateBatchStatus(batchId, 'completed', creationResults);
    
    // Emit completion event
    io.emit('complete', {
      batchId,
      validCount: validationResults.valid.length,
      invalidCount: validationResults.invalid.length,
      createdCount: creationResults.success.length
    });
    
  } catch (error) {
    console.error('Error processing batch:', error);
    await updateBatchStatus(batchId, 'failed', { error: error.message });
    io.emit('error', { batchId, message: error.message });
  }
}
```

---

### **Phase 3: Frontend Implementation**

#### **3.1 Component Structure**

```
frontend/src/
├── features/
│   └── vehicle/
│       └── components/
│           ├── VehicleBulkUploadModal.jsx        (Main modal - NEW)
│           ├── VehicleBulkUploadHistory.jsx      (History modal - NEW)
│           └── (existing components)
├── redux/
│   └── slices/
│       └── vehicleBulkUploadSlice.js             (Redux state - NEW)
└── services/
    └── vehicleBulkUploadService.js               (API calls - NEW)
```

#### **3.2 Redux Slice**

```javascript
// vehicleBulkUploadSlice.js

const initialState = {
  isModalOpen: false,
  isHistoryModalOpen: false,
  isUploading: false,
  uploadProgress: 0,
  currentBatch: null,
  validationResults: null,
  progressLogs: [],
  uploadHistory: [],
  historyPagination: { page: 1, limit: 10, total: 0, pages: 0 },
  isFetchingHistory: false,
  isDownloadingTemplate: false,
  isDownloadingErrorReport: false,
  error: null,
};

const vehicleBulkUploadSlice = createSlice({
  name: 'vehicleBulkUpload',
  initialState,
  reducers: {
    openModal: (state) => { /* ... */ },
    closeModal: (state) => { /* ... */ },
    updateProgress: (state, action) => { /* ... */ },
    setValidationResults: (state, action) => { /* ... */ },
    // ... other reducers
  },
  extraReducers: (builder) => {
    // Handle async thunks (upload, fetch history, etc.)
  }
});
```

#### **3.3 Integration with VehicleMaintenance Page**

```jsx
// VehicleMaintenance.jsx

import VehicleBulkUploadModal from '../features/vehicle/components/VehicleBulkUploadModal';
import VehicleBulkUploadHistory from '../features/vehicle/components/VehicleBulkUploadHistory';
import { openModal as openBulkUploadModal } from '../redux/slices/vehicleBulkUploadSlice';

const VehicleMaintenance = () => {
  const dispatch = useDispatch();
  
  const handleBulkUpload = () => {
    dispatch(openBulkUploadModal());
  };
  
  return (
    <div>
      <TopActionBar
        onCreateNew={handleCreateNew}
        onBulkUpload={handleBulkUpload}  // NEW button
        onBack={handleBack}
        totalCount={pagination.total || 0}
        showFilters={showFilters}
        onToggleFilters={handleToggleFilters}
      />
      
      {/* Existing content */}
      
      <VehicleBulkUploadModal />
      <VehicleBulkUploadHistory />
    </div>
  );
};
```

---

### **Phase 4: Excel Template Generation**

#### **4.1 Template Structure**

```javascript
// excelTemplateGenerator.js

async function generateVehicleBulkUploadTemplate() {
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: Basic Information
  const sheet1 = workbook.addWorksheet('Basic Information');
  sheet1.columns = [
    { header: 'Vehicle_Ref_ID', key: 'vehicle_ref_id', width: 15 },
    { header: 'Make_Brand', key: 'make_brand', width: 20 },
    { header: 'Model', key: 'model', width: 20 },
    // ... all 20 columns
  ];
  
  // Add sample data rows
  sheet1.addRow({
    vehicle_ref_id: 'VR001',
    make_brand: 'Tata',
    model: 'LPT 1918',
    // ... sample data
  });
  
  // Sheet 2: Specifications
  // Sheet 3: Capacity Details
  // Sheet 4: Ownership Details
  // Sheet 5: Documents
  
  // Style headers
  sheet1.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  
  // Add data validation (dropdowns for master data)
  sheet1.getColumn('vehicle_type_id').dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['"VT001,VT002,VT003"'] // Fetch from DB
  };
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
```

---

### **Phase 5: Validation Service**

#### **5.1 Validation Pipeline**

```javascript
// validationService.js

async function validateAllData(parsedData) {
  const results = { valid: [], invalid: [], summary: {} };
  
  // Step 1: Validate relational integrity
  const relationalErrors = await validateRelationalIntegrity(parsedData);
  
  // Step 2: Validate each vehicle
  for (const basicInfo of parsedData.basicInformation) {
    const vehicleData = {
      basicInfo,
      specifications: findByRefId(parsedData.specifications, basicInfo.Vehicle_Ref_ID),
      capacityDetails: findByRefId(parsedData.capacityDetails, basicInfo.Vehicle_Ref_ID),
      ownershipDetails: findByRefId(parsedData.ownershipDetails, basicInfo.Vehicle_Ref_ID),
      documents: filterByRefId(parsedData.documents, basicInfo.Vehicle_Ref_ID)
    };
    
    const errors = await validateVehicle(vehicleData, relationalErrors);
    
    if (errors.length === 0) {
      results.valid.push(vehicleData);
    } else {
      results.invalid.push({ ...vehicleData, errors });
    }
  }
  
  return results;
}

async function validateVehicle(vehicleData, relationalErrors) {
  const errors = [];
  
  // Field-level validations
  errors.push(...validateBasicInfo(vehicleData.basicInfo));
  errors.push(...validateSpecifications(vehicleData.specifications));
  errors.push(...validateCapacityDetails(vehicleData.capacityDetails));
  errors.push(...validateOwnershipDetails(vehicleData.ownershipDetails));
  errors.push(...validateDocuments(vehicleData.documents));
  
  // Business rules
  errors.push(...await validateBusinessRules(vehicleData));
  
  // Duplicate checks
  errors.push(...await checkDuplicates(vehicleData));
  
  return errors.filter(Boolean);
}
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Database** ✅
- [ ] Create `tms_bulk_upload_vehicle_batches` table
- [ ] Create `tms_bulk_upload_vehicles` table
- [ ] Run migration script and verify

### **Phase 2: Backend Services** ✅
- [ ] Excel parser service (5 sheets)
- [ ] Validation service (all rules)
- [ ] Error report generator
- [ ] Vehicle creation service (batch insert)
- [ ] Template generator service

### **Phase 3: Backend API** ✅
- [ ] vehicleBulkUploadController.js
- [ ] vehicleBulkUploadRoutes.js
- [ ] vehicleBulkUploadQueue.js
- [ ] vehicleBulkUploadProcessor.js
- [ ] Register routes in server.js

### **Phase 4: Frontend Components** ✅
- [ ] VehicleBulkUploadModal.jsx
- [ ] VehicleBulkUploadHistory.jsx
- [ ] vehicleBulkUploadSlice.js
- [ ] vehicleBulkUploadService.js
- [ ] Socket.IO integration for real-time updates

### **Phase 5: UI Integration** ✅
- [ ] Add "Bulk Upload" button to TopActionBar
- [ ] Connect modal to VehicleMaintenance page
- [ ] Test drag-drop file upload
- [ ] Test progress bar and live logs

### **Phase 6: Testing** ✅
- [ ] Template download works
- [ ] File upload queues job
- [ ] Validation detects all errors
- [ ] Error report generates correctly
- [ ] Valid vehicles are created in DB
- [ ] History shows all batches
- [ ] Real-time progress updates work

---

## 🚀 **IMPLEMENTATION TIMELINE**

### **Estimated Effort**: 16-20 hours

- **Phase 1 (Database)**: 1-2 hours
- **Phase 2 (Backend Services)**: 6-8 hours
- **Phase 3 (Backend API)**: 3-4 hours
- **Phase 4 (Frontend Components)**: 4-5 hours
- **Phase 5 (UI Integration)**: 1-2 hours
- **Phase 6 (Testing & Bug Fixes)**: 2-3 hours

---

## 📌 **NEXT STEPS**

1. **Review this plan** with the user
2. **Get approval** to proceed with implementation
3. **Start with Phase 1** (Database setup)
4. **Implement incrementally** following the phases
5. **Test each phase** before moving to the next

---

## ⚠️ **IMPORTANT NOTES**

### **Key Differences from Transporter Bulk Upload**

1. **Database Schema**:
   - Vehicle has more tables (5 vs 4 for transporter)
   - Different ID format (VEH0001 vs transporter_id)
   - Different master data tables

2. **Validation Rules**:
   - VIN/Chassis Number uniqueness (critical)
   - GPS IMEI uniqueness (critical)
   - More numeric validations (capacities, weights)

3. **Document Handling**:
   - Same as transporter: metadata only, no file upload
   - Files uploaded later via edit mode in details page

4. **Processing Capacity**:
   - Target: 500+ vehicles per batch
   - May need chunking for very large batches (>1000)

### **Reusable Components from Transporter**

- Modal UI structure ✅
- Drag-drop file picker ✅
- Progress bar and logs ✅
- History modal ✅
- Socket.IO integration ✅
- Bull Queue pattern ✅
- Error report generation ✅

---

## 📄 **CONCLUSION**

This guideline provides a complete blueprint for implementing Vehicle Bulk Upload functionality. The implementation follows the proven pattern from Transporter Bulk Upload while accounting for vehicle-specific requirements.

**Key Success Factors**:
- ✅ Comprehensive validation (field + relational + business rules)
- ✅ Real-time progress updates via Socket.IO
- ✅ Asynchronous processing with Bull Queue
- ✅ User-friendly error reporting
- ✅ Metadata-only document handling (no file upload in bulk)
- ✅ Scalable architecture (500+ vehicles per batch)

---

**AWAITING USER APPROVAL TO PROCEED WITH IMPLEMENTATION** ✋
