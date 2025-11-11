# Vehicle Backend Quick Start Guide

##  Getting Started in 5 Minutes

This guide will help you quickly set up and test the Vehicle Backend System.

---

## Prerequisites

 Node.js installed (v14+)  
 MySQL running  
 Backend server configured  
 Database credentials in .env file

---

## Step 1: Database Setup (2 minutes)

### Run Migrations

`ash
cd tms-backend
npx knex migrate:latest
`

**Expected Output**:
`
Batch 1 run: 8 migrations
 012_create_service_frequency_master.js
 013_create_vehicle_basic_information_hdr.js
 014_create_vehicle_basic_information_itm.js
 015_create_vehicle_special_permit.js
 016_create_vehicle_ownership_details.js
 017_create_vehicle_maintenance_service_history.js
 018_create_vehicle_documents.js
 (vehicle_type_master migration)
`

### Seed Test Data

`ash
npx knex seed:run --specific=seed_vehicle_test_data.js
`

**Expected Output**:
`
Ran 1 seed files
 seed_vehicle_test_data.js
`

**Test Data Created**:
- 3 vehicles (VEH0001, VEH0002, VEH0003)
- 3 ownership records
- 3 maintenance records
- 4 documents

---

## Step 2: Start the Server (1 minute)

`ash
# If not already running
npm start
`

**Expected Output**:
`
Server running on port 5000
Database connected successfully
`

---

## Step 3: Quick API Test (2 minutes)

### Option A: Using cURL

**Get Master Data**:
`ash
curl -X GET http://localhost:5000/api/vehicles/master-data \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`

**Get All Vehicles**:
`ash
curl -X GET "http://localhost:5000/api/vehicles?page=1&limit=25" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`

**Get Vehicle by ID**:
`ash
curl -X GET http://localhost:5000/api/vehicles/VEH0001 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`

### Option B: Using PowerShell

**Get Master Data**:
`powershell
 = @{ Authorization = "Bearer YOUR_TOKEN_HERE" }
Invoke-RestMethod -Uri "http://localhost:5000/api/vehicles/master-data" -Headers  -Method Get
`

**Get All Vehicles**:
`powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/vehicles?page=1&limit=25" -Headers  -Method Get
`

---

## Step 4: Verify Setup

### Check Database Tables

`sql
-- Check vehicles exist
SELECT vehicle_id_code_hdr, maker_brand_description, maker_model 
FROM vehicle_basic_information_hdr;

-- Expected output:
-- VEH0001 | TATA | LPT 407
-- VEH0002 | Ashok Leyland | Dost Plus
-- VEH0003 | Mahindra | Bolero Pickup
`

### Check API Response

If you get a response with "success": true and data, you're all set! 

---

## Common Commands Reference

### Database Operations

`ash
# Run migrations
npx knex migrate:latest

# Rollback last migration
npx knex migrate:rollback

# Check migration status
npx knex migrate:status

# Run seed
npx knex seed:run --specific=seed_vehicle_test_data.js

# Rollback and re-seed (fresh start)
npx knex migrate:rollback --all
npx knex migrate:latest
npx knex seed:run --specific=seed_vehicle_test_data.js
`

### Server Operations

`ash
# Start server
npm start

# Start with nodemon (auto-reload)
npm run dev

# Check for errors
npm run lint
`

---

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/vehicles/master-data | Get dropdown options |
| GET | /api/vehicles | List all vehicles (paginated) |
| GET | /api/vehicles/:id | Get vehicle details |
| POST | /api/vehicles | Create new vehicle |
| PUT | /api/vehicles/:id | Update vehicle |
| DELETE | /api/vehicles/:id | Delete vehicle (soft) |

**All endpoints require JWT authentication!**

---

## Sample Request Bodies

### Create Vehicle (Minimal Required Fields)

`json
{
  "basicInformation": {
    "make": "TATA",
    "model": "LPT 407",
    "vin": "UNIQUE_VIN_123456",
    "vehicleType": "VT001",
    "manufacturingMonthYear": "2023-06",
    "gpsIMEI": "UNIQUE_IMEI_12345",
    "gpsActive": true,
    "usageType": "CARGO"
  },
  "specifications": {
    "engineType": "DIESEL_4CYL",
    "engineNumber": "ENG123456",
    "fuelType": "DIESEL",
    "transmission": "MANUAL",
    "financer": "HDFC Bank",
    "suspensionType": "LEAF_SPRING"
  },
  "capacityDetails": {
    "unloadingWeight": 1500,
    "gvw": 4000
  },
  "ownershipDetails": {
    "ownershipName": "Test Company",
    "registrationNumber": "UNIQUE_REG_123"
  },
  "maintenanceHistory": {
    "serviceDate": "2024-01-15",
    "upcomingServiceDate": "2024-07-15"
  }
}
`

---

## Troubleshooting

### Issue: "Authentication required"
**Solution**: Make sure you're sending the JWT token in the Authorization header:
`
Authorization: Bearer YOUR_JWT_TOKEN
`

### Issue: "Duplicate VIN/Chassis Number"
**Solution**: Each vehicle must have a unique VIN. Change the in field to a unique value.

### Issue: "Validation errors"
**Solution**: Check that all required fields are provided:
- Basic Info: make, model, vin, vehicleType, manufacturingMonthYear, gpsIMEI, gpsActive, usageType
- Specifications: engineType, engineNumber, fuelType, transmission, financer, suspensionType
- Maintenance: serviceDate, upcomingServiceDate

### Issue: "Vehicle not found"
**Solution**: Verify the vehicle ID exists using:
`sql
SELECT vehicle_id_code_hdr FROM vehicle_basic_information_hdr;
`

### Issue: "Cannot connect to database"
**Solution**: Check your .env file has correct database credentials:
`env
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=tms_database
`

---

## Testing Checklist

Before deploying to production, test these scenarios:

- [ ] Create vehicle with all required fields 
- [ ] Create vehicle missing required fields (should fail) 
- [ ] Create vehicle with duplicate VIN (should fail) 
- [ ] Get all vehicles with pagination
- [ ] Get vehicle by ID
- [ ] Update vehicle information
- [ ] Delete vehicle (soft delete)
- [ ] Search vehicles by make/model
- [ ] Filter vehicles by type/status

---

## File Structure Overview

`
tms-backend/
 controllers/
    vehicleController.js        # 900+ lines - All CRUD operations
 routes/
    vehicles.js                 # API route definitions
 migrations/
    012_create_service_frequency_master.js
    013_create_vehicle_basic_information_hdr.js
    014_create_vehicle_basic_information_itm.js
    015_create_vehicle_special_permit.js
    016_create_vehicle_ownership_details.js
    017_create_vehicle_maintenance_service_history.js
    018_create_vehicle_documents.js
 seeds/
    seed_vehicle_test_data.js   # Test data - 3 vehicles
 server.js                        # Routes registered here
`

---

## Key Functions in vehicleController.js

| Function | Purpose | Lines |
|----------|---------|-------|
| generateVehicleId() | Auto-generate VEH0001, VEH0002 | ~20 |
| alidateBasicInformation() | Validate required fields | ~40 |
| checkDuplicateVIN() | Prevent duplicate chassis numbers | ~20 |
| createVehicle() | Create new vehicle (transaction) | ~180 |
| getAllVehicles() | List with pagination/filters | ~80 |
| getVehicleById() | Get complete vehicle details | ~130 |
| updateVehicle() | Update vehicle (transaction) | ~140 |
| deleteVehicle() | Soft delete (set status=INACTIVE) | ~35 |
| getMasterData() | Get dropdown options | ~80 |

---

## Database Tables Used

| Table | Purpose | Foreign Key |
|-------|---------|-------------|
| ehicle_basic_information_hdr | Main vehicle data | - |
| ehicle_basic_information_itm | Insurance details | vehicle_id_code_hdr |
| ehicle_ownership_details | Registration, owner info | vehicle_id_code |
| ehicle_special_permit | Permits | vehicle_id_code_hdr |
| ehicle_maintenance_service_history | Service records | vehicle_id_code |
| service_frequency_master | Service intervals | vehicle_id |
| ehicle_documents | Document storage | vehicle_id_code |
| ehicle_type_master | Vehicle types (master) | - |

---

## Next Steps

1.  Complete database setup
2.  Test all API endpoints
3.  Integrate with frontend
4.  Update Redux slice (vehicleSlice.js)
5.  Update CreateVehiclePage.jsx form
6.  Test complete flow (frontend  backend  database)

---

## Support & Documentation

- **Full Documentation**: VEHICLE_BACKEND_SYSTEM_DOCUMENTATION.md
- **Testing Guide**: VEHICLE_BACKEND_TESTING_CHECKLIST.md
- **Project Overview**: .github/copilot-instructions.md

---

## Quick Debug Queries

`sql
-- Get all vehicles
SELECT * FROM vehicle_basic_information_hdr;

-- Get vehicles with ownership info
SELECT 
  v.vehicle_id_code_hdr,
  v.maker_brand_description,
  v.maker_model,
  o.registration_number,
  o.ownership_name
FROM vehicle_basic_information_hdr v
LEFT JOIN vehicle_ownership_details o ON v.vehicle_id_code_hdr = o.vehicle_id_code;

-- Count active vehicles
SELECT COUNT(*) as active_count 
FROM vehicle_basic_information_hdr 
WHERE status = 'ACTIVE';

-- Check for duplicate VINs
SELECT vin_chassis_no, COUNT(*) as count
FROM vehicle_basic_information_hdr
GROUP BY vin_chassis_no
HAVING count > 1;

-- Check for orphan records
SELECT 'ownership' as table_name, COUNT(*) as orphans
FROM vehicle_ownership_details 
WHERE vehicle_id_code NOT IN (SELECT vehicle_id_code_hdr FROM vehicle_basic_information_hdr)
UNION ALL
SELECT 'documents', COUNT(*)
FROM vehicle_documents
WHERE vehicle_id_code NOT IN (SELECT vehicle_id_code_hdr FROM vehicle_basic_information_hdr);
`

---

## Success Metrics

Your setup is successful when:

 All migrations run without errors  
 Seed data creates 3 vehicles  
 GET /api/vehicles returns 3 vehicles  
 GET /api/vehicles/VEH0001 returns complete vehicle data  
 POST /api/vehicles creates VEH0004  
 All validation checks work (duplicate VIN, missing fields)

---

**Happy Coding! **

For questions or issues, refer to the comprehensive documentation or contact the development team.

---

**Document Version**: 1.0  
**Last Updated**: November 5, 2025  
**Author**: TMS Development Team
