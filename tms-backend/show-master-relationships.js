require('dotenv').config();
const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig.development);

async function showMasterTableRelationships() {
  try {
    console.log('🚀 Showing Master Table Relationships and Data...\n');

    // Show TMS Addresses with their types
    const addresses = await knex('tms_address as ta')
      .leftJoin('address_type_master as atm', 'ta.address_type_id', 'atm.address_type_id')
      .select(
        'ta.address_id',
        'ta.user_type',
        'ta.city',
        'ta.state',
        'ta.address_type_id',
        'atm.address as address_type_name'
      )
      .orderBy('ta.address_id');

    console.log('📍 TMS ADDRESSES WITH TYPE REFERENCES:');
    console.log(`   Total addresses: ${addresses.length}`);
    addresses.forEach(addr => {
      console.log(`   - ${addr.address_id}: ${addr.user_type} in ${addr.city}, ${addr.state}`);
      console.log(`     Address Type: ${addr.address_type_name} (${addr.address_type_id})`);
    });
    console.log('');

    // Show Material Master with their types
    const materials = await knex('material_master_information as mmi')
      .leftJoin('material_types_master as mtm', 'mmi.material_types_id', 'mtm.material_types_id')
      .select(
        'mmi.material_master_id',
        'mmi.material_id',
        'mmi.material_sector',
        'mmi.material_types_id',
        'mtm.material_types as material_type_name',
        'mmi.description'
      )
      .orderBy('mmi.material_master_id');

    console.log('📦 MATERIAL MASTER WITH TYPE REFERENCES:');
    console.log(`   Total materials: ${materials.length}`);
    materials.forEach(mat => {
      console.log(`   - ${mat.material_master_id}: ${mat.material_id} (${mat.material_sector})`);
      console.log(`     Material Type: ${mat.material_type_name} (${mat.material_types_id})`);
      console.log(`     Description: ${mat.description}`);
    });
    console.log('');

    // Show Message Master with their types
    const messages = await knex('message_master as mm')
      .leftJoin('message_type_master as mtm', 'mm.message_type_id', 'mtm.message_type_id')
      .select(
        'mm.message_master_id',
        'mm.application_id',
        'mm.subject',
        'mm.message_type_id',
        'mtm.message_type as message_type_name'
      )
      .orderBy('mm.message_master_id');

    console.log('💬 MESSAGE MASTER WITH TYPE REFERENCES:');
    console.log(`   Total messages: ${messages.length}`);
    messages.forEach(msg => {
      console.log(`   - ${msg.message_master_id}: ${msg.subject}`);
      console.log(`     Message Type: ${msg.message_type_name} (${msg.message_type_id})`);
      console.log(`     Application: ${msg.application_id}`);
    });
    console.log('');

    // Summary of all master tables
    const masterTableCounts = await Promise.all([
      knex('address_type_master').count('* as count'),
      knex('material_types_master').count('* as count'),
      knex('message_type_master').count('* as count'),
      knex('fuel_type_master').count('* as count'),
      knex('engine_type_master').count('* as count'),
      knex('usage_type_master').count('* as count')
    ]);

    console.log('📊 MASTER TABLES SUMMARY:');
    console.log(`   - Address Types: ${masterTableCounts[0][0].count} records`);
    console.log(`   - Material Types: ${masterTableCounts[1][0].count} records`);
    console.log(`   - Message Types: ${masterTableCounts[2][0].count} records`);
    console.log(`   - Fuel Types: ${masterTableCounts[3][0].count} records`);
    console.log(`   - Engine Types: ${masterTableCounts[4][0].count} records`);
    console.log(`   - Usage Types: ${masterTableCounts[5][0].count} records`);
    console.log(`   Total Master Records: ${masterTableCounts.reduce((sum, count) => sum + count[0].count, 0)}`);

    console.log('\n✅ Master Table Relationships displayed successfully!');

  } catch (error) {
    console.error('❌ Error showing master table relationships:', error.message);
  } finally {
    await knex.destroy();
  }
}

showMasterTableRelationships();