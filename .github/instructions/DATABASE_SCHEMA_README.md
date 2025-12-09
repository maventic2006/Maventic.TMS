# TMS Database Schema Documentation

## Overview

This directory contains comprehensive database schema documentation for the entire TMS (Transportation Management System) database. The documentation is automatically generated from the actual database structure and includes all tables, columns, data types, constraints, indexes, and relationships.

## Files

### `database-schema.json`

Complete database schema in JSON format containing:

- **130 tables** across the entire TMS system
- **2,004+ columns** with detailed information
- **54 foreign key relationships**
- **638 indexes** for optimized queries
- Column metadata (data type, length, nullable, default values)
- Primary key definitions
- Foreign key relationships (both forward and reverse)
- Index information (unique, composite, types)
- Migration file references

## Schema Structure

The JSON file is organized as follows:

```json
{
  "database": "tms_dev",
  "generatedAt": "2025-10-31T11:29:32.942Z",
  "totalTables": 130,
  "tables": {
    "table_name": {
      "name": "table_name",
      "migration": {
        "migrationFile": "001_create_table_name.js",
        "migrationOrder": 1
      },
      "columns": {
        "column_name": {
          "type": "varchar",
          "maxLength": 255,
          "nullable": false,
          "defaultValue": null,
          "comment": null
        }
      },
      "primaryKey": ["id"],
      "foreignKeys": [
        {
          "column": "foreign_id",
          "referencedTable": "other_table",
          "referencedColumn": "id",
          "constraintName": "fk_constraint_name"
        }
      ],
      "indexes": [
        {
          "name": "index_name",
          "columns": ["column1", "column2"],
          "unique": false,
          "type": "BTREE"
        }
      ],
      "relationships": {
        "referencesTo": ["other_table"],
        "referencedBy": ["dependent_table"]
      }
    }
  }
}
```

## Regenerating the Documentation

The schema documentation can be regenerated at any time to reflect the latest database changes.

### Method 1: Using npm Script (Recommended)

```bash
cd backend
npm run generate-schema
```

### Method 2: Direct Script Execution

```bash
cd backend
node generate-schema-docs.js
```

### What Happens During Regeneration

1. **Connects to Database**: Uses the development database configuration from `knexfile.js`
2. **Queries All Tables**: Retrieves list of all tables (excluding migration tables)
3. **Extracts Column Information**: Gets detailed column metadata for each table
4. **Identifies Relationships**: Queries foreign key constraints from information_schema
5. **Indexes Information**: Extracts all indexes including primary keys, unique constraints
6. **Parses Migrations**: Reads migration files to link tables to their creation scripts
7. **Builds Relationships**: Maps both forward (referencesTo) and reverse (referencedBy) relationships
8. **Generates JSON**: Creates formatted JSON file with complete schema documentation

## Use Cases

### 1. Quick Table Lookup

Find any table's structure without querying the database:

```javascript
// Example: Find tms_address table structure
const schema = require("./.github/instructions/database-schema.json");
const addressTable = schema.tables.tms_address;

console.log("Columns:", Object.keys(addressTable.columns));
console.log("Primary Key:", addressTable.primaryKey);
console.log("Foreign Keys:", addressTable.foreignKeys);
```

### 2. Relationship Discovery

Identify which tables are related:

```javascript
const schema = require("./.github/instructions/database-schema.json");

// Find what tables reference address_type_master
const addressTypeMaster = schema.tables.address_type_master;
console.log("Referenced by:", addressTypeMaster.relationships.referencedBy);
// Output: ["tms_address"]
```

### 3. Database Query Development

Verify column names before writing queries:

```javascript
// Check if address_type_id exists in tms_address
const addressColumns = schema.tables.tms_address.columns;
if ("address_type_id" in addressColumns) {
  console.log("Column exists!");
  console.log("Type:", addressColumns.address_type_id.type);
  console.log("Nullable:", addressColumns.address_type_id.nullable);
}
```

### 4. Migration Planning

See which tables will be affected by changes:

```javascript
// Find all tables that reference transporter_general_info
const transporterInfo = schema.tables.transporter_general_info;
console.log("Dependent tables:", transporterInfo.relationships.referencedBy);
```

### 5. API Development

Ensure API responses match database schema:

```javascript
// Verify all required fields are present
const requiredFields = Object.entries(schema.tables.tms_address.columns)
  .filter(([name, info]) => !info.nullable)
  .map(([name]) => name);

console.log("Required fields for tms_address:", requiredFields);
```

## Table Categories

### Master Tables (Reference Data)

- `address_type_master` - Address type definitions
- `vehicle_type_master` - Vehicle type classifications
- `document_name_master` - Document type definitions
- `status_master` - Status code definitions
- `user_type_master` - User role types
- And 25+ more master tables

### Transaction Tables (Business Data)

- `transporter_general_info` - Transporter basic information
- `tms_address` - Address management
- `transporter_documents` - Document uploads
- `vehicle_basic_information_hdr` - Vehicle information
- `indent_header` - Indent/order headers
- `rfq_header` - RFQ management
- And 100+ more transaction tables

### Configuration Tables

- `general_config` - System configuration
- `checklist_configuration` - Checklist setups
- `approval_configuration` - Approval workflows

### Mapping Tables (Relationships)

- `transporter_consignor_mapping` - Transporter-consignor relationships
- `vehicle_driver_mapping` - Vehicle-driver assignments
- `transporter_vehicle_mapping` - Transporter-vehicle ownership

## Key Relationships

### Address Management

- `tms_address` references `address_type_master` via `address_type_id`
- Used by: `user_signup_request`, transporters, warehouses

### Document Management

- `transporter_documents` references `document_name_master` via `doc_name_master_id`
- `vehicle_documents` references `document_name_master` for vehicle docs

### Vehicle Relationships

- `vehicle_basic_information_hdr` references `vehicle_type_master`
- `vehicle_basic_information_hdr` references `fuel_type_master`
- `vehicle_basic_information_hdr` references `engine_type_master`

### Driver Management

#### Overview

The Driver module manages driver information, documents, employment history, and violations across the TMS platform. It provides comprehensive driver profiles with address integration, document management, and performance tracking.

#### Core Tables

**1. `driver_basic_information`** - Primary driver records

- **Purpose**: Stores essential driver information including contact details, personal info, and ratings
- **Key Columns**:
  - `driver_id` (VARCHAR(10), Unique) - Primary driver identifier (e.g., DRV0001)
  - `full_name` (VARCHAR(200)) - Driver's complete name
  - `date_of_birth` (DATE) - Birth date for age verification
  - `gender` (VARCHAR(10)) - MALE, FEMALE, OTHER
  - `blood_group` (VARCHAR(5)) - O+, O-, A+, A-, B+, B-, AB+, AB-
  - `phone_number` (VARCHAR(20)) - Primary contact (10-digit Indian format: 6-9xxxxxxxx)
  - `email_id` (VARCHAR(100)) - Email address
  - `whats_app_number` (VARCHAR(20)) - WhatsApp contact
  - `alternate_phone_number` (VARCHAR(20)) - Secondary contact
  - `avg_rating` (DECIMAL(3,2)) - Driver performance rating (0.00-5.00)
  - `status` (VARCHAR(10)) - ACTIVE, INACTIVE
- **Indexes**:
  - `idx_driver_basic_driver_id` on `driver_id`
  - `idx_driver_basic_email` on `email_id`
  - `idx_driver_basic_phone` on `phone_number`
  - `idx_driver_basic_name` on `full_name`
- **Address Integration**: Links to `tms_address` via:
  - `user_reference_id` = `driver_id`
  - `user_type` = 'DRIVER'
  - `is_primary` = true

**2. `driver_documents`** - Driver document management

- **Purpose**: Stores driver licenses, ID proofs, and certifications
- **Key Columns**:
  - `document_unique_id` (VARCHAR(20)) - Unique document identifier
  - `driver_id` (VARCHAR(10)) - Links to driver_basic_information
  - `document_id` (VARCHAR(20)) - Document reference ID
  - `document_type_id` (VARCHAR(10)) - References document_name_master
  - `document_number` (VARCHAR(100)) - License/document number
  - `issuing_country` (VARCHAR(100)) - Document issuing country
  - `issuing_state` (VARCHAR(100)) - Document issuing state
  - `active_flag` (BOOLEAN) - Document active status
  - `valid_from` (DATE) - Document validity start date
  - `valid_to` (DATE) - Document expiry date
  - `remarks` (TEXT) - Additional document notes
- **Foreign Keys**:
  - `driver_id` → `driver_basic_information.driver_id`
- **Common Document Types**:
  - DOC002 - Driver License (various categories: LMV, TRANS, HGMV)
  - DN002 - Aadhaar Card (Indian ID proof)
  - DN001 - PAN Card
- **Indexes**:
  - `idx_driver_docs_driver_id` on `driver_id`
  - `idx_driver_docs_doc_id` on `document_id`
  - `idx_driver_docs_type_id` on `document_type_id`

**3. `driver_history_information`** - Employment history

- **Purpose**: Tracks driver's employment timeline and experience
- **Key Columns**:
  - `driver_history_id` (VARCHAR(20)) - Unique history record ID
  - `driver_id` (VARCHAR(10)) - Links to driver_basic_information
  - `employer` (VARCHAR(255)) - Previous/current employer name
  - `from_date` (DATE) - Employment start date
  - `to_date` (DATE, Nullable) - Employment end date (NULL for current)
  - `employment_status` (VARCHAR(50)) - Full-time, Part-time, Contract
  - `job_title` (VARCHAR(100)) - Position title
- **Foreign Keys**:
  - `driver_id` → `driver_basic_information.driver_id`

**4. `driver_accident_violation`** - Incidents and violations

- **Purpose**: Records driver accidents, violations, and safety incidents
- **Key Columns**:
  - `driver_violation_id` (VARCHAR(20)) - Unique violation record ID
  - `driver_id` (VARCHAR(10)) - Links to driver_basic_information
  - `type` (VARCHAR(100)) - Incident type (Speeding, Accident, etc.)
  - `description` (TEXT) - Detailed incident description
  - `date` (DATE) - Incident date
  - `vehicle_regn_number` (VARCHAR(50)) - Involved vehicle registration
- **Foreign Keys**:
  - `driver_id` → `driver_basic_information.driver_id`

#### Relationships

```
driver_basic_information (1) ─┬─→ (N) driver_documents
                              ├─→ (N) driver_history_information
                              ├─→ (N) driver_accident_violation
                              ├─→ (N) tms_address (via user_reference_id + user_type='DRIVER')
                              ├─→ (N) vehicle_driver_mapping
                              └─→ (N) transporter_driver_mapping
```

#### API Endpoints

The Driver module exposes the following REST API endpoints:

**Base Path**: `/api/driver`

| Method | Endpoint                                     | Purpose                                                              | Authentication Required |
| ------ | -------------------------------------------- | -------------------------------------------------------------------- | ----------------------- |
| GET    | `/api/driver`                                | List all drivers with pagination & filters                           | Yes (Product Owner)     |
| GET    | `/api/driver/:id`                            | Get single driver details with addresses & documents                 | Yes (Product Owner)     |
| POST   | `/api/driver`                                | Create new driver with validation                                    | Yes (Product Owner)     |
| PUT    | `/api/driver/:id`                            | Update existing driver                                               | Yes (Product Owner)     |
| GET    | `/api/driver/master-data`                    | Get dropdown data (countries, blood groups, genders, document types) | Yes (Product Owner)     |
| GET    | `/api/driver/states/:countryCode`            | Get states for a country                                             | Yes (Product Owner)     |
| GET    | `/api/driver/cities/:countryCode/:stateCode` | Get cities for a state                                               | Yes (Product Owner)     |

**List Drivers (GET /api/driver)**

- **Query Parameters**:
  - `page` (default: 1) - Page number
  - `limit` (default: 25) - Records per page (25, 50, 100)
  - `search` - Fuzzy search across driver_id, full_name, phone_number, email_id
  - `driverId` - Filter by driver ID pattern
  - `status` - Filter by status (ACTIVE, INACTIVE)
  - `gender` - Filter by gender (MALE, FEMALE, OTHER)
  - `bloodGroup` - Filter by blood group (O+, O-, A+, A-, B+, B-, AB+, AB-)
- **Response**: Returns paginated driver list with city information (JOINed from tms_address)
- **Joins**: LEFT JOIN with `tms_address` where `user_type='DRIVER'` and `is_primary=true`

**Get Driver Details (GET /api/driver/:id)**

- **Response**: Complete driver profile including:
  - Basic information
  - All addresses (with country/state/city names, not just codes)
  - All documents with validity status
  - Employment history (if exists)
- **Data Transformation**: Converts ISO country/state codes to readable names using `country-state-city` library

**Create Driver (POST /api/driver)**

- **Request Body Structure**:
  ```json
  {
    "basicInfo": {
      "fullName": "string (min 2 chars, required)",
      "dateOfBirth": "YYYY-MM-DD (optional)",
      "gender": "MALE | FEMALE | OTHER (optional)",
      "bloodGroup": "O+ | O- | A+ | A- | B+ | B- | AB+ | AB- (optional)",
      "phoneNumber": "string (10 digits, 6-9 start, required)",
      "emailId": "string (valid email, optional)",
      "whatsAppNumber": "string (10 digits, optional)",
      "alternatePhoneNumber": "string (10 digits, optional)"
    },
    "addresses": [
      {
        "addressType": "Primary | Permanent | Current",
        "street1": "string (required)",
        "street2": "string (optional)",
        "city": "string (required)",
        "district": "string (optional)",
        "state": "string (required)",
        "country": "string (required)",
        "postalCode": "string (required)",
        "isPrimary": "boolean"
      }
    ],
    "documents": [
      {
        "documentType": "Driver License | Aadhaar Card | PAN Card",
        "documentNumber": "string (required)",
        "issuingCountry": "string (required)",
        "issuingState": "string (required)",
        "validFrom": "YYYY-MM-DD (required)",
        "validTo": "YYYY-MM-DD (optional)",
        "remarks": "string (optional)"
      }
    ]
  }
  ```
- **Validation Rules**:
  - Phone numbers: Exactly 10 digits starting with 6, 7, 8, or 9 (Indian format)
  - Email: Standard email format validation
  - Duplicate checking: Phone number and email uniqueness enforced
  - Document numbers: Checked for duplicates across all drivers
  - At least one address required
  - Transaction-based: All inserts rolled back on any error

**Update Driver (PUT /api/driver/:id)**

- **Request Body**: Same structure as Create
- **Validation**: Same as Create, plus checks for existing driver ID
- **Behavior**: Updates basic info, manages addresses and documents (can add/remove)

**Master Data (GET /api/driver/master-data)**

- **Response**:
  ```json
  {
    "countries": [...],           // From country-state-city library
    "documentTypes": [...],       // From document_name_master where user_type='DRIVER'
    "documentNames": [...],       // All document types
    "addressTypes": [...],        // From address_type_master
    "genderOptions": [...],       // MALE, FEMALE, OTHER
    "bloodGroupOptions": [...]    // All 8 blood groups
  }
  ```

#### Validation & Business Rules

1. **Phone Number Validation**:

   - Format: 10 digits starting with 6, 7, 8, or 9
   - No spaces, hyphens, or country codes
   - Example valid: `9876543210`
   - Example invalid: `+91-9876543210`, `5876543210`, `98765432`

2. **Email Validation**:

   - Standard RFC 5322 email format
   - Unique across all drivers

3. **Document Validation**:

   - Document numbers must be unique within document type
   - Valid date ranges required (valid_from < valid_to)
   - Active documents must have future expiry dates

4. **Address Validation**:

   - At least one address required per driver
   - Only one address can be marked as primary
   - All required fields (street1, city, state, country, postal_code) must be provided

5. **Duplicate Prevention**:
   - Phone number uniqueness enforced at database level
   - Email uniqueness enforced at database level
   - Document number uniqueness enforced per document type

#### Query Examples

```sql
-- Get all active drivers with their primary city
SELECT
  dbi.driver_id,
  dbi.full_name,
  dbi.phone_number,
  dbi.email_id,
  dbi.gender,
  dbi.blood_group,
  addr.city,
  addr.state,
  addr.country,
  dbi.avg_rating,
  dbi.status
FROM driver_basic_information dbi
LEFT JOIN tms_address addr ON (
  dbi.driver_id = addr.user_reference_id
  AND addr.user_type = 'DRIVER'
  AND addr.is_primary = true
  AND addr.status = 'ACTIVE'
)
WHERE dbi.status = 'ACTIVE'
ORDER BY dbi.driver_id ASC;

-- Get driver with all documents and validity status
SELECT
  dbi.driver_id,
  dbi.full_name,
  dd.document_type_id,
  dd.document_number,
  dd.valid_from,
  dd.valid_to,
  CASE
    WHEN dd.valid_to IS NULL THEN 'No Expiry'
    WHEN dd.valid_to < CURDATE() THEN 'Expired'
    WHEN DATE_ADD(dd.valid_to, INTERVAL -30 DAY) < CURDATE() THEN 'Expiring Soon'
    ELSE 'Valid'
  END as validity_status
FROM driver_basic_information dbi
LEFT JOIN driver_documents dd ON dbi.driver_id = dd.driver_id
WHERE dbi.driver_id = 'DRV0001'
AND dd.active_flag = true;

-- Get drivers by blood group for emergency situations
SELECT
  driver_id,
  full_name,
  blood_group,
  phone_number,
  addr.city,
  addr.state
FROM driver_basic_information dbi
LEFT JOIN tms_address addr ON (
  dbi.driver_id = addr.user_reference_id
  AND addr.user_type = 'DRIVER'
  AND addr.is_primary = true
)
WHERE blood_group = 'O-'
AND status = 'ACTIVE';
```

#### Frontend Integration

**Redux State** (`frontend/src/redux/slices/driverSlice.js`):

```javascript
{
  drivers: [],                    // List of drivers from API
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    pages: 0
  },
  selectedDriver: null,           // Current driver details
  masterData: {
    countries: [],
    documentTypes: [],
    documentNames: [],
    addressTypes: [],
    genderOptions: [],
    bloodGroupOptions: []
  },
  isFetching: false,
  isFetchingDetails: false,
  isCreating: false,
  isUpdating: false,
  error: null
}
```

**Frontend Pages**:

- `/drivers` - DriverMaintenance.jsx (List page with filters, search, pagination)
- `/driver/create` - DriverCreatePage.jsx (Multi-tab creation form - placeholder)
- `/driver/:id` - DriverDetailsPage.jsx (View/Edit driver details - placeholder)

**Search & Filter Capabilities**:

- Fuzzy search across: driver_id, full_name, phone_number, email_id, gender, blood_group, city, status
- Filters: Driver ID pattern, Status, Gender, Blood Group
- Client-side fuzzy matching + server-side filtering
- Real-time search with debouncing

#### Data Population

**Seed File**: `backend/seeds/03_driver_seed.js`

- Creates 25 sample drivers with complete profiles
- Covers all Indian states (Maharashtra, Karnataka, Tamil Nadu, Delhi, Gujarat, Rajasthan, West Bengal, Telangana, Kerala)
- Includes 25 addresses linked via tms_address table
- Includes 25 documents (driver licenses + Aadhaar cards)
- Includes 5 employment history records
- Test data includes:
  - Mix of genders (13 MALE, 12 FEMALE)
  - All 8 blood groups represented
  - Ratings ranging from 4.3 to 4.9
  - Valid Indian phone numbers (10 digits starting with 6-9)
  - Realistic Indian names and cities

**Running the Seed**:

```bash
cd backend
npx knex seed:run --specific=03_driver_seed.js
```

#### Performance Considerations

- **Indexes**: All frequently queried columns are indexed (driver_id, phone_number, email_id, full_name)
- **Pagination**: Server-side pagination prevents large result sets
- **JOIN Optimization**: tms_address join uses indexed columns (user_reference_id + user_type)
- **Duplicate Checks**: Use indexed columns for duplicate validation
- **Transaction Support**: All creates/updates use database transactions for data integrity

#### Security & Access Control

- **Authentication**: All endpoints require JWT authentication
- **Authorization**: Only Product Owners (user_type = 'UT001') can access driver endpoints
- **Data Validation**: Comprehensive server-side validation prevents SQL injection and malformed data
- **Audit Trail**: All tables include created_by, created_at, updated_by, updated_at fields

### User & Authentication

- `user_master` references `user_type_master`
- `user_role_hdr` manages user role assignments

## Tips for AI Agents

When working with the TMS database:

1. **Always check this file first** before writing database queries
2. **Verify column names** - migrations may use different naming than expected
3. **Check nullable constraints** - required fields must be validated
4. **Review foreign keys** - ensure referential integrity in queries
5. **Consider indexes** - use indexed columns in WHERE clauses for performance
6. **Check relationships** - understand table dependencies before modifications

## Maintenance

### When to Regenerate

Regenerate the schema documentation after:

- Creating new migrations
- Adding new tables
- Modifying table structures
- Adding/removing foreign keys
- Adding/removing indexes
- Major database refactoring

### Automation Options

Consider adding schema regeneration to:

- **Pre-commit hooks** - Ensure schema docs are always up to date
- **CI/CD pipeline** - Regenerate on database migration deployments
- **Post-migration scripts** - Auto-update after running `knex migrate:latest`

## Troubleshooting

### Error: Cannot connect to database

- Verify `.env` file has correct database credentials
- Check if MySQL server is running
- Ensure database exists

### Error: Permission denied

- Verify database user has SELECT permissions on information_schema
- Check read/write permissions on `.github/instructions/` directory

### Incomplete schema

- Ensure all migrations have been run: `knex migrate:latest`
- Check for tables created outside migration system
- Verify all foreign keys are properly defined in migrations

## Integration with Memory System

This schema documentation is integrated with the AI agent memory system:

- **Location**: `.github/instructions/` - Part of the memory/instruction system
- **Usage**: AI agents can reference this file to understand database structure
- **Benefits**: Reduces errors from column name mismatches and improves query accuracy

## Statistics

Current schema (as of generation):

- **Total Tables**: 130
- **Total Columns**: 2,004
- **Foreign Key Constraints**: 54
- **Total Indexes**: 638
- **Master Tables**: ~30
- **Transaction Tables**: ~100

---

**Last Updated**: Auto-generated from database  
**Script Location**: `backend/generate-schema-docs.js`  
**Documentation File**: `.github/instructions/database-schema.json`
