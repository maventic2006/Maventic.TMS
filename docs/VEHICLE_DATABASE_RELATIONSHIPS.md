#  Vehicle Database Tables - Complete Relationship Analysis

**Date**: November 6, 2025  
**Database**: tms_dev (MySQL)  
**Total Vehicle Tables**: 8 Core + 2 Master Reference Tables

---

##  TABLE OVERVIEW

### Core Vehicle Tables (8)
1. **vehicle_basic_information_hdr** (Header) - PRIMARY PARENT TABLE
2. **vehicle_basic_information_itm** (Item) - Vehicle insurance details
3. **vehicle_special_permit** - Permit information
4. **vehicle_ownership_details** - Registration & ownership
5. **vehicle_maintenance_service_history** - Service records
6. **service_frequency_master** - Service schedule configuration
7. **vehicle_documents** - Document attachments
8. **vehicle_capacity_details** (Referenced but not found in schema - may be columns in HDR)

### Master Reference Tables (2)
9. **vehicle_type_master** - Vehicle type definitions (for indent)
10. **usage_type_master** - Usage type definitions (PASSENGER/CARGO/SPECIAL_EQUIPMENT)

---

##  RELATIONSHIP HIERARCHY

### Central Hub: ehicle_basic_information_hdr

`
                    vehicle_basic_information_hdr (PARENT)
                     Primary Key: vehicle_id_code_hdr
                           
                           [1:1]> vehicle_basic_information_itm
                                       FK: vehicle_id_code_hdr
                           
                           [1:N]> vehicle_special_permit
                                       FK: vehicle_id_code_hdr
                           
                           [1:N]> vehicle_ownership_details
                                       FK: vehicle_id_code (maps to vehicle_id_code_hdr)
                                       UNIQUE: registration_number
                           
                           [1:N]> vehicle_maintenance_service_history
                                       FK: vehicle_id_code (maps to vehicle_id_code_hdr)
                           
                           [1:N]> service_frequency_master
                                       FK: vehicle_id (maps to vehicle_id_code_hdr)
                           
                           [1:N]> vehicle_documents
                                       FK: vehicle_id_code (implicitly via maintenance_id)
                           
                           [N:1]< vehicle_type_master
                                       FK: vehicle_type_id  vehicle_type_id
                           
                           [N:1]< usage_type_master
                                       FK: usage_type_id  usage_type_id
                           
                           [1:N]> transporter_vehicle_mapping
                                       FK: vehicle_id  vehicle_id_code_hdr
                           
                           [1:N]> vehicle_driver_mapping
                                        FK: vehicle_id  vehicle_id_code_hdr
`

---

##  DETAILED TABLE RELATIONSHIPS

### 1. ehicle_basic_information_hdr (PRIMARY PARENT)

**Purpose**: Core vehicle master data - basic information, specifications, and capacity

**Primary Key**: ehicle_id_code_hdr (VARCHAR(20))  
**Format**: VEH0001, VEH0002, VEH0003, etc.

**Key Fields**:
- maker_brand_description - Make/Brand (e.g., TATA, ASHOK LEYLAND)
- maker_model - Model name (e.g., LPT 407, DOST)
- in_chassis_no - VIN/Chassis number (UNIQUE, NOT NULL)
- ehicle_type_id - FK to vehicle_type_master
- usage_type_id - FK to usage_type_master
- engine_number - Engine number (NOT NULL)
- engine_type_id - FK to engine_type_master
- uel_type_id - FK to fuel_type_master
- gps_tracker_imei_number - GPS IMEI (UNIQUE, NOT NULL)
- gps_tracker_active_flag - GPS status (BOOLEAN)
- manufacturing_month_year - Manufacturing date (VARCHAR "YYYY-MM")
- Capacity fields: unloading_weight, gross_vehicle_weight_kg, olume_capacity_cubic_meter
- Status fields: lacklist_status, status

**Foreign Keys OUT (References TO Master Tables)**:
- ehicle_type_id  ehicle_type_master.vehicle_type_id
- usage_type_id  usage_type_master.usage_type_id
- engine_type_id  engine_type_master.engine_type_id
- uel_type_id  uel_type_master.fuel_type_id

**Foreign Keys IN (Referenced BY Child Tables)**:
- ehicle_basic_information_itm.vehicle_id_code_hdr
- ehicle_special_permit.vehicle_id_code_hdr
- ehicle_ownership_details.vehicle_id_code
- ehicle_maintenance_service_history.vehicle_id_code
- service_frequency_master.vehicle_id
- 	ransporter_vehicle_mapping.vehicle_id
- ehicle_driver_mapping.vehicle_id

**Unique Constraints**:
- in_chassis_no - No duplicate VINs allowed
- gps_tracker_imei_number - No duplicate GPS devices

**Indexes**:
- PRIMARY: ehicle_id_code_hdr
- UNIQUE: in_chassis_no, gps_tracker_imei_number
- INDEX: ehicle_type_id, usage_type_id, uel_type_id, status

---

### 2. ehicle_basic_information_itm (CHILD - INSURANCE)

**Purpose**: Vehicle insurance policy information (Item-level details)

**Relationship**: **1:1** with ehicle_basic_information_hdr  
**Cardinality**: One vehicle header can have one insurance item record

**Primary Key**: ehicle_item_unique_id (INT AUTO_INCREMENT)  
**Business Key**: ehicle_id_code_itm (VARCHAR(20))

**Foreign Key**:
`sql
vehicle_id_code_hdr  vehicle_basic_information_hdr.vehicle_id_code_hdr
ON DELETE: Not specified (likely RESTRICT)
ON UPDATE: Not specified (likely CASCADE)
`

**Key Fields**:
- ehicle_id_code_itm - Item ID (UNIQUE)
- ehicle_id_code_hdr - FK to parent (INDEXED)
- insurance_provider - Insurance company name
- policy_number - Policy number (INDEXED, can be used for search)
- coverage_type - Type of coverage (Comprehensive, Third-party, etc.)
- policy_expiry_date - Expiry date

**Use Case**: Store insurance-specific details separately from main vehicle data

**Indexes**:
- PRIMARY: ehicle_item_unique_id
- UNIQUE: ehicle_id_code_itm
- INDEX: ehicle_id_code_hdr, policy_number

---

### 3. ehicle_special_permit (CHILD - PERMITS)

**Purpose**: Special permits for vehicle operation (National Permit, State Permit, etc.)

**Relationship**: **1:N** with ehicle_basic_information_hdr  
**Cardinality**: One vehicle can have MULTIPLE permits (different states, routes, etc.)

**Primary Key**: ehicle_permit_unique_id (INT AUTO_INCREMENT)  
**Business Key**: ehicle_permit_id (VARCHAR(20), UNIQUE)  
**Format**: PRM0001, PRM0002, PRM0003, etc.

**Foreign Key**:
`sql
vehicle_id_code_hdr  vehicle_basic_information_hdr.vehicle_id_code_hdr
ON DELETE: Not specified (likely RESTRICT)
ON UPDATE: Not specified (likely CASCADE)
`

**Key Fields**:
- ehicle_permit_id - Permit ID (UNIQUE)
- ehicle_id_code_hdr - FK to vehicle (INDEXED)
- permit_category - Category (National, State, Tourist, Goods, etc.)
- permit_code - Permit code identifier
- permit_issue_date - Issue date
- permit_number - Official permit number (UNIQUE, INDEXED)
- permit_expiry_date - Expiry date
- issuing_authority - Authority that issued permit
- emarks - Additional notes

**Unique Constraints**:
- permit_number - No duplicate permit numbers across system

**Indexes**:
- PRIMARY: ehicle_permit_unique_id
- UNIQUE: ehicle_permit_id, permit_number
- INDEX: ehicle_id_code_hdr, permit_category

**Use Case**: Track multiple permits per vehicle, prevent permit expiry

---

### 4. ehicle_ownership_details (CHILD - REGISTRATION)

**Purpose**: Vehicle ownership, registration, and RTO details

**Relationship**: **1:N** with ehicle_basic_information_hdr  
**Cardinality**: One vehicle can have MULTIPLE ownership records (ownership transfers over time)

**Primary Key**: ehicle_ownership_unique_id (INT AUTO_INCREMENT)  
**Business Key**: ehicle_ownership_id (VARCHAR(20), UNIQUE)  
**Format**: OWN0001, OWN0002, OWN0003, etc.

**Foreign Key**:
`sql
vehicle_id_code  vehicle_basic_information_hdr.vehicle_id_code_hdr
Note: Column name is 'vehicle_id_code' but maps to 'vehicle_id_code_hdr' in parent
ON DELETE: Not specified (likely RESTRICT)
ON UPDATE: Not specified (likely CASCADE)
`

**Key Fields**:
- ehicle_ownership_id - Ownership record ID (UNIQUE)
- ehicle_id_code - FK to vehicle (INDEXED)
- ownership_name - Owner name
- egistration_number - Vehicle registration plate (UNIQUE, INDEXED)  CRITICAL
- egistration_date - First registration date
- egistration_upto - Registration validity
- alid_from - Ownership start date
- alid_to - Ownership end date (NULL if current owner)
- purchase_date - Purchase date
- sale_amount - Purchase/sale price
- state_code - State of registration (INDEXED)
- to_code - RTO code (INDEXED)
- contact_number - Owner contact
- email - Owner email

**Unique Constraints**:
- egistration_number - **SYSTEM-WIDE UNIQUE** - No duplicate registrations

**Indexes**:
- PRIMARY: ehicle_ownership_unique_id
- UNIQUE: ehicle_ownership_id, egistration_number (reg_number_unique)
- INDEX: ehicle_id_code, state_code, to_code

**Use Case**: Track ownership history, registration renewals, RTO records

** IMPORTANT**: Registration number is stored HERE, not in HDR table

---

### 5. ehicle_maintenance_service_history (CHILD - SERVICE)

**Purpose**: Service and maintenance records for vehicles

**Relationship**: **1:N** with ehicle_basic_information_hdr  
**Cardinality**: One vehicle can have MULTIPLE maintenance records (service history over time)

**Primary Key**: ehicle_maintenance_unique_id (INT AUTO_INCREMENT)  
**Business Key**: ehicle_maintenance_id (VARCHAR(20), UNIQUE)  
**Format**: MNT0001, MNT0002, MNT0003, etc.

**Foreign Key**:
`sql
vehicle_id_code  vehicle_basic_information_hdr.vehicle_id_code_hdr
ON DELETE: Not specified (likely RESTRICT)
ON UPDATE: Not specified (likely CASCADE)
`

**Key Fields**:
- ehicle_maintenance_id - Maintenance record ID (UNIQUE)
- ehicle_id_code - FK to vehicle (INDEXED)
- service_date - Date of service (INDEXED) - **REQUIRED**
- upcoming_service_date - Next scheduled service (INDEXED) - **REQUIRED**
- 	ype_of_service - Service type (Oil Change, Brake Service, etc.) (INDEXED)
- service_expense - Service cost
- service_remark - Service notes - **REQUIRED**

**Indexes**:
- PRIMARY: ehicle_maintenance_unique_id
- UNIQUE: ehicle_maintenance_id (vm_maintenance_id_unique)
- INDEX: ehicle_id_code, service_date, upcoming_service_date, 	ype_of_service

**Use Case**: Track service history, schedule upcoming maintenance, calculate maintenance costs

**Relationship with Documents**: ehicle_documents can reference ehicle_maintenance_id

---

### 6. service_frequency_master (CHILD - SERVICE SCHEDULE)

**Purpose**: Define service frequency configuration per vehicle

**Relationship**: **1:N** with ehicle_basic_information_hdr  
**Cardinality**: One vehicle can have MULTIPLE service frequency rules (different time periods/KM intervals)

**Primary Key**: Composite (ehicle_id, sequence_number)  
**No Business Key**: Uses composite primary key

**Foreign Key**:
`sql
vehicle_id  vehicle_basic_information_hdr.vehicle_id_code_hdr (implicit, not enforced)
`

**Key Fields**:
- ehicle_id - FK to vehicle (VARCHAR(20))
- sequence_number - Sequence within vehicle (INT, auto-incremented)
- 	ime_period - Time interval (e.g., "6 months", "1 year")
- km_drove - Kilometer-based interval (e.g., 10000 km)

**Use Case**: Configure service reminders based on time OR kilometer intervals

**Example**:
`
VEH0001, 1, "6 months", 5000    Service every 6 months OR 5000 km
VEH0001, 2, "1 year", 10000     Major service every year OR 10000 km
`

---

### 7. ehicle_documents (CHILD - DOCUMENTS)

**Purpose**: Store vehicle-related documents (insurance, PUC, fitness, permits)

**Relationship**: **1:N** with ehicle_basic_information_hdr (IMPLICIT through maintenance_id)  
**Cardinality**: One vehicle can have MULTIPLE documents

**Primary Key**: document_unique_id (INT AUTO_INCREMENT)  
**Business Key**: document_id (VARCHAR(20))  
**Format**: DOC0001, DOC0002, DOC0003, etc.

**Foreign Keys**:
`sql
document_type_id  document_type_master.document_type_id (explicit FK)
coverage_type_id  coverage_type_master.coverage_type_id (explicit FK)
vehicle_maintenance_id  vehicle_maintenance_service_history.vehicle_maintenance_id (implicit)
vehicle_id_code  vehicle_basic_information_hdr.vehicle_id_code_hdr (implicit, via maintenance)
`

**Key Fields**:
- document_id - Document ID (INDEXED)
- ehicle_id_code - Vehicle ID (implicit through maintenance)
- document_type_id - Type (Insurance, PUC, Fitness, Permit) (INDEXED, FK to master)
- eference_number - Document reference number (INDEXED)
- ehicle_maintenance_id - Link to maintenance record (optional)
- permit_category - Permit category if applicable
- permit_code - Permit code
- document_provider - Provider/issuer (insurance company, RTO, etc.)
- coverage_type_id - Coverage type (FK to coverage_type_master)
- premium_amount - Premium amount (for insurance)
- alid_from - Document start date - **REQUIRED**
- alid_to - Document expiry date - **REQUIRED**
- emarks - Additional notes - **REQUIRED**

**Indexes**:
- PRIMARY: document_unique_id
- INDEX: document_id, document_type_id, eference_number, permit_category
- FK INDEX: coverage_type_id_foreign

**Use Case**: Track document expiry, manage renewals, store document metadata

** IMPORTANT**: Documents can be linked to:
1. Directly to vehicle via ehicle_id_code
2. To a specific maintenance record via ehicle_maintenance_id

---

##  FOREIGN KEY SUMMARY

### Parent Table: ehicle_basic_information_hdr

| Child Table | Foreign Key Column | Parent Column | Relationship | Cascade |
|-------------|-------------------|---------------|--------------|---------|
| ehicle_basic_information_itm | ehicle_id_code_hdr | ehicle_id_code_hdr | 1:1 | Not specified |
| ehicle_special_permit | ehicle_id_code_hdr | ehicle_id_code_hdr | 1:N | Not specified |
| ehicle_ownership_details | ehicle_id_code | ehicle_id_code_hdr | 1:N | Not specified |
| ehicle_maintenance_service_history | ehicle_id_code | ehicle_id_code_hdr | 1:N | Not specified |
| service_frequency_master | ehicle_id | ehicle_id_code_hdr | 1:N | Not enforced |
| ehicle_documents | ehicle_id_code | ehicle_id_code_hdr | 1:N | Implicit |
| 	ransporter_vehicle_mapping | ehicle_id | ehicle_id_code_hdr | 1:N | Explicit FK |
| ehicle_driver_mapping | ehicle_id | ehicle_id_code_hdr | 1:N | Explicit FK |

### Master Table References (Vehicle HDR  Masters)

| Master Table | FK in Vehicle HDR | Purpose |
|--------------|-------------------|---------|
| ehicle_type_master | ehicle_type_id | Vehicle type (Truck, Trailer, etc.) |
| usage_type_master | usage_type_id | Usage type (PASSENGER/CARGO/SPECIAL_EQUIPMENT) |
| engine_type_master | engine_type_id | Engine type (DIESEL_4CYL, etc.) |
| uel_type_master | uel_type_id | Fuel type (Diesel, Petrol, CNG, Electric) |

---

##  UNIQUE CONSTRAINTS ACROSS TABLES

### System-Wide Unique Fields

| Table | Field | Purpose | Indexed |
|-------|-------|---------|---------|
| ehicle_basic_information_hdr | ehicle_id_code_hdr | Primary vehicle ID | PRIMARY KEY |
| ehicle_basic_information_hdr | in_chassis_no | VIN/Chassis number | UNIQUE + INDEX |
| ehicle_basic_information_hdr | gps_tracker_imei_number | GPS IMEI | UNIQUE + INDEX |
| ehicle_ownership_details | egistration_number | Registration plate | UNIQUE + INDEX |
| ehicle_special_permit | permit_number | Permit number | UNIQUE + INDEX |
| ehicle_basic_information_itm | ehicle_id_code_itm | Insurance item ID | UNIQUE + INDEX |
| ehicle_ownership_details | ehicle_ownership_id | Ownership record ID | UNIQUE + INDEX |
| ehicle_maintenance_service_history | ehicle_maintenance_id | Maintenance record ID | UNIQUE + INDEX |
| ehicle_special_permit | ehicle_permit_id | Permit record ID | UNIQUE + INDEX |

---

##  DATA FLOW EXAMPLE: Creating a New Vehicle

### Step-by-Step Insert Order

`sql
-- Step 1: Insert into HDR (Parent) - REQUIRED FIRST
INSERT INTO vehicle_basic_information_hdr (
  vehicle_id_code_hdr,        -- VEH0001 (generated)
  maker_brand_description,     -- "TATA"
  maker_model,                 -- "LPT 407"
  vin_chassis_no,             -- "MAT123456789012345" (UNIQUE)
  vehicle_type_id,            -- "VT001" (FK to vehicle_type_master)
  usage_type_id,              -- "CARGO" (FK to usage_type_master)
  engine_number,              -- "ENG123456"
  gps_tracker_imei_number,    -- "123456789012345" (UNIQUE)
  gps_tracker_active_flag,    -- true
  ...
) VALUES (...);

-- Step 2: Insert into ownership_details (Child) - REQUIRED SECOND
INSERT INTO vehicle_ownership_details (
  vehicle_ownership_id,       -- OWN0001 (generated)
  vehicle_id_code,           -- VEH0001 (FK to HDR)
  ownership_name,            -- "ABC Logistics Pvt Ltd"
  registration_number,       -- "MH12AB1234" (UNIQUE)
  registration_date,         -- "2023-06-20"
  ...
) VALUES (...);

-- Step 3: Insert into maintenance_service_history (Child) - OPTIONAL
INSERT INTO vehicle_maintenance_service_history (
  vehicle_maintenance_id,    -- MNT0001 (generated)
  vehicle_id_code,          -- VEH0001 (FK to HDR)
  service_date,             -- "2024-01-15" (REQUIRED)
  upcoming_service_date,    -- "2024-07-15" (REQUIRED)
  service_remark,           -- "Regular service" (REQUIRED)
  ...
) VALUES (...);

-- Step 4: Insert into service_frequency_master (Child) - OPTIONAL
INSERT INTO service_frequency_master (
  vehicle_id,               -- VEH0001 (FK to HDR)
  sequence_number,          -- 1
  time_period,              -- "6 months"
  km_drove,                 -- 10000
  ...
) VALUES (...);

-- Step 5: Insert into vehicle_documents (Child) - OPTIONAL
INSERT INTO vehicle_documents (
  document_id,              -- DOC0001 (generated)
  vehicle_id_code,          -- VEH0001 (FK to HDR)
  document_type_id,         -- "VEHICLE_INSURANCE"
  reference_number,         -- "INS123456"
  valid_from,               -- "2023-06-20" (REQUIRED)
  valid_to,                 -- "2024-06-19" (REQUIRED)
  remarks,                  -- "Comprehensive insurance" (REQUIRED)
  ...
) VALUES (...);

-- Step 6: Insert into vehicle_special_permit (Child) - OPTIONAL
INSERT INTO vehicle_special_permit (
  vehicle_permit_id,        -- PRM0001 (generated)
  vehicle_id_code_hdr,      -- VEH0001 (FK to HDR)
  permit_category,          -- "National Permit"
  permit_number,            -- "NP123456" (UNIQUE)
  ...
) VALUES (...);

-- Step 7: Insert into vehicle_basic_information_itm (Child) - OPTIONAL
INSERT INTO vehicle_basic_information_itm (
  vehicle_id_code_itm,      -- VEH0001-INS (generated)
  vehicle_id_code_hdr,      -- VEH0001 (FK to HDR)
  insurance_provider,       -- "ICICI Lombard"
  policy_number,            -- "POL123456"
  ...
) VALUES (...);
`

---

##  TRANSACTION MANAGEMENT

### Backend Controller Implementation

The ehicleController.js uses **database transactions** to ensure data integrity:

`javascript
const trx = await db.transaction();

try {
  // Step 1: Insert HDR
  await trx('vehicle_basic_information_hdr').insert({...});
  
  // Step 2: Insert Ownership (if provided)
  if (ownershipDetails) {
    await trx('vehicle_ownership_details').insert({...});
  }
  
  // Step 3: Insert Maintenance (if provided)
  if (maintenanceHistory) {
    await trx('vehicle_maintenance_service_history').insert({...});
  }
  
  // Step 4: Insert Service Frequency (if provided)
  if (serviceFrequency) {
    await trx('service_frequency_master').insert({...});
  }
  
  // Step 5: Insert Documents (if provided)
  if (documents && documents.length > 0) {
    for (const doc of documents) {
      await trx('vehicle_documents').insert({...});
    }
  }
  
  await trx.commit(); // All or nothing
} catch (error) {
  await trx.rollback(); // Rollback if any error
  throw error;
}
`

**Benefits**:
-  Atomicity: Either ALL inserts succeed or NONE succeed
-  Consistency: No orphan records
-  Data Integrity: Foreign key relationships maintained

---

##  KEY TAKEAWAYS

### Primary Parent Table
- **ehicle_basic_information_hdr** is the **CENTRAL HUB**
- All other vehicle tables reference it via foreign keys
- **PRIMARY KEY**: ehicle_id_code_hdr (VEH0001 format)

### Child Table Relationships
| Table | Relationship Type | Cardinality | FK Column |
|-------|------------------|-------------|-----------|
| ehicle_basic_information_itm | 1:1 | One insurance record per vehicle | ehicle_id_code_hdr |
| ehicle_special_permit | 1:N | Multiple permits per vehicle | ehicle_id_code_hdr |
| ehicle_ownership_details | 1:N | Multiple ownership records over time | ehicle_id_code |
| ehicle_maintenance_service_history | 1:N | Multiple service records per vehicle | ehicle_id_code |
| service_frequency_master | 1:N | Multiple service schedules per vehicle | ehicle_id |
| ehicle_documents | 1:N | Multiple documents per vehicle | ehicle_id_code |

### System-Wide Unique Constraints
-  **VIN/Chassis Number** - No duplicates allowed
-  **GPS IMEI Number** - No duplicate GPS devices
-  **Registration Number** - No duplicate vehicle registrations
-  **Permit Number** - No duplicate permits

### Master Data Dependencies
- **vehicle_type_master** - Required for vehicle_type_id
- **usage_type_master** - Required for usage_type_id (PASSENGER/CARGO/SPECIAL_EQUIPMENT)
- **engine_type_master** - Required for engine_type_id
- **fuel_type_master** - Required for fuel_type_id

### Critical Fields for Integration
- **HDR**: ehicle_id_code_hdr, in_chassis_no, gps_tracker_imei_number
- **Ownership**: egistration_number (stored HERE, not in HDR!)
- **Maintenance**: service_date, upcoming_service_date, service_remark (all REQUIRED)
- **Documents**: alid_from, alid_to, emarks (all REQUIRED)

---

##  RELATED DOCUMENTATION

- Backend Implementation: 	ms-backend/controllers/vehicleController.js
- Frontend Integration: docs/VEHICLE_INTEGRATION_SUMMARY.md
- Field Mapping: docs/VEHICLE_FIELD_MAPPING.md
- API Documentation: 	ms-backend/VEHICLE_BACKEND_SYSTEM_DOCUMENTATION.md

---

**Document Version**: 1.0  
**Last Updated**: November 6, 2025  
**Author**: AI Agent (Beast Mode)  
**Status**:  COMPREHENSIVE RELATIONSHIP ANALYSIS COMPLETE
