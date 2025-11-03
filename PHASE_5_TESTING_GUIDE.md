# Phase 5: Testing & Optimization Guide

> **Comprehensive Testing Guide for TMS Bulk Upload Functionality**

This document provides step-by-step instructions for testing the complete bulk upload pipeline, from Redis setup to end-to-end validation.

---

## 📋 **TESTING CHECKLIST**

```markdown
## Phase 5: Testing & Optimization

- [ ] Install and start Redis server
- [ ] Verify Redis connection from backend
- [ ] Test backend server startup with Redis
- [ ] Upload test file: 5 valid transporters
- [ ] Verify WebSocket real-time progress updates
- [ ] Verify transporters created in database
- [ ] Check all 6 tables populated correctly
- [ ] Verify status set to "pending_approval"
- [ ] Test error report generation (mixed valid/invalid)
- [ ] Download and verify error report content
- [ ] Test upload history display
- [ ] Verify batch tracking information
- [ ] Test template download functionality
- [ ] Performance test with 50+ records
- [ ] Verify transaction rollback on database errors
- [ ] Check memory usage during large uploads
- [ ] Verify concurrent upload handling
- [ ] Test approval workflow integration
```

---

## 🚀 **STEP 1: REDIS INSTALLATION (CRITICAL)**

Redis is **required** for the Bull job queue to process bulk uploads. Without Redis, uploads will fail.

### **Option A: Install Redis for Windows (Recommended for Development)**

#### **Using Memurai (Redis-Compatible for Windows)**

1. **Download Memurai** (free Redis-compatible server for Windows):
   - Visit: https://www.memurai.com/
   - Download Memurai Developer (free version)
   - Install using the installer

2. **Start Memurai Service**:
   ```powershell
   # Memurai runs as a Windows service automatically
   # Check if running:
   Get-Service Memurai
   
   # Start if stopped:
   Start-Service Memurai
   ```

3. **Verify Installation**:
   ```powershell
   # Memurai includes redis-cli.exe
   & "C:\Program Files\Memurai\redis-cli.exe" ping
   # Should return: PONG
   ```

#### **Using Redis via WSL2 (Windows Subsystem for Linux)**

1. **Install WSL2** (if not already installed):
   ```powershell
   wsl --install
   ```

2. **Install Redis in WSL2**:
   ```bash
   sudo apt update
   sudo apt install redis-server
   sudo service redis-server start
   ```

3. **Verify Installation**:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

### **Option B: Docker Desktop (If Available)**

1. **Install Docker Desktop**:
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and start Docker Desktop

2. **Run Redis Container**:
   ```powershell
   docker run -d --name redis-tms -p 6379:6379 redis:alpine
   ```

3. **Verify Redis Running**:
   ```powershell
   docker exec -it redis-tms redis-cli ping
   # Should return: PONG
   ```

### **Option C: Redis Stack Cloud (Free Tier)**

1. **Sign up for Redis Cloud**:
   - Visit: https://redis.com/try-free/
   - Create free account (no credit card required)
   - Create a new database

2. **Get Connection Details**:
   - Copy the endpoint (e.g., `redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com:12345`)
   - Copy the password

3. **Update Backend `.env` File**:
   ```env
   REDIS_HOST=redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com
   REDIS_PORT=12345
   REDIS_PASSWORD=your_password_here
   ```

---

## 🔧 **STEP 2: VERIFY REDIS CONNECTION**

Once Redis is installed and running, verify the backend can connect:

### **Test Redis Connection**

1. **Check Backend `.env` Configuration**:
   ```env
   # For local Redis (default)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   
   # For Redis Cloud
   REDIS_HOST=your-redis-cloud-endpoint
   REDIS_PORT=your-redis-port
   REDIS_PASSWORD=your-redis-password
   ```

2. **Test Connection from Node.js**:
   ```powershell
   cd "d:\tms dev 12 oct\tms-backend"
   
   node -e "const redis = require('redis'); const client = redis.createClient({host: 'localhost', port: 6379}); client.on('error', err => console.error('Redis Error:', err)); client.connect().then(() => { console.log('✅ Redis connected successfully!'); client.disconnect(); }).catch(err => console.error('❌ Redis connection failed:', err));"
   ```

3. **Expected Output**:
   ```
   ✅ Redis connected successfully!
   ```

### **Troubleshooting Redis Connection Issues**

**Error: "ECONNREFUSED"**
- Redis is not running
- Check service: `Get-Service Memurai` or `sudo service redis-server status`
- Start service if stopped

**Error: "NOAUTH Authentication required"**
- Redis requires password
- Add `REDIS_PASSWORD` to `.env` file

**Error: "WRONGPASS invalid username-password pair"**
- Incorrect password in `.env` file
- Verify password with Redis provider

---

## 🧪 **STEP 3: END-TO-END TESTING**

### **Test 1: Upload Valid Transporters**

#### **Test File**: `test-valid-5-transporters.xlsx`

This file contains 5 completely valid transporters with:
- All required fields populated
- Valid data formats
- Multiple addresses and contacts per transporter
- Serviceable areas and documents

#### **Test Procedure**:

1. **Start Backend** (if not running):
   ```powershell
   cd "d:\tms dev 12 oct\tms-backend"
   node server.js
   ```
   
   ✅ **Expected Output**:
   ```
   🚀 TMS Backend server running on port 5000
   📡 Socket.IO server running
   ```

2. **Start Frontend** (if not running):
   ```powershell
   cd "d:\tms dev 12 oct\frontend"
   npm run dev
   ```
   
   ✅ **Expected Output**:
   ```
   VITE v... ready in ...ms
   ➜  Local:   http://localhost:5174/
   ```

3. **Open Browser**:
   - Navigate to: `http://localhost:5174`
   - Login with Product Owner credentials
   - Navigate to **Transporter Maintenance** page

4. **Upload Test File**:
   - Click **"Bulk Upload"** button
   - Select file: `test-data/test-valid-5-transporters.xlsx`
   - Observe real-time progress updates
   
   ✅ **Expected Behavior**:
   ```
   - Progress bar moves from 0% to 100%
   - Live log shows:
     ✅ Parsing Excel file...
     ✅ Validating data...
     ✅ Creating transporters...
     ✅ TEST001 - Test Transport Company 1 created
     ✅ TEST002 - Test Transport Company 2 created
     ✅ TEST003 - Test Transport Company 3 created
     ✅ TEST004 - Test Transport Company 4 created
     ✅ TEST005 - Test Transport Company 5 created
   - Results: 5 Valid Created | 0 Invalid
   ```

5. **Verify Database Records**:
   ```sql
   -- Check bulk upload batch
   SELECT * FROM tms_bulk_upload_batches ORDER BY id DESC LIMIT 1;
   -- Expected: status = 'completed', total_valid = 5, total_invalid = 0, total_created = 5
   
   -- Check transporter records
   SELECT * FROM tms_bulk_upload_transporters WHERE batch_id = 'BATCH-xxx';
   -- Expected: 5 rows with validation_status = 'valid'
   
   -- Check transporters created
   SELECT * FROM transporter_general_info WHERE business_name LIKE 'Test Transport Company%';
   -- Expected: 5 rows with status = 'pending_approval'
   
   -- Check addresses created
   SELECT COUNT(*) FROM transporter_address WHERE transporter_id IN (
     SELECT id FROM transporter_general_info WHERE business_name LIKE 'Test Transport Company%'
   );
   -- Expected: 7 addresses (5 head offices + 2 branches for even-numbered transporters)
   
   -- Check contacts created
   SELECT COUNT(*) FROM transporter_contact;
   -- Expected: 7 contacts
   
   -- Check serviceable areas
   SELECT COUNT(*) FROM transporter_serviceable_area;
   -- Expected: 5 serviceable areas
   
   -- Check documents
   SELECT COUNT(*) FROM transporter_document;
   -- Expected: 10 documents (2 per transporter: PAN + GST)
   ```

---

### **Test 2: Upload Mixed Valid/Invalid Data**

#### **Test File**: `test-mixed-3valid-2invalid.xlsx`

This file contains:
- 3 valid transporters (TEST001, TEST002, TEST003)
- 2 invalid transporters (TEST004, TEST005) with intentional errors:
  - TEST004: Empty business name, invalid email/phone format, no transport mode
  - TEST005: Missing contact, missing serviceable area, missing documents

#### **Test Procedure**:

1. **Upload Test File**:
   - Click **"Bulk Upload"** button
   - Select file: `test-data/test-mixed-3valid-2invalid.xlsx`
   
   ✅ **Expected Behavior**:
   ```
   - Progress bar completes
   - Live log shows:
     ✅ Parsing Excel file...
     ✅ Validating data...
     ✅ TEST001 - Valid Transport 1 created
     ✅ TEST002 - Valid Transport 2 created
     ✅ TEST003 - Valid Transport 3 created
     ❌ TEST004 - Validation failed (2 errors)
     ❌ TEST005 - Validation failed (3 errors)
   - Results: 3 Valid Created | 2 Invalid
   - "Download Error Report" button appears
   ```

2. **Download Error Report**:
   - Click **"Download Error Report"** button
   - Open downloaded Excel file
   
   ✅ **Expected Content**:
   ```
   Sheet 1: Error Summary
   - Total Records: 5
   - Valid Records: 3
   - Invalid Records: 2
   
   Sheet 2: General Details Errors
   - TEST004 row highlighted with errors:
     • Business_Name: Required field is empty
     • Transport modes: At least one transport mode must be selected
   
   Sheet 3: Contact Errors
   - TEST004 row highlighted:
     • Email_ID: Invalid email format
     • Phone_Number: Invalid phone format
   
   Sheet 4: Missing Records
   - TEST005: Missing contact record
   - TEST005: Missing serviceable area
   - TEST005: Missing document records
   ```

3. **Verify Database Records**:
   ```sql
   -- Check batch
   SELECT * FROM tms_bulk_upload_batches ORDER BY id DESC LIMIT 1;
   -- Expected: total_valid = 3, total_invalid = 2, total_created = 3
   
   -- Check individual records
   SELECT * FROM tms_bulk_upload_transporters WHERE batch_id = 'BATCH-xxx';
   -- Expected: 5 rows - 3 with validation_status = 'valid', 2 with 'invalid'
   
   -- Check validation errors stored
   SELECT excel_row_number, validation_errors FROM tms_bulk_upload_transporters 
   WHERE batch_id = 'BATCH-xxx' AND validation_status = 'invalid';
   -- Expected: JSON with detailed error messages
   
   -- Check only 3 transporters created
   SELECT COUNT(*) FROM transporter_general_info WHERE business_name LIKE 'Valid Transport%';
   -- Expected: 3
   ```

---

### **Test 3: Upload History**

1. **View Upload History**:
   - In Bulk Upload modal, click **"Upload History"** button
   
   ✅ **Expected Display**:
   ```
   | Batch ID | Upload Time | Uploaded By | Filename | Total | Valid | Invalid | Status |
   |----------|-------------|-------------|----------|-------|-------|---------|--------|
   | BATCH-002| 2025-10-30  | John Doe    | test-mix | 5     | 3     | 2       | Complete|
   | BATCH-001| 2025-10-30  | John Doe    | test-val | 5     | 5     | 0       | Complete|
   ```

2. **Download Previous Error Reports**:
   - Click error report icon for BATCH-002
   - Verify file downloads correctly

---

### **Test 4: Template Download**

1. **Download Template**:
   - In Bulk Upload modal, click **"Download Template"** button
   
   ✅ **Expected Result**:
   - File downloads: `transporter-bulk-upload-template.xlsx`
   - File contains 5 sheets with correct headers
   - No data rows (only headers)

2. **Verify Template Structure**:
   - Open downloaded file
   - Check all 5 sheets present:
     • General Details
     • Addresses
     • Contacts
     • Serviceable Areas
     • Documents
   - Verify all columns match specification

---

## 📊 **STEP 4: PERFORMANCE TESTING**

### **Test 5: Large Batch Upload (50+ Records)**

#### **Generate Large Test File**:

1. **Modify Test Generator**:
   ```powershell
   cd "d:\tms dev 12 oct\tms-backend"
   ```

2. **Create `generate-large-test.js`**:
   ```javascript
   // Modify the generate-test-excel.js to accept count parameter
   // Change loop from 1-5 to 1-50
   ```

3. **Generate 50-transporter file**:
   ```powershell
   node generate-large-test.js
   ```

#### **Test Procedure**:

1. **Monitor Backend Logs**:
   - Watch for processing progress messages
   - Check for any memory warnings

2. **Upload 50-transporter File**:
   - Time the complete process
   - Monitor progress bar updates
   - Verify no crashes or hangs

3. **Performance Metrics to Check**:
   ```
   - Total processing time: Expected < 60 seconds for 50 records
   - Memory usage: Should stay under 500MB
   - WebSocket updates: Should be smooth and real-time
   - Database connections: No pool exhaustion errors
   ```

4. **Verify Results**:
   ```sql
   -- All 50 transporters created
   SELECT COUNT(*) FROM transporter_general_info WHERE created_at > NOW() - INTERVAL 5 MINUTE;
   -- Expected: 50
   
   -- All related records created
   SELECT 
     (SELECT COUNT(*) FROM transporter_address) as addresses,
     (SELECT COUNT(*) FROM transporter_contact) as contacts,
     (SELECT COUNT(*) FROM transporter_serviceable_area) as areas,
     (SELECT COUNT(*) FROM transporter_document) as documents;
   ```

---

## 🔍 **STEP 5: ERROR HANDLING TESTS**

### **Test 6: Transaction Rollback**

#### **Test Database Error Handling**:

1. **Temporarily Break Database**:
   ```sql
   -- Rename a table to simulate error
   RENAME TABLE transporter_address TO transporter_address_backup;
   ```

2. **Upload Test File**:
   - Upload `test-valid-5-transporters.xlsx`
   
   ✅ **Expected Behavior**:
   ```
   - Processing starts
   - Error occurs during address creation
   - Transaction rolls back
   - No partial records in database
   - Error message displayed to user
   - Batch status set to 'failed'
   ```

3. **Verify Rollback**:
   ```sql
   -- No orphaned general_info records
   SELECT * FROM transporter_general_info WHERE created_at > NOW() - INTERVAL 5 MINUTE;
   -- Expected: 0 rows (all rolled back)
   ```

4. **Restore Database**:
   ```sql
   RENAME TABLE transporter_address_backup TO transporter_address;
   ```

---

### **Test 7: Concurrent Uploads**

1. **Open Multiple Browser Tabs**:
   - Tab 1: Upload file A
   - Tab 2: Upload file B (start 5 seconds after Tab 1)

2. **Verify Both Process Correctly**:
   - Both show independent progress bars
   - WebSocket updates don't interfere
   - Both complete successfully
   - Correct batch records created

---

## 🎯 **STEP 6: APPROVAL WORKFLOW TESTING**

### **Test 8: Approval Flow Integration**

1. **Verify Initial Status**:
   ```sql
   SELECT id, business_name, status FROM transporter_general_info 
   WHERE business_name LIKE 'Test Transport%';
   -- Expected: All have status = 'pending_approval'
   ```

2. **Test Cross-Product Owner Approval**:
   - Login as different Product Owner
   - Navigate to Approval page (if exists)
   - Verify batch information displayed
   - Approve one transporter
   
   ✅ **Expected**:
   ```sql
   -- Status changes to 'approved'
   SELECT status FROM transporter_general_info WHERE id = ?;
   -- Expected: 'approved'
   ```

3. **Verify Batch Tracking Maintained**:
   ```sql
   SELECT batch_id FROM tms_bulk_upload_transporters WHERE created_transporter_id = ?;
   -- Expected: Original batch_id still present
   ```

---

## 🐛 **COMMON ISSUES & TROUBLESHOOTING**

### **Issue 1: Redis Connection Failed**

**Symptoms**:
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution**:
1. Check if Redis is running:
   ```powershell
   Get-Service Memurai
   # or
   sudo service redis-server status
   ```

2. Start Redis:
   ```powershell
   Start-Service Memurai
   # or
   sudo service redis-server start
   ```

3. Verify connection:
   ```powershell
   redis-cli ping
   ```

---

### **Issue 2: Upload Hangs at "Processing"**

**Symptoms**:
- Progress bar stuck
- No updates in live log
- Backend shows no errors

**Solution**:
1. Check Bull queue status:
   ```powershell
   cd "d:\tms dev 12 oct\tms-backend"
   node -e "const Queue = require('bull'); const queue = new Queue('bulk-upload'); queue.getJobCounts().then(counts => console.log(counts));"
   ```

2. Check for failed jobs:
   ```javascript
   // In backend console
   const failed = await bulkUploadQueue.getFailed();
   console.log(failed);
   ```

3. Restart backend server

---

### **Issue 3: WebSocket Not Connecting**

**Symptoms**:
- No real-time updates
- Progress bar doesn't move
- Console errors: "Socket.IO connection failed"

**Solution**:
1. Check browser console for errors
2. Verify Socket.IO server running (backend logs should show "📡 Socket.IO server running")
3. Check CORS configuration in backend
4. Verify frontend Socket.IO client URL matches backend port

---

### **Issue 4: Validation Errors Not Showing**

**Symptoms**:
- All records show as valid
- No error report generated
- Known invalid data passes validation

**Solution**:
1. Check validation service logs
2. Verify all 42 validation rules are active
3. Check master data tables populated (countries, states, cities)
4. Review validation service code for logic errors

---

## ✅ **TESTING COMPLETION CRITERIA**

Mark each as complete before moving to production:

- [ ] Redis installed and running successfully
- [ ] Backend connects to Redis without errors
- [ ] Template download works correctly
- [ ] Valid file upload creates all transporters
- [ ] All 6 tables populated correctly per transporter
- [ ] Invalid records generate error report
- [ ] Error report highlights errors correctly
- [ ] WebSocket updates work in real-time
- [ ] Upload history displays correctly
- [ ] Large batch (50+) processes without errors
- [ ] Transaction rollback works on database errors
- [ ] Concurrent uploads don't interfere
- [ ] Approval workflow integration works
- [ ] Status correctly set to "pending_approval"
- [ ] No memory leaks during large uploads
- [ ] All error scenarios handled gracefully

---

## 📈 **PERFORMANCE BENCHMARKS**

Document your test results:

| Test Scenario | Record Count | Processing Time | Memory Usage | Status |
|---------------|--------------|-----------------|--------------|--------|
| Valid upload | 5 | ____ sec | ____ MB | ☐ |
| Mixed upload | 5 (3 valid) | ____ sec | ____ MB | ☐ |
| Large batch | 50 | ____ sec | ____ MB | ☐ |
| Large batch | 100 | ____ sec | ____ MB | ☐ |
| Large batch | 500 | ____ sec | ____ MB | ☐ |

---

## 🚀 **NEXT STEPS AFTER TESTING**

Once all tests pass:

1. **Production Deployment Prep**:
   - [ ] Configure production Redis instance
   - [ ] Set up Redis clustering for high availability
   - [ ] Configure backup for bulk upload files
   - [ ] Set up monitoring and alerting

2. **Documentation**:
   - [ ] Update user manual with bulk upload instructions
   - [ ] Create video tutorial for users
   - [ ] Document common errors and solutions
   - [ ] Create admin guide for troubleshooting

3. **Optimization**:
   - [ ] Fine-tune batch sizes based on performance tests
   - [ ] Optimize database queries if needed
   - [ ] Add caching for master data lookups
   - [ ] Implement file compression for error reports

4. **Security Audit**:
   - [ ] Review file upload security
   - [ ] Test for SQL injection vulnerabilities
   - [ ] Verify authentication and authorization
   - [ ] Test for XSS in error messages

---

**🎉 CONGRATULATIONS!**

If all tests pass, your bulk upload functionality is ready for production deployment!
