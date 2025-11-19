# Warehouse Bulk Upload Testing Guide

**Date**: 2025-01-18  
**Status**: Testing Phase  
**Test Files Generated**: 4 comprehensive test scenarios

---

## 📋 Overview

This document outlines the comprehensive testing strategy for the warehouse bulk upload functionality. Four test files have been generated to cover all scenarios: fully valid data, fully invalid data, mixed valid/invalid data, and stress testing with large volumes.

---

## 🎯 Testing Objectives

1. **Validation Testing**: Verify all validation rules are properly enforced
2. **Error Handling**: Ensure meaningful error messages for all failure scenarios
3. **Performance Testing**: Test system behavior with large data volumes (100+ warehouses)
4. **Data Integrity**: Verify no data corruption or duplicate entries
5. **UI Responsiveness**: Ensure UI properly displays batch status and error reports
6. **Transaction Safety**: Verify rollback on partial failures

---

## 📁 Test Files Generated

### 1. warehouse-test-all-valid-10.xlsx

- **Warehouses**: 10
- **Expected Result**: All 10 should pass validation and be created
- **Features Tested**:
  - Unique warehouse names (TEST-WH-0001 through TEST-WH-0010)
  - Unique VAT numbers
  - Valid country/state/city ISO codes
  - Proper boolean TRUE/FALSE values
  - Sub-locations with geofencing coordinates (2 per warehouse, 4 coordinates each)
  - Valid master data references (Warehouse_Type, Material_Type, Address_Type)

### 2. warehouse-test-all-invalid-10.xlsx

- **Warehouses**: 10
- **Expected Result**: All 10 should fail validation
- **Error Types Covered**:
  - **Row 4 (Index 0)**: Missing required fields (Warehouse_Type, Warehouse_Name1, Country, VAT_Number)
  - **Row 5 (Index 1)**: Invalid data types (text in numeric fields, invalid boolean values)
  - **Row 6 (Index 2)**: Invalid master data references (non-existent Warehouse_Type, invalid country codes)
  - **Row 7 (Index 3)**: Duplicate VAT number ("VAT_DUPLICATE_001")
  - **Row 8 (Index 4)**: Warehouse name exceeds max length (>30 characters)
  - **Row 9-13**: Repeating error patterns for thorough testing

### 3. warehouse-test-mixed-7valid-3invalid.xlsx

- **Warehouses**: 10 (7 valid + 3 invalid)
- **Expected Result**: 7 pass, 3 fail
- **Valid Rows**: 4-10 (Warehouse names: TEST-WH-0101 through TEST-WH-0107)
- **Invalid Rows**: 11-13 (Various validation errors)
- **Purpose**: Test partial batch success handling

### 4. warehouse-test-stress-100.xlsx

- **Warehouses**: 100
- **Expected Result**: All 100 should pass validation
- **Features Tested**:
  - Large batch processing performance
  - Transaction handling at scale
  - Database connection pooling
  - Memory usage with large Excel files
  - Progress tracking accuracy
  - Unique ID generation at scale (DRV0001-DRV0100 pattern)

---

## 🧪 Test Execution Plan

### Pre-Test Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend dev server running on port 5173
- [ ] Database connection verified
- [ ] Redis/Memurai running for batch processing
- [ ] User logged in as POWNER001 (or valid user with warehouse permissions)
- [ ] Warehouse Maintenance page accessible

### Test Procedure

#### Test 1: All Valid Data (10 Warehouses)

1. **Upload File**: `warehouse-test-all-valid-10.xlsx`
2. **Expected Batch Status**: "Processing" → "Completed"
3. **Expected Validation**: 10 valid, 0 invalid
4. **Expected Creation**: 10 created, 0 failed
5. **Verify**:
   - [ ] All 10 warehouses appear in warehouse list
   - [ ] Warehouse IDs generated (WH001, WH002, etc.)
   - [ ] Address IDs auto-generated
   - [ ] Sub-locations created (20 total: 2 per warehouse)
   - [ ] Geofencing coordinates saved (80 total: 4 per sub-location)
   - [ ] No error report generated
   - [ ] Toast notification shows success
6. **Data Verification**:
   - [ ] Open TEST-WH-0001 details → Verify all fields populated correctly
   - [ ] Check address details → Verify country/state/city converted from ISO codes
   - [ ] Check facilities → Verify boolean fields (Weigh Bridge, Fuel Availability, etc.)
   - [ ] Check geofencing → Verify 2 sub-locations with 4 coordinates each

#### Test 2: All Invalid Data (10 Warehouses)

1. **Upload File**: `warehouse-test-all-invalid-10.xlsx`
2. **Expected Batch Status**: "Processing" → "Completed"
3. **Expected Validation**: 0 valid, 10 invalid
4. **Expected Creation**: 0 created, 0 failed
5. **Verify**:
   - [ ] Error report downloadable
   - [ ] Error report contains 10 rows with specific validation errors
   - [ ] No warehouses created in database
   - [ ] Toast notification shows validation failures
6. **Error Messages to Verify**:
   - [ ] "Warehouse_Type is required" (Row 4)
   - [ ] "Vehicle_Capacity must be a number" (Row 5)
   - [ ] "Invalid Warehouse_Type: INVALID_TYPE" (Row 6)
   - [ ] "Duplicate VAT_Number: VAT_DUPLICATE_001" (Rows 7, 11)
   - [ ] "Warehouse_Name1 exceeds maximum length of 30 characters" (Row 8)

#### Test 3: Mixed Data (7 Valid, 3 Invalid)

1. **Upload File**: `warehouse-test-mixed-7valid-3invalid.xlsx`
2. **Expected Batch Status**: "Processing" → "Completed"
3. **Expected Validation**: 7 valid, 3 invalid
4. **Expected Creation**: 7 created, 0 failed
5. **Verify**:
   - [ ] 7 warehouses created successfully
   - [ ] 3 warehouses rejected with proper error messages
   - [ ] Error report contains only 3 failed rows
   - [ ] Valid warehouses: TEST-WH-0101 through TEST-WH-0107
   - [ ] Invalid warehouse rows identified in error report
   - [ ] Toast shows partial success (e.g., "7 warehouses created, 3 failed validation")

#### Test 4: Stress Test (100 Warehouses)

1. **Upload File**: `warehouse-test-stress-100.xlsx`
2. **Expected Batch Status**: "Processing" → "Completed"
3. **Expected Validation**: 100 valid, 0 invalid
4. **Expected Creation**: 100 created, 0 failed
5. **Verify**:
   - [ ] All 100 warehouses created
   - [ ] Processing time < 2 minutes (reasonable performance)
   - [ ] No memory issues or crashes
   - [ ] Progress tracking updates smoothly
   - [ ] Database transaction commits successfully
   - [ ] Unique IDs generated correctly (WH1001-WH1100)
   - [ ] No duplicate VAT numbers or warehouse names
6. **Performance Metrics**:
   - Upload time: **\_\_\_\_**
   - Parsing time: **\_\_\_\_**
   - Validation time: **\_\_\_\_**
   - Creation time: **\_\_\_\_**
   - Total time: **\_\_\_\_**

---

## 🐛 Known Issues & Fixes

### Issue 1: Parser Finding "0 Warehouses"

**Symptom**: Excel file uploaded but parser returns "Found 0 warehouse(s)"

**Root Cause**: Parser skips first 3 rows (header + sample + instructions). If user uploads a file with only headers and sample data, no actual data rows exist.

**Fix Applied**: Test data generator creates files with:

- Row 1: Headers
- Row 2: Sample data (yellow background)
- Row 3: Instructions (light yellow background)
- **Row 4+**: Actual test data (this is where parser starts reading)

**Verification**: All 4 test files generated have data starting from Row 4.

### Issue 2: Document Duplication on Update

**Status**: ✅ Fixed (see WAREHOUSE_UPDATE_FIX.md)

**Fix**: Frontend now preserves `documentUniqueId` when transforming warehouse data for editing.

### Issue 3: Warehouse Update Not Implemented

**Status**: ✅ Fixed (see WAREHOUSE_UPDATE_FIX.md)

**Fix**: Complete `updateWarehouse` function implemented with transaction support (Lines 969-1378 in warehouseController.js).

---

## ✅ Validation Rules Reference

### Required Fields (Sheet 1)

- `Warehouse_Type` - Must exist in master data (WT001-WT007)
- `Warehouse_Name1` - Max 30 characters, must be unique
- `Vehicle_Capacity` - Numeric, minimum 0
- `Country` - ISO code (IN, US, etc.)
- `State` - ISO code (MH, CA, etc.)
- `City` - City name
- `Street_1` - Address line 1
- `VAT_Number` - Must be unique across all warehouses
- `Address_Type` - Must exist in master data (AT001-AT005)
- `Material_Type` - Must exist in master data (MT001-MT008)

### Unique Constraints

- `VAT_Number` - Must be globally unique
- `TIN_PAN` - Must be unique if provided (optional field)
- `Warehouse_Name1` - Must be unique

### Boolean Fields (TRUE/FALSE)

- `Virtual_Yard_In`
- `Weigh_Bridge_Availability`
- `Gatepass_System_Available`
- `Fuel_Availability`
- `Staging_Area`
- `Driver_Waiting_Area`
- `Gate_In_Checklist_Auth`
- `Gate_Out_Checklist_Auth`

### Numeric Fields

- `Vehicle_Capacity` - Integer, min 0
- `Radius_Virtual_Yard_In` - Integer (meters)
- `Speed_Limit` - Integer (km/h, default 20)

### Sub-Location Validation (Sheet 2 & 3)

- `Warehouse_Name1` - Must match a warehouse from Sheet 1
- `SubLocation_Name` - Must be unique within warehouse
- `Latitude` - Decimal degrees (-90 to 90)
- `Longitude` - Decimal degrees (-180 to 180)
- `Sequence` - Integer starting from 1 (polygon point order)
- Minimum 3 coordinate points required for polygon

---

## 📊 Expected Test Results Summary

| Test File             | Total | Valid | Invalid | Created | Errors | Sub-Locations | Coordinates |
| --------------------- | ----- | ----- | ------- | ------- | ------ | ------------- | ----------- |
| all-valid-10          | 10    | 10    | 0       | 10      | 0      | 20            | 80          |
| all-invalid-10        | 10    | 0     | 10      | 0       | 10     | 0             | 0           |
| mixed-7valid-3invalid | 10    | 7     | 3       | 7       | 3      | 14            | 56          |
| stress-100            | 100   | 100   | 0       | 100     | 0      | 200           | 800         |

---

## 🔍 Post-Test Verification

After completing all tests:

1. **Database Verification**:

   ```sql
   -- Check warehouse count
   SELECT COUNT(*) FROM warehouse_basic_information;

   -- Check for duplicates
   SELECT vat_number, COUNT(*)
   FROM warehouse_basic_information
   GROUP BY vat_number
   HAVING COUNT(*) > 1;

   -- Check sub-locations
   SELECT COUNT(*) FROM warehouse_sub_location_header;
   SELECT COUNT(*) FROM warehouse_sub_location_item;
   ```

2. **UI Verification**:

   - [ ] Warehouse list pagination works correctly with 100+ warehouses
   - [ ] Filters (Country, State, Warehouse Type) work properly
   - [ ] Search finds warehouses by name or VAT number
   - [ ] Status pills display correctly
   - [ ] Details page opens without errors

3. **Batch History Verification**:
   - [ ] All 4 batch uploads appear in history
   - [ ] Batch status accurately reflects results
   - [ ] Error reports downloadable for failed batches
   - [ ] Timestamps accurate

---

## 🚀 Next Steps

1. Execute all 4 tests systematically
2. Document any validation issues discovered
3. Fix any missing validations
4. Re-test after fixes
5. Performance optimization if needed
6. Update this document with actual results

---

## 📝 Test Execution Log

### Test Run 1: [Date/Time]

**Tester**: ******\_\_\_******

#### Test 1: All Valid (10 warehouses)

- Status: ⏳ Pending / ✅ Passed / ❌ Failed
- Issues Found: ******\_\_\_******
- Notes: ******\_\_\_******

#### Test 2: All Invalid (10 warehouses)

- Status: ⏳ Pending / ✅ Passed / ❌ Failed
- Issues Found: ******\_\_\_******
- Notes: ******\_\_\_******

#### Test 3: Mixed (7 valid, 3 invalid)

- Status: ⏳ Pending / ✅ Passed / ❌ Failed
- Issues Found: ******\_\_\_******
- Notes: ******\_\_\_******

#### Test 4: Stress Test (100 warehouses)

- Status: ⏳ Pending / ✅ Passed / ❌ Failed
- Performance: ******\_\_\_******
- Issues Found: ******\_\_\_******
- Notes: ******\_\_\_******

---

## 🔧 Troubleshooting

### Issue: "0 warehouses found" after upload

**Solution**:

1. Open the Excel file
2. Verify data exists starting from Row 4
3. Check that sheet names match exactly:
   - "Warehouse Basic Information"
   - "Sub Location Header"
   - "Sub Location Item"
4. Ensure no hidden rows between header and data

### Issue: "Duplicate VAT Number" for unique values

**Solution**:

1. Check if warehouse already exists in database
2. Use unique VAT numbers in test data
3. Clear test data between test runs if needed

### Issue: Validation passes but creation fails

**Solution**:

1. Check backend logs for database errors
2. Verify foreign key constraints
3. Check transaction rollback logs
4. Ensure database connection pool not exhausted

---

## 📚 Related Documentation

- [Warehouse Create Page Complete Fix](./WAREHOUSE_CREATE_COMPLETE_FIX.md)
- [Warehouse Update Implementation](./WAREHOUSE_UPDATE_FIX.md)
- [Driver Bulk Upload Implementation](./DRIVER_BULK_UPLOAD_COMPLETE.md)
- [Bulk Upload Test Plan](./BULK_UPLOAD_TEST_PLAN.md)

---

**End of Document**
