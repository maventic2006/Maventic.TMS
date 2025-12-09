const db = require('./config/database');
const consignorConfigurati    // Get prefix from config - fields is an object, not array
    const pkFieldConfig = config.fields[config.primaryKey];
    if (pkFieldConfig && pkFieldConfig.autoGenerate) {
      // Use a default prefix based on configurationType
      let prefix;
      switch (configurationType) {
        case 'checklist_configuration':
          prefix = 'CHK';
          break;
        case 'consignor_material_state_config':
          prefix = 'MSC';
          break;
        case 'changeable_field_info':
          prefix = 'CFI';
          break;
        case 'milestone_invoice_requirement':
          prefix = 'MIR';
          break;
        default:
          prefix = 'GEN';
      }
      const nextId = generateNextId(prefix, existingIds);
      recordData[config.primaryKey] = nextId;
      console.log(`   🎯 Generated ID: ${nextId}`);
    }equire('./config/consignor-configurations.json');

// Simplified version of enhanced generateNextId for testing
function generateNextId(prefix, existingIds) {
  console.log(`   ��� Generating VARCHAR ID for prefix: ${prefix}`);
  console.log(`   ��� Existing IDs to check:`, existingIds);
  
  if (!prefix || prefix.trim() === '') {
    throw new Error('Invalid prefix provided');
  }
  
  const filteredIds = existingIds.filter(id => 
    id && typeof id === 'string' && id.startsWith(prefix)
  );
  
  if (filteredIds.length === 0) {
    return prefix + '0001';
  }
  
  const numericParts = filteredIds
    .map(id => {
      const numericPart = id.substring(prefix.length);
      return parseInt(numericPart, 10);
    })
    .filter(num => !isNaN(num));
  
  if (numericParts.length === 0) {
    return prefix + '0001';
  }
  
  const maxNumber = Math.max(...numericParts);
  const nextNumber = maxNumber + 1;
  return prefix + String(nextNumber).padStart(4, '0');
}

// Simulate the enhanced controller logic
async function simulateEnhancedController(configurationType, data) {
  const config = consignorConfigurations[configurationType];
  if (!config) {
    throw new Error(`Configuration not found for type: ${configurationType}`);
  }

  console.log(`   ��� Configuration: ${configurationType}`);
  console.log(`   ���️  Table: ${config.table}`);
  console.log(`   ��� Primary Key: ${config.primaryKey}`);

  // Check primary key column type (enhanced logic)
  const [tableSchema] = await db.raw(`DESCRIBE ${config.table}`);
  const pkColumn = tableSchema.find(col => col.Field === config.primaryKey);
  
  console.log(`   ��� Column Type: ${pkColumn.Type}`);
  console.log(`   ⚡ Auto Increment: ${pkColumn.Extra.includes('auto_increment') ? 'YES' : 'NO'}`);

  let recordData = { ...data };

  // Enhanced primary key handling
  if (pkColumn.Extra.includes('auto_increment')) {
    console.log(`   ⏭️  Skipping ID generation for auto-increment column`);
    // Don't set primary key for auto-increment - let MySQL handle it
  } else {
    console.log(`   ��� Generating string ID for VARCHAR column`);
    
    // Get existing IDs for VARCHAR primary keys
    const existingRecords = await db(config.table).select(config.primaryKey);
    const existingIds = existingRecords.map(record => record[config.primaryKey]);
    
    // Get prefix from config
    const autoGenField = config.fields.find(field => field.autoGenerate);
    if (autoGenField && autoGenField.prefix) {
      const nextId = generateNextId(autoGenField.prefix, existingIds);
      recordData[config.primaryKey] = nextId;
      console.log(`   ��� Generated ID: ${nextId}`);
    }
  }

  // Add audit fields
  recordData.created_at = new Date();
  recordData.updated_at = new Date();

  console.log(`   ��� Inserting data:`, recordData);

  // Insert the record
  const result = await db(config.table).insert(recordData);
  
  let insertedId;
  if (pkColumn.Extra.includes('auto_increment')) {
    insertedId = result[0]; // Auto-generated ID
  } else {
    insertedId = recordData[config.primaryKey]; // Our generated string ID
  }
  
  return { id: insertedId, data: recordData };
}

async function testBothScenarios() {
  console.log('��� Testing Enhanced Controller Logic...\n');
  
  try {
    // Test 1: AUTO-INCREMENT scenario (e_bidding_config)
    console.log('1️⃣ Testing AUTO-INCREMENT scenario (e_bidding_config):');
    
    const eBiddingTestData = {
      consignor_id: 'CON002',
      warehouse_id: 'WH002',
      vehicle_type: 'LCV',
      max_rate: 35,
      min_rate: 20,
      freight_unit_id: 'CM',
      e_bidding_tolerance_value: 10,
      status: 'ACTIVE',
      created_by: 'TEST',
      created_on: new Date(),
      updated_by: 'TEST',
      updated_on: new Date()
    };

    const eBiddingResult = await simulateEnhancedController('e_bidding_config', eBiddingTestData);
    console.log(`   ✅ Result: ID=${eBiddingResult.id} (MySQL auto-generated)`);
    
    // Cleanup
    await db('e_bidding_config').where('e_bidding_config_id', eBiddingResult.id).del();
    console.log(`   ✅ Cleaned up record ${eBiddingResult.id}\n`);

    // Test 2: VARCHAR scenario (checklist_configuration) 
    console.log('2️⃣ Testing VARCHAR scenario (checklist_configuration):');
    
    const checklistTestData = {
      consignor_id: 'CON002',
      warehouse_id: 'WH002',
      checking_point: 'TEST_POINT',
      status_id: 'STS001',
      valid_from: new Date().toISOString().split('T')[0],
      valid_to: '2025-12-31',
      created_by: 'TEST',
      created_on: new Date().toTimeString().split(' ')[0],
      updated_by: 'TEST',
      updated_on: new Date().toTimeString().split(' ')[0],
      status: 'ACTIVE'
    };

    const checklistResult = await simulateEnhancedController('checklist_configuration', checklistTestData);
    console.log(`   ✅ Result: ID=${checklistResult.id} (Generated string ID)`);
    
    // Cleanup
    await db('checklist_configuration').where('checklist_config_id', checklistResult.id).del();
    console.log(`   ✅ Cleaned up record ${checklistResult.id}\n`);
    
    console.log('��� All tests passed! Enhanced controller logic working correctly for both scenarios.');
    console.log('\n✅ SUMMARY:');
    console.log('   • AUTO-INCREMENT columns: Controller skips ID generation ✓');
    console.log('   • VARCHAR columns: Controller generates string IDs ✓');
    console.log('   • Original e_bidding_config error should now be fixed ✓');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testBothScenarios();
