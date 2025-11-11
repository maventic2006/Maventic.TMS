# Vehicle Backend System Documentation

## Overview

This document provides comprehensive documentation for the Vehicle Management System backend implementation, following industry-standard practices and patterns consistent with the existing Transporter and Driver modules.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Controller Functions](#controller-functions)
5. [Validation Rules](#validation-rules)
6. [Testing](#testing)
7. [Deployment](#deployment)

---

## Architecture Overview

### Design Principles

- **Modular Architecture**: Separation of concerns with dedicated controllers, routes, and utilities
- **Transaction Management**: All multi-table operations wrapped in database transactions
- **Comprehensive Validation**: Field-level and business logic validation
- **Duplicate Prevention**: Checks for unique constraints (VIN, Registration, GPS IMEI)
- **Soft Deletes**: Status-based deletion for data integrity
- **Audit Trail**: Automatic tracking of created_by, updated_by, timestamps

### Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MySQL with Knex.js query builder
- **Authentication**: JWT-based authentication middleware
- **Validation**: Custom validators with detailed error messages

---

## Database Schema

### Tables Structure

The vehicle system uses **8 primary tables** with well-defined relationships:

#### 1. vehicle_basic_information_hdr
**Primary table for vehicle core information**

Key Fields:
- ehicle_id_code_hdr (PK, Unique) - Format: VEH0001, VEH0002
- in_chassis_no (Unique) - Vehicle Identification Number
- maker_brand_description - Make/Brand (e.g., TATA, Ashok Leyland)
- maker_model - Model name
- ehicle_type_id (FK) - References vehicle_type_master
- manufacturing_month_year - Manufacturing date
- gps_tracker_imei_number (Unique) - GPS IMEI
- usage_type_id - PASSENGER, CARGO, SPECIAL_EQUIPMENT
- All audit fields (created_at, created_by, updated_at, updated_by, status)

#### 2. vehicle_basic_information_itm
**Insurance details (child table)**

Key Fields:
- ehicle_id_code_hdr (FK)
- insurance_provider
- policy_number
- coverage_type
- policy_expiry_date
- premium_amount

#### 3. vehicle_ownership_details
**Ownership and registration information**

Key Fields:
- ehicle_ownership_id (PK) - Format: OWN0001
- ehicle_id_code (FK) - References vehicle_id_code_hdr
- egistration_number (Unique) - Vehicle registration
- ownership_name - Owner name
- alid_from, alid_to - Ownership validity period
- egistration_date, egistration_upto - Registration dates
- state_code, to_code - RTO details
- sale_amount - Purchase/Sale amount

#### 4. vehicle_special_permit
**Special permits and authorizations**

Key Fields:
- ehicle_permit_id (PK) - Format: PRM0001
- ehicle_id_code_hdr (FK)
- permit_number (Unique)
- permit_category, permit_code
- alid_from, alid_to - Permit validity

#### 5. vehicle_maintenance_service_history
**Service and maintenance records**

Key Fields:
- ehicle_maintenance_id (PK) - Format: MNT0001
- ehicle_id_code (FK)
- service_date - Last service date (mandatory)
- upcoming_service_date - Next service due (mandatory)
- 	ype_of_service - Type of service performed
- service_expense - Cost of service
- service_remark - Service notes

#### 6. service_frequency_master
**Service frequency tracking**

Key Fields:
- ehicle_id (FK)
- sequence_number - Auto-generated sequence
- 	ime_period - Service interval (e.g., "6 months")
- km_drove - Kilometers driven

#### 7. vehicle_documents
**Document management**

Key Fields:
- document_id (PK) - Format: DOC0001
- ehicle_id_code (FK)
- document_type_id - Type of document
- eference_number - Policy/Permit number
- ehicle_maintenance_id - Link to maintenance
- permit_category, permit_code
- document_provider - Insurance/Document provider
- coverage_type_id - Insurance coverage type
- premium_amount - Insurance premium
- alid_from, alid_to (Mandatory) - Validity dates
- emarks (Mandatory) - Document notes

#### 8. vehicle_type_master
**Master data for vehicle types**

Key Fields:
- ehicle_type_id (PK)
- ehicle_type_description
- Status and audit fields

### Database Relationships

`
vehicle_basic_information_hdr (1)
     vehicle_basic_information_itm (Many)
     vehicle_ownership_details (1)
     vehicle_special_permit (Many)
     vehicle_maintenance_service_history (Many)
     service_frequency_master (Many)
     vehicle_documents (Many)

vehicle_type_master (1)  vehicle_basic_information_hdr (Many)
`

### Unique Constraints

1. in_chassis_no - Must be unique across all vehicles
2. egistration_number - Must be unique across ownership records
3. gps_tracker_imei_number - Must be unique across all vehicles
4. permit_number - Must be unique across permits

---

## API Endpoints

### Base URL
/api/vehicles (or /api/vehicle based on frontend configuration)

### Endpoints

#### 1. Get Master Data
`http
GET /api/vehicles/master-data
`

**Authentication**: Required

**Response**: Master data for dropdowns
`json
{
  "success": true,
  "data": {
    "vehicleTypes": [...],
    "documentTypes": [...],
    "fuelTypes": [...],
    "transmissionTypes": [...],
    "emissionStandards": [...],
    "usageTypes": [...],
    "suspensionTypes": [...],
    "vehicleConditions": [...]
  }
}
`

#### 2. Get All Vehicles
`http
GET /api/vehicles?page=1&limit=25&search=VEH001&vehicleType=VT001&status=ACTIVE
`

**Authentication**: Required

**Query Parameters**:
- page (number) - Page number (default: 1)
- limit (number) - Items per page (default: 25)
- search (string) - Search by vehicle ID, make, model, VIN, registration
- ehicleType (string) - Filter by vehicle type
- status (string) - Filter by status (ACTIVE, INACTIVE)
- uelType (string) - Filter by fuel type
- sortBy (string) - Sort field (default: created_at)
- sortOrder (string) - Sort order: asc/desc (default: desc)

**Response**:
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
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 50,
    "totalPages": 2
  }
}
`

#### 3. Get Vehicle by ID
`http
GET /api/vehicles/:id
`

**Authentication**: Required

**Parameters**:
- id (string) - Vehicle ID (e.g., VEH0001)

**Response**:
`json
{
  "success": true,
  "data": {
    "vehicleId": "VEH0001",
    "basicInformation": { ... },
    "specifications": { ... },
    "capacityDetails": { ... },
    "ownershipDetails": { ... },
    "maintenanceHistory": { ... },
    "serviceFrequency": { ... },
    "documents": [ ... ],
    "status": "ACTIVE",
    "blacklistStatus": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
`

#### 4. Create Vehicle
`http
POST /api/vehicles
`

**Authentication**: Required

**Request Body**:
`json
{
  "basicInformation": {
    "make": "TATA",
    "model": "LPT 407",
    "vin": "MAT123456789012345",
    "vehicleType": "VT001",
    "vehicleCategory": "Light Commercial Vehicle",
    "manufacturingMonthYear": "2023-06",
    "gpsIMEI": "123456789012345",
    "gpsActive": true,
    "usageType": "CARGO",
    "safetyInspectionDate": "2024-06-15",
    "taxesAndFees": 25000,
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
    "volumeCapacity": 15.5,
    "towingCapacity": 1000,
    "tireLoadRating": "2000 KG",
    "vehicleCondition": "GOOD",
    "fuelTankCapacity": 60,
    "seatingCapacity": 2,
    ...
  },
  "ownershipDetails": {
    "ownershipName": "ABC Logistics Pvt Ltd",
    "validFrom": "2023-06-15",
    "validTo": "2028-06-14",
    "registrationNumber": "MH12AB1234",
    "registrationDate": "2023-06-20",
    "registrationUpto": "2038-06-19",
    "purchaseDate": "2023-06-10",
    "stateCode": "MH",
    "rtoCode": "MH12",
    "saleAmount": 1250000,
    ...
  },
  "maintenanceHistory": {
    "serviceDate": "2024-01-15",
    "serviceRemark": "Regular maintenance",
    "upcomingServiceDate": "2024-07-15",
    "typeOfService": "Oil Change",
    "serviceExpense": 5000
  },
  "serviceFrequency": {
    "timePeriod": "6 months",
    "kmDrove": 10000
  },
  "documents": [
    {
      "documentType": "VEHICLE_INSURANCE",
      "referenceNumber": "INS/2023/MH/123456",
      "vehicleMaintenanceId": "MNT0001",
      "permitCategory": "Commercial",
      "permitCode": "COM/MH/2023",
      "documentProvider": "HDFC ERGO General Insurance",
      "coverageType": "COMPREHENSIVE",
      "premiumAmount": 25000,
      "validFrom": "2023-06-20",
      "validTo": "2024-06-19",
      "remarks": "Comprehensive insurance coverage"
    }
  ]
}
`

**Response**:
`json
{
  "success": true,
  "message": "Vehicle created successfully",
  "data": {
    "vehicleId": "VEH0004"
  }
}
`

**Error Response**:
`json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "field": "basicInformation.make",
      "message": "Make/Brand is required"
    },
    {
      "field": "basicInformation.vin",
      "message": "VIN/Chassis Number is required"
    }
  ]
}
`

#### 5. Update Vehicle
`http
PUT /api/vehicles/:id
`

**Authentication**: Required

**Parameters**:
- id (string) - Vehicle ID

**Request Body**: Same structure as Create Vehicle

**Response**:
`json
{
  "success": true,
  "message": "Vehicle updated successfully",
  "data": {
    "vehicleId": "VEH0001"
  }
}
`

#### 6. Delete Vehicle (Soft Delete)
`http
DELETE /api/vehicles/:id
`

**Authentication**: Required

**Parameters**:
- id (string) - Vehicle ID

**Response**:
`json
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
`

---

## Controller Functions

### Utility Functions

#### 1. generateVehicleId()
`javascript
Format: VEH0001, VEH0002, etc.
Auto-increments based on existing records
`

#### 2. generateOwnershipId()
`javascript
Format: OWN0001, OWN0002, etc.
`

#### 3. generateMaintenanceId()
`javascript
Format: MNT0001, MNT0002, etc.
`

#### 4. generatePermitId()
`javascript
Format: PRM0001, PRM0002, etc.
`

#### 5. generateDocumentId()
`javascript
Format: DOC0001, DOC0002, etc.
`

#### 6. generateSequenceNumber(vehicleId)
`javascript
Auto-increments per vehicle
Used for service frequency tracking
`

### Validation Functions

#### 1. validateBasicInformation(data)
Validates:
- Make/Brand (required)
- Maker Model (required)
- VIN/Chassis Number (required)
- Vehicle Type (required)
- Manufacturing Month & Year (required)
- GPS Tracker IMEI (required)
- GPS Tracker Active Flag (required)
- Usage Type (required)

#### 2. validateSpecifications(data)
Validates:
- Engine Type (required)
- Engine Number (required)
- Fuel Type (required)
- Transmission Type (required)
- Financer (required)
- Suspension Type (required)

#### 3. checkDuplicateVIN(vin, excludeVehicleId)
Checks if VIN already exists in database

#### 4. checkDuplicateRegistration(regNumber, excludeVehicleId)
Checks if registration number already exists

#### 5. checkDuplicateGPSIMEI(imei, excludeVehicleId)
Checks if GPS IMEI already exists

---

## Validation Rules

### Mandatory Fields

**Basic Information:**
- Make/Brand Description 
- Maker Model 
- VIN/Chassis Number 
- Vehicle Type 
- Manufacturing Month & Year 
- GPS Tracker IMEI Number 
- GPS Tracker Active Flag 
- Usage Type 

**Specifications:**
- Engine Type 
- Engine Number 
- Fuel Type 
- Transmission Type 
- Financer 
- Suspension Type 

**Documents:**
- Document Type 
- Valid From 
- Valid To 
- Remarks 
- Upload Document 

**Maintenance History:**
- Service Date 
- Upcoming Service Date 

### Unique Constraints

1. **VIN/Chassis Number** - Must be unique across all vehicles
2. **Registration Number** - Must be unique across ownership records
3. **GPS IMEI Number** - Must be unique across all vehicles
4. **Permit Number** - Must be unique across permits

### Business Rules

1. **Payload Capacity Calculation**
   `javascript
   payloadCapacity = GVW - Unloading Weight
   `

2. **System Generated IDs**
   - Owner ID: Auto-generated (OWN0001)
   - Sequence Number: Auto-generated per vehicle

3. **Soft Delete**
   - Status set to 'INACTIVE' instead of physical deletion
   - Maintains data integrity and audit trail

4. **Transaction Management**
   - All multi-table operations wrapped in transactions
   - Rollback on any error to maintain consistency

---

## Testing

### Running Seeds

`ash
# Seed vehicle test data
cd tms-backend
npx knex seed:run --specific=seed_vehicle_test_data.js
`

### Test Data

The seed file creates:
- **3 vehicles** with different makes, models, and configurations
- **3 ownership records** with unique registration numbers
- **3 maintenance records** with service history
- **3 service frequency records**
- **4 documents** (insurance, PUC, fitness certificates)

### API Testing

#### Using Postman/Thunder Client

**1. Test Master Data**
`http
GET {{baseURL}}/api/vehicles/master-data
Authorization: Bearer {{token}}
`

**2. Test Create Vehicle**
`http
POST {{baseURL}}/api/vehicles
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "basicInformation": { ... },
  "specifications": { ... },
  ...
}
`

**3. Test Get All Vehicles**
`http
GET {{baseURL}}/api/vehicles?page=1&limit=25
Authorization: Bearer {{token}}
`

**4. Test Get Vehicle by ID**
`http
GET {{baseURL}}/api/vehicles/VEH0001
Authorization: Bearer {{token}}
`

**5. Test Update Vehicle**
`http
PUT {{baseURL}}/api/vehicles/VEH0001
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "basicInformation": { ... },
  ...
}
`

**6. Test Delete Vehicle**
`http
DELETE {{baseURL}}/api/vehicles/VEH0001
Authorization: Bearer {{token}}
`

### Validation Testing

Test cases to verify:
1.  Create vehicle with all required fields
2.  Create vehicle missing required fields (should fail)
3.  Create vehicle with duplicate VIN (should fail)
4.  Create vehicle with duplicate Registration Number (should fail)
5.  Create vehicle with duplicate GPS IMEI (should fail)
6.  Update vehicle with valid data
7.  Update vehicle with duplicate VIN (should fail)
8.  Soft delete vehicle (status should be INACTIVE)

---

## Deployment

### Environment Variables

`env
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=tms_database
JWT_SECRET=your_jwt_secret
`

### Production Checklist

- [ ] Run all migrations
- [ ] Seed master data (vehicle types)
- [ ] Configure JWT secret
- [ ] Set up database connections
- [ ] Enable CORS for frontend origin
- [ ] Configure logging
- [ ] Set up error monitoring
- [ ] Test all API endpoints
- [ ] Verify duplicate checks are working
- [ ] Test transaction rollbacks
- [ ] Verify soft delete functionality

### Performance Optimization

1. **Database Indexes**
   - All foreign keys indexed
   - Unique constraints on VIN, Registration, GPS IMEI
   - Indexes on frequently queried fields

2. **Query Optimization**
   - Use of Knex query builder for optimized queries
   - Proper use of JOINs for related data
   - Pagination for large datasets

3. **Transaction Management**
   - Minimal transaction scope
   - Proper rollback handling
   - Connection pooling

---

## Integration with Frontend

### Redux Slice Required

Create ehicleSlice.js with:
- createVehicle thunk
- getAllVehicles thunk
- getVehicleById thunk
- updateVehicle thunk
- deleteVehicle thunk
- getMasterData thunk

### API Client Configuration

Update utils/api.js:
`javascript
// Vehicle endpoints
export const vehicleAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(/vehicles/),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(/vehicles/, data),
  delete: (id) => api.delete(/vehicles/),
  getMasterData: () => api.get('/vehicles/master-data'),
};
`

---

## Troubleshooting

### Common Issues

**1. Duplicate Key Errors**
- Check VIN, Registration Number, GPS IMEI for duplicates
- Verify unique constraints in database

**2. Validation Errors**
- Ensure all required fields are provided
- Check field naming matches exactly (camelCase)

**3. Transaction Rollback**
- Check database connection
- Verify all foreign key relationships exist
- Review error logs for specific issues

**4. Authentication Errors**
- Verify JWT token is valid
- Check token expiration
- Ensure authorization header is set

---

## Code Quality Standards

### Naming Conventions
- **Functions**: camelCase (e.g., createVehicle)
- **Constants**: UPPER_SNAKE_CASE (e.g., VEHICLE_STATUS)
- **Database Fields**: snake_case (e.g., ehicle_id_code_hdr)
- **Frontend Fields**: camelCase (e.g., ehicleId)

### Documentation
- JSDoc comments for all functions
- Inline comments for complex logic
- API endpoint documentation
- Database schema documentation

### Error Handling
- Try-catch blocks for all async operations
- Transaction rollback on errors
- Descriptive error messages
- Proper HTTP status codes

### Code Organization
- Modular structure (controllers, routes, utils)
- Separation of concerns
- Reusable utility functions
- Consistent patterns across modules

---

## Conclusion

The Vehicle Backend System is built with industry-standard practices, comprehensive validation, and robust error handling. It follows the same patterns as the existing Transporter and Driver modules, ensuring consistency across the TMS application.

For support or questions, refer to the main project documentation or contact the development team.

---

**Document Version**: 1.0  
**Last Updated**: November 5, 2025  
**Author**: TMS Development Team
