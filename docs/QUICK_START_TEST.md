#  Quick Start Testing Guide - Bulk Upload

##  System Status

- ** Memurai Redis**: RUNNING (Port 6379)
- ** Backend Server**: RUNNING (Port 5000)
- ** Frontend Server**: RUNNING (Port 5173)

---

##  READY TO TEST!

### Step 1: Open the Application

1. Open your browser and go to: http://localhost:5173/
2. Login with your Product Owner credentials

### Step 2: Navigate to Transporter Maintenance

1. Click on 'Transporter' in the sidebar
2. Look for the 'Bulk Upload' button

### Step 3: Test with Prepared Test Files

We have two test files ready in test-data/ folder:

#### Test File 1: All Valid Records
File: test-data/test-valid-5-transporters.xlsx
Expected: 5 transporters created successfully, 0 errors

#### Test File 2: Mixed Valid/Invalid
File: test-data/test-mixed-3valid-2invalid.xlsx
Expected: 3 transporters created, 2 errors with downloadable report

### Step 4: Upload Test File

1. Click 'Bulk Upload' button
2. Drag and drop test-valid-5-transporters.xlsx OR click to browse
3. Watch the progress bar and live log
4. See results: '5 Valid Created | 0 Invalid'

### Step 5: Verify in Database

`sql
SELECT id, transporter_code, business_name, status 
FROM transporters 
ORDER BY id DESC 
LIMIT 5;
`

Expected status: pending_approval

---

##  What to Check For

 Success Indicators:
- Progress bar shows 0% to 100%
- Live log displays each transporter being processed
- Success message with correct counts
- Transporters appear in database with pending_approval status
- No console errors in browser DevTools
- No errors in backend terminal

 Error Testing (use mixed file):
- Invalid rows are caught during validation
- Error report Excel file is generated
- Valid rows still get processed

---

##  Troubleshooting

### Backend Not Connecting to Redis
Check backend terminal for: Error: connect ECONNREFUSED

Solution: Get-Service Memurai | Restart-Service

### No Progress Updates
- Check Bull queue is processing jobs
- Verify Redis connection
- Check WebSocket connection in browser DevTools

---

 BULK UPLOAD IS NOW READY FOR TESTING! 
