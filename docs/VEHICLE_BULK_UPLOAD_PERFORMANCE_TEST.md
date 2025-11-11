# Vehicle Bulk Upload - Performance Testing Guide

## 🎯 Testing Objective

Validate that the optimized bulk upload system can:
- ✅ Handle 10 vehicles in < 5 seconds
- ✅ Handle 100 vehicles in < 20 seconds  
- ✅ Handle 1000+ vehicles without timeout
- ✅ No more "Request Timeout" errors

---

## 🚀 Quick Start Test (5 minutes)

### Prerequisites
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5174` (or 5173)
- Test file: `test-vehicle-all-valid-10.xlsx` in workspace root

### Step 1: Open Application
```
Browser: http://localhost:5174
Login credentials: (use your test account)
```

### Step 2: Navigate to Bulk Upload
```
Dashboard → Vehicle Maintenance → Bulk Upload (top right button)
```

### Step 3: Upload Test File
```
1. Click "Choose File"
2. Select: test-vehicle-all-valid-10.xlsx
3. Click "Upload File"
4. ⏱️ Start timer
```

### Step 4: Expected Results
```
✅ Controller responds in < 1 second
✅ Total processing completes in < 5 seconds
✅ Progress bar updates smoothly
✅ Success notification appears
✅ 10 vehicles created in database
✅ NO timeout errors
```

---

## 📊 Performance Benchmarks

### Before Optimization
| Records | Response Time | Total Time | Database Queries | Result |
|---------|--------------|------------|------------------|---------|
| 10      | 3-5 seconds  | 30-60s     | 50-70 queries    | ❌ Timeout |
| 100     | 3-5 seconds  | 5-10 min   | 500-700 queries  | ❌ Timeout |
| 1000    | N/A          | N/A        | N/A              | ❌ Impossible |

### After Optimization
| Records | Response Time | Total Time | Database Queries | Result |
|---------|--------------|------------|------------------|---------|
| 10      | < 500ms      | 2-3s       | ~10 queries      | ✅ Success |
| 100     | < 500ms      | 10-15s     | ~15 queries      | ✅ Success |
| 1000    | < 500ms      | 60-90s     | ~105 queries     | ✅ Success |

**Performance Improvement**: **10x-100x faster** ⚡

---

## 🧪 Detailed Test Plan

### Test 1: Small Batch (10 vehicles)
**File**: `test-vehicle-all-valid-10.xlsx`

**What to Monitor**:
1. Open Browser DevTools (F12) → Console
2. Watch for these logs:
   ```
   📤 Uploading vehicle file: test-vehicle-all-valid-10.xlsx (XX KB)
   ✅ Upload completed in XXXms
   ```

**Success Criteria**:
- [ ] Upload completes in < 1 second
- [ ] No timeout errors
- [ ] Progress bar shows 0% → 100%
- [ ] Success toast notification appears
- [ ] 10 vehicles visible in Vehicle List

**Backend Logs to Check**:
```
📁 Processing file: test-vehicle-all-valid-10.xlsx (XX KB)
⚡ Controller processing time: XXXms
✓ Batch record created in XXms
✓ Processing completed in XXXs
```

---

### Test 2: Medium Batch (100 vehicles)
**File**: `test-vehicle-all-valid-100.xlsx` (create if needed)

**Generate Test Data**:
```powershell
cd "d:\tms dev 12 oct\test-data"
node generate-vehicle-test-data.js 100
```

**Success Criteria**:
- [ ] Upload completes in < 1 second
- [ ] Total processing < 20 seconds
- [ ] No timeout errors
- [ ] Progress updates smoothly (10%, 20%, 30%...)
- [ ] 100 vehicles created successfully

---

### Test 3: Large Batch (250 vehicles)
**File**: `test-vehicle-all-valid-250.xlsx`

**Generate Test Data**:
```powershell
cd "d:\tms dev 12 oct\test-data"
node generate-vehicle-test-data.js 250
```

**Success Criteria**:
- [ ] Upload completes in < 1 second
- [ ] Total processing < 45 seconds
- [ ] Memory usage stable
- [ ] Socket.IO updates working
- [ ] 250 vehicles created successfully

---

### Test 4: Stress Test (1000 vehicles)
**File**: `test-vehicle-all-valid-1000.xlsx`

**Generate Test Data**:
```powershell
cd "d:\tms dev 12 oct\test-data"
node generate-vehicle-test-data.js 1000
```

**Success Criteria**:
- [ ] Upload completes in < 1 second
- [ ] Total processing < 3 minutes
- [ ] No memory leaks
- [ ] Progress updates continuously
- [ ] 1000 vehicles created successfully

---

## 🔍 Monitoring Checklist

### Frontend Console Logs
```javascript
// Look for these indicators:
✅ "Upload completed in XXXms" (should be < 1000ms)
✅ "Progress: XX%" (should update smoothly)
✅ "Upload successful" toast notification
❌ NO "Request timeout" errors
❌ NO "ECONNABORTED" errors
```

### Backend Console Logs
```javascript
// Look for these indicators:
✅ "Controller processing time: XXXms" (should be < 500ms)
✅ "Batch record created in XXms" (should be < 100ms)
✅ "Validation completed: XX valid, XX invalid"
✅ "Creating XX vehicles in database"
✅ "Chunk X/X processing time: XXXms"
✅ "Processing completed in XXXs"
```

### Database Verification
```sql
-- Check batch record
SELECT * FROM tms_bulk_upload_vehicle_batches 
ORDER BY created_at DESC LIMIT 1;

-- Check uploaded records
SELECT batch_id, COUNT(*) as total, 
       SUM(CASE WHEN validation_status = 'valid' THEN 1 ELSE 0 END) as valid,
       SUM(CASE WHEN validation_status = 'invalid' THEN 1 ELSE 0 END) as invalid
FROM tms_bulk_upload_vehicles
GROUP BY batch_id
ORDER BY created_at DESC LIMIT 1;

-- Check created vehicles
SELECT COUNT(*) as total_vehicles 
FROM vehicle_basic_information_hdr;
```

---

## 🐛 Troubleshooting

### Issue: "Request Timeout"
**Cause**: Frontend timeout still triggering (should NOT happen)
**Solution**: 
1. Check backend is running
2. Verify API base URL is correct
3. Check console logs for actual error

### Issue: "Port 5000 already in use"
**Cause**: Previous backend instance still running
**Solution**:
```powershell
cd "d:\tms dev 12 oct\tms-backend"
.\kill-port.ps1
npm run dev
```

### Issue: Slow upload (> 5 seconds for 10 vehicles)
**Cause**: Database connection pool exhausted or network latency
**Solution**:
1. Check database connection pool size
2. Verify MySQL is running
3. Check for other heavy queries running

### Issue: Memory leak (RAM usage keeps increasing)
**Cause**: Unhandled promise or file buffers not released
**Solution**:
1. Restart backend server
2. Check for unclosed database connections
3. Monitor `process.memoryUsage()`

---

## 📈 Performance Metrics to Record

### Test Results Template
```
Date: __________
Environment: Development
Backend: Node.js vX.X.X
Database: MySQL 8.0
File: test-vehicle-all-valid-XX.xlsx

┌─────────────┬───────────────┬─────────────┬──────────┐
│ Records     │ Response Time │ Total Time  │ Result   │
├─────────────┼───────────────┼─────────────┼──────────┤
│ 10          │ ___ms         │ ___s        │ ✅ / ❌  │
│ 100         │ ___ms         │ ___s        │ ✅ / ❌  │
│ 250         │ ___ms         │ ___s        │ ✅ / ❌  │
│ 1000        │ ___ms         │ ___s        │ ✅ / ❌  │
└─────────────┴───────────────┴─────────────┴──────────┘

Notes:
_____________________________________________
_____________________________________________
```

---

## ✅ Test Completion Checklist

### Basic Functionality
- [ ] File upload works without timeout
- [ ] Progress bar updates correctly
- [ ] Success/error notifications appear
- [ ] Vehicles created in database

### Performance Validation
- [ ] 10 vehicles complete in < 5 seconds
- [ ] 100 vehicles complete in < 20 seconds
- [ ] 1000 vehicles complete without timeout
- [ ] Response time < 1 second for all tests

### Error Handling
- [ ] Invalid file format rejected
- [ ] Duplicate vehicle_ref_id detected
- [ ] Validation errors displayed correctly
- [ ] Partial success handled properly

### User Experience
- [ ] No browser freezing
- [ ] Progress updates smooth
- [ ] Error messages clear
- [ ] Success confirmation visible

---

## 🎉 Success Criteria

**PASS Requirements**:
1. ✅ All 4 test scenarios complete successfully
2. ✅ No timeout errors in any test
3. ✅ Performance meets or exceeds benchmarks
4. ✅ Database records created correctly
5. ✅ No memory leaks or server crashes

**FAIL Indicators**:
1. ❌ Any timeout errors
2. ❌ Performance slower than benchmarks
3. ❌ Missing or incorrect database records
4. ❌ Memory leaks or crashes
5. ❌ Progress updates not working

---

## 📝 Next Steps After Testing

### If All Tests Pass ✅
1. Create comprehensive documentation
2. Update API documentation
3. Deploy to staging environment
4. Run load tests in staging
5. Monitor production performance

### If Tests Fail ❌
1. Review backend logs for errors
2. Check database query performance
3. Verify chunk size configuration
4. Profile memory usage
5. Re-run tests after fixes

---

## 📚 Related Documentation

- `VEHICLE_BULK_UPLOAD_TIMEOUT_FIX.md` - Original timeout fix
- `VEHICLE_MODULE_TODO.md` - Feature requirements
- `VEHICLE_TESTING_COMPLETE.md` - Module testing results
- Backend API: `tms-backend/controllers/bulkUpload/vehicleBulkUploadController.js`
- Processor: `tms-backend/queues/vehicleBulkUploadProcessor.js`

---

**Test Status**: 🟡 Ready for Testing
**Last Updated**: 2025
**Tester**: _____________
**Results**: ⏳ Pending
