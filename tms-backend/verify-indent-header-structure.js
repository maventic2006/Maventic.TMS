const knex = require('./config/database');

async function verifyIndentHeaderStructure() {
  try {
    console.log('=== Verifying indent_header table structure ===\n');
    
    // Get table structure
    const [structure] = await knex.raw('DESCRIBE indent_header');
    
    console.log('Current Table Structure:');
    console.log('------------------------');
    structure.forEach(column => {
      console.log(`${column.Field.padEnd(30)} | ${column.Type.padEnd(15)} | Null: ${column.Null.padEnd(3)} | Key: ${column.Key.padEnd(3)} | Default: ${column.Default || 'NULL'}`);
    });
    
    console.log('\n=== Expected vs Actual Comparison ===\n');
    
    const expectedStructure = {
      'indent_id': { type: 'varchar(10)', nullable: 'NO', key: 'PRI', unique: true },
      'consignor_id': { type: 'varchar(10)', nullable: 'YES', key: '', unique: false },
      'warehouse_id': { type: 'varchar(10)', nullable: 'NO', key: 'UNI', unique: true },
      'creation_medium_id': { type: 'varchar(10)', nullable: 'YES', key: '', unique: false },
      'warehouse_gate_sub_type_id': { type: 'varchar(10)', nullable: 'YES', key: '', unique: false },
      'goods_loading_point_id': { type: 'varchar(10)', nullable: 'YES', key: '', unique: false },
      'priority_order_identifier': { type: 'varchar(10)', nullable: 'YES', key: '', unique: false },
      'e_bidding_eligible': { type: 'tinyint(1)', nullable: 'NO', key: '', unique: false },
      'ebidding_slot_number': { type: 'varchar(10)', nullable: 'NO', key: '', unique: false },
      'comments': { type: 'varchar(30)', nullable: 'NO', key: '', unique: false },
      'indent_status_id': { type: 'varchar(10)', nullable: 'NO', key: '', unique: false },
      'total_freight_amount': { type: 'varchar(10)', nullable: 'NO', key: '', unique: false },
      'currency_id': { type: 'varchar(10)', nullable: 'NO', key: '', unique: false },
      'created_at': { type: 'date', nullable: 'NO', key: '', unique: false },
      'created_on': { type: 'time', nullable: 'NO', key: '', unique: false },
      'created_by': { type: 'varchar(10)', nullable: 'NO', key: '', unique: false },
      'updated_at': { type: 'date', nullable: 'NO', key: '', unique: false },
      'updated_on': { type: 'time', nullable: 'NO', key: '', unique: false },
      'updated_by': { type: 'varchar(10)', nullable: 'NO', key: '', unique: false },
      'status': { type: 'varchar(10)', nullable: 'YES', key: '', unique: false }
    };
    
    let allCorrect = true;
    
    for (const column of structure) {
      const fieldName = column.Field;
      const expected = expectedStructure[fieldName];
      
      if (!expected) {
        console.log(`❌ Unexpected column: ${fieldName}`);
        allCorrect = false;
        continue;
      }
      
      const typeMatch = column.Type === expected.type;
      const nullMatch = column.Null === expected.nullable;
      const keyMatch = column.Key === expected.key || (expected.key === '' && column.Key === 'MUL');
      
      if (typeMatch && nullMatch && keyMatch) {
        console.log(`✅ ${fieldName}: All properties match specification`);
      } else {
        console.log(`❌ ${fieldName}:`);
        if (!typeMatch) console.log(`   Type mismatch: Expected ${expected.type}, Got ${column.Type}`);
        if (!nullMatch) console.log(`   Nullable mismatch: Expected ${expected.nullable}, Got ${column.Null}`);
        if (!keyMatch) console.log(`   Key mismatch: Expected ${expected.key}, Got ${column.Key}`);
        allCorrect = false;
      }
    }
    
    // Check for missing columns
    const actualColumns = structure.map(col => col.Field);
    const expectedColumns = Object.keys(expectedStructure);
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log(`❌ Missing columns: ${missingColumns.join(', ')}`);
      allCorrect = false;
    }
    
    console.log('\n=== Sample Data ===\n');
    
    // Get sample data
    const sampleData = await knex.select('*').from('indent_header').limit(3);
    
    if (sampleData.length > 0) {
      console.log('Sample records:');
      console.table(sampleData);
    } else {
      console.log('No data found in table');
    }
    
    console.log('\n=== Summary ===');
    console.log(`Structure verification: ${allCorrect ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Total columns: ${structure.length}`);
    console.log(`Records count: ${sampleData.length}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error during verification:', error.message);
    process.exit(1);
  }
}

verifyIndentHeaderStructure();