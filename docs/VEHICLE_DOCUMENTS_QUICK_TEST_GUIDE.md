# Vehicle Documents - Quick Test Guide

**Quick reference for testing vehicle document upload functionality**

---

##  Quick Start

### 1. Start Servers

```bash
# Terminal 1 - Backend
cd tms-backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Navigate to Vehicle Create Page

1. Open browser: `http://localhost:5173`
2. Login with test credentials
3. Navigate to: **Vehicles  Create New Vehicle**

### 3. Test Document Upload

1. Click on **"Documents" tab** (Tab 7)
2. Click **"Add Document"** button
3. Document upload modal opens
4. Click **Document Type dropdown**

---

##  Expected Document Types (12 total)

**Should appear in dropdown (alphabetically sorted)**:

1.  AIP
2.  Fitness Certificate
3.  Insurance Policy
4.  Leasing Agreement
5.  Permit certificate
6.  PUC certificate
7.  Tax Certificate
8.  Temp Vehicle Permit
9.  Vehicle Insurance
10.  Vehicle Registration Certificate
11.  Vehicle Service Bill
12.  Vehicle Warranty

---

##  Test Scenarios

### Test 1: Document Type Dropdown
- **Action**: Open document type dropdown
- **Expected**: All 12 document types visible
- **Status**:  Pending

### Test 2: Select Document Type
- **Action**: Click "AIP" from dropdown
- **Expected**: "AIP" selected in form
- **Status**:  Pending

### Test 3: Upload Document
- **Action**: Upload a test PDF file
- **Expected**: File name displayed, no errors
- **Status**:  Pending

### Test 4: Add Multiple Documents
- **Action**: Add 3 different document types
- **Expected**: All 3 appear in documents table
- **Status**:  Pending

### Test 5: Submit Vehicle
- **Action**: Fill all required fields + documents, submit
- **Expected**: Vehicle created with documents saved
- **Status**:  Pending

---

##  Troubleshooting

### Dropdown shows no options
- **Check**: Backend server running?
- **Check**: API endpoint working: `GET http://localhost:3000/api/vehicle/master-data`
- **Fix**: Restart backend server

### Dropdown shows old hardcoded values
- **Check**: vehicleController.js changes saved?
- **Check**: Backend server restarted after changes?
- **Fix**: Restart backend with `npm run dev`

### Documents not saving
- **Check**: Browser console for errors
- **Check**: Network tab for API responses
- **Fix**: Check vehicle creation API logs

---

##  API Verification

### Test Master Data Endpoint

```bash
# Using curl
curl http://localhost:3000/api/vehicle/master-data

# Using browser
Open: http://localhost:3000/api/vehicle/master-data
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "documentTypes": [
      { "value": "DN013", "label": "AIP" },
      { "value": "DN012", "label": "Fitness Certificate" },
      ...
    ]
  }
}
```

---

##  Completion Checklist

- [ ] Backend server running
- [ ] Frontend server running
- [ ] Can navigate to Create Vehicle page
- [ ] Documents tab accessible
- [ ] Add Document button works
- [ ] Document type dropdown opens
- [ ] All 12 document types visible
- [ ] Can select a document type
- [ ] Can upload a file
- [ ] Can add multiple documents
- [ ] Can submit vehicle with documents
- [ ] Vehicle saves successfully

---

##  Notes

- Document IDs use `DN###` format (not `DOC###`)
- New documents have `VEHICLE` user type
- Legacy vehicle documents have `TRANSPORTER` user type
- Dropdown uses `StatusSelect` component (modern styled)
- Documents stored with base64 encoding

---

**Test Date**: _____________
**Tested By**: _____________
**Result**: _____________
