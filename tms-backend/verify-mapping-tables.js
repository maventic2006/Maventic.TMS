require('dotenv').config();
const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig.development);

async function verifyMappingTables() {
  try {
    console.log('🚀 Verifying Mapping Database Tables Implementation...\n');

    // Get all mapping table counts
    const tableCounts = await Promise.all([
      knex('transporter_consignor_mapping').count('* as count'),
      knex('transporter_consignor_mapping_item').count('* as count'),
      knex('transporter_vehicle_mapping').count('* as count'),
      knex('transporter_driver_mapping').count('* as count'),
      knex('transporter_owner_mapping').count('* as count'),
      knex('vehicle_driver_mapping').count('* as count'),
      knex('blacklist_mapping').count('* as count'),
      knex('blacklist_log').count('* as count')
    ]);

    console.log('📊 MAPPING TABLES OVERVIEW:');
    console.log(`   - Transporter-Consignor Mapping: ${tableCounts[0][0].count} records`);
    console.log(`   - Transporter-Consignor Mapping Items: ${tableCounts[1][0].count} records`);
    console.log(`   - Transporter-Vehicle Mapping: ${tableCounts[2][0].count} records`);
    console.log(`   - Transporter-Driver Mapping: ${tableCounts[3][0].count} records`);
    console.log(`   - Transporter-Owner Mapping: ${tableCounts[4][0].count} records`);
    console.log(`   - Vehicle-Driver Mapping: ${tableCounts[5][0].count} records`);
    console.log(`   - Blacklist Mapping: ${tableCounts[6][0].count} records`);
    console.log(`   - Blacklist Log: ${tableCounts[7][0].count} records`);
    console.log('');

    // Show Transporter-Consignor Mapping details
    const tcMappings = await knex('transporter_consignor_mapping')
      .select('tc_mapping_id', 'transporter_id', 'consignor_id', 'valid_from', 'valid_to', 'active_flag', 'remark')
      .where('active_flag', true);

    if (tcMappings.length > 0) {
      console.log('🔗 TRANSPORTER-CONSIGNOR MAPPINGS:');
      tcMappings.forEach(mapping => {
        console.log(`   - ${mapping.tc_mapping_id}: Transporter ${mapping.transporter_id} ↔ Consignor ${mapping.consignor_id}`);
        console.log(`     Valid: ${mapping.valid_from} to ${mapping.valid_to} | Status: ${mapping.active_flag ? 'Active' : 'Inactive'}`);
        console.log(`     Remark: ${mapping.remark}`);
      });
      console.log('');
    }

    // Show Vehicle-Driver Mapping details with vehicle info
    const vdMappings = await knex('vehicle_driver_mapping as vdm')
      .leftJoin('vehicle_basic_information_hdr as vbh', 'vdm.vehicle_id', 'vbh.vehicle_id_code_hdr')
      .select(
        'vdm.vd_mapping_id',
        'vdm.vehicle_id',
        'vdm.driver_id',
        'vdm.valid_from',
        'vdm.valid_to',
        'vdm.active_flag',
        'vbh.maker_brand_description',
        'vbh.maker_model',
        'vbh.load_capacity_in_ton'
      )
      .where('vdm.active_flag', true);

    if (vdMappings.length > 0) {
      console.log('🚛 VEHICLE-DRIVER MAPPINGS:');
      vdMappings.forEach(mapping => {
        console.log(`   - ${mapping.vd_mapping_id}: Vehicle ${mapping.vehicle_id} ↔ Driver ${mapping.driver_id}`);
        if (mapping.maker_brand_description) {
          console.log(`     Vehicle: ${mapping.maker_brand_description} ${mapping.maker_model} (${mapping.load_capacity_in_ton} tons)`);
        }
        console.log(`     Valid: ${mapping.valid_from} to ${mapping.valid_to} | Status: ${mapping.active_flag ? 'Active' : 'Inactive'}`);
      });
      console.log('');
    }

    // Verify foreign key constraints
    const constraints = await knex.raw(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME LIKE '%mapping%'
      AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);

    console.log('🔗 MAPPING TABLE FOREIGN KEY CONSTRAINTS:');
    if (constraints[0].length > 0) {
      constraints[0].forEach(constraint => {
        console.log(`   ✅ ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME} → ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
      });
    } else {
      console.log('   ⚠️  No foreign key constraints found');
    }
    
    console.log('');

    // Show table structures for key mapping tables
    const tcMappingStructure = await knex.raw('DESCRIBE transporter_consignor_mapping');
    const vdMappingStructure = await knex.raw('DESCRIBE vehicle_driver_mapping');
    const blacklistLogStructure = await knex.raw('DESCRIBE blacklist_log');

    console.log('📋 KEY TABLE STRUCTURES:');
    console.log('   Transporter-Consignor Mapping:');
    tcMappingStructure[0].slice(0, 5).forEach(field => {
      console.log(`   - ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'Nullable' : 'Not Null'})`);
    });
    console.log('');
    
    console.log('   Vehicle-Driver Mapping:');
    vdMappingStructure[0].slice(0, 5).forEach(field => {
      console.log(`   - ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'Nullable' : 'Not Null'})`);
    });
    console.log('');

    console.log('   Blacklist Log (without blacklist_status as requested):');
    blacklistLogStructure[0].slice(0, 7).forEach(field => {
      console.log(`   - ${field.Field}: ${field.Type} (${field.Null === 'YES' ? 'Nullable' : 'Not Null'})`);
    });

    console.log('\n✅ Mapping Database Tables verification complete!');

  } catch (error) {
    console.error('❌ Error verifying mapping tables:', error.message);
  } finally {
    await knex.destroy();
  }
}

verifyMappingTables();