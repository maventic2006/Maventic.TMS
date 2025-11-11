#  Quick Test Guide - Vehicle Create Integration

## Step 1: Start Backend
`ash
cd tms-backend
npm start
`
 Backend should be running on http://localhost:5000

---

## Step 2: Seed Test Data (Optional)
`ash
cd tms-backend
npx knex seed:run --specific=seed_vehicle_test_data.js
`
 Creates 3 test vehicles in database

---

## Step 3: Start Frontend
`ash
cd frontend
npm run dev
`
 Frontend should be running on http://localhost:5173

---

## Step 4: Test Create Vehicle

### Navigate to Create Page:
http://localhost:5173/vehicle/create

### Fill Minimum Required Fields:

**Tab 1: Basic Information**
- Registration Number: MH12AB1234
- VIN: MAT123456789012345
- Vehicle Type: Select from dropdown
- Make: TATA
- Model: LPT 407
- Year: 2024

**Tab 2: Specifications**
- Engine Number: ENG123456
- Fuel Type: Select from dropdown
- Transmission: Select from dropdown

**Tab 3: Capacity Details**
- GVW: 4000 (kg)
- Payload Capacity: 2500 (kg)

**Tab 4: Ownership Details**
- Ownership Type: Select from dropdown
- Owner Name: ABC Logistics Pvt Ltd
- Chassis Number: CHASSIS123456

**Tab 5-7: Optional** (can be skipped)

### Click Submit Button

---

##  Expected Results:

### Console Logs:
`
 Submitting vehicle data: {basicInformation: {...}, specifications: {...}}
 Creating vehicle with data: {...}
 Vehicle created successfully: {vehicleId: "VEH0001", success: true}
`

### Success Toast:
Vehicle VEH0001 created successfully!

### Navigation:
Redirects to /vehicle/VEH0001 (details page) or /vehicle (list page)

### Database:
`sql
SELECT * FROM vehicle_basic_information_hdr WHERE vehicle_information_id = 'VEH0001';
`

---

##  Test Validation Errors:

### Test 1: Missing Required Field
1. Leave "Make" field empty
2. Click Submit
3. Expect: Toast with error "make: Make is required"

### Test 2: Duplicate VIN
1. Use VIN from existing vehicle
2. Click Submit
3. Expect: Backend error "VIN already exists"

### Test 3: Duplicate Registration
1. Use Registration Number from existing vehicle
2. Click Submit
3. Expect: Backend error "Registration number already exists"

---

##  Debug Checklist:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] No console errors on page load
- [ ] Form fields render correctly
- [ ] Submit button enabled
- [ ] Console shows transformation log on submit
- [ ] Success toast appears after submit
- [ ] Navigation occurs after success
- [ ] Database record created

---

##  Common Issues:

**Issue**: "Network Error" on submit
- **Fix**: Check backend is running on port 5000

**Issue**: "Validation Error" toast
- **Fix**: Fill all required fields marked with asterisk

**Issue**: "VIN already exists"
- **Fix**: Use unique VIN (try incrementing last digit)

**Issue**: "Registration number already exists"
- **Fix**: Use unique registration number

**Issue**: No navigation after success
- **Fix**: Check console for errors, verify vehicleId returned

---

##  Integration Status: 90% Complete

 Backend API working  
 Redux calling real API  
 Form transformation working  
 Create flow functional  
 5 fields use defaults (needs UI update)  

---

**Quick Success Test**:
1. Fill only required fields
2. Click Submit
3. See "Vehicle VEH0001 created successfully!"
4.  Integration working!
