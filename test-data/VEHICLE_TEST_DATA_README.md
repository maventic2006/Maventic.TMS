# Vehicle Bulk Upload Test Data

**Generated**: November 11, 2025  
**Purpose**: Comprehensive test files for vehicle bulk upload functionality testing  
**Location**: `/test-data` folder

---

## 📋 Overview

This folder contains test Excel files for vehicle bulk upload testing. Each file is designed to test specific scenarios including validation rules, error handling, and performance.

---

## 🗂️ Test Files

### 1. **All Valid Data Tests**

#### `test-vehicle-all-valid-10.xlsx`
- **Vehicles**: 10
- **Status**: All Valid
- **Purpose**: Basic happy path testing
- **Expected Result**: All 10 vehicles should be created successfully
- **Use Case**: Initial functionality verification

#### `test-vehicle-all-valid-50.xlsx`
- **Vehicles**: 50
- **Status**: All Valid
- **Purpose**: Medium batch testing
- **Expected Result**: All 50 vehicles created
- **Use Case**: Performance testing for medium datasets

#### `test-vehicle-all-valid-100.xlsx`
- **Vehicles**: 100
- **Status**: All Valid
- **Purpose**: Large batch testing
- **Expected Result**: All 100 vehicles created
- **Use Case**: Performance and scalability testing
- **Processing Time**: Should complete within 3-5 minutes

---

### 2. **All Invalid Data Tests**

#### `test-vehicle-all-invalid-10.xlsx`
- **Vehicles**: 10
- **Status**: All Invalid
- **Purpose**: Validation rule testing
- **Expected Result**: 0 vehicles created, 10 validation errors
- **Use Case**: Error reporting and validation testing

**Error Types Included**:
1. **Missing Required Fields** (VR001, VR008)
   - Empty Make_Brand
   - Empty Model
   
2. **Invalid VIN** (VR002, VR009)
   - VIN shorter than 17 characters
   - Should trigger: "VIN must be exactly 17 characters"

3. **Invalid GPS IMEI** (VR003, VR010)
   - IMEI not 15 digits
   - Should trigger: "GPS IMEI must be exactly 15 digits"

4. **Invalid Master Data IDs** (VR004)
   - Non-existent Vehicle_Type_ID
   - Non-existent Engine_Type_ID
   - Should trigger: "Vehicle type not found" errors

5. **Invalid Date Logic** (VR005)
   - Valid_To before Valid_From
   - Registration_Upto before Registration_Date
   - Should trigger: "End date must be after start date"

6. **Negative Numbers** (VR006)
   - Negative weight values
   - Negative tax amounts
   - Should trigger: "Value must be greater than or equal to 0"

7. **Invalid Enum Values** (VR007)
   - Invalid Transmission_Type
   - Invalid Suspension_Type
   - Invalid GPS_Active_Flag
   - Should trigger: "Invalid value for field"

---

### 3. **Mixed Valid/Invalid Tests**

#### `test-vehicle-mixed-5valid-5invalid.xlsx`
- **Vehicles**: 10 (5 valid + 5 invalid)
- **Status**: Mixed
- **Purpose**: Test partial success handling
- **Expected Result**: 5 created, 5 failed
- **Use Case**: Verify system handles mixed data correctly

**Data Breakdown**:
- VR001-VR005: Valid vehicles
- VR006-VR010: Invalid vehicles (various error types)

#### `test-vehicle-mixed-15valid-5invalid.xlsx`
- **Vehicles**: 20 (15 valid + 5 invalid)
- **Status**: Mixed (75% success rate)
- **Purpose**: Test majority-valid scenario
- **Expected Result**: 15 created, 5 failed
- **Use Case**: Real-world upload simulation

**Data Breakdown**:
- VR001-VR015: Valid vehicles
- VR016-VR020: Invalid vehicles

#### `test-vehicle-mixed-8valid-2invalid.xlsx`
- **Vehicles**: 10 (8 valid + 2 invalid)
- **Status**: Mixed (80% success rate)
- **Purpose**: Test high-success-rate scenario
- **Expected Result**: 8 created, 2 failed
- **Use Case**: Common data quality scenario

**Data Breakdown**:
- VR001-VR008: Valid vehicles
- VR009-VR010: Invalid vehicles

---

## 📊 Data Structure

All test files follow the 5-sheet structure:

### Sheet 1: Basic Information
- **Required Fields**: Vehicle_Ref_ID, Make_Brand, Model, VIN_Chassis_Number, Vehicle_Type_ID, Manufacturing_Month_Year, GPS_IMEI_Number, Usage_Type_ID
- **Unique Fields**: VIN_Chassis_Number, GPS_IMEI_Number, Registration_Number (if provided)

### Sheet 2: Specifications
- **Required Fields**: Vehicle_Ref_ID, Engine_Type_ID, Engine_Number, Fuel_Type_ID, Transmission_Type, Financer, Suspension_Type
- **Links To**: Basic Information (via Vehicle_Ref_ID)

### Sheet 3: Capacity Details
- **Required Fields**: Vehicle_Ref_ID
- **Numeric Fields**: All weights, dimensions, capacities (must be >= 0)
- **Links To**: Basic Information (via Vehicle_Ref_ID)

### Sheet 4: Ownership Details
- **Required Fields**: Vehicle_Ref_ID
- **Date Logic**: Valid_To > Valid_From, Registration_Upto > Registration_Date
- **Links To**: Basic Information (via Vehicle_Ref_ID)

### Sheet 5: Documents
- **Required Fields**: Vehicle_Ref_ID, Document_Type_ID, Document_Type_Name, Reference_Number
- **Multiple Records**: Each vehicle can have multiple documents
- **Links To**: Basic Information (via Vehicle_Ref_ID)

---

## 🧪 Testing Scenarios

### Scenario 1: Happy Path Testing
**File**: `test-vehicle-all-valid-10.xlsx`  
**Steps**:
1. Login to TMS
2. Navigate to Vehicle Maintenance
3. Click "Bulk Upload"
4. Upload `test-vehicle-all-valid-10.xlsx`
5. Watch real-time progress
6. Verify all 10 vehicles created
7. Check vehicle list for new entries

**Expected Results**:
- ✅ Progress bar reaches 100%
- ✅ "Valid: 10, Invalid: 0" displayed
- ✅ "Created: 10, Failed: 0" displayed
- ✅ Green success message
- ✅ No error report button
- ✅ All vehicles appear in list

---

### Scenario 2: Validation Error Testing
**File**: `test-vehicle-all-invalid-10.xlsx`  
**Steps**:
1. Upload `test-vehicle-all-invalid-10.xlsx`
2. Watch validation process
3. Verify no vehicles created
4. Download error report
5. Open error report in Excel
6. Verify errors highlighted

**Expected Results**:
- ✅ "Valid: 0, Invalid: 10" displayed
- ✅ "Created: 0, Failed: 0" (no creation attempted)
- ✅ Yellow warning panel
- ✅ "Download Error Report" button visible
- ✅ Error report contains highlighted cells
- ✅ Error messages clear and actionable

---

### Scenario 3: Partial Success Testing
**File**: `test-vehicle-mixed-5valid-5invalid.xlsx`  
**Steps**:
1. Upload mixed file
2. Watch processing
3. Verify partial success
4. Download error report for failed records
5. Check vehicle list for created vehicles

**Expected Results**:
- ✅ "Valid: 5, Invalid: 5" displayed
- ✅ "Created: 5, Failed: 0" displayed
- ✅ 5 vehicles appear in list
- ✅ Error report shows only 5 invalid records
- ✅ Valid vehicles successfully created despite invalid ones

---

### Scenario 4: Performance Testing
**File**: `test-vehicle-all-valid-100.xlsx`  
**Steps**:
1. Upload large file (100 vehicles)
2. Monitor processing time
3. Watch real-time updates
4. Verify no UI freezing
5. Check server CPU/memory usage
6. Verify all vehicles created

**Expected Results**:
- ✅ Processing completes within 5 minutes
- ✅ Real-time progress updates smoothly
- ✅ No browser lag or freezing
- ✅ All 100 vehicles created
- ✅ Server remains responsive

---

## 🔍 Validation Rules Tested

### Field-Level Validations
1. ✅ Required field presence
2. ✅ Data type validation (text, number, date)
3. ✅ String length validation (VIN: 17 chars, IMEI: 15 digits)
4. ✅ Numeric range validation (values >= 0)
5. ✅ Enum value validation (transmission types, suspension types, flags)
6. ✅ Date format validation (YYYY-MM-DD)

### Relational Integrity
1. ✅ Parent-child relationships (Vehicle_Ref_ID exists in Basic Info)
2. ✅ Orphan record detection
3. ✅ Missing child record warnings

### Business Rules
1. ✅ Master data existence (Vehicle_Type_ID, Engine_Type_ID, etc.)
2. ✅ Date logic (end dates after start dates)
3. ✅ Calculated fields (Payload = GVW - Unloading Weight)

### Uniqueness Constraints
1. ✅ VIN_Chassis_Number globally unique
2. ✅ GPS_IMEI_Number globally unique
3. ✅ Registration_Number unique (if provided)
4. ✅ Document Reference_Number unique per type per vehicle

---

## 🛠️ Generator Script

### File: `generate-vehicle-test-data.js`

**Usage**:
```bash
cd test-data
node generate-vehicle-test-data.js
```

**Functions**:
- `generateAllValidVehicles(count)` - Create all valid data
- `generateAllInvalidVehicles(count)` - Create all invalid data
- `generateMixedVehicles(validCount, invalidCount)` - Create mixed data
- `generateLargeDataset(count)` - Create large datasets (500+)

**Customization**:
```javascript
// Generate custom dataset
const { generateMixedVehicles } = require('./generate-vehicle-test-data');
await generateMixedVehicles(20, 5); // 20 valid + 5 invalid
```

---

## 📝 Sample Data

### Valid Vehicle Example (VR001)

**Basic Information**:
- Make: Tata
- Model: LPT 1918
- VIN: TEST0000000000001
- GPS IMEI: 351000000000001
- Vehicle Type: VT001
- Registration: MH12AB1001

**Specifications**:
- Engine Type: ET001
- Engine Number: ENG100001
- Fuel Type: FT001
- Transmission: MANUAL
- Financer: HDFC Bank

**Capacity**:
- GVW: 18,000 kg
- Unloading Weight: 7,500 kg
- Payload: 10,500 kg
- Cargo: 7.5m x 2.4m x 2.8m

**Ownership**:
- Owner: Tata Fleet Pvt Ltd
- Registration Date: 2023-01-15
- Valid Until: 2038-01-15
- State: MH
- RTO: MH12

**Documents**:
1. Registration Certificate (RC100001)
2. Insurance (INS100001)

---

## 🚫 Common Issues

### Issue 1: Duplicate VIN/IMEI
**Problem**: Error "VIN already exists in database"  
**Solution**: Use the generator to create fresh data with unique values

### Issue 2: Invalid Master Data IDs
**Problem**: Error "Vehicle type not found"  
**Solution**: Verify master data exists in database (VT001, ET001, etc.)

### Issue 3: File Size Too Large
**Problem**: File > 10MB rejected  
**Solution**: Use smaller batches (50-100 vehicles max per file)

### Issue 4: Date Format Issues
**Problem**: Invalid date errors  
**Solution**: Ensure dates in YYYY-MM-DD format

---

## 📊 Testing Checklist

### Pre-Testing
- [ ] Backend server running (port 5000)
- [ ] Frontend dev server running (port 5173)
- [ ] Redis/Memurai running (for Bull Queue)
- [ ] Database connected
- [ ] Logged in with Product Owner role

### Basic Tests
- [ ] Upload `test-vehicle-all-valid-10.xlsx`
- [ ] Verify all 10 vehicles created
- [ ] Upload `test-vehicle-all-invalid-10.xlsx`
- [ ] Verify 0 vehicles created, 10 errors
- [ ] Download and verify error report

### Mixed Data Tests
- [ ] Upload `test-vehicle-mixed-5valid-5invalid.xlsx`
- [ ] Verify 5 created, 5 failed
- [ ] Upload `test-vehicle-mixed-15valid-5invalid.xlsx`
- [ ] Verify 15 created, 5 failed

### Performance Tests
- [ ] Upload `test-vehicle-all-valid-50.xlsx`
- [ ] Monitor processing time (< 2 minutes)
- [ ] Upload `test-vehicle-all-valid-100.xlsx`
- [ ] Monitor processing time (< 5 minutes)
- [ ] Verify no UI freezing
- [ ] Check server resource usage

### Error Handling Tests
- [ ] Upload invalid file type (.csv, .pdf)
- [ ] Upload file > 10MB
- [ ] Test with backend offline
- [ ] Test with network timeout
- [ ] Verify error messages clear

### UI/UX Tests
- [ ] Real-time progress updates smoothly
- [ ] Live log entries appear correctly
- [ ] Validation results display properly
- [ ] Error report downloads correctly
- [ ] Upload history shows all batches
- [ ] Pagination works in history

---

## 📈 Success Criteria

### Functionality
- ✅ Template downloads correctly
- ✅ File upload validates type and size
- ✅ All valid data creates vehicles
- ✅ All invalid data shows errors
- ✅ Mixed data processes correctly
- ✅ Error reports accurate and helpful

### Performance
- ✅ 10 vehicles: < 30 seconds
- ✅ 50 vehicles: < 2 minutes
- ✅ 100 vehicles: < 5 minutes
- ✅ No UI freezing during processing
- ✅ Real-time updates smooth

### User Experience
- ✅ Clear instructions in modal
- ✅ Drag-drop works intuitively
- ✅ Progress bar accurate
- ✅ Live logs helpful
- ✅ Error messages actionable
- ✅ Success/error states clear

---

## 🔄 Regenerating Test Data

To regenerate all test files:

```bash
cd test-data
node generate-vehicle-test-data.js
```

To create custom test files:

```javascript
// Edit generate-vehicle-test-data.js
// Uncomment this line at the bottom:
// await generateLargeDataset(500); // For 500 vehicles

// Or create custom scenarios:
await generateMixedVehicles(25, 10); // 25 valid + 10 invalid
await generateAllValidVehicles(200); // 200 valid vehicles
```

---

## 📞 Support

If test files are not working as expected:

1. **Check database master data** - Ensure VT001, ET001, FT001, UT001, DN001, DN009 exist
2. **Verify uniqueness** - Clear test vehicles from DB before re-testing
3. **Check backend logs** - Look for validation errors in server console
4. **Review error report** - Download and examine highlighted errors

---

## 📚 Related Documentation

- **Implementation Guide**: `/docs/VEHICLE_BULK_UPLOAD_PHASE_4_COMPLETE.md`
- **Testing Plan**: `/docs/VEHICLE_BULK_UPLOAD_PHASE_5_TESTING.md`
- **Guidelines**: `/.github/instructions/vehicle-bulk-upload-guidelines.md`
- **Generator Script**: `/test-data/generate-vehicle-test-data.js`

---

**Generated with**: Node.js + ExcelJS  
**Maintained by**: TMS Development Team  
**Last Updated**: November 11, 2025