# Database Population Guide

> **Complete guide for populating your TMS database with sample data**

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding Seeds](#understanding-seeds)
3. [Available Seed Files](#available-seed-files)
4. [Running Seeds](#running-seeds)
5. [Creating Custom Seeds](#creating-custom-seeds)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## 🚀 Quick Start

### Run All Seeds

```bash
cd tms-backend
npx knex seed:run
```

### Run Specific Seed

```bash
npx knex seed:run --specific=999_transporter_complete_sample_data.js
```

### Check What Was Inserted

```bash
# View transporters
node -e "const knex = require('knex')(require('./knexfile').development); knex('transporter_general_info').select('transporter_id', 'business_name', 'status').then(data => { console.table(data); process.exit(); });"

# View contacts
node -e "const knex = require('knex')(require('./knexfile').development); knex('transporter_contact').select('tcontact_id', 'contact_person_name', 'email_id').then(data => { console.table(data); process.exit(); });"

# View service areas
node -e "const knex = require('knex')(require('./knexfile').development); knex('transporter_service_area_itm').join('transporter_service_area_hdr', 'transporter_service_area_itm.service_area_hdr_id', 'transporter_service_area_hdr.service_area_hdr_id').select('transporter_service_area_hdr.transporter_id', 'service_country', 'service_state').then(data => { console.table(data); process.exit(); });"
```

---

## 🌱 Understanding Seeds

### What are Seed Files?

Seed files are JavaScript files that populate your database with sample or initial data. They're useful for:

- **Development**: Testing your application with realistic data
- **Demo**: Showing features to stakeholders
- **Onboarding**: Helping new developers understand data structures
- **Testing**: Creating consistent test datasets

### Seed File Naming Convention

Seeds are executed in alphabetical order:

```
001_master_data.js          # Runs first
002_sample_data.js          # Runs second
999_custom_data.js          # Runs last
```

### Seed File Structure

```javascript
exports.seed = async function(knex) {
  // 1. Clear existing data (optional)
  await knex('table_name').del();
  
  // 2. Insert new data
  await knex('table_name').insert([
    { column1: 'value1', column2: 'value2' },
    { column1: 'value3', column2: 'value4' }
  ]);
};
```

---

## 📂 Available Seed Files

### Current Seed Files in `/seeds` Directory

| File Name | Purpose | Tables Populated |
|-----------|---------|------------------|
| `001_2_address_material_message_master_types_data.js` | Master type data | address_type_master, material_type_master, etc. |
| `001_vehicle_master_types_data.js` | Vehicle master data | vehicle_type_master |
| `002_sample_data.js` | Warehouse & Material | warehouse_basic_information, consignor_material_master |
| `02_transporter_seed.js` | Legacy transporter data | transporter_general_info |
| `999_transporter_complete_sample_data.js` | **Complete transporter dataset** | transporter_general_info, transporter_contact, service areas |

### ✅ Successfully Tested Seeds

**`999_transporter_complete_sample_data.js`** - Recommended for development

Populates:
- 8 Transporters (TRP001-TRP008)
- 5 Transporter Contacts
- 5 Service Area Headers
- 16 Service Area States across India

---

## 🎯 Running Seeds

### Method 1: Run All Seeds

```bash
npx knex seed:run
```

**⚠️ Warning**: This may fail due to foreign key constraints if tables have dependencies.

### Method 2: Run Specific Seed (Recommended)

```bash
npx knex seed:run --specific=999_transporter_complete_sample_data.js
```

### Method 3: Run Multiple Specific Seeds

```bash
npx knex seed:run --specific=001_vehicle_master_types_data.js
npx knex seed:run --specific=999_transporter_complete_sample_data.js
```

### Method 4: Run Seeds for Specific Environment

```bash
# Development (default)
npx knex seed:run --env development

# Production
npx knex seed:run --env production
```

---

## 🛠️ Creating Custom Seeds

### Step 1: Generate a New Seed File

```bash
npx knex seed:make my_custom_seed
```

This creates a file: `seeds/YYYYMMDDHHMMSS_my_custom_seed.js`

### Step 2: Define Your Data

```javascript
exports.seed = async function(knex) {
  try {
    console.log('🌱 Starting custom seed...');
    
    // Insert your data
    const myData = [
      {
        id: '001',
        name: 'Sample Item 1',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      },
      {
        id: '002',
        name: 'Sample Item 2',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      }
    ];

    // Use upsert to avoid duplicates
    for (const item of myData) {
      await knex('my_table')
        .insert(item)
        .onConflict('id')  // Specify unique key
        .merge();           // Update if exists
    }

    console.log(`✅ Inserted ${myData.length} items`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    throw error;
  }
};
```

### Step 3: Run Your Seed

```bash
npx knex seed:run --specific=my_custom_seed.js
```

---

## 🔍 Troubleshooting

### Issue 1: Foreign Key Constraint Errors

**Error**: `Cannot delete or update a parent row: a foreign key constraint fails`

**Solution**:
- Don't delete data from master tables that are referenced by other tables
- Use `.onConflict().merge()` instead of `.del()` then `.insert()`
- Seed dependencies in correct order (master data → transactional data)

**Example**:
```javascript
// ❌ Don't do this
await knex('master_table').del();
await knex('child_table').insert(data);

// ✅ Do this instead
for (const item of data) {
  await knex('table_name')
    .insert(item)
    .onConflict('primary_key')
    .merge();
}
```

### Issue 2: Column Not Found

**Error**: `Unknown column 'column_name' in 'field list'`

**Solution**:
1. Check the actual database schema:
```bash
node -e "const knex = require('knex')(require('./knexfile').development); knex('table_name').columnInfo().then(cols => { console.log(JSON.stringify(cols, null, 2)); process.exit(); });"
```

2. Verify migration files in `/migrations` folder match your expectations

3. Update seed data to match actual column names

### Issue 3: Data Too Long

**Error**: `Data too long for column 'column_name' at row X`

**Solution**:
- Check column max length in migration file
- Shorten your data values to fit within constraints
- Example: `address_id` is varchar(10), so use 'A001' not 'ADDR_TRP001'

### Issue 4: Duplicate Entry

**Error**: `Duplicate entry 'value' for key 'PRIMARY'`

**Solution**:
Use upsert pattern to avoid duplicates:

```javascript
await knex('table_name')
  .insert(data)
  .onConflict('unique_column')
  .merge();  // This updates if exists
```

---

## 💡 Best Practices

### 1. Use Transactions for Multiple Tables

```javascript
exports.seed = async function(knex) {
  return knex.transaction(async (trx) => {
    // All operations within transaction
    await trx('table1').insert(data1);
    await trx('table2').insert(data2);
    // If any fails, all rollback
  });
};
```

### 2. Add Logging for Visibility

```javascript
console.log('🌱 Starting seed...');
console.log(`📦 Inserting ${data.length} records...`);
console.log('✅ Seed completed successfully!');
```

### 3. Handle Errors Gracefully

```javascript
try {
  await knex('table_name').insert(data);
} catch (error) {
  console.error('❌ Seed failed:', error.message);
  throw error;  // Re-throw to fail the seed
}
```

### 4. Use Realistic Test Data

```javascript
// ❌ Bad: Unrealistic data
{ name: 'Test 1', value: 'ABC123' }

// ✅ Good: Realistic data
{ 
  business_name: 'Swift Express Logistics',
  phone_number: '+91-9876543210',
  email_id: 'contact@swiftexpress.com'
}
```

### 5. Respect Foreign Key Dependencies

**Seeding Order**:
1. Master data (countries, states, types)
2. User data (consignors, transporters)
3. Reference data (addresses, contacts)
4. Transactional data (indents, trips)

### 6. Document Your Seeds

```javascript
/**
 * Seed: Transporter Complete Sample Data
 * 
 * Populates:
 * - 8 transporters with various statuses
 * - 5 contacts across different transporters
 * - Service areas covering major Indian states
 * 
 * Dependencies:
 * - None (can run independently)
 * 
 * Usage:
 * npx knex seed:run --specific=999_transporter_complete_sample_data.js
 */
exports.seed = async function(knex) {
  // ... seed logic
};
```

---

## 📊 Sample Data Overview

### Transporter Sample Data (TRP001-TRP008)

| ID | Business Name | Status | Rating | Transport Modes |
|----|--------------|--------|--------|----------------|
| TRP001 | Swift Express Logistics | Active | 4.7 | Road, Air |
| TRP002 | Global Freight Solutions | Active | 4.5 | Road, Rail, Air, Sea |
| TRP003 | Metro City Transporters | Pending | 4.2 | Road |
| TRP004 | Coastal Cargo Services | Active | 4.8 | Road, Sea |
| TRP005 | Air Express Couriers | Active | 4.9 | Road, Air |
| TRP006 | Northern Rail Logistics | Inactive | 3.8 | Road, Rail |
| TRP007 | Eastern Express Transport | Pending | 4.4 | Road, Air |
| TRP008 | Western Highway Movers | Active | 4.1 | Road |

### Service Coverage

- **West India**: Maharashtra, Gujarat, Goa
- **North India**: Delhi, Uttar Pradesh, Haryana, Punjab
- **South India**: Karnataka, Tamil Nadu, Kerala, Andhra Pradesh
- **East India**: West Bengal, Odisha

---

## 🔧 Useful Commands

### Query Database Directly

```bash
# Count records
node -e "const knex = require('knex')(require('./knexfile').development); knex('transporter_general_info').count('* as count').then(result => { console.log('Total transporters:', result[0].count); process.exit(); });"

# Find specific record
node -e "const knex = require('knex')(require('./knexfile').development); knex('transporter_general_info').where('transporter_id', 'TRP001').first().then(data => { console.log(data); process.exit(); });"

# List all tables
node -e "const knex = require('knex')(require('./knexfile').development); knex.raw('SHOW TABLES').then(([tables]) => { console.log(tables); process.exit(); });"
```

### Reset Database

```bash
# Rollback all migrations
npx knex migrate:rollback --all

# Re-run all migrations
npx knex migrate:latest

# Re-seed database
npx knex seed:run
```

---

## 📝 Next Steps

1. **Run the transporter seed**:
   ```bash
   npx knex seed:run --specific=999_transporter_complete_sample_data.js
   ```

2. **Verify data in your frontend**:
   - Start your backend: `npm run dev`
   - Navigate to Transporter Maintenance page
   - You should see 8 transporters with various statuses

3. **Create seeds for other modules**:
   - Warehouses
   - Vehicles
   - Drivers
   - Indents

4. **Test your fuzzy search and filters** with the populated data!

---

## 🎉 Success Checklist

- [ ] Database migrations are up to date (`npx knex migrate:latest`)
- [ ] Seed file runs without errors
- [ ] Data appears in database (verify with SQL query)
- [ ] Frontend displays the data correctly
- [ ] Filters and search work with sample data
- [ ] No foreign key constraint errors

---

**Need more data?** Create additional seed files following the patterns in `999_transporter_complete_sample_data.js`!
