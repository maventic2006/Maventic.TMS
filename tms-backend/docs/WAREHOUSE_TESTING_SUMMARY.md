# Warehouse Module - Quick Testing Guide

## Quick Start

### 1. Verify Database Tables
\\\sql
USE tms_dev;
SHOW TABLES LIKE 'tms_warehouse_bulk%';
-- Should show:
-- - tms_warehouse_bulk_upload_batches
-- - tms_warehouse_bulk_upload_warehouses
\\\

### 2. Test Validation Rules (Quick Test Cases)

#### Test Case 1: Speed Limit Validation
1. Navigate to Warehouse Create Page
2. Fill General Details
3. Enter Speed Limit: **85** (should fail)
4. Expected: Toast error "Speed limit cannot exceed 80 KM/H"
5. Enter Speed Limit: **80** (should pass)

#### Test Case 2: Postal Code Validation
1. Navigate to Address tab
2. Enter Postal Code: **12345** (5 digits, should fail)
3. Expected: Toast error "Postal code must be exactly 6 digits"
4. Enter Postal Code: **123456** (6 digits, should pass)

#### Test Case 3: TIN/PAN Validation (Optional Field)
1. Leave TIN/PAN empty  Should pass (optional)
2. Enter: **ABC1234D**  Should fail (wrong format)
3. Expected: Toast error "TIN/PAN must follow format: ABCDE1234F"
4. Enter: **ABCDE1234F**  Should pass

#### Test Case 4: TAN Validation (Optional Field)
1. Leave TAN empty  Should pass (optional)
2. Enter: **ABC12345D**  Should fail (wrong format)
3. Expected: Toast error "TAN must follow format: ASDF12345N"
4. Enter: **ASDF12345N**  Should pass

#### Test Case 5: Document Date Validation
1. Navigate to Documents tab
2. Add document
3. Enter Valid From: **Tomorrow's date**  Should fail
4. Expected: Toast error "Valid from date cannot be in the future"
5. Enter Valid From: **Today**
6. Enter Valid To: **Yesterday**  Should fail
7. Expected: Toast error "Valid to date must be after valid from date"
8. Enter Valid To: **Tomorrow**  Should pass

#### Test Case 6: File Upload Validation
1. Try to upload a 10MB PDF  Should fail
2. Expected: Toast error "File size must be less than 5MB"
3. Try to upload a .exe file  Should fail
4. Expected: Toast error "Only JPEG, PNG, GIF, PDF, DOC, and DOCX files are allowed"
5. Upload a 2MB PDF  Should pass
6. Expected: Success toast "File uploaded successfully"

### 3. Test Document View/Download

#### Test Case 7: Document Preview
1. Create warehouse with a PDF document
2. Navigate to Warehouse Details page
3. Click Documents tab
4. Click "View" button on the document
5. Expected: Preview modal opens with PDF displayed in iframe
6. Close modal

#### Test Case 8: Document Download
1. On the same document, click "Download" button
2. Expected: File downloads to browser's download folder
3. Open downloaded file
4. Verify: File matches the original uploaded document

#### Test Case 9: Image Document
1. Create warehouse with a JPEG image document
2. Navigate to warehouse details  Documents tab
3. Click "View" on the image document
4. Expected: Preview modal shows image
5. Click "Download"
6. Expected: Image downloads successfully

### 4. End-to-End Test

#### Complete Warehouse Creation Flow
1. **General Details Tab**
   - Warehouse Name: "Test Warehouse 001"
   - Warehouse Type: Select from dropdown
   - Material Type: Select from dropdown
   - Vehicle Capacity: 100
   - Speed Limit: **80** (test max value)
   - Virtual Yard In: Yes
   - Radius: 5

2. **Facilities Tab**
   - Fill all facility checkboxes

3. **Address Tab**
   - Address Line 1: "123 Test Street"
   - City: Select from dropdown
   - State: Select from dropdown
   - Country: India
   - Postal Code: **123456** (6 digits)
   - VAT Number: **ABCD1234EFGH**
   - TIN/PAN: **ABCDE1234F** (test format)
   - TAN: **ASDF12345N** (test format)
   - Phone: +91-1234567890
   - Email: test@warehouse.com

4. **Documents Tab**
   - Document Type: GST Certificate
   - Document Number: Valid GST format
   - Valid From: Today
   - Valid To: 1 year from today
   - Upload: 2MB PDF file
   - Verify success toast appears

5. **Submit**
   - Click "Submit" button
   - Expected: Success toast "Warehouse created successfully!"
   - Auto-redirect to warehouse list after 2 seconds

6. **Verify Details**
   - Click on the newly created warehouse
   - Verify all fields match entered data
   - Check Documents tab
   - Click "View" on document  Verify preview
   - Click "Download"  Verify file downloads

### 5. Error Handling Tests

#### Test Case 10: Multiple Validation Errors
1. Fill form with multiple errors:
   - Speed Limit: 100 (exceeds max)
   - Postal Code: 12345 (only 5 digits)
   - TIN/PAN: ABC123 (wrong format)
2. Click Submit
3. Expected: Toast shows first 5 unique validation errors
4. Expected: Form switches to first tab with error
5. Expected: Tab indicators show red dots on tabs with errors

#### Test Case 11: Backend Validation Error
1. Fill all frontend validations correctly
2. Submit form
3. If backend detects additional errors:
   - Expected: Toast displays backend error message
   - Expected: Error details include field path
   - Example: "address.postalCode: Postal code must be exactly 6 digits"

### 6. Toast Notification Verification

#### Expected Toast Types

**Error Toasts (Red, 8 seconds duration):**
- Validation errors with details (first 5 unique errors)
- File upload errors (size, type)
- Backend validation errors with field paths

**Success Toasts (Green):**
- Warehouse created successfully (3 seconds)
- File uploaded successfully (2 seconds)

**Toast Features to Verify:**
- [ ] Proper color coding (red for errors, green for success)
- [ ] Error details displayed as bullet list
- [ ] Auto-dismiss after specified duration
- [ ] Multiple toasts stack properly
- [ ] Toast close button works

---

## Validation Matrix

| Field | Test Value | Expected Result | Toast Message |
|-------|-----------|----------------|---------------|
| Speed Limit | 85 |  Fail | "Speed limit cannot exceed 80 KM/H" |
| Speed Limit | 80 |  Pass | - |
| Postal Code | "12345" |  Fail | "Postal code must be exactly 6 digits" |
| Postal Code | "123456" |  Pass | - |
| TIN/PAN | "" (empty) |  Pass | - |
| TIN/PAN | "ABC1234D" |  Fail | "TIN/PAN must follow format: ABCDE1234F" |
| TIN/PAN | "ABCDE1234F" |  Pass | - |
| TAN | "" (empty) |  Pass | - |
| TAN | "ABC12345D" |  Fail | "TAN must follow format: ASDF12345N" |
| TAN | "ASDF12345N" |  Pass | - |
| Valid From | Future date |  Fail | "Valid from date cannot be in the future" |
| Valid From | Today/Past |  Pass | - |
| Valid To | Before Valid From |  Fail | "Valid to date must be after valid from date" |
| Valid To | After Valid From |  Pass | - |
| File Size | 10MB |  Fail | "File size must be less than 5MB" |
| File Size | 2MB |  Pass | "File uploaded successfully" |
| File Type | .exe |  Fail | "Only JPEG, PNG, GIF, PDF, DOC, and DOCX files are allowed" |
| File Type | .pdf |  Pass | "File uploaded successfully" |

---

## Performance Benchmarks

Expected performance targets:

- **Warehouse Creation**: < 2 seconds
- **Document Upload**: < 1 second for files < 5MB
- **Document View**: < 500ms to load preview
- **Document Download**: Instant download initiation
- **Form Validation**: Instant (< 100ms)
- **Toast Notification**: Appears instantly

---

## Browser Compatibility Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if available)

Verify:
- [ ] Toast notifications display correctly
- [ ] File upload works
- [ ] Document preview modal works
- [ ] PDF iframe displays properly
- [ ] Image preview works
- [ ] Download functionality works

---

## Regression Testing

Verify these existing features still work:

- [ ] Warehouse list page loads
- [ ] Search and filters work
- [ ] Pagination works
- [ ] Edit warehouse works
- [ ] Delete warehouse works
- [ ] Facilities tab works
- [ ] Geofencing tab works
- [ ] All master data dropdowns populate

---

## Test Status Template

Use this checklist for each test session:

**Tester:** _______________  
**Date:** _______________  
**Build Version:** _______________  

### Validation Tests
- [ ] Speed Limit (80 max)
- [ ] Postal Code (6 digits)
- [ ] VAT Number
- [ ] TIN/PAN (optional, validated)
- [ ] TAN (optional, validated)
- [ ] Document Dates
- [ ] Document Number Format
- [ ] File Size (5MB max)
- [ ] File Type

### Document Management Tests
- [ ] File Upload
- [ ] Document View (PDF)
- [ ] Document View (Image)
- [ ] Document Download
- [ ] Preview Modal

### Toast Notification Tests
- [ ] Frontend Validation Errors
- [ ] Backend Validation Errors
- [ ] Success Messages
- [ ] File Upload Errors
- [ ] File Upload Success

### End-to-End Tests
- [ ] Complete Warehouse Creation
- [ ] View Created Warehouse
- [ ] All Fields Display Correctly
- [ ] Documents Tab Works
- [ ] View/Download Works

### Regression Tests
- [ ] No Breaking Changes
- [ ] Existing Features Work
- [ ] No Console Errors
- [ ] No Backend Errors

**Issues Found:** _______________  
**Status:**  Pass |  Fail |  Partial  
**Notes:** _______________

---

**Last Updated:** 2025-01-17  
**Status:** Ready for Testing
