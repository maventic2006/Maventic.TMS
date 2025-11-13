# Warehouse Module - Quick Test Guide ⚡

**Date**: November 13, 2025  
**Purpose**: Fast end-to-end testing of new warehouse requirements  
**Time**: ~15 minutes for complete verification

---

## 🚀 Pre-Test Checklist

Before testing, ensure:

- ✅ Backend server running (`http://localhost:5000`)
- ✅ Frontend dev server running (`http://localhost:5173`)
- ✅ Database migration applied (Batch 145)
- ✅ You are logged in with a valid user account

---

## 🧪 Test 1: Backend API - Master Data (2 minutes)

### Test Endpoint:

```bash
GET http://localhost:5000/api/warehouse/master-data
```

### Using Postman/Insomnia:

1. Send GET request to above endpoint
2. Include authorization header if required

### Expected Response:

```json
{
  "success": true,
  "warehouseTypes": [
    {
      "warehouse_types_id": "WH001",
      "warehouse_types": "Manufacturing"
    }
  ],
  "materialTypes": [
    {
      "material_types_id": "MT001",
      "material_types": "Electronics"
    }
  ],
  "addressTypes": [
    {
      "address_type_id": "AT001",
      "address": "Billing"
    }
  ],
  "subLocationTypes": [
    {
      "sub_location_id": "SL001",
      "warehouse_sub_location_description": "Loading Dock"
    }
  ]
}
```

### ✅ Pass Criteria:

- Response has `success: true`
- All 4 arrays present: warehouseTypes, materialTypes, addressTypes, subLocationTypes
- Each array contains at least 1 record
- All records have status = 'ACTIVE'

---

## 🧪 Test 2: Frontend - General Details Tab (5 minutes)

### Navigate to:

```
http://localhost:5173/warehouse/create
```

### Visual Inspection:

#### Field 1: Consignor ID

- [ ] Field is visible at top of form
- [ ] Field is disabled (gray background)
- [ ] Shows your consignor_id OR "AUTO-GENERATED"
- [ ] Has help text: "Auto-filled based on logged-in user"

#### Field 2: Warehouse Name 1

- [ ] Has red asterisk (\*) indicating mandatory
- [ ] Placeholder: "Enter primary warehouse name"
- [ ] Max length: 30 characters
- [ ] Shows error when empty on submit

#### Field 3: Warehouse Name 2

- [ ] Has red asterisk (\*) indicating mandatory
- [ ] Placeholder: "Enter secondary warehouse name"
- [ ] Max length: 30 characters
- [ ] Shows error when empty on submit

#### Field 4: Warehouse Type

- [ ] Dropdown with red asterisk (\*)
- [ ] Options: Manufacturing, Mining, Extraction, Assembling, Food Processing, Cold Storage, Distributor
- [ ] Shows error when empty on submit

#### Field 5: Material Type

- [ ] Dropdown with red asterisk (\*)
- [ ] Options loaded from API (materialTypes)
- [ ] Placeholder: "Select material type"
- [ ] Has help text: "Type of materials that can be shipped from this warehouse"
- [ ] Shows error when empty on submit

#### Field 6: Language

- [ ] Has red asterisk (\*) indicating mandatory
- [ ] Default value: "EN" (pre-filled)
- [ ] Max length: 10 characters

#### Field 7: Vehicle Capacity

- [ ] Has red asterisk (\*) indicating mandatory
- [ ] Type: Number input
- [ ] Help text: "Maximum number of vehicles this warehouse can handle"
- [ ] Only accepts non-negative integers

#### Field 8: Speed Limit

- [ ] Has red asterisk (\*) indicating mandatory
- [ ] Default value: 20 (pre-filled)
- [ ] Placeholder: "20"
- [ ] Range: 1-200
- [ ] Unit: KM/H shown in label
- [ ] Help text: "Default: 20 KM/H"

#### Field 9: Virtual Yard-In

- [ ] Toggle switch (not mandatory)
- [ ] Default: Off (false)

#### Field 10: Radius (Conditional)

- [ ] Only visible when Virtual Yard-In is ON
- [ ] Label: "Radius for Virtual Yard-In (KM)"
- [ ] Placeholder: "Enter radius in KM"
- [ ] Type: Decimal input (step 0.01)
- [ ] Help text: "Radius in kilometers for virtual yard boundary"

### ✅ Pass Criteria:

- All 10 fields render correctly
- All mandatory fields have red asterisk (\*)
- Defaults are correct (Consignor ID, Language "EN", Speed Limit 20)
- Radius only shows when Virtual Yard-In is enabled

---

## 🧪 Test 3: Frontend - Address Tab (3 minutes)

### Click on "Address" tab

### Visual Inspection:

#### New Field 1: VAT Number

- [ ] Has red asterisk (\*) indicating mandatory
- [ ] Placeholder: "Enter VAT number"
- [ ] Max length: 20 characters
- [ ] Converts input to UPPERCASE automatically
- [ ] Help text: "8-20 alphanumeric characters"
- [ ] Shows error when empty on submit

#### New Field 2: Address Type

- [ ] Dropdown with red asterisk (\*)
- [ ] Options loaded from API (addressTypes)
- [ ] Placeholder: "Select address type"
- [ ] Shows error when empty on submit

#### Existing Field: Postal Code

- [ ] Label: "Postal Code (PIN)"
- [ ] Length: 6 characters

### Test VAT Number Uppercase Conversion:

1. Type: `abc123xyz`
2. Observe: Should auto-convert to `ABC123XYZ`

### ✅ Pass Criteria:

- VAT Number field mandatory with red asterisk
- VAT Number converts to uppercase
- Address Type dropdown populates from API
- Postal Code label shows "(PIN)"

---

## 🧪 Test 4: Frontend - Geofencing Tab (2 minutes)

### Click on "Geofencing" tab

### Visual Inspection:

#### Sub-Location Dropdown

- [ ] Dropdown loads options from API
- [ ] Options show `warehouse_sub_location_description` text
- [ ] Dropdown functional (can select items)

### ✅ Pass Criteria:

- Sub-location dropdown populates correctly
- No console errors related to field mapping
- Can select and add sub-locations to list

---

## 🧪 Test 5: Form Validation (3 minutes)

### Test Empty Form Submission:

1. **Don't fill any fields**
2. Click "Submit" button
3. Observe validation errors

### Expected Errors:

- [ ] "Warehouse Name 1 is required"
- [ ] "Warehouse Name 2 is required"
- [ ] "Warehouse Type is required"
- [ ] "Material Type is required"
- [ ] "Vehicle Capacity is required"
- [ ] "Speed Limit is required"
- [ ] "VAT Number is required"
- [ ] "Address Type is required"
- [ ] "Country is required"
- [ ] "State is required"
- [ ] "City is required"
- [ ] "Street 1 is required"

### Test Invalid VAT Number:

1. Fill required fields
2. In VAT Number, type: `ABC` (too short)
3. Click "Submit"
4. Observe error: "VAT number must be 8-20 alphanumeric characters"

### Test Invalid Speed Limit:

1. Fill required fields
2. In Speed Limit, type: `250` (too high)
3. Click "Submit"
4. Observe error: "Speed limit must be between 1 and 200"

### Test Warehouse Name Too Long:

1. Fill required fields
2. In Warehouse Name 1, type: `This is a very long warehouse name that exceeds thirty characters`
3. Observe: Field should not accept beyond 30 characters (maxLength constraint)

### ✅ Pass Criteria:

- All mandatory fields show validation errors when empty
- VAT number validates 8-20 character length
- Speed limit validates 1-200 range
- Warehouse names enforce 30 character limit

---

## 🧪 Test 6: Form Submission (Full Flow) (5 minutes)

### Fill Complete Form:

**General Details Tab**:

1. Consignor ID: (auto-filled, disabled)
2. Warehouse Name 1: `Test Warehouse Main`
3. Warehouse Name 2: `Test Warehouse Secondary`
4. Warehouse Type: `Manufacturing`
5. Material Type: Select any from dropdown
6. Language: `EN` (default, keep as is)
7. Vehicle Capacity: `50`
8. Speed Limit: `20` (default, keep as is)
9. Virtual Yard-In: Toggle ON
10. Radius: `2.5`

**Address Tab**:

1. Country: Select `India`
2. State: Select any state
3. City: Select any city
4. District: `Test District`
5. Street 1: `123 Test Street`
6. Street 2: `Building A`
7. Postal Code: `123456`
8. VAT Number: `ABCD1234EFGH5678` (type lowercase to test uppercase conversion)
9. Address Type: Select any from dropdown

**Documents Tab**:

1. Upload at least 1 document (optional)

**Contact Tab**:

1. Add at least 1 contact (optional)

**Geofencing Tab**:

1. Add at least 1 sub-location (optional)
2. Add GPS coordinates (optional)

### Submit Form:

1. Click "Submit" button
2. Wait for response

### Expected Behavior:

- [ ] Form submits without errors
- [ ] Success toast notification appears
- [ ] Redirects to warehouse details page OR warehouse list
- [ ] No console errors

### ✅ Pass Criteria:

- Form submits successfully
- All data saves to database
- VAT number stored in uppercase
- Material type ID stored correctly
- Speed limit stored as 20
- No JavaScript errors in console

---

## 🧪 Test 7: Clear Button (1 minute)

### Test Reset Functionality:

1. Fill some fields in General Details tab
2. Change Speed Limit to `100`
3. Change Language to `FR`
4. Click "Clear" button

### Expected Behavior:

- [ ] All fields reset to empty/default values
- [ ] Speed Limit resets to `20`
- [ ] Language resets to `EN`
- [ ] Consignor ID remains (auto-filled)
- [ ] All validation errors clear

### ✅ Pass Criteria:

- Clear button resets form to initial state
- Default values restored (Speed Limit 20, Language EN)
- Consignor ID not affected (still shows user's ID)

---

## 🧪 Test 8: Console Error Check (1 minute)

### Throughout All Tests:

1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Monitor for errors

### Expected:

- [ ] **No red errors**
- [ ] No warnings about missing props
- [ ] No network errors (500, 404, etc.)
- [ ] API calls complete successfully (200 status)

### Common Issues to Watch:

- ❌ `Cannot read property 'materialTypes' of undefined` - means masterData not loaded
- ❌ `Warning: Each child in a list should have a unique "key" prop` - means React key issue
- ❌ `Failed to fetch` - means API endpoint not working

### ✅ Pass Criteria:

- Zero JavaScript errors in console
- All API calls return 200 OK
- No React warnings

---

## 📊 Test Results Summary

| Test                                | Status          | Notes |
| ----------------------------------- | --------------- | ----- |
| 1. Backend API - Master Data        | ☐ Pass / ☐ Fail |       |
| 2. General Details Tab (10 fields)  | ☐ Pass / ☐ Fail |       |
| 3. Address Tab (VAT + Address Type) | ☐ Pass / ☐ Fail |       |
| 4. Geofencing Tab (Sub-locations)   | ☐ Pass / ☐ Fail |       |
| 5. Form Validation (Error messages) | ☐ Pass / ☐ Fail |       |
| 6. Form Submission (Full flow)      | ☐ Pass / ☐ Fail |       |
| 7. Clear Button (Reset defaults)    | ☐ Pass / ☐ Fail |       |
| 8. Console Error Check              | ☐ Pass / ☐ Fail |       |

---

## 🐛 Common Issues & Solutions

### Issue 1: Material Type Dropdown Empty

**Symptom**: Material Type dropdown shows "Select material type" but no options  
**Cause**: Master data not fetched or empty in database  
**Solution**:

```sql
SELECT * FROM material_types_master WHERE status = 'ACTIVE';
```

If empty, seed data into table

### Issue 2: VAT Number Not Converting to Uppercase

**Symptom**: VAT number stays lowercase after typing  
**Cause**: `toUpperCase()` not working in onChange handler  
**Solution**: Check AddressTab.jsx line with VAT Number onChange

### Issue 3: Speed Limit Not Defaulting to 20

**Symptom**: Speed limit field is empty on page load  
**Cause**: Initial state not set correctly  
**Solution**: Check WarehouseCreatePage.jsx formData initial state

### Issue 4: Consignor ID Shows "AUTO-GENERATED" for Consignor Role

**Symptom**: Consignor users see "AUTO-GENERATED" instead of their ID  
**Cause**: User data not loaded from auth state  
**Solution**: Check auth slice and ensure user.consignor_id exists

### Issue 5: Radius Field Always Visible

**Symptom**: Radius field shows even when Virtual Yard-In is OFF  
**Cause**: Conditional rendering not working  
**Solution**: Check GeneralDetailsTab.jsx conditional on `formData.generalDetails.virtualYardIn`

---

## ✅ Test Complete!

### If All Tests Pass:

🎉 **Implementation is production-ready!**

Next steps:

1. Document test results
2. Schedule UAT with stakeholders
3. Prepare for staging deployment

### If Any Test Fails:

🔍 **Debug and fix issues**

Steps:

1. Document which test failed
2. Note exact error message
3. Check browser console for details
4. Reference "Common Issues & Solutions" section above
5. Fix issue and re-test

---

## 📞 Support

For issues or questions:

- Backend Issues: Check `tms-backend/controllers/warehouseController.js`
- Frontend Issues: Check `frontend/src/features/warehouse/`
- Database Issues: Verify migration `999_add_material_type_to_warehouse.js` ran
- Validation Issues: Check `frontend/src/features/warehouse/validation.js`

---

**Test Duration**: ~15 minutes  
**Last Updated**: November 13, 2025  
**Status**: ✅ Ready for Testing
