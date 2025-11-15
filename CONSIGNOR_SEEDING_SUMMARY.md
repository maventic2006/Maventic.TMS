# Consignor Data Seeding - Implementation Summary

## Overview
Successfully populated the consignor maintenance tables with 50 comprehensive consignor records maintaining all relationships and data consistency across 6 interconnected database tables.

## Execution Summary

**Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Status**:  COMPLETED SUCCESSFULLY
**Seeder File**: `tms-backend/seeds/seed_50_consignors.js`

## Data Populated

| Table | Record Count | Description |
|-------|--------------|-------------|
| `consignor_basic_information` | 50 | Main consignor records (CUST00001-CUST00050) |
| `consignor_organization` | 50 | Organization details with unique company codes |
| `contact` | 129 | 2-3 contacts per consignor with 10-digit phone numbers |
| `tms_address` | 50 | 1 address per consignor (user_type=CONSIGNOR) |
| `consignor_documents` | 142 | 2-4 documents per consignor |
| `document_upload` | 242 | NDA/MSA pairs + additional documents |
| **TOTAL** | **663** | Total records across all tables |

## Key Features

### 1. Proper Foreign Key Relationships
-  All customer_id references are valid
-  Address relationships properly linked (address_type_id = AT001)
-  Document uploads correctly referenced (upload_nda, upload_msa)
-  Document type IDs use existing TRANSPORTER types (DTM001-DTM010)

### 2. Realistic Test Data
- **Company Names**: Generated using Faker.js with diverse business names
- **Industries**: 14 different industry types (Automotive, Pharma, FMCG, etc.)
- **Currencies**: 8 currency types (INR, USD, EUR, GBP, etc.)
- **Payment Terms**: 8 payment term options (NET15, NET30, COD, etc.)
- **Locations**: 10 Indian states with 3-5 cities each
- **Contact Numbers**: 10-digit format (98XXXXXXXX) compliant with database constraints

### 3. Data Consistency
- **Status Distribution**: 45 ACTIVE, 5 INACTIVE/PENDING consignors
- **Unique Constraints**: 
  - Customer IDs: CUST00001-CUST00050
  - Company Codes: CC0001-CC0050
  - Business Areas: BA0001-BA0050
  - All contact IDs, document IDs unique
- **Audit Trail**: All records have created_by, created_at, updated_by, updated_at

## Issues Resolved During Implementation

### Issue 1: Address Type Foreign Key Constraint
**Problem**: Used 'HQ' as address_type_id, but valid values are 'AT001'-'AT005'
**Solution**: Queried database and changed to 'AT001' (Headquarters address type)

### Issue 2: Contact Number Length Constraint
**Problem**: faker.phone.number() generated formatted numbers with extensions (21+ characters)
**Solution**: Changed to manual generation: '98' + faker.string.numeric(8) for consistent 10-digit numbers

### Issue 3: Document Type Foreign Key Constraint
**Problem**: Used descriptive names (PAN_CARD, GST_CERTIFICATE) instead of actual document_type_id values
**Solution**: No CONSIGNOR document types exist in database, so used existing TRANSPORTER document types (DTM001-DTM013)

## Database Schema

### consignor_basic_information
- Primary Key: `customer_id` (VARCHAR, business key)
- Foreign Keys: `address_id`, `upload_nda`, `upload_msa`, `industry_type`, `currency_type`
- Business fields: customer_name, search_term, vat_number, payment_terms, credit_limit, etc.

### consignor_organization
- Primary Key: `customer_id` (FK to consignor_basic_information)
- Unique Constraints: `company_code`, `business_area`
- Fields: plant_code, operation_code, operation_indicator

### contact
- Primary Key: `contact_id`
- Foreign Key: `customer_id`
- Fields: contact_name, designation, role, team, phone (10 digits), email, linkedin

### consignor_documents
- Primary Key: `document_unique_id`
- Foreign Keys: `customer_id`, `document_id`, `document_type_id`
- Fields: document_number, valid_from, valid_to, status

### tms_address
- Primary Key: `address_id`
- Fields: user_reference_id (=customer_id), user_type (=CONSIGNOR), address_type_id (=AT001)
- Location: street, city, state, country, postal_code, lat/long

### document_upload
- Primary Key: `document_id`
- Fields: system_reference_id (=customer_id), file_name, file_type, file_xstring_value (base64)

## Verification Results

```
 Record Counts:
   - Consignors: 50
   - Organizations: 50
   - Contacts: 129
   - Addresses: 50
   - Documents: 142
   - Document Uploads: 242

 Sample Data Quality:
   - Customer Name: Cronin - Runte
   - Status: ACTIVE
   - Industry: IND_CONSTRUCTION
   - Contact Numbers: All 10-digit format
   - All foreign key relationships valid
```

## Sample Consignor Data

**Customer ID**: CUST00001
- **Name**: Nikolaus, Dickinson and Casper
- **Industry**: IND_FMCG
- **Status**: ACTIVE
- **Organization**: CC0001 / BA0001
- **Contacts**: 2 (Wilbur Harvey, Peggy Lindgren-Shanahan)
- **Documents**: 2 (DTM010 types)
- **Address**: ADDR000001

## Usage

### Run the Seeder
```bash
cd tms-backend
npx knex seed:run --specific=seed_50_consignors.js
```

### Clean Up Data
The seeder automatically cleans up existing consignor data before inserting new records.

### Verify Data
```sql
-- Count consignors
SELECT COUNT(*) FROM consignor_basic_information WHERE customer_id LIKE 'CUST%';

-- View a sample consignor with all related data
SELECT 
  c.customer_id, 
  c.customer_name, 
  c.status,
  o.company_code,
  a.city_name,
  COUNT(DISTINCT ct.contact_id) as contact_count,
  COUNT(DISTINCT d.document_unique_id) as document_count
FROM consignor_basic_information c
LEFT JOIN consignor_organization o ON c.customer_id = o.customer_id
LEFT JOIN tms_address a ON c.address_id = a.address_id
LEFT JOIN contact ct ON c.customer_id = ct.customer_id
LEFT JOIN consignor_documents d ON c.customer_id = d.customer_id
WHERE c.customer_id = 'CUST00001'
GROUP BY c.customer_id;
```

## Dependencies

- **@faker-js/faker**: ^9.x (for realistic test data generation)
- **Knex.js**: 3.1.0 (for database operations)
- **Node.js**: 22.18.0

## Notes

1. Document types currently use TRANSPORTER document type IDs (DTM001-DTM013) since no CONSIGNOR-specific document types exist in the database
2. All addresses use address_type_id = 'AT001' (Headquarters)
3. Contact numbers follow Indian mobile format: 98XXXXXXXX (10 digits)
4. NDA and MSA documents are mandatory for each consignor
5. Additional documents (2-4 per consignor) are randomly selected from available document types

## Future Enhancements

1. Create dedicated CONSIGNOR document type configurations
2. Add more diverse address types (Billing, Shipping, etc.)
3. Implement international phone number formats
4. Add more document variety with different compliance requirements
5. Include serviceable area mappings for consignors
6. Add consignor-specific payment gateway configurations

## Success Metrics

 All 50 consignors created with unique IDs
 100% foreign key integrity maintained
 Realistic and diverse test data
 No duplicate values in unique constraint fields
 All audit trail fields properly populated
 Data ready for frontend integration testing

---
**Implementation completed successfully by AI Agent**
**Total records inserted: 663 across 6 tables**
**Execution time: ~2 seconds**
