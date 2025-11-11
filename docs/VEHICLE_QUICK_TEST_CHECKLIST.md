#  QUICK TEST CHECKLIST - Vehicle Foreign Key Fixes

##  **WHAT WAS FIXED**
-  BasicInformationTab: Vehicle Type + Usage Type dropdowns now use API data
-  SpecificationsTab: Fuel Type + Engine Type dropdowns now use API data
-  DocumentUploadModal: Coverage Type changed from text input to dropdown
-  Backend: Added coverage types to getMasterData() API
-  Redux: Added coverageTypes + engineTypes to state

---

##  **TESTING STEPS (5 Minutes)**

### Step 1: Restart Backend 
`ash
cd tms-backend
# Stop current server: Ctrl+C
npm run dev
`
**Expected**: Server starts on port 5000 without errors

---

### Step 2: Verify Master Data API 
Open in browser: http://localhost:5000/api/vehicles/master-data

**Check Response Includes**:
`json
{
  "success": true,
  "data": {
    "vehicleTypes": [
      {"value": "VT001", "label": "HCV - Heavy Commercial Vehicle"},
      {"value": "VT002", "label": "MCV - Medium Commercial Vehicle"},
      ...
    ],
    "fuelTypes": [
      {"value": "FT001", "label": "DIESEL"},
      {"value": "FT002", "label": "CNG"},
      ...
    ],
    "usageTypes": [
      {"value": "UT001", "label": "COMMERCIAL"},
      {"value": "UT002", "label": "PRIVATE"},
      ...
    ],
    "engineTypes": [
      {"value": "ET001", "label": "BS4"},
      {"value": "ET002", "label": "BS6"},
      ...
    ],
    "coverageTypes": [
      {"value": "CT001", "label": "Comprehensive Insurance"},
      {"value": "CT002", "label": "Third Party Liability"},
      ...
    ]
  }
}
`

 **Pass Criteria**: All 5 types present with correct ID format (VT###, FT###, UT###, ET###, CT###)

---

### Step 3: Clear Browser Cache 
- Press: Ctrl + Shift + Delete
- Select: "Cached images and files" + "Cookies and other site data"
- Click: Clear data
- Hard refresh: Ctrl + F5

---

### Step 4: Test Basic Information Tab 
Navigate to: **Vehicle Master  Create Vehicle  Basic Information**

**Check Dropdowns**:
- [ ] **Vehicle Type** dropdown shows:
  -  VT001 - Heavy Commercial Vehicle
  -  VT002 - Medium Commercial Vehicle
  -  VT003 - Light Commercial Vehicle
  -  NOT "HCV", "MCV", "LCV" (old hardcoded values)

- [ ] **Usage Type** dropdown shows:
  -  UT001 - COMMERCIAL
  -  UT002 - PRIVATE
  -  UT003 - RENTAL
  -  UT004 - LEASE
  -  NOT free text values

---

### Step 5: Test Specifications Tab 
Navigate to: **Specifications Tab**

**Check Dropdowns**:
- [ ] **Fuel Type** dropdown shows:
  -  FT001 - DIESEL
  -  FT002 - CNG
  -  FT003 - ELECTRIC
  -  FT004 - LNG
  -  NOT "DIESEL", "PETROL", "CNG" (old hardcoded values)

- [ ] **Engine Type** dropdown shows:
  -  ET001 - BS4
  -  ET002 - BS6
  -  ET003 - EURO5
  -  ET004 - EURO6
  -  NOT free text values

---

### Step 6: Test Document Upload Modal 
Navigate to: **Documents Tab  Upload Documents Button**

**Check Coverage Type Field**:
- [ ] **Coverage Type** is a DROPDOWN (not text input)
- [ ] Shows options:
  -  CT001 - Comprehensive Insurance
  -  CT002 - Third Party Liability
  -  CT003 - Collision Coverage
  -  CT004 - Cargo Insurance
  -  CT005 - Personal Accident
  -  CT006 - Fire & Theft
  -  CT007 - Extended Warranty
  -  CT008 - Roadside Assistance
  -  CANNOT type "full" or "third party" (text input removed)

---

### Step 7: Complete Vehicle Creation 
**Fill Form**:
1. **Basic Information**:
   - Registration Number: TEST001
   - Vehicle Type: Select "VT001 - Heavy Commercial Vehicle"
   - Usage Type: Select "UT001 - COMMERCIAL"
   - Manufacturer: Tata
   - Model: 407

2. **Specifications**:
   - Fuel Type: Select "FT001 - DIESEL"
   - Engine Type: Select "ET001 - BS4"
   - Engine Number: ENG12345

3. **Capacity & Ownership**:
   - Loading Capacity: 5000
   - Unit: KG

4. **GPS & Operational**:
   - Status: ACTIVE

5. **Documents** (optional):
   - Click "Upload Documents"
   - Document Type: Select any
   - Coverage Type: Select "CT001 - Comprehensive Insurance"
   - Premium Amount: 5000
   - Valid From: 2025-01-01
   - Valid To: 2026-01-01
   - Click "Add Document"

6. **Submit**:
   - Click "Submit" button

---

### Step 8: Verify Submission 

**Open DevTools** (F12):
1. Go to **Network Tab**
2. Find: POST /api/vehicles
3. Click on it  **Payload Tab**

**Expected Payload**:
`json
{
  "vehicleType": "VT001",  //  Valid ID (not "HCV")
  "fuelType": "FT001",     //  Valid ID (not "DIESEL")
  "usageType": "UT001",    //  Valid ID (not "COMMERCIAL")
  "engineType": "ET001",   //  Valid ID (not "BS4")
  "documents": [
    {
      "coverageType": "CT001"  //  Valid ID (not "full")
    }
  ]
}
`

**Expected Response**:
- Status Code: 201 Created
- Response Body:
  `json
  {
    "success": true,
    "message": "Vehicle created successfully",
    "data": { ... }
  }
  `

**Expected Success Message**:
- Green toast notification: "Vehicle created successfully"
- Redirect to vehicle list or details page

---

##  **IF ERRORS OCCUR**

### Error 1: Dropdowns Show Empty or Loading
**Cause**: Master data not loaded
**Fix**:
1. Check Redux DevTools  State  vehicle  masterData
2. If empty, check Network tab for master-data API call
3. If API call failed, check backend console for errors
4. Verify backend server is running on port 5000

### Error 2: Still Getting Foreign Key Error
**Cause**: Form still sending old values
**Fix**:
1. Clear Redux persist: 
   - Open DevTools  Application  Local Storage
   - Delete persist:root key
   - Hard refresh (Ctrl + F5)
2. Clear browser cache again
3. Restart frontend: cd frontend && npm run dev

### Error 3: Coverage Type Still Text Input
**Cause**: Frontend code not updated
**Fix**:
1. Verify file was saved: rontend/src/features/vehicle/components/DocumentUploadModal.jsx
2. Check line ~335 should have <StatusSelect> not <input type="text">
3. Restart frontend server
4. Hard refresh browser

### Error 4: "Cannot find module StatusSelect"
**Cause**: Import missing in DocumentUploadModal
**Fix**:
1. Check imports at top of DocumentUploadModal.jsx:
   `javascript
   import { StatusSelect } from "../../../components/ui/Select";
   `
2. If missing, add it
3. Restart frontend

---

##  **SUCCESS CRITERIA**

 **All Tests Pass If**:
1. Master data API returns all 5 types with correct IDs
2. All dropdowns show VT###, FT###, UT###, ET###, CT### format
3. No text inputs for foreign key fields
4. Form submission sends valid IDs (not labels)
5. Vehicle creation succeeds without foreign key errors
6. Success toast notification appears

---

##  **TROUBLESHOOTING COMMANDS**

### Check Backend Logs
`ash
cd tms-backend
npm run dev
# Watch for errors in terminal
`

### Check Database Coverage Types
`sql
-- In MySQL Workbench or command line
SELECT * FROM coverage_type_master WHERE status = 'ACTIVE';
-- Should return CT001-CT008
`

### Test API Directly
`ash
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:5000/api/vehicles/master-data" | Select-Object -ExpandProperty Content
`

### Clear All Caches
`ash
# Stop both servers
# Delete node_modules/.cache in frontend
cd frontend
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
npm run dev
`

---

##  **NEED HELP?**

If issues persist after all fixes:
1. Check docs/VEHICLE_COVERAGE_TYPE_FIX.md for detailed coverage type fix
2. Check docs/VEHICLE_FOREIGN_KEY_PERMANENT_FIX.md for hardcoded constants fix
3. Check docs/VEHICLE_FOREIGN_KEY_COMPLETE_RESOLUTION.md for complete overview
4. Verify all 5 files were modified correctly (see FILES MODIFIED section in docs)

---

**Date**: January 10, 2025  
**Total Fixes**: 5 foreign key fields  
**Estimated Testing Time**: 5-10 minutes  
**Expected Result**:  **All foreign key errors RESOLVED**
