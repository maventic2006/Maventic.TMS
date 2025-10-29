# Transporter Contact & Document Relationship Fix

## Date: October 29, 2025

## Issues Fixed

### 1. ✅ Contact Data Not Showing in Transporter List

**Problem**: Contact information (phone number, email) was not displaying in the TransporterListTable component  
**Root Cause**: Backend `getTransporters` API was not JOINing with `transporter_contact` table and not including contact fields in the response

**Solution**: Updated backend controller to include contact data

#### Changes Made:

**File**: `controllers/transporterController.js`

1. **Added LEFT JOIN with transporter_contact**:
```javascript
.leftJoin("transporter_contact as tc", function() {
  this.on("tgi.transporter_id", "=", "tc.transporter_id")
      .andOn("tc.status", "=", knex.raw("'ACTIVE'"));
})
```

2. **Added contact fields to SELECT**:
```javascript
"tc.contact_person_name",
"tc.phone_number",
"tc.email_id"
```

3. **Added GROUP BY** to handle multiple contacts per transporter (returns first active contact)

4. **Updated response transformation** to include contact data:
```javascript
contactPersonName: transporter.contact_person_name,
mobileNumber: transporter.phone_number,
emailId: transporter.email_id,
vatGst: transporter.vat_number
```

5. **Updated count query** to use `countDistinct` to avoid duplicate counts:
```javascript
.countDistinct("tgi.transporter_id as count")
```

---

### 2. ✅ Document Relationship via reference_number

**Problem**: Need to establish relationship between transporter_documents and transporters  
**Solution**: Use `reference_number` field to store `transporter_id`

#### Changes Made:

**1. Migration Created**: `020_add_reference_number_index_to_transporter_documents.js`
- Adds index on `reference_number` for better query performance
- Documents the purpose: `reference_number` stores transporter_id, warehouse_id, driver_id, etc. based on `user_type`

**2. Seed File Updated**: `998_comprehensive_transporter_data.js`
- Changed from: `reference_number: 'REF-${transporterId}-${docIndex}'`
- Changed to: `reference_number: transporterId` (direct transporter ID)

#### Database Relationship:

```
transporter_general_info (transporter_id) 
    ↓ (one-to-many)
transporter_documents (reference_number = transporter_id)
    WHERE user_type = 'Transporter'
```

**Query Example**:
```javascript
// Get all documents for a transporter
knex('transporter_documents')
  .where('reference_number', 'T001')
  .where('user_type', 'Transporter')
  .where('status', 'ACTIVE')
```

---

## Data Flow Architecture

### Frontend → Backend → Database

**Frontend Request**:
```javascript
GET /api/transporter?page=1&limit=25
```

**Backend Query**:
```sql
SELECT 
  tgi.*, 
  addr.*, 
  tc.contact_person_name, 
  tc.phone_number, 
  tc.email_id
FROM transporter_general_info tgi
LEFT JOIN tms_address addr 
  ON tgi.transporter_id = addr.user_reference_id 
  AND addr.user_type = 'TRANSPORTER'
LEFT JOIN transporter_contact tc 
  ON tgi.transporter_id = tc.transporter_id 
  AND tc.status = 'ACTIVE'
GROUP BY tgi.transporter_id, ...
ORDER BY tgi.transporter_id ASC
LIMIT 25 OFFSET 0
```

**Backend Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "T001",
      "businessName": "Express Transport Solutions",
      "mobileNumber": "+91-9876543210",
      "emailId": "contact@express.com",
      "vatGst": "27ABCDE1234F1Z5",
      "city": "Mumbai",
      "state": "Maharashtra",
      "address": "123 Main St, Mumbai, Maharashtra, India",
      ...
    }
  ]
}
```

**Frontend Display**:
- TransporterListTable component now receives and displays contact data
- Phone number and email columns show actual data

---

## Table Relationships Summary

### 1. Transporter ↔ Address
- **Join**: `transporter_id = user_reference_id`
- **Filter**: `user_type = 'TRANSPORTER'`
- **Type**: One-to-Many (one transporter can have multiple addresses, but we show primary/first)

### 2. Transporter ↔ Contact
- **Join**: `transporter_id = transporter_id`
- **Filter**: `status = 'ACTIVE'`
- **Type**: One-to-Many (multiple contacts per transporter, showing first active)

### 3. Transporter ↔ Documents
- **Join**: `transporter_id = reference_number`
- **Filter**: `user_type = 'Transporter'`
- **Type**: One-to-Many (multiple documents per transporter)

### 4. Transporter ↔ Service Areas
- **Join**: Via `service_area_hdr_id`
- **Chain**: transporter → service_area_hdr → service_area_itm
- **Type**: One-to-Many-to-Many

---

## Testing Results

### Before Fixes:
```
mobileNumber: undefined
emailId: undefined
vatGst: undefined
```

### After Fixes:
```
mobileNumber: "+91-9876543210"
emailId: "rajesh.kumar@expresslogistics.com"
vatGst: "27ABCDE1234F1Z5"
```

---

## Database Schema Reference

### transporter_contact (Key Columns)
```
- tcontact_id (PK)
- transporter_id (FK → transporter_general_info.transporter_id)
- contact_person_name
- phone_number
- email_id
- alternate_phone_number
- whats_app_number
- status ('ACTIVE', 'INACTIVE')
```

### transporter_documents (Key Columns)
```
- document_unique_id (PK)
- document_id
- reference_number (stores transporter_id for relationship)
- document_type_id
- document_number
- user_type ('Transporter', 'Warehouse', 'Driver', etc.)
- status ('ACTIVE', 'INACTIVE')
```

---

## Running the Updates

### 1. Run Migration
```bash
cd tms-backend
npx knex migrate:latest
```

### 2. Update Existing Document Records (Optional)
```sql
-- Update existing records to use transporter_id in reference_number
UPDATE transporter_documents 
SET reference_number = SUBSTRING_INDEX(reference_number, '-', -2)
WHERE user_type = 'Transporter' 
  AND reference_number LIKE 'REF-%';
```

### 3. Re-run Seed (to update document relationships)
```bash
npx knex seed:run --specific=998_comprehensive_transporter_data.js
```

### 4. Restart Backend
```bash
npm start
```

---

## API Response Changes

### Old Response (Missing Contact Data):
```json
{
  "id": "T001",
  "businessName": "Express Transport",
  "city": "Mumbai",
  "state": "Maharashtra"
  // NO contact data
}
```

### New Response (With Contact Data):
```json
{
  "id": "T001",
  "businessName": "Express Transport",
  "city": "Mumbai",
  "state": "Maharashtra",
  "contactPersonName": "Rajesh Kumar",
  "mobileNumber": "+91-9876543210",
  "emailId": "rajesh.kumar@expresslogistics.com",
  "vatGst": "27ABCDE1234F1Z5"
}
```

---

## Important Notes

### Contact Selection Logic
- When a transporter has multiple contacts, the query returns the **first active contact**
- This is controlled by the GROUP BY clause
- If you need all contacts, use the `getTransporterById` API which returns all related data

### Document Query Pattern
```javascript
// To get all documents for a transporter
const documents = await knex('transporter_documents')
  .where('reference_number', transporterId)
  .where('user_type', 'Transporter')
  .where('status', 'ACTIVE')
  .select('*');
```

### Performance Considerations
- Added index on `reference_number` for fast lookups
- Using LEFT JOIN to ensure transporters without contacts still appear
- GROUP BY prevents duplicate rows when multiple contacts exist
- `countDistinct` ensures accurate pagination counts

---

## Frontend Component Updates

No changes needed in `TransporterListTable.jsx` - the component already had the code to display:
- `transporter.mobileNumber`
- `transporter.emailId`
- `transporter.vatGst`

The component was just receiving `undefined` values before, now it receives actual data!

---

**All fixes are complete and tested! 🎉**

The transporter list now shows:
✅ Contact phone numbers
✅ Contact email addresses
✅ VAT/GST numbers
✅ Proper document relationships via reference_number
