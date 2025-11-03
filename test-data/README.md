# Test Data for Bulk Upload Testing

This folder contains test Excel files and utilities for testing the TMS bulk upload functionality.

## 📁 Files

### Test Excel Files

1. **test-valid-5-transporters.xlsx**
   - Contains: 5 completely valid transporters
   - Purpose: Test successful bulk upload flow
   - Expected result: All 5 transporters created successfully
   - Records:
     - TEST001 - Test Transport Company 1 (Head Office + 1 contact)
     - TEST002 - Test Transport Company 2 (Head Office + Branch + 2 contacts)
     - TEST003 - Test Transport Company 3 (Head Office + 1 contact)
     - TEST004 - Test Transport Company 4 (Head Office + Branch + 2 contacts)
     - TEST005 - Test Transport Company 5 (Head Office + 1 contact)

2. **test-mixed-3valid-2invalid.xlsx**
   - Contains: 3 valid + 2 invalid transporters
   - Purpose: Test validation and error reporting
   - Expected result: 3 created, 2 failed with error report
   - Valid records: TEST001, TEST002, TEST003
   - Invalid records:
     - TEST004: Empty business name, invalid email/phone, no transport mode
     - TEST005: Missing contact, missing serviceable area, missing documents

### Test Generator Script

3. **generate-test-excel.js**
   - Purpose: Generate test Excel files programmatically
   - Usage: Run from backend directory where exceljs is installed
   - Command: `cd ../tms-backend && node ../test-data/generate-test-excel.js`

## 🧪 How to Use Test Files

### Step 1: Ensure Redis is Running
```powershell
# Check Redis status
cd ..
.\setup-redis-windows.ps1
```

### Step 2: Start Backend Server
```powershell
cd ..\tms-backend
node server.js
```

### Step 3: Start Frontend
```powershell
cd ..\frontend
npm run dev
```

### Step 4: Upload Test Files
1. Open browser: http://localhost:5174
2. Navigate to Transporter Maintenance page
3. Click "Bulk Upload" button
4. Select a test file from this folder
5. Watch the upload process

## ✅ Expected Results

### Test 1: test-valid-5-transporters.xlsx
- ✅ Progress: 0% → 100% smoothly
- ✅ Status: "5 Valid Created | 0 Invalid"
- ✅ Database: 5 new transporters with status "pending_approval"
- ✅ Related records: 7 addresses, 7 contacts, 5 serviceable areas, 10 documents

### Test 2: test-mixed-3valid-2invalid.xlsx
- ✅ Progress: 0% → 100% smoothly
- ✅ Status: "3 Valid Created | 2 Invalid"
- ✅ Error report download available
- ✅ Database: 3 new transporters created, 2 validation failures recorded
- ✅ Error report: Highlights invalid rows with specific error messages

## 🔍 Database Verification

After uploading, verify in database:

```sql
-- Check batch records
SELECT * FROM tms_bulk_upload_batches ORDER BY id DESC;

-- Check transporter records
SELECT * FROM tms_bulk_upload_transporters WHERE batch_id = 'BATCH-xxx';

-- Check created transporters
SELECT * FROM transporter_general_info 
WHERE business_name LIKE 'Test Transport%' OR business_name LIKE 'Valid Transport%';

-- Count related records
SELECT 
  (SELECT COUNT(*) FROM transporter_address) as addresses,
  (SELECT COUNT(*) FROM transporter_contact) as contacts,
  (SELECT COUNT(*) FROM transporter_serviceable_area) as areas,
  (SELECT COUNT(*) FROM transporter_document) as documents;
```

## 🔄 Regenerate Test Files

If you need to regenerate test files:

```powershell
cd ..\tms-backend
node ..\test-data\generate-test-excel.js
```

This will create fresh test Excel files with the same structure.

## 📚 More Information

- Complete testing guide: See `../PHASE_5_TESTING_GUIDE.md`
- Redis setup: See `../setup-redis-windows.ps1`
- Project overview: See `../PHASE_5_SETUP_COMPLETE.md`
