# Driver Draft Submit Validation - Quick Test Checklist

## 🚀 Quick Start

**Current Status:** Backend server running, validation implemented

**Test Driver:** DRV0059 (Draft status)

## ✅ Quick Test Scenarios (5 minutes)

### Test 1: Missing Phone Number ❌

**Steps:**

1. Navigate to http://localhost:5173/drivers
2. Click on draft driver DRV0059
3. Click "Edit" button
4. Go to Basic Info tab
5. Clear the phone number field
6. Click "Submit for Approval"

**Expected Result:**

- ❌ Error toast appears
- Message: "Phone number is required"
- Field: "phoneNumber"
- Duration: 8 seconds
- **Does NOT navigate to list**

---

### Test 2: Invalid Phone Format ❌

**Steps:**

1. Edit Basic Info
2. Change phone number to "12345" (5 digits)
3. Click "Submit for Approval"

**Expected Result:**

- ❌ Error toast appears
- Message: "Phone number must be exactly 10 digits"
- Field: "phoneNumber"
- **Does NOT navigate to list**

---

### Test 3: Invalid Postal Code ❌

**Steps:**

1. Edit Basic Info (ensure phone is valid 10 digits)
2. Go to Basic Info tab (addresses section)
3. Change postal code to "12345" (5 digits)
4. Click "Submit for Approval"

**Expected Result:**

- ❌ Error toast appears
- Message: "Postal code must be exactly 6 digits"
- Field: "addresses 0 - postalCode"
- **Does NOT navigate to list**

---

### Test 4: Missing Emergency Contact ❌

**Steps:**

1. Edit Basic Info
2. Clear emergency contact field
3. Ensure phone number is valid (10 digits)
4. Ensure postal code is valid (6 digits)
5. Click "Submit for Approval"

**Expected Result:**

- ❌ Error toast appears
- Message: "Emergency contact is required" or "Emergency contact must be exactly 10 digits"
- **Does NOT navigate to list**

---

### Test 5: Successful Submission ✅

**Steps:**

1. Edit Basic Info tab
2. Ensure ALL fields are valid:
   - Full Name: "Test Driver" (min 2 chars) ✅
   - Date of Birth: Valid date (age 18-100) ✅
   - Phone: "9876543210" (exactly 10 digits, unique) ✅
   - Email: "test@example.com" (valid format if provided) ✅
   - Emergency Contact: "9876543211" (exactly 10 digits) ✅
3. Ensure address has valid postal code (6 digits) ✅
4. Click "Submit for Approval"

**Expected Result:**

- ✅ Success toast appears
- Message: "Driver submitted for approval successfully! Status changed to PENDING."
- **WAIT 1 second**
- **Automatically navigates to /drivers list page**
- Driver DRV0059 status changed to PENDING in list

---

## 🔍 Detailed Validation Test (Optional - 10 minutes)

### Test 6: Duplicate Phone Number ❌

**Steps:**

1. Find an active driver's phone number (e.g., DRV0001 → 9876543210)
2. Edit draft driver DRV0059
3. Change phone to match active driver's phone
4. Click "Submit for Approval"

**Expected Result:**

- ❌ Error toast appears
- Message: "Driver with this phone number already exists"
- Code: "DUPLICATE_PHONE"
- Field: "phoneNumber"

---

### Test 7: Invalid Email Format ❌

**Steps:**

1. Edit email to "invalidemail" (no @ symbol)
2. Click "Submit for Approval"

**Expected Result:**

- ❌ Error toast appears
- Message: "Invalid email format"

---

### Test 8: Missing Address City ❌

**Steps:**

1. Go to Basic Info addresses section
2. Clear the city field
3. Click "Submit for Approval"

**Expected Result:**

- ❌ Error toast appears
- Message: "City is required"
- Field: "addresses 0 - city"

---

## 📊 Test Results

| Test # | Scenario              | Expected             | Actual | Pass/Fail |
| ------ | --------------------- | -------------------- | ------ | --------- |
| 1      | Missing Phone         | Error toast          | ⬜     | ⬜        |
| 2      | Invalid Phone         | Error toast          | ⬜     | ⬜        |
| 3      | Invalid Postal        | Error toast          | ⬜     | ⬜        |
| 4      | Missing Emergency     | Error toast          | ⬜     | ⬜        |
| 5      | **Successful Submit** | **Navigate to list** | ⬜     | ⬜        |
| 6      | Duplicate Phone       | Error toast          | ⬜     | ⬜        |
| 7      | Invalid Email         | Error toast          | ⬜     | ⬜        |
| 8      | Missing City          | Error toast          | ⬜     | ⬜        |

## 🎯 Success Criteria

- ✅ All error scenarios show toast with specific field path
- ✅ Toast duration is 8 seconds for errors
- ✅ Successful submission navigates to driver list after 1 second
- ✅ Driver status changes to PENDING after submission
- ✅ No breaking changes to existing functionality

## 🔧 Troubleshooting

**Issue:** Error toast not showing

- Check browser console for errors
- Check backend logs for validation errors
- Verify Redux toast slice is working

**Issue:** Navigation not working

- Check browser console for navigation errors
- Verify React Router is configured
- Check setTimeout is executing

**Issue:** Validation not working

- Check backend server is running
- Check backend logs for validation logic execution
- Verify API endpoint `/api/driver/:id/submit-draft` is being called

**Issue:** Backend errors

- Check MySQL connection
- Verify database schema matches validation queries
- Check backend console logs for detailed errors

## 📝 Notes

- Backend server must be running on port 5000
- Frontend must be running on port 5173
- Test with draft driver DRV0059 or any driver with DRAFT/SAVE_AS_DRAFT status
- After Test 5 (successful submission), DRV0059 will be PENDING - use another draft driver for subsequent tests

---

**Status:** Ready for Testing
**Priority:** High - Comprehensive validation is critical for data integrity
