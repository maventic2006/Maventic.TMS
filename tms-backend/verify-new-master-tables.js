require('dotenv').config();
const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig.development);

async function verifyMasterTables() {
  try {
    console.log('🚀 Verifying New Master Tables and Foreign Key Relationships...\n');

    // Verify Address Type Master
    const addressTypes = await knex('address_type_master')
      .select('address_type_id', 'address', 'status')
      .orderBy('address_type_id');
    
    console.log('📋 ADDRESS TYPE MASTER:');
    console.log(`   Total records: ${addressTypes.length}`);
    addressTypes.forEach(type => {
      console.log(`   - ${type.address_type_id}: ${type.address} (${type.status})`);
    });
    console.log('');

    // Verify Material Types Master
    const materialTypes = await knex('material_types_master')
      .select('material_types_id', 'material_types', 'status')
      .orderBy('material_types_id');
    
    console.log('📋 MATERIAL TYPES MASTER:');
    console.log(`   Total records: ${materialTypes.length}`);
    materialTypes.forEach(type => {
      console.log(`   - ${type.material_types_id}: ${type.material_types} (${type.status})`);
    });
    console.log('');

    // Verify Message Type Master
    const messageTypes = await knex('message_type_master')
      .select('message_type_id', 'message_type', 'status')
      .orderBy('message_type_id');
    
    console.log('📋 MESSAGE TYPE MASTER:');
    console.log(`   Total records: ${messageTypes.length}`);
    messageTypes.forEach(type => {
      console.log(`   - ${type.message_type_id}: ${type.message_type} (${type.status || 'N/A'})`);
    });
    console.log('');

    // Check if related tables have any data
    const addressCount = await knex('tms_address').count('* as count');
    const materialCount = await knex('material_master_information').count('* as count');
    const messageCount = await knex('message_master').count('* as count');

    console.log('📊 RELATED TABLES STATUS:');
    console.log(`   - TMS Address records: ${addressCount[0].count}`);
    console.log(`   - Material Master records: ${materialCount[0].count}`);
    console.log(`   - Message Master records: ${messageCount[0].count}`);
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
      AND REFERENCED_TABLE_NAME IN ('address_type_master', 'material_types_master', 'message_type_master')
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);

    console.log('🔗 FOREIGN KEY CONSTRAINTS VERIFICATION:');
    if (constraints[0].length > 0) {
      console.log('   New Master Table Foreign Keys:');
      constraints[0].forEach(constraint => {
        console.log(`   - ${constraint.COLUMN_NAME} → ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
      });
    } else {
      console.log('   ⚠️  No foreign key constraints found for new master tables');
    }

    console.log('\n✅ New Master Tables verification complete!');

  } catch (error) {
    console.error('❌ Error verifying master tables:', error.message);
  } finally {
    await knex.destroy();
  }
}

verifyMasterTables();