# 🚀 Bulk Upload Implementation TODO Checklist

**Project**: TMS Transporter Bulk Upload Functionality  
**Date Started**: October 30, 2025  
**Estimated Completion**: 4-5 weeks

---

## 📦 Phase 1: Backend Foundation & Setup ✅ COMPLETED

### Database Schema ✅

- [x] Create `bulk_upload_batches` table
  ```sql
  - batch_id (VARCHAR 50, unique)
  - uploaded_by (INT, FK to user_master)
  - filename (VARCHAR 255)
  - total_rows (INT)
  - valid_rows (INT)
  - invalid_rows (INT)
  - status (ENUM: processing, completed, failed)
  - upload_timestamp (TIMESTAMP)
  - processed_timestamp (TIMESTAMP)
  - error_file_path (VARCHAR 500)
  ```

- [x] Create `bulk_upload_transporters` table
  ```sql
  - id (INT, PK)
  - batch_id (VARCHAR 50, FK)
  - transporter_ref_id (VARCHAR 50)
  - excel_row_number (INT)
  - validation_status (ENUM: valid, invalid)
  - validation_errors (JSON)
  - created_transporter_id (VARCHAR 10, FK to transporter_general_info)
  ```

- [x] Add indexes for performance optimization
- [x] Run migration to create tables

### NPM Package Installation ✅

- [x] Install `exceljs` - Excel parsing and generation
- [x] Install `multer` - File upload middleware (already installed)
- [x] Install `bull` - Background job queue
- [x] Install `redis` - Required for Bull queue
- [x] Install `socket.io` - Real-time updates
- [x] Install `date-fns` - Date validation
- [x] Install `validator` - Email/phone validation
- [x] Update `package.json` with new dependencies

### Backend File Structure ✅

- [x] Create `controllers/bulkUpload/bulkUploadController.js`
- [ ] Create `services/bulkUpload/excelParserService.js`
- [ ] Create `services/bulkUpload/bulkValidationService.js`
- [ ] Create `services/bulkUpload/bulkProcessorService.js`
- [ ] Create `services/bulkUpload/errorReportService.js`
- [x] Create `utils/bulkUpload/excelTemplateGenerator.js`
- [x] Create `queues/bulkUploadQueue.js`
- [x] Create `routes/bulkUploadRoutes.js`
- [x] Create `config/redis.js`
- [ ] Create `middleware/bulkUploadMiddleware.js`

---

## 🔧 Phase 2: Excel Template Generation

### Template Generator

- [ ] Create template generator utility
- [ ] **Sheet 1**: General Details structure
  - [ ] Define columns with data validation
  - [ ] Add comments/notes for each column
  - [ ] Set column widths and formatting

- [ ] **Sheet 2**: Addresses structure
  - [ ] Define columns with data validation
  - [ ] Add dropdown for Address_Type (from master data)
  - [ ] Add dropdown for Country (from country-state-city)

- [ ] **Sheet 3**: Contacts structure
  - [ ] Define columns with data validation
  - [ ] Link to Address_Type from Sheet 2
  - [ ] Add email and phone format validation

- [ ] **Sheet 4**: Serviceable Areas structure
  - [ ] Define columns with data validation
  - [ ] Add dropdown for Country
  - [ ] Add instructions for comma-separated states

- [ ] **Sheet 5**: Documents structure
  - [ ] Define columns with data validation
  - [ ] Add dropdown for Document_Type (from master data)
  - [ ] Add dropdown for Document_Name (from master data)

- [ ] Add "Instructions" sheet with guidelines
- [ ] Add "Sample Data" sheet with examples
- [ ] Implement template download endpoint

---

## ✅ Phase 2: Excel Parsing & Validation ✅ COMPLETED

### Excel Parser Service ✅

- [x] Implement multi-sheet Excel reader
  - [x] Parse General Details sheet
  - [x] Parse Addresses sheet
  - [x] Parse Contacts sheet
  - [x] Parse Serviceable Areas sheet
  - [x] Parse Documents sheet

- [x] Handle streaming for large files (1000+ rows)
- [x] Convert Excel date formats to proper dates
- [x] Handle empty cells and null values
- [x] Map column headers to field names

### Structure Validation ✅

- [x] Validate all 5 sheets are present
- [x] Validate column headers match template
- [x] Validate no empty required columns
- [x] Check for duplicate Transporter_Ref_IDs
- [x] Validate file format (.xlsx, .xls only)

### Relational Integrity Validation ✅

- [x] Validate child records reference existing parent
  - [x] Addresses reference valid Transporter_Ref_ID
  - [x] Contacts reference valid Transporter_Ref_ID and Address_Type
  - [x] Serviceable Areas reference valid Transporter_Ref_ID
  - [x] Documents reference valid Transporter_Ref_ID

- [x] Validate one-to-many relationships
  - [x] At least one address per transporter
  - [x] At least one contact per transporter
  - [x] Serviceable areas optional
  - [x] Documents optional for bulk upload

- [x] Validate business rules
  - [x] One primary address per transporter
  - [x] No duplicate countries in serviceable areas per transporter

### Field-Level Validation ✅

- [x] **General Details validations**:
  - [x] Business_Name: min 2 characters, max 200
  - [x] Transport modes: At least one must be Y
  - [x] From_Date: Required, valid date
  - [x] To_Date: Valid date, after From_Date

- [x] **Address validations**:
  - [x] Address_Type: Required
  - [x] Country: Valid ISO code
  - [x] State: Valid for selected country
  - [x] City: Required
  - [x] Postal_Code: Valid format
  - [x] VAT_GST_Number: Optional
  - [x] Phone: Valid international format

- [x] **Contact validations**:
  - [x] Contact_Person_Name: Required
  - [x] Phone_Number: Valid format (+countrycode+number)
  - [x] Email_ID: Valid format, not duplicate

- [x] **Serviceable Area validations**:
  - [x] Service_Country: Valid ISO code
  - [x] Service_States: Required (comma-separated)
  - [x] No duplicate countries per transporter

- [x] **Document validations**:
  - [x] Document_Type: Required
  - [x] Document_Name: Required
  - [x] Document_Number: Required
  - [x] Issue_Date: Valid date
  - [x] Expiry_Date: Valid date (optional)

### Duplicate Checks ✅

- [x] Check duplicate business names
- [x] Check duplicate primary emails
- [x] Check duplicate primary phones (via business rules)
- [x] VAT/GST validation (format check)
- [x] Document number uniqueness (per transporter)

### Error Report Generation ✅

- [x] Create error report service
- [x] Generate Excel with summary sheet
- [x] Generate sheet-wise error sheets
- [x] Highlight invalid cells in red
- [x] Include error messages per field

---

## 🔄 Phase 4: Bulk Processing Engine

### Job Queue Setup

- [ ] Configure Redis connection
- [ ] Set up Bull queue for bulk uploads
- [ ] Define job retry strategy
- [ ] Configure job concurrency limits
- [ ] Set up failed job handling

### Batch Processing Logic

- [ ] Create batch record in database
- [ ] Queue processing job
- [ ] Return batch ID immediately to frontend
- [ ] Process valid transporters in chunks of 50
- [ ] Use parallel processing (10 concurrent)
- [ ] Emit real-time progress updates via WebSocket

### Transporter Creation from Bulk

- [ ] Map Excel data to createTransporter format
  - [ ] Map general details
  - [ ] Map addresses array
  - [ ] Map contacts array (nested in addresses)
  - [ ] Map serviceable areas array
  - [ ] Map documents array

- [ ] Create transporter with "Pending Approval" status
- [ ] Link transporter to bulk upload batch
- [ ] Handle transaction rollback on failure
- [ ] Log each transporter creation in bulk_upload_transporters table

### Error Handling

- [ ] Collect all validation errors per row
- [ ] Store errors in JSON format
- [ ] Continue processing valid rows
- [ ] Update batch statistics
- [ ] Generate error report for invalid rows

---

## 📊 Phase 5: Error Report Generation

### Error Report Service

- [ ] Create Excel file with error details
- [ ] **Summary Sheet**:
  - [ ] Total records processed
  - [ ] Valid records count
  - [ ] Invalid records count
  - [ ] Error breakdown by type

- [ ] **Error Detail Sheets** (one per source sheet):
  - [ ] Include original data
  - [ ] Add "Error_Type" column
  - [ ] Add "Error_Message" column
  - [ ] Highlight invalid cells in red
  - [ ] Add row number reference

- [ ] Save error report to server
- [ ] Store file path in database
- [ ] Provide download endpoint

---

## 🎨 Phase 6: Frontend UI Components

### Button Replacement

- [ ] Remove Export button from TransporterMaintenance page
- [ ] Add Bulk Upload button with upload icon
- [ ] Position button in TopActionBar
- [ ] Add tooltip "Upload Multiple Transporters"

### Bulk Upload Modal

- [ ] Create BulkUploadModal component
- [ ] Modal structure:
  - [ ] Header with title and close button
  - [ ] Download Template button
  - [ ] Upload History button
  - [ ] File picker section
  - [ ] Progress section
  - [ ] Real-time log section
  - [ ] Results summary section

- [ ] File Picker:
  - [ ] Drag-and-drop zone
  - [ ] Click to browse
  - [ ] File type validation (.xlsx, .xls only)
  - [ ] File size indication
  - [ ] Show selected filename

- [ ] Progress Section:
  - [ ] Progress bar (0-100%)
  - [ ] Percentage text
  - [ ] Processing status text
  - [ ] Estimated time remaining

- [ ] Real-time Log:
  - [ ] Scrollable log area
  - [ ] Success entries (green checkmark)
  - [ ] Error entries (red X)
  - [ ] Auto-scroll to latest
  - [ ] Maximum 100 visible entries

- [ ] Results Summary:
  - [ ] Total processed count
  - [ ] Success count (green)
  - [ ] Error count (red)
  - [ ] Download Error Report button
  - [ ] Close button

### Redux State Management

- [ ] Add bulkUpload slice to transporterSlice
- [ ] Create async thunks:
  - [ ] `uploadTransporterBulk` - Upload file
  - [ ] `downloadTemplate` - Download template
  - [ ] `fetchUploadHistory` - Get user's upload history
  - [ ] `downloadErrorReport` - Download error Excel

- [ ] Add state properties:
  - [ ] isUploading (boolean)
  - [ ] uploadProgress (number 0-100)
  - [ ] currentBatch (object)
  - [ ] processingLog (array)
  - [ ] validationResults (object)
  - [ ] uploadHistory (array)

### WebSocket Integration

- [ ] Connect to Socket.IO on modal open
- [ ] Join room for specific batch ID
- [ ] Listen for progress events
- [ ] Update progress bar on progress event
- [ ] Append to log on transporter created event
- [ ] Update counters on status update
- [ ] Disconnect on modal close

---

## 🔌 Phase 7: API Endpoints

### Bulk Upload Endpoints

- [ ] `POST /api/transporter/bulk-upload`
  - [ ] Accept file upload (multer middleware)
  - [ ] Validate file structure
  - [ ] Create batch record
  - [ ] Queue processing job
  - [ ] Return batch ID

- [ ] `GET /api/transporter/bulk-upload/template`
  - [ ] Generate Excel template
  - [ ] Include all 5 sheets
  - [ ] Add sample data
  - [ ] Return file download

- [ ] `GET /api/transporter/bulk-upload/history/:userId`
  - [ ] Fetch user's upload history
  - [ ] Include batch statistics
  - [ ] Sort by date descending
  - [ ] Paginate results

- [ ] `GET /api/transporter/bulk-upload/error-report/:batchId`
  - [ ] Validate batch ownership
  - [ ] Check error report exists
  - [ ] Stream file download

- [ ] `GET /api/transporter/bulk-upload/status/:batchId`
  - [ ] Return batch status
  - [ ] Return progress details
  - [ ] Return validation results

### WebSocket Events

- [ ] `bulk-upload:progress` - Processing progress update
- [ ] `bulk-upload:transporter-created` - Individual transporter created
- [ ] `bulk-upload:error` - Processing error
- [ ] `bulk-upload:completed` - Batch processing completed
- [ ] `bulk-upload:failed` - Batch processing failed

---

## 🧪 Phase 8: Testing

### Unit Tests

- [ ] Test Excel template generation
- [ ] Test Excel parsing logic
- [ ] Test validation rules (each type)
- [ ] Test relational integrity checks
- [ ] Test error report generation
- [ ] Test batch processing logic

### Integration Tests

- [ ] Test full upload flow with valid data
- [ ] Test upload with mixed valid/invalid data
- [ ] Test upload with all invalid data
- [ ] Test large file upload (1000+ records)
- [ ] Test concurrent uploads
- [ ] Test WebSocket real-time updates

### Performance Tests

- [ ] Test with 100 transporters
- [ ] Test with 500 transporters
- [ ] Test with 1000 transporters
- [ ] Test with 2000 transporters
- [ ] Measure processing time
- [ ] Measure memory usage
- [ ] Test Redis queue performance

### Edge Cases

- [ ] Empty Excel file
- [ ] Missing sheets
- [ ] Invalid column headers
- [ ] Circular references
- [ ] Special characters in data
- [ ] Very long text fields
- [ ] Date format variations
- [ ] Network interruption during upload

---

## 📝 Phase 9: Documentation

### User Documentation

- [ ] Create user guide for bulk upload
- [ ] Document Excel template structure
- [ ] Provide field-by-field descriptions
- [ ] Add validation rules documentation
- [ ] Include troubleshooting guide
- [ ] Add FAQ section

### Developer Documentation

- [ ] Document API endpoints
- [ ] Document WebSocket events
- [ ] Document database schema
- [ ] Document processing flow
- [ ] Add code comments
- [ ] Create architecture diagram

---

## ✅ Phase 10: Deployment & Monitoring

### Pre-Deployment Checklist

- [ ] Review all code changes
- [ ] Run all tests
- [ ] Check error handling
- [ ] Verify logging
- [ ] Test in staging environment
- [ ] Performance benchmarks met

### Deployment Steps

- [ ] Run database migrations
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Start Redis server
- [ ] Start Bull workers
- [ ] Verify WebSocket connectivity

### Post-Deployment

- [ ] Monitor error logs
- [ ] Monitor job queue
- [ ] Monitor Redis performance
- [ ] Track upload success rates
- [ ] Gather user feedback
- [ ] Plan improvements

---

## 📊 Success Metrics

- [ ] Template download works without errors
- [ ] File upload accepts valid Excel files
- [ ] Validation catches all error types
- [ ] Processing completes for 1000+ records in <5 minutes
- [ ] Real-time updates work smoothly
- [ ] Error report generated correctly
- [ ] Created transporters appear in list with "Pending" status
- [ ] No memory leaks during large uploads
- [ ] No database deadlocks
- [ ] User feedback positive

---

## 🎯 Current Status

**Status**: 📝 Planning & Documentation Complete  
**Next Step**: Begin Phase 1 - Database Schema Creation  
**Blockers**: None

---

**Ready to begin implementation! Should I start with Phase 1: Database Schema Creation?**
