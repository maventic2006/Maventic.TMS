const knex = require('knex')(require('./knexfile').development);
const configurations = require('./config/master-configurations.json');

async function validateConfigurationMetadata() {
  console.log('🚀 Validating Configuration Metadata Against Database Schema...\n');

  const results = {
    valid: [],
    invalid: [],
    missing: []
  };

  for (const [configName, config] of Object.entries(configurations)) {
    try {
      console.log(`\n📋 Validating: ${configName} (${config.name})`);
      
      // Check if table exists
      const tableExists = await knex.schema.hasTable(config.table);
      if (!tableExists) {
        results.invalid.push({
          config: configName,
          error: `Table '${config.table}' does not exist`
        });
        console.log(`❌ Table '${config.table}' not found`);
        continue;
      }

      // Get table columns
      const columns = await knex.raw(`DESCRIBE ${config.table}`);
      const dbColumns = columns[0].map(col => col.Field);
      
      // Validate fields exist
      const configFields = Object.keys(config.fields);
      const missingFields = configFields.filter(field => !dbColumns.includes(field));
      const extraDbColumns = dbColumns.filter(col => !configFields.includes(col));
      
      if (missingFields.length > 0) {
        results.invalid.push({
          config: configName,
          error: `Missing fields in database: ${missingFields.join(', ')}`
        });
        console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
      } else {
        results.valid.push({
          config: configName,
          table: config.table,
          fieldsCount: configFields.length,
          dbColumnsCount: dbColumns.length
        });
        console.log(`✅ Valid configuration`);
        console.log(`   Fields: ${configFields.length}, DB Columns: ${dbColumns.length}`);
        
        if (extraDbColumns.length > 0) {
          console.log(`   ℹ️ Extra DB columns not in config: ${extraDbColumns.join(', ')}`);
        }
      }
      
    } catch (error) {
      results.invalid.push({
        config: configName,
        error: error.message
      });
      console.log(`❌ Error validating ${configName}: ${error.message}`);
    }
  }

  // Check for master tables not in configurations
  console.log('\n🔍 Checking for master tables not in configurations...');
  const masterTables = await knex.raw(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
    AND table_name LIKE '%_master'
    ORDER BY table_name
  `);
  
  const configuredTables = Object.values(configurations).map(config => config.table);
  const unconfiguredTables = masterTables[0]
    .map(row => row.table_name || row.TABLE_NAME)
    .filter(table => !configuredTables.includes(table));
  
  if (unconfiguredTables.length > 0) {
    console.log(`\n⚠️ Master tables without configurations (${unconfiguredTables.length}):`);
    unconfiguredTables.forEach(table => {
      console.log(`   - ${table}`);
      results.missing.push(table);
    });
  } else {
    console.log('✅ All master tables have configurations');
  }

  // Summary
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('====================');
  console.log(`✅ Valid configurations: ${results.valid.length}`);
  console.log(`❌ Invalid configurations: ${results.invalid.length}`);
  console.log(`⚠️ Missing configurations: ${results.missing.length}`);
  
  if (results.invalid.length > 0) {
    console.log('\n❌ INVALID CONFIGURATIONS:');
    results.invalid.forEach(item => {
      console.log(`   ${item.config}: ${item.error}`);
    });
  }
  
  console.log('\n✅ VALID CONFIGURATIONS:');
  results.valid.forEach(item => {
    console.log(`   ${item.config} (${item.fieldsCount} fields)`);
  });

  await knex.destroy();
  
  const isValid = results.invalid.length === 0;
  console.log(`\n${isValid ? '✅' : '❌'} Overall validation: ${isValid ? 'PASSED' : 'FAILED'}`);
  
  return isValid;
}

// Test a specific configuration's CRUD operations
async function testCRUDOperations() {
  console.log('\n🧪 Testing CRUD Operations on "status" configuration...\n');
  
  try {
    const configName = 'status';
    const config = configurations[configName];
    
    if (!config) {
      console.log('❌ Configuration not found');
      return false;
    }

    const { table, primaryKey } = config;
    
    // Test Create
    console.log('📝 Testing CREATE operation...');
    const testRecord = {
      status_id: 'TEST01',
      status_name: 'Test Status',
      status_description: 'Test status created by validation script',
      status: 'ACTIVE',
      created_at: new Date(),
      created_on: new Date(),
      created_by: 'SYSTEM',
      updated_at: new Date(),
      updated_on: new Date(),
      updated_by: 'SYSTEM'
    };
    
    await knex(table).insert(testRecord);
    console.log('✅ CREATE: Record inserted successfully');
    
    // Test Read
    console.log('📖 Testing READ operation...');
    const createdRecord = await knex(table).where(primaryKey, 'TEST01').first();
    if (createdRecord) {
      console.log('✅ READ: Record retrieved successfully');
    } else {
      console.log('❌ READ: Record not found');
    }
    
    // Test Update
    console.log('✏️ Testing UPDATE operation...');
    await knex(table)
      .where(primaryKey, 'TEST01')
      .update({
        status_description: 'Updated test status description',
        updated_at: new Date(),
        updated_by: 'SYSTEM'
      });
    
    const updatedRecord = await knex(table).where(primaryKey, 'TEST01').first();
    if (updatedRecord.status_description === 'Updated test status description') {
      console.log('✅ UPDATE: Record updated successfully');
    } else {
      console.log('❌ UPDATE: Record not updated properly');
    }
    
    // Test Delete (soft delete)
    console.log('🗑️ Testing DELETE operation (soft delete)...');
    await knex(table)
      .where(primaryKey, 'TEST01')
      .update({
        status: 'INACTIVE',
        updated_at: new Date(),
        updated_by: 'SYSTEM'
      });
    
    const deletedRecord = await knex(table).where(primaryKey, 'TEST01').first();
    if (deletedRecord.status === 'INACTIVE') {
      console.log('✅ DELETE: Record soft deleted successfully');
    } else {
      console.log('❌ DELETE: Record not soft deleted properly');
    }
    
    // Cleanup
    console.log('🧹 Cleaning up test record...');
    await knex(table).where(primaryKey, 'TEST01').del();
    console.log('✅ CLEANUP: Test record removed');
    
    console.log('\n🎉 All CRUD operations completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ CRUD test failed:', error.message);
    return false;
  }
}

async function runValidation() {
  console.log('🚀 Starting Comprehensive Configuration Validation...\n');
  
  const metadataValid = await validateConfigurationMetadata();
  const crudValid = await testCRUDOperations();
  
  console.log('\n🏁 FINAL RESULTS');
  console.log('================');
  console.log(`Metadata Validation: ${metadataValid ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`CRUD Operations: ${crudValid ? '✅ PASSED' : '❌ FAILED'}`);
  
  const overallValid = metadataValid && crudValid;
  console.log(`Overall System: ${overallValid ? '✅ READY FOR PRODUCTION' : '❌ NEEDS FIXES'}`);
  
  process.exit(overallValid ? 0 : 1);
}

runValidation();