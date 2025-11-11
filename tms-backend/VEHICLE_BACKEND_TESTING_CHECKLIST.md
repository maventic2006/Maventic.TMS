# Vehicle Backend Testing Checklist

## Overview
This document provides a comprehensive testing checklist for the Vehicle Backend System. Use this checklist to systematically test all functionality before deploying to production.

---

## Prerequisites

### Environment Setup
- [ ] Backend server running on port 5000
- [ ] MySQL database accessible
- [ ] JWT authentication configured
- [ ] Postman/Thunder Client installed
- [ ] Valid authentication token obtained

### Database Setup
- [ ] All vehicle-related migrations executed
- [ ] Vehicle type master data seeded
- [ ] Test data seed file ready to run

---

## Phase 1: Database Setup Testing

### Test 1.1: Run Migration Files
`ash
cd tms-backend
npx knex migrate:latest
`
**Expected Result**: All migrations execute successfully without errors

**Verification Queries**:
`sql
-- Check if tables exist
SHOW TABLES LIKE 'vehicle%';

-- Expected tables:
-- vehicle_basic_information_hdr
-- vehicle_basic_information_itm
-- vehicle_ownership_details
-- vehicle_special_permit
-- vehicle_maintenance_service_history
-- vehicle_documents
-- service_frequency_master
-- vehicle_type_master
`

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

### Test 1.2: Seed Test Data
`ash
npx knex seed:run --specific=seed_vehicle_test_data.js
`

**Expected Result**: 
- 3 vehicles created (VEH0001, VEH0002, VEH0003)
- 3 ownership records
- 3 maintenance records
- 3 service frequency records
- 4 documents

**Verification Queries**:
`sql
-- Check vehicles
SELECT vehicle_id_code_hdr, maker_brand_description, maker_model 
FROM vehicle_basic_information_hdr;

-- Expected output:
-- VEH0001 | TATA | LPT 407
-- VEH0002 | Ashok Leyland | Dost Plus
-- VEH0003 | Mahindra | Bolero Pickup

-- Check ownership
SELECT vehicle_id_code, registration_number, ownership_name 
FROM vehicle_ownership_details;

-- Expected output:
-- VEH0001 | MH12AB1234 | ABC Logistics Pvt Ltd
-- VEH0002 | KA09CD5678 | XYZ Transport Services
-- VEH0003 | DL05EF9012 | Rajesh Kumar

-- Check documents count
SELECT COUNT(*) as doc_count FROM vehicle_documents;
-- Expected: 4
`

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

## Phase 2: API Endpoint Testing

### Test 2.1: Get Master Data
**Endpoint**: GET /api/vehicles/master-data

**Postman Configuration**:
`http
GET http://localhost:5000/api/vehicles/master-data
Authorization: Bearer {{token}}
`

**Expected Response** (Status: 200):
`json
{
  "success": true,
  "data": {
    "vehicleTypes": [
      { "vehicle_type_id": "VT001", "vehicle_type_description": "Light Commercial Vehicle" }
    ],
    "documentTypes": [
      { "value": "VEHICLE_INSURANCE", "label": "Vehicle Insurance" },
      ...
    ],
    "fuelTypes": [
      { "value": "DIESEL", "label": "Diesel" },
      ...
    ],
    "transmissionTypes": [...],
    "emissionStandards": [...],
    "usageTypes": [...],
    "suspensionTypes": [...],
    "vehicleConditions": [...]
  }
}
`

**Verification Checklist**:
- [ ] Status code is 200
- [ ] Response has success: true
- [ ] vehicleTypes array contains data from database
- [ ] documentTypes array has at least 10 items
- [ ] fuelTypes array has 6 items (DIESEL, PETROL, CNG, ELECTRIC, HYBRID, LPG)
- [ ] transmissionTypes array has 5 items
- [ ] All arrays properly formatted with value/label pairs

**Status**:  Not Started |  In Progress |  Passed |  Failed

**Notes**: _________________________________

---

### Test 2.2: Get All Vehicles (Basic List)
**Endpoint**: GET /api/vehicles

**Postman Configuration**:
`http
GET http://localhost:5000/api/vehicles?page=1&limit=25
Authorization: Bearer {{token}}
`

**Expected Response** (Status: 200):
`json
{
  "success": true,
  "data": [
    {
      "vehicle_id_code_hdr": "VEH0001",
      "maker_brand_description": "TATA",
      "maker_model": "LPT 407",
      "vin_chassis_no": "MAT123456789012345",
      "vehicle_type_description": "Light Commercial Vehicle",
      "registration_number": "MH12AB1234",
      "ownership_name": "ABC Logistics Pvt Ltd",
      "fuel_type_id": "DIESEL",
      "gvw": 4000,
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 3,
    "totalPages": 1
  }
}
`

**Verification Checklist**:
- [ ] Status code is 200
- [ ] Response has success: true
- [ ] data array contains 3 vehicles
- [ ] Pagination object present with correct values
- [ ] Each vehicle has all required fields
- [ ] Vehicle IDs are VEH0001, VEH0002, VEH0003

**Status**:  Not Started |  In Progress |  Passed |  Failed

**Notes**: _________________________________

---

### Test 2.3: Get All Vehicles (With Search)
**Endpoint**: GET /api/vehicles?search=TATA

**Postman Configuration**:
`http
GET http://localhost:5000/api/vehicles?search=TATA&page=1&limit=25
Authorization: Bearer {{token}}
`

**Expected Response** (Status: 200):
- Only VEH0001 (TATA LPT 407) should be returned
- Total should be 1

**Verification Checklist**:
- [ ] Only TATA vehicle returned
- [ ] Search works for make/brand
- [ ] Pagination total reflects filtered count

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

### Test 2.4: Get All Vehicles (With Filters)
**Endpoint**: GET /api/vehicles?fuelType=DIESEL&status=ACTIVE

**Postman Configuration**:
`http
GET http://localhost:5000/api/vehicles?fuelType=DIESEL&status=ACTIVE
Authorization: Bearer {{token}}
`

**Expected Response** (Status: 200):
- All 3 vehicles should be returned (all are Diesel and Active)

**Verification Checklist**:
- [ ] Filter by fuel type works
- [ ] Filter by status works
- [ ] Multiple filters work together

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

### Test 2.5: Get Vehicle by ID
**Endpoint**: GET /api/vehicles/:id

**Postman Configuration**:
`http
GET http://localhost:5000/api/vehicles/VEH0001
Authorization: Bearer {{token}}
`

**Expected Response** (Status: 200):
`json
{
  "success": true,
  "data": {
    "vehicleId": "VEH0001",
    "basicInformation": {
      "make": "TATA",
      "model": "LPT 407",
      "vin": "MAT123456789012345",
      "vehicleType": "VT001",
      "vehicleCategory": "Light Commercial Vehicle",
      "manufacturingMonthYear": "2023-06",
      "color": "White",
      "gpsIMEI": "123456789012345",
      "gpsActive": true,
      "usageType": "CARGO",
      ...
    },
    "specifications": {
      "engineType": "DIESEL_4CYL",
      "engineNumber": "ENG123456",
      "fuelType": "DIESEL",
      "transmission": "MANUAL",
      "financer": "HDFC Bank",
      "suspensionType": "LEAF_SPRING",
      ...
    },
    "capacityDetails": {
      "unloadingWeight": 1500,
      "gvw": 4000,
      "payloadCapacity": 2500,
      ...
    },
    "ownershipDetails": {
      "ownerId": "OWN0001",
      "ownershipName": "ABC Logistics Pvt Ltd",
      "registrationNumber": "MH12AB1234",
      ...
    },
    "maintenanceHistory": {
      "maintenanceId": "MNT0001",
      "serviceDate": "2024-01-15",
      ...
    },
    "serviceFrequency": {
      "sequenceNumber": 1,
      "timePeriod": "6 months",
      "kmDrove": 10000
    },
    "documents": [
      {
        "documentId": "DOC0001",
        "documentType": "VEHICLE_INSURANCE",
        ...
      }
    ],
    "status": "ACTIVE",
    "blacklistStatus": false
  }
}
`

**Verification Checklist**:
- [ ] Status code is 200
- [ ] All 7 sections present (basicInformation, specifications, capacityDetails, ownershipDetails, maintenanceHistory, serviceFrequency, documents)
- [ ] Payload capacity calculated correctly (GVW - Unloading Weight = 4000 - 1500 = 2500)
- [ ] Documents array contains insurance record
- [ ] All IDs properly formatted (VEH0001, OWN0001, MNT0001, DOC0001)

**Status**:  Not Started |  In Progress |  Passed |  Failed

**Notes**: _________________________________

---

### Test 2.6: Get Vehicle by ID (Non-Existent)
**Endpoint**: GET /api/vehicles/VEH9999

**Expected Response** (Status: 404):
`json
{
  "success": false,
  "message": "Vehicle not found"
}
`

**Verification Checklist**:
- [ ] Status code is 404
- [ ] Error message is clear

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

## Phase 3: Create Vehicle Testing

### Test 3.1: Create Vehicle (Valid Data)
**Endpoint**: POST /api/vehicles

**Postman Configuration**:
`http
POST http://localhost:5000/api/vehicles
Authorization: Bearer {{token}}
Content-Type: application/json

Body:
{
  "basicInformation": {
    "make": "Eicher",
    "model": "Pro 2049",
    "vin": "EIC456789012345678",
    "vehicleType": "VT001",
    "vehicleCategory": "Light Commercial Vehicle",
    "manufacturingMonthYear": "2024-03",
    "color": "Silver",
    "gpsIMEI": "987654321098765",
    "gpsActive": true,
    "usageType": "CARGO",
    "safetyInspectionDate": "2024-09-15",
    "taxesAndFees": 30000
  },
  "specifications": {
    "engineType": "DIESEL_4CYL",
    "engineNumber": "ENG789012",
    "fuelType": "DIESEL",
    "transmission": "MANUAL",
    "financer": "ICICI Bank",
    "suspensionType": "PARABOLIC_LEAF_SPRING"
  },
  "capacityDetails": {
    "unloadingWeight": 1800,
    "gvw": 4500,
    "volumeCapacity": 18.0,
    "towingCapacity": 1200,
    "tireLoadRating": "2500 KG",
    "vehicleCondition": "EXCELLENT",
    "fuelTankCapacity": 70,
    "seatingCapacity": 2
  },
  "ownershipDetails": {
    "ownershipName": "Quick Transport Ltd",
    "validFrom": "2024-03-20",
    "validTo": "2029-03-19",
    "registrationNumber": "TN33CD9876",
    "registrationDate": "2024-03-25",
    "registrationUpto": "2039-03-24",
    "purchaseDate": "2024-03-15",
    "stateCode": "TN",
    "rtoCode": "TN33",
    "saleAmount": 1450000
  },
  "maintenanceHistory": {
    "serviceDate": "2024-03-25",
    "serviceRemark": "Initial inspection and setup",
    "upcomingServiceDate": "2024-09-25",
    "typeOfService": "Complete Service",
    "serviceExpense": 8000
  },
  "serviceFrequency": {
    "timePeriod": "6 months",
    "kmDrove": 5000
  },
  "documents": [
    {
      "documentType": "VEHICLE_INSURANCE",
      "referenceNumber": "INS/2024/TN/987654",
      "permitCategory": "Commercial",
      "permitCode": "COM/TN/2024",
      "documentProvider": "ICICI Lombard General Insurance",
      "coverageType": "COMPREHENSIVE",
      "premiumAmount": 28000,
      "validFrom": "2024-03-25",
      "validTo": "2025-03-24",
      "remarks": "Comprehensive coverage with zero depreciation"
    }
  ]
}
`

**Expected Response** (Status: 201):
`json
{
  "success": true,
  "message": "Vehicle created successfully",
  "data": {
    "vehicleId": "VEH0004"
  }
}
`

**Verification Checklist**:
- [ ] Status code is 201
- [ ] Vehicle ID returned is VEH0004
- [ ] Success message present

**Database Verification**:
`sql
-- Check vehicle created
SELECT * FROM vehicle_basic_information_hdr WHERE vehicle_id_code_hdr = 'VEH0004';

-- Check ownership created
SELECT * FROM vehicle_ownership_details WHERE vehicle_id_code = 'VEH0004';

-- Check maintenance created
SELECT * FROM vehicle_maintenance_service_history WHERE vehicle_id_code = 'VEH0004';

-- Check document created
SELECT * FROM vehicle_documents WHERE vehicle_id_code = 'VEH0004';
`

**Status**:  Not Started |  In Progress |  Passed |  Failed

**Notes**: _________________________________

---

### Test 3.2: Create Vehicle (Missing Required Fields - Make)
**Endpoint**: POST /api/vehicles

**Request Body** (missing make field):
`json
{
  "basicInformation": {
    "model": "Pro 2049",
    "vin": "EIC456789012345679",
    "vehicleType": "VT001",
    ...
  },
  ...
}
`

**Expected Response** (Status: 400):
`json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "field": "basicInformation.make",
      "message": "Make/Brand is required"
    }
  ]
}
`

**Verification Checklist**:
- [ ] Status code is 400
- [ ] Error clearly indicates missing field
- [ ] Field path is correct (basicInformation.make)

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

### Test 3.3: Create Vehicle (Missing Required Fields - VIN)
**Expected Response** (Status: 400):
- Error: "VIN/Chassis Number is required"

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

### Test 3.4: Create Vehicle (Missing Required Fields - Engine Type)
**Expected Response** (Status: 400):
- Error: "Engine Type is required"

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

### Test 3.5: Create Vehicle (Duplicate VIN)
**Request Body**: Same VIN as VEH0001 (MAT123456789012345)

**Expected Response** (Status: 400):
`json
{
  "success": false,
  "message": "Duplicate VIN/Chassis Number",
  "error": "A vehicle with this VIN already exists (Vehicle ID: VEH0001)"
}
`

**Verification Checklist**:
- [ ] Status code is 400
- [ ] Error indicates duplicate VIN
- [ ] Existing vehicle ID provided

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

### Test 3.6: Create Vehicle (Duplicate Registration Number)
**Request Body**: Same registration as VEH0001 (MH12AB1234)

**Expected Response** (Status: 400):
`json
{
  "success": false,
  "message": "Duplicate Registration Number",
  "error": "A vehicle with this registration already exists"
}
`

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

### Test 3.7: Create Vehicle (Duplicate GPS IMEI)
**Request Body**: Same GPS IMEI as VEH0001 (123456789012345)

**Expected Response** (Status: 400):
`json
{
  "success": false,
  "message": "Duplicate GPS IMEI Number",
  "error": "A vehicle with this GPS IMEI already exists"
}
`

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

## Phase 4: Update Vehicle Testing

### Test 4.1: Update Vehicle (Valid Data)
**Endpoint**: PUT /api/vehicles/VEH0001

**Request Body**:
`json
{
  "basicInformation": {
    "make": "TATA",
    "model": "LPT 407 EX",
    "vin": "MAT123456789012345",
    "vehicleType": "VT001",
    "vehicleCategory": "Light Commercial Vehicle",
    "manufacturingMonthYear": "2023-06",
    "color": "Pearl White",
    "gpsIMEI": "123456789012345",
    "gpsActive": true,
    "usageType": "CARGO"
  },
  ...
}
`

**Expected Response** (Status: 200):
`json
{
  "success": true,
  "message": "Vehicle updated successfully",
  "data": {
    "vehicleId": "VEH0001"
  }
}
`

**Verification**:
- Model changed from "LPT 407" to "LPT 407 EX"
- Color changed from "White" to "Pearl White"

**Database Verification**:
`sql
SELECT maker_model, color_of_vehicle 
FROM vehicle_basic_information_hdr 
WHERE vehicle_id_code_hdr = 'VEH0001';
`

**Status**:  Not Started |  In Progress |  Passed |  Failed

**Notes**: _________________________________

---

### Test 4.2: Update Vehicle (Duplicate VIN)
**Endpoint**: PUT /api/vehicles/VEH0002

**Request Body**: Try to change VIN to VEH0001's VIN (MAT123456789012345)

**Expected Response** (Status: 400):
`json
{
  "success": false,
  "message": "Duplicate VIN/Chassis Number",
  "error": "A vehicle with this VIN already exists (Vehicle ID: VEH0001)"
}
`

**Verification Checklist**:
- [ ] Update prevented
- [ ] Original VIN unchanged
- [ ] Clear error message

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

### Test 4.3: Update Vehicle (Non-Existent Vehicle)
**Endpoint**: PUT /api/vehicles/VEH9999

**Expected Response** (Status: 404):
`json
{
  "success": false,
  "message": "Vehicle not found"
}
`

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

## Phase 5: Delete Vehicle Testing

### Test 5.1: Delete Vehicle (Soft Delete)
**Endpoint**: DELETE /api/vehicles/VEH0003

**Expected Response** (Status: 200):
`json
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
`

**Database Verification**:
`sql
-- Check status changed to INACTIVE
SELECT vehicle_id_code_hdr, status 
FROM vehicle_basic_information_hdr 
WHERE vehicle_id_code_hdr = 'VEH0003';

-- Expected: status = 'INACTIVE'

-- Verify record still exists (soft delete)
SELECT COUNT(*) FROM vehicle_basic_information_hdr WHERE vehicle_id_code_hdr = 'VEH0003';
-- Expected: 1
`

**Verification Checklist**:
- [ ] Status code is 200
- [ ] Status changed to INACTIVE
- [ ] Record still exists in database
- [ ] Vehicle no longer appears in active list

**Status**:  Not Started |  In Progress |  Passed |  Failed

**Notes**: _________________________________

---

### Test 5.2: Delete Vehicle (Non-Existent)
**Endpoint**: DELETE /api/vehicles/VEH9999

**Expected Response** (Status: 404):
`json
{
  "success": false,
  "message": "Vehicle not found"
}
`

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

## Phase 6: Integration Testing

### Test 6.1: Complete Vehicle Lifecycle
**Scenario**: Create  Read  Update  Delete

1. **Create** new vehicle (VEH0005)
2. **Read** vehicle details
3. **Update** vehicle information
4. **Delete** vehicle (soft delete)
5. **Verify** vehicle no longer in active list

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

### Test 6.2: Transaction Rollback Test
**Scenario**: Create vehicle with invalid document data

**Expected Behavior**:
- Validation fails
- Transaction rolls back
- No partial data in database
- No orphan records

**Verification**:
`sql
-- Check no partial vehicle created
SELECT COUNT(*) FROM vehicle_basic_information_hdr WHERE status = 'ACTIVE';
-- Should be same count as before test

-- Check no orphan ownership records
SELECT COUNT(*) FROM vehicle_ownership_details WHERE vehicle_id_code NOT IN (
  SELECT vehicle_id_code_hdr FROM vehicle_basic_information_hdr
);
-- Expected: 0
`

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

## Phase 7: Performance Testing

### Test 7.1: Pagination Performance
**Scenario**: Request large page sizes

`http
GET /api/vehicles?page=1&limit=100
`

**Verification**:
- [ ] Response time < 1 second
- [ ] Pagination metadata correct
- [ ] All fields present in response

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

### Test 7.2: Search Performance
**Scenario**: Search across multiple fields

`http
GET /api/vehicles?search=ABC
`

**Verification**:
- [ ] Searches across vehicle ID, make, model, VIN, registration
- [ ] Case-insensitive search works
- [ ] Response time reasonable

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

## Phase 8: Security Testing

### Test 8.1: Authentication Required
**Scenario**: Access endpoints without token

`http
GET http://localhost:5000/api/vehicles
`

**Expected Response** (Status: 401):
`json
{
  "success": false,
  "message": "Authentication required"
}
`

**Verification**:
- [ ] All endpoints require authentication
- [ ] Clear error message for missing token

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

### Test 8.2: Invalid Token
**Scenario**: Use invalid/expired token

`http
GET http://localhost:5000/api/vehicles
Authorization: Bearer invalid_token_here
`

**Expected Response** (Status: 401):
`json
{
  "success": false,
  "message": "Invalid or expired token"
}
`

**Status**:  Not Started |  In Progress |  Passed |  Failed

---

## Test Summary

### Overall Results

| Phase | Total Tests | Passed | Failed | Not Started |
|-------|-------------|---------|---------|-------------|
| Phase 1: Database Setup | 2 | 0 | 0 | 2 |
| Phase 2: API Endpoints | 6 | 0 | 0 | 6 |
| Phase 3: Create Vehicle | 7 | 0 | 0 | 7 |
| Phase 4: Update Vehicle | 3 | 0 | 0 | 3 |
| Phase 5: Delete Vehicle | 2 | 0 | 0 | 2 |
| Phase 6: Integration | 2 | 0 | 0 | 2 |
| Phase 7: Performance | 2 | 0 | 0 | 2 |
| Phase 8: Security | 2 | 0 | 0 | 2 |
| **TOTAL** | **26** | **0** | **0** | **26** |

---

## Critical Issues Log

### Issue 1
**Severity**:  Critical |  Medium |  Low  
**Description**: _________________________________  
**Steps to Reproduce**: _________________________________  
**Expected**: _________________________________  
**Actual**: _________________________________  
**Status**: Open | In Progress | Resolved  
**Resolution**: _________________________________

---

## Next Steps

1.  Complete Phase 1: Database Setup
2.  Complete Phase 2: API Endpoints Basic Testing
3.  Complete Phase 3: Create Vehicle Validation
4.  Complete Phase 4: Update Vehicle Testing
5.  Complete Phase 5: Delete Vehicle Testing
6.  Complete Phase 6: Integration Testing
7.  Complete Phase 7: Performance Testing
8.  Complete Phase 8: Security Testing
9.  Document any issues found
10.  Create frontend integration plan

---

## Additional Notes

- Use consistent test data for reproducibility
- Test in isolated environment before production
- Document all edge cases discovered
- Keep authentication tokens secure
- Clear test data between test runs if needed

---

**Document Version**: 1.0  
**Last Updated**: November 5, 2025  
**Tester**: _________________________________  
**Testing Environment**: Development / Staging / Production
