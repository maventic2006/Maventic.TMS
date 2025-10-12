require('dotenv').config();
const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig.development);

async function verifyCoverageTypeMaster() {
  try {
    console.log('🚀 Verifying Coverage Type Master Table and Foreign Key Relationships...\n');

    // Verify Coverage Type Master
    const coverageTypes = await knex('coverage_type_master')
      .select('coverage_type_id', 'coverage_type', 'status')
      .orderBy('coverage_type_id');
    
    console.log('📋 COVERAGE TYPE MASTER:');
    console.log(`   Total records: ${coverageTypes.length}`);
    coverageTypes.forEach(type => {
      console.log(`   - ${type.coverage_type_id}: ${type.coverage_type} (${type.status})`);
    });
    console.log('');

    // Check vehicle_documents table structure
    const vehicleDocsStructure = await knex.raw(`
      DESCRIBE vehicle_documents
    `);
    
    console.log('📋 VEHICLE DOCUMENTS TABLE STRUCTURE:');
    const relevantFields = vehicleDocsStructure[0].filter(field => 
      ['coverage_type_id', 'document_provider', 'premium_amount'].includes(field.Field)
    );
    relevantFields.forEach(field => {
      console.log(`   - ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'Nullable' : 'Not Null'})`);
    });
    console.log('');

    // Verify foreign key constraints exist
    const constraints = await knex.raw(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND REFERENCED_TABLE_NAME = 'coverage_type_master'
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);

    console.log('🔗 FOREIGN KEY CONSTRAINTS VERIFICATION:');
    if (constraints[0].length > 0) {
      console.log('   Coverage Type Foreign Keys:');
      constraints[0].forEach(constraint => {
        console.log(`   - ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME} → ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
      });
    } else {
      console.log('   ⚠️  No foreign key constraints found for coverage_type_master');
    }
    console.log('');

    // Check if vehicle_documents has any data
    const vehicleDocsCount = await knex('vehicle_documents').count('* as count');
    console.log('📊 RELATED TABLES STATUS:');
    console.log(`   - Vehicle Documents records: ${vehicleDocsCount[0].count}`);
    console.log('');

    // Show all master tables count for context
    const allMasterTables = await Promise.all([
      knex('coverage_type_master').count('* as count'),
      knex('address_type_master').count('* as count'),
      knex('material_types_master').count('* as count'),
      knex('message_type_master').count('* as count'),
      knex('fuel_type_master').count('* as count'),
      knex('engine_type_master').count('* as count'),
      knex('usage_type_master').count('* as count')
    ]);

    console.log('📊 ALL MASTER TABLES SUMMARY:');
    console.log(`   - Coverage Types: ${allMasterTables[0][0].count} records`);
    console.log(`   - Address Types: ${allMasterTables[1][0].count} records`);
    console.log(`   - Material Types: ${allMasterTables[2][0].count} records`);
    console.log(`   - Message Types: ${allMasterTables[3][0].count} records`);
    console.log(`   - Fuel Types: ${allMasterTables[4][0].count} records`);
    console.log(`   - Engine Types: ${allMasterTables[5][0].count} records`);
    console.log(`   - Usage Types: ${allMasterTables[6][0].count} records`);
    console.log(`   Total Master Records: ${allMasterTables.reduce((sum, count) => sum + count[0].count, 0)}`);

    console.log('\n✅ Coverage Type Master verification complete!');

  } catch (error) {
    console.error('❌ Error verifying coverage type master:', error.message);
  } finally {
    await knex.destroy();
  }
}

verifyCoverageTypeMaster();