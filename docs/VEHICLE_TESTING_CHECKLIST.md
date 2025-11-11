# Vehicle Module Testing Checklist

## Quick Reference for Testing Vehicle Features

###  Database Status
- [x] Master tables populated (24 records)
- [x] 50 vehicles created
- [x] 550 related records created
- [x] All foreign keys validated
- [x] API endpoints ready

---

## Backend API Testing

### 1. Master Data Endpoint
```bash
GET /api/vehicles/master-data
```
**Expected**: Vehicle types, fuel types, usage types, engine types

### 2. List Vehicles
```bash
GET /api/vehicles?page=1&limit=25
```
**Expected**: 50 total vehicles, 25 per page

### 3. Get Vehicle Details
```bash
GET /api/vehicles/VEH0001
```
**Expected**: Complete vehicle data with all relationships

### 4. Test Filters
```bash
GET /api/vehicles?vehicleType=VT001&fuelType=FT001
```

### 5. Test Search
```bash
GET /api/vehicles?search=Tata
```

---

## Frontend Testing

### Vehicle List Page (`/vehicle-maintenance`)

#### Display Tests
- [ ] Page loads without errors
- [ ] 25 vehicles display in table
- [ ] Table headers correct (ID, Make, Model, Type, Fuel, Status)
- [ ] Pagination shows "Page 1 of 2"
- [ ] Total count shows "50 vehicles"

#### Filter Tests
- [ ] Vehicle Type dropdown populated (8 types)
- [ ] Fuel Type dropdown populated (4 types)
- [ ] Status dropdown works (Active/Inactive)
- [ ] Filters apply correctly
- [ ] Clear filters button works

#### Search Tests
- [ ] Search by vehicle ID works
- [ ] Search by make works
- [ ] Search by model works
- [ ] Search by registration number works

#### Interaction Tests
- [ ] Clicking vehicle ID navigates to details
- [ ] Pagination First/Prev/Next/Last works
- [ ] Sorting by columns works
- [ ] "Create New Vehicle" button navigates to create page

---

### Vehicle Details Page (`/vehicle-maintenance/:id`)

#### Navigation
- [ ] Page loads with vehicle ID in URL
- [ ] Back button returns to list

#### Tabs Display
- [ ] Basic Information tab shows data
- [ ] Specifications tab shows data
- [ ] Capacity tab shows data
- [ ] Ownership tab shows data
- [ ] Maintenance tab shows records (3 per vehicle)
- [ ] Documents tab displays
- [ ] Mappings tab displays
- [ ] Performance tab displays
- [ ] GPS tab shows IMEI number

#### Data Verification
Test with VEH0001:
- [ ] Make: Ashok Leyland
- [ ] Model: FM440
- [ ] Registration: WB01EH6678
- [ ] Owner: ABC Transport
- [ ] Insurance: ICICI Lombard
- [ ] Permits: 2 records display
- [ ] Maintenance: 3 records display
- [ ] Service Schedules: 3 records display

#### View/Edit Mode
- [ ] View mode displays data (collapsible sections)
- [ ] Edit button enables edit mode
- [ ] Cancel button returns to view mode
- [ ] Save button updates data
- [ ] Validation errors display

---

### Vehicle Create Page (`/vehicle-maintenance/create`)

#### Step 1: Basic Information
- [ ] Form displays
- [ ] Make dropdown populated
- [ ] Model input works
- [ ] Vehicle Type dropdown (8 options)
- [ ] Fuel Type dropdown (4 options)
- [ ] Usage Type dropdown (4 options)
- [ ] Engine Type dropdown (4 options)
- [ ] VIN validation works
- [ ] IMEI validation works (15 digits)
- [ ] "Next" button navigates to Step 2

#### Step 2: Capacity & Ownership
- [ ] Registration number input
- [ ] Owner name input
- [ ] RTO dropdown populated
- [ ] Load capacity input
- [ ] Volume capacity input
- [ ] "Next" button navigates to Step 3

#### Step 3: GPS & Operational
- [ ] GPS tracker toggle
- [ ] IMEI input (if GPS enabled)
- [ ] Transmission type dropdown
- [ ] Suspension type dropdown
- [ ] "Next" button navigates to Step 4

#### Step 4: Review & Submit
- [ ] All entered data displays
- [ ] Edit buttons navigate back to steps
- [ ] "Submit" button creates vehicle
- [ ] Success message displays
- [ ] Redirects to details page or list

---

## Sample Test Data

### Test Vehicle IDs
- VEH0001 - Ashok Leyland FM440 (FLATBED, DIESEL)
- VEH0002 - Volvo 3123R (REFRIGERATED, DIESEL)
- VEH0003 - Tata 3123R (HCV, DIESEL)
- VEH0004 - Volvo 3123R (TANKER, DIESEL)
- VEH0005 - Ashok Leyland LPT 1918 (TANKER, ELECTRIC)

### Test Registration Numbers
- WB01EH6678 (VEH0001)
- TN01LA9393 (VEH0002)
- RJ01LW5735 (VEH0003)

### Test Owners
- ABC Transport
- XYZ Logistics
- PQR Fleet
- LMN Transport

### Test Insurance Providers
- ICICI Lombard
- HDFC ERGO
- Bajaj Allianz
- TATA AIG

---

## Known Issues / Notes

### Authentication Required
All API endpoints require JWT token. To test:
1. Login to application
2. Get JWT token from cookie/localStorage
3. Include in Authorization header

### API Base URL
- Development: `http://localhost:5000/api/vehicles`
- Frontend proxy should handle automatically

### Database Connection
- Ensure backend server is running: `npm run dev`
- Check .env file has correct DB credentials

---

## Quick Database Checks

### Count All Records
```sql
SELECT 
  'Vehicles' as entity, 
  COUNT(*) as count 
FROM vehicle_basic_information_hdr
UNION ALL
SELECT 'Ownership', COUNT(*) FROM vehicle_ownership_details
UNION ALL
SELECT 'Insurance', COUNT(*) FROM vehicle_basic_information_itm
UNION ALL
SELECT 'Permits', COUNT(*) FROM vehicle_special_permit
UNION ALL
SELECT 'Maintenance', COUNT(*) FROM vehicle_maintenance_service_history;
```

### Get Vehicle Details
```sql
SELECT 
  hdr.*,
  own.registration_number,
  own.ownership_name,
  itm.insurance_provider
FROM vehicle_basic_information_hdr hdr
LEFT JOIN vehicle_ownership_details own ON hdr.vehicle_id_code_hdr = own.vehicle_id_code
LEFT JOIN vehicle_basic_information_itm itm ON hdr.vehicle_id_code_hdr = itm.vehicle_id_code_hdr
WHERE hdr.vehicle_id_code_hdr = 'VEH0001';
```

---

## Testing Priority

### P0 - Critical
1. [ ] List page displays 50 vehicles
2. [ ] Details page loads for VEH0001
3. [ ] All tabs show data
4. [ ] Create page flow works

### P1 - High
1. [ ] Pagination works correctly
2. [ ] Filters apply properly
3. [ ] Search finds vehicles
4. [ ] Edit mode saves data

### P2 - Medium
1. [ ] Sorting works on columns
2. [ ] Collapsible sections animate
3. [ ] Form validations display errors
4. [ ] Success/error toasts show

### P3 - Low
1. [ ] Theme consistency
2. [ ] Mobile responsive layout
3. [ ] Loading states display
4. [ ] Animations smooth

---

**Last Updated**: November 6, 2024  
**Status**: Ready for Testing  
**Total Test Cases**: 60+
