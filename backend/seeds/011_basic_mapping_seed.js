exports.seed = async function(knex) {
  try {
    // Only seed tables without foreign key dependencies first
    
    // 1. Transporter Consignor Mapping (Header) - no FK dependencies
    await knex('transporter_consignor_mapping').insert([
      {
        tc_mapping_id: 'TCM001',
        transporter_id: 'TR001',
        consignor_id: 'CON001',
        valid_from: '2024-01-01',
        valid_to: '2024-12-31',
        active_flag: true,
        remark: 'Annual transport contract between TR001 and CON001',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      }
    ]);

    // 2. Vehicle Driver Mapping - references existing vehicle table
    await knex('vehicle_driver_mapping').insert([
      {
        vd_mapping_id: 'VDM001',
        vehicle_id: 'VH001',
        driver_id: 'DRV001',
        valid_from: '2024-01-01',
        valid_to: '2024-12-31',
        active_flag: true,
        remark: 'Primary driver for VH001',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      }
    ]);

    console.log('✅ Basic Mapping Tables sample data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding basic mapping tables:', error.message);
    throw error;
  }
};