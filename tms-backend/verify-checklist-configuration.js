const db = require('./config/database');

async function verifyChecklistConfigurationStructure() {
  try {
    console.log('\n🔍 CHECKLIST_CONFIGURATION TABLE STRUCTURE VERIFICATION\n');
    console.log('=' .repeat(70));

    // Get table structure
    const result = await db.raw('DESCRIBE checklist_configuration');
    const structure = result[0];

    console.log('📊 Updated Table Structure:');
    console.log('-'.repeat(70));
    console.log('Field'.padEnd(20) + ' | ' + 'Type'.padEnd(15) + ' | ' + 'Null'.padEnd(4) + ' | ' + 'Key'.padEnd(3) + ' | ' + 'Default'.padEnd(10));
    console.log('-'.repeat(70));

    structure.forEach(col => {
      const field = col.Field.padEnd(20);
      const type = col.Type.padEnd(15);
      const nullable = col.Null.padEnd(4);
      const key = (col.Key || '').padEnd(3);
      const defaultVal = (col.Default || 'NULL').padEnd(10);
      
      console.log(`${field} | ${type} | ${nullable} | ${key} | ${defaultVal}`);
    });

    // Verify against requirements
    console.log('\n✅ STRUCTURE VERIFICATION:');
    console.log('-'.repeat(40));

    const expectedFields = {
      'checklist_config_id': { type: 'varchar(10)', null: 'NO', key: 'PRI' },
      'consignor_id': { type: 'varchar(10)', null: 'NO' },
      'warehouse_id': { type: 'varchar(10)', null: 'NO' },
      'checking_point': { type: 'varchar(10)', null: 'NO' },
      'status_id': { type: 'varchar(10)', null: 'NO' },
      'valid_from': { type: 'date', null: 'NO' },
      'valid_to': { type: 'date', null: 'NO' },
      'created_at': { type: 'date', null: 'NO' },
      'created_on': { type: 'time', null: 'NO' },
      'created_by': { type: 'varchar(10)', null: 'NO' },
      'updated_at': { type: 'date', null: 'NO' },
      'updated_on': { type: 'time', null: 'NO' },
      'updated_by': { type: 'varchar(10)', null: 'NO' },
      'status': { type: 'varchar(10)', null: 'YES' }
    };

    let allCorrect = true;

    Object.entries(expectedFields).forEach(([fieldName, expected]) => {
      const actual = structure.find(col => col.Field === fieldName);
      
      if (!actual) {
        console.log(`❌ ${fieldName}: Field missing`);
        allCorrect = false;
      } else {
        const typeMatch = actual.Type.toLowerCase().includes(expected.type.toLowerCase());
        const nullMatch = actual.Null === expected.null;
        const keyMatch = !expected.key || actual.Key === expected.key;
        
        const status = typeMatch && nullMatch && keyMatch ? '✅' : '❌';
        console.log(`${status} ${fieldName}: ${actual.Type} | ${actual.Null} | ${actual.Key || 'None'}`);
        
        if (!typeMatch || !nullMatch || !keyMatch) {
          console.log(`    Expected: ${expected.type} | ${expected.null} | ${expected.key || 'None'}`);
          allCorrect = false;
        }
      }
    });

    // Check for extra fields
    const actualFields = structure.map(col => col.Field);
    const expectedFieldNames = Object.keys(expectedFields);
    const extraFields = actualFields.filter(field => !expectedFieldNames.includes(field));
    
    if (extraFields.length > 0) {
      console.log(`\n⚠️ Extra fields found: ${extraFields.join(', ')}`);
    }

    console.log(`\n${allCorrect ? '🎉 SUCCESS' : '⚠️ ISSUES'}: Table structure ${allCorrect ? 'matches' : 'has differences with'} specifications`);

    // Show sample data if any
    const sampleData = await db('checklist_configuration').select().limit(3);
    if (sampleData.length > 0) {
      console.log('\n📋 Sample Data:');
      console.table(sampleData);
    } else {
      console.log('\n📋 No sample data in table');
    }

  } catch (error) {
    console.error('❌ Error verifying table structure:', error.message);
  } finally {
    await db.destroy();
  }
}

verifyChecklistConfigurationStructure();