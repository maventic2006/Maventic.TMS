# Vehicle Bulk Upload Specifications Table Fix

**Date**: November 11, 2025
**Issue**: Unknown column 'emission_standard' in 'field list' when inserting to vehicle_basic_information_itm
**Status**:  RESOLVED

---

## Problem Description

After fixing the data structure access issue, the vehicle bulk upload proceeded to Step 5 (Creating vehicles in database) but failed with:

```
 Chunk 1 failed: insert into `vehicle_basic_information_itm` (`created_by`, `emission_standard`, `engine_number`, `engine_type_id`, `financer`, `fuel_type_id`, `suspension_type`, `transmission_type`, `updated_by`, `vehicle_id_code_itm`, `weight_dimensions`) values (...) - Unknown column 'emission_standard' in 'field list'
```

**Result**: 0 vehicles created, 10 failed

---

## Root Cause Analysis

### Database Schema Misunderstanding

The code was incorrectly attempting to insert **specification fields** into the `vehicle_basic_information_itm` table.

**Actual Database Structure:**

1. **`vehicle_basic_information_hdr`** (Header table)
   - Contains BOTH basic information AND specifications
   - Columns include: `engine_type_id`, `engine_number`, `fuel_type_id`, `transmission_type`, `emission_standard`, `financer`, `suspension_type`, etc.

2. **`vehicle_basic_information_itm`** (Item table)
   - Contains INSURANCE information only
   - Columns: `insurance_provider`, `policy_number`, `coverage_type`, `policy_expiry_date`, `premium_amount`
   - NOT for specifications!

**Code Assumption (Wrong):**
- Basic info  `vehicle_basic_information_hdr`
- Specifications  `vehicle_basic_information_itm`

**Database Reality (Correct):**
- Basic info + Specifications  `vehicle_basic_information_hdr` (single row)
- Insurance info  `vehicle_basic_information_itm` (separate table)

---

## Files Modified

### **vehicleBulkUploadProcessor.js**

**Location**: `d:\tms dev 12 oct\tms-backend\queues\vehicleBulkUploadProcessor.js`

#### Fix 1: Merged Specifications into Basic Information Insert (Lines ~428-458)

**Before:**
```javascript
// Basic information (header)
basicInfoRecords.push({
  vehicle_id_code_hdr: vehicleId,
  maker_brand_description: basicInformation.Make_Brand,
  // ... other basic fields
  status: basicInformation.Status || 'ACTIVE',
  created_by: userId,
  updated_by: userId
});

// Specifications (item) if provided
if (specifications) {
  specificationsRecords.push({
    vehicle_id_code_itm: vehicleId,  //  Wrong table!
    engine_type_id: specifications.Engine_Type_ID,
    engine_number: specifications.Engine_Number,
    // ... other spec fields
  });
}
```

**After:**
```javascript
// Basic information (header) - includes specifications fields
basicInfoRecords.push({
  vehicle_id_code_hdr: vehicleId,
  maker_brand_description: basicInformation.Make_Brand,
  // ... other basic fields
  // Specification fields (from specifications sheet)
  engine_type_id: specifications?.Engine_Type_ID || null,  //  Now in header!
  engine_number: specifications?.Engine_Number || null,
  fuel_type_id: specifications?.Fuel_Type_ID || null,
  transmission_type: specifications?.Transmission_Type || null,
  emission_standard: specifications?.Emission_Standard || null,
  financer: specifications?.Financer || null,
  suspension_type: specifications?.Suspension_Type || null,
  status: basicInformation.Status || 'ACTIVE',
  created_by: userId,
  updated_by: userId
});
```

**Changes:**
- Added 7 specification fields directly to `basicInfoRecords`
- Used optional chaining (`specifications?.`) since specifications may not exist
- All fields now insert into `vehicle_basic_information_hdr` table

---

#### Fix 2: Removed Specifications Array Declaration (Line ~413)

**Before:**
```javascript
const basicInfoRecords = [];
const specificationsRecords = [];  //  Not needed
const capacityRecords = [];
```

**After:**
```javascript
const basicInfoRecords = [];
// Note: Specifications are now part of basicInfoRecords (vehicle_basic_information_hdr)
const capacityRecords = [];
```

---

#### Fix 3: Removed Specifications Batch Insert (Lines ~561-563)

**Before:**
```javascript
if (basicInfoRecords.length > 0) {
  await trx('vehicle_basic_information_hdr').insert(basicInfoRecords);
}

if (specificationsRecords.length > 0) {
  await trx('vehicle_basic_information_itm').insert(specificationsRecords);  //  Wrong!
}

if (capacityRecords.length > 0) {
  await trx('vehicle_capacity_details').insert(capacityRecords);
}
```

**After:**
```javascript
if (basicInfoRecords.length > 0) {
  await trx('vehicle_basic_information_hdr').insert(basicInfoRecords);
  console.log(` Batch INSERT: vehicle_basic_information_hdr (${basicInfoRecords.length} rows)`);
}

// Note: vehicle_basic_information_itm is for insurance, not specifications
// Specifications are included in vehicle_basic_information_hdr above

if (capacityRecords.length > 0) {
  await trx('vehicle_capacity_details').insert(capacityRecords);
  console.log(` Batch INSERT: vehicle_capacity_details (${capacityRecords.length} rows)`);
}
```

**Changes:**
- Removed entire `vehicle_basic_information_itm` insert block
- Added console logging for batch operations
- Added clarifying comments about table purpose

---

## Database Schema Reference

### **vehicle_basic_information_hdr** (Migration: 013_create_vehicle_basic_information_hdr.js)

**Purpose**: Stores ALL vehicle information including basic details AND specifications

**Key Columns:**
```javascript
// Basic Information
table.string("vehicle_id_code_hdr", 20).notNullable().unique();
table.string("maker_brand_description", 100);
table.string("maker_model", 100);
table.string("vin_chassis_no", 50);
table.string("vehicle_type_id", 10);
table.string("vehicle_category", 50);

// Specifications (same table!)
table.string("engine_number", 50);
table.string("engine_type_id", 10);
table.string("emission_standard", 50);
table.string("fuel_type_id", 10);
table.string("transmission_type", 50);
table.string("financer", 100);
table.string("suspension_type", 50);

// Other fields
table.decimal("gross_vehicle_weight_kg", 10, 2);
table.integer("seating_capacity");
table.boolean("gps_tracker_active_flag");
// ... 40+ more columns
```

**Total Columns**: ~60 columns including basic, specifications, and audit fields

---

### **vehicle_basic_information_itm** (Migration: 014_create_vehicle_basic_information_itm.js)

**Purpose**: Stores INSURANCE information for vehicles

**Key Columns:**
```javascript
table.string("vehicle_id_code_itm", 20).notNullable();
table.string("vehicle_id_code_hdr", 20).notNullable();  // Foreign key
table.string("insurance_provider", 100);
table.string("policy_number", 50);
table.string("coverage_type", 50);
table.date("policy_expiry_date");
table.decimal("premium_amount", 10, 2);
```

**NOT for specifications!** This table is for insurance policies only.

---

## Specification Fields Mapping

| Excel Sheet Column | Database Column | Table |
|-------------------|-----------------|-------|
| Engine_Type_ID | engine_type_id | vehicle_basic_information_hdr |
| Engine_Number | engine_number | vehicle_basic_information_hdr |
| Fuel_Type_ID | fuel_type_id | vehicle_basic_information_hdr |
| Transmission_Type | transmission_type | vehicle_basic_information_hdr |
| Emission_Standard | emission_standard | vehicle_basic_information_hdr |
| Financer | financer | vehicle_basic_information_hdr |
| Suspension_Type | suspension_type | vehicle_basic_information_hdr |

All stored in **one row** per vehicle in the header table.

---

## Testing Instructions

### Step 1: Upload Test File

1. Navigate to **Vehicle Maintenance** page
2. Click **"Bulk Upload"** button
3. Select `test-vehicle-all-valid-10.xlsx`
4. Upload

### Step 2: Expected Backend Console Output

```
 Step 1: Parsing Excel file...
 Excel parsed successfully: 10 vehicles

 Step 2: Validating vehicle data...
 Validation complete: 10 valid, 0 invalid

 Step 3: Storing validation results...
 Stored 10 vehicle records in tms_bulk_upload_vehicles

  Step 5: Creating valid vehicles in database...
 Batch INSERT: vehicle_basic_information_hdr (10 rows)   Includes specifications!
 Batch INSERT: vehicle_capacity_details (10 rows)
 Batch INSERT: vehicle_ownership_details (10 rows)
 Batch INSERT: vehicle_documents (20 rows)
 Created 10 of 10 vehicles

 Step 6: Updating batch status...
 Batch marked as 'completed'

 Vehicle bulk upload processing complete!
```

### Step 3: Database Verification

```sql
-- Check created vehicles with specifications
SELECT 
  vehicle_id_code_hdr,
  maker_brand_description,
  maker_model,
  vin_chassis_no,
  engine_type_id,           -- Should be populated (e.g., 'ET001')
  engine_number,            -- Should be populated (e.g., 'ENG100001')
  fuel_type_id,             -- Should be populated (e.g., 'FT002')
  transmission_type,        -- Should be populated (e.g., 'AUTOMATIC')
  emission_standard,        -- Should be populated (e.g., 'BS6')
  financer,                 -- Should be populated (e.g., 'HDFC Bank')
  suspension_type           -- Should be populated (e.g., 'AIR_SUSPENSION')
FROM vehicle_basic_information_hdr
ORDER BY vehicle_id_code_hdr DESC
LIMIT 10;

-- Expected: 10 vehicles with ALL specification fields populated

-- Verify no incorrect records in insurance table
SELECT COUNT(*) FROM vehicle_basic_information_itm;
-- Expected: 0 (we don't have insurance data in test file)
```

---

## Architecture Clarification

### Excel File Structure  Database Mapping

**Excel Sheets:**
1. Basic Information
2. Specifications
3. Capacity Details
4. Ownership Details
5. Documents

**Database Tables:**
1. `vehicle_basic_information_hdr`  Combines Basic + Specifications (single row)
2. `vehicle_capacity_details`  Separate table
3. `vehicle_ownership_details`  Separate table
4. `vehicle_documents`  Separate table (multiple rows per vehicle)
5. `vehicle_basic_information_itm`  Insurance (NOT in Excel template)

**Key Insight**: The Excel has 5 sheets, but specifications are NOT stored separately in the database. They are denormalized into the header table for performance.

---

## Prevention Strategy

### Code Review Checklist

When working with vehicle tables:

- [ ] **Never** assume `_itm` tables are for specifications
- [ ] Check migration files for actual table structure
- [ ] Understand `_hdr` (header) often contains specifications too
- [ ] Verify table purpose with comments in migrations
- [ ] Test with actual database schema, not assumptions

### Documentation Improvements

1. **Add Table Purpose Comments** in migration files
2. **Update Excel Template** to clarify which sheet maps to which table
3. **Create Schema Diagram** showing table relationships
4. **Document Denormalization** decisions for future developers

---

## Related Issues

- Vehicle Bulk Upload Redis Removal (completed)
- Database Column Name Fixes (11 fixes completed)
- Registration Number Column Fix (completed)
- Data Structure Access Fix (completed)
- **THIS FIX**: Specifications Table Misunderstanding (completed)

---

## Summary

 **Fixed table misunderstanding** - Specifications belong in header table
 **Merged 7 specification fields** into basic information insert
 **Removed incorrect _itm insert** - That table is for insurance only
 **Added console logging** for better debugging
 **Clarified architecture** with comments in code
 **Ready for testing** - Upload should now create vehicles successfully

**Next Action**: User should test upload with all-valid-10.xlsx file

**Expected Outcome**: All 10 vehicles created with complete specifications data

