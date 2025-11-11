# Option C - Quick Test Guide

**Date**: 2025-11-08 23:33:47

---

##  Quick Test Steps

### 1. Start Servers

```bash
# Terminal 1 - Backend
cd tms-backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Test Database Configuration

```bash
# Check if configurations exist
cd tms-backend
npx knex seed:run --specific=06_configure_vehicle_document_types.js
```

**Expected Output**: "Vehicle document configurations already exist" (if already run)

### 3. Test Backend API

1. Open browser to `http://localhost:5173`
2. Login to the application
3. Open Developer Tools  Network tab
4. Navigate to Create Vehicle page
5. Look for `GET /api/vehicle/master-data` request
6. Check Response:
   - Should have `documentTypes` array with 12 items
   - Each item should have: `value`, `label`, `isMandatory`, `isExpiryRequired`, `isVerificationRequired`

**Sample Response**:
```json
{
  "success": true,
  "data": {
    "documentTypes": [
      {
        "value": "DN013",
        "label": "AIP",
        "isMandatory": 0,
        "isExpiryRequired": 1,
        "isVerificationRequired": 0
      },
      ...
    ]
  }
}
```

### 4. Test Document Upload Modal

1. Navigate to **Create Vehicle** page
2. Fill in **Basic Information** tab (minimum required fields)
3. Click **Documents** tab
4. Click **Upload Documents** button

**Test Scenario 1: Required Badge**
- Document Type dropdown should show:
  - "Vehicle Registration Certificate (Required)"
  - "Vehicle Insurance (Required)"
  - "PUC certificate (Required)"
  - "Fitness Certificate (Required)"
  - "Tax Certificate (Required)"

**Test Scenario 2: Conditional Expiry Fields**
- Select "Vehicle Insurance"
-  Valid From and Valid To should show red asterisk (*)
- Select "Vehicle Service Bill"
-  Valid From and Valid To should NOT show asterisk

**Test Scenario 3: Validation**
- Select "Vehicle Insurance"
- Leave Valid From/To empty
- Try to upload
-  Should show error: "Valid from date is required for this document type"

- Select "Vehicle Service Bill"
- Leave Valid From/To empty
- Try to upload
-  Should succeed (no error)

### 5. Test Mandatory Documents Checklist

1. Go to Documents tab (with 0 documents)
2. Look for blue "Required Documents" box
3. Should show 5 documents with red X:
   -  Vehicle Registration Certificate
   -  Vehicle Insurance
   -  PUC certificate
   -  Fitness Certificate
   -  Tax Certificate

4. Upload "Vehicle Registration Certificate"
5. Checklist should update:
   -  Vehicle Registration Certificate (green checkmark)
   -  Vehicle Insurance
   -  PUC certificate
   -  Fitness Certificate
   -  Tax Certificate

### 6. Test Validation on Submit

**Test Scenario 1: Missing Mandatory Documents**
1. Fill all required fields in all tabs
2. Upload only 2 mandatory documents (e.g., Registration + Insurance)
3. Click "Create Vehicle" button
4.  Should see error banner: "Missing mandatory documents: PUC certificate, Fitness Certificate, Tax Certificate"
5.  Documents tab should show red error indicator (dot)
6.  Should auto-switch to Documents tab

**Test Scenario 2: All Mandatory Documents Present**
1. Upload all 5 mandatory documents
2. Checklist should show all green checkmarks
3. Click "Create Vehicle" button
4.  Should succeed and create vehicle
5.  Should redirect to vehicle list or details page

### 7. Test Expiry Date Validation

1. Upload "Vehicle Insurance"
2. Set Valid From: 2024-12-01
3. Set Valid To: 2024-11-01 (earlier date)
4. Try to upload
5.  Should show error: "Valid to date must be after valid from date"

---

##  Success Criteria

All tests should pass:
- [ ] Backend API returns enhanced document types with metadata
- [ ] Document dropdown shows "(Required)" for 5 mandatory docs
- [ ] Expiry fields conditionally show asterisk based on document type
- [ ] Validation enforces expiry dates only when required
- [ ] Mandatory documents checklist shows upload progress
- [ ] Vehicle submission blocked until all mandatory docs uploaded
- [ ] Error messages are clear and helpful
- [ ] Tab indicators show errors correctly

---

##  Troubleshooting

**Issue**: Dropdown doesn't show "(Required)" badge
- **Solution**: Check Redux DevTools  vehicle.masterData.documentTypes  should have `isMandatory` field

**Issue**: Expiry fields always show asterisk
- **Solution**: Check document type selection  verify `isExpiryRequired` field exists

**Issue**: Validation doesn't block submission
- **Solution**: Check browser console for errors  verify `validateAllTabs()` is called

**Issue**: Checklist doesn't update
- **Solution**: Refresh page  check if `masterData.documentTypes` is loaded

---

##  Expected Results Summary

| Test | Expected Result | Status |
|------|----------------|--------|
| API Returns Metadata |  All 12 docs with 3 boolean fields |  |
| Required Badge Shows |  5 docs show "(Required)" |  |
| Conditional Asterisks |  Only for docs with expiry |  |
| Expiry Validation |  Enforced conditionally |  |
| Mandatory Checklist |  Shows 5 docs with status |  |
| Submit Validation |  Blocks without mandatory docs |  |
| Error Messages |  Clear and specific |  |
| Tab Indicators |  Red dot on Documents tab |  |

---

**Created**: 2025-11-08 23:33:47
**Time to Test**: ~15-20 minutes
**Complexity**: Medium
