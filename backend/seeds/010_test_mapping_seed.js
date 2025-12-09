exports.seed = async function(knex) {
  try {
    // Delete existing entries
    await knex('transporter_consignor_mapping').del();

    // Test with just the header mapping (no foreign key dependencies)
    await knex('transporter_consignor_mapping').insert([
      {
        tc_mapping_id: 'TCM001',
        transporter_id: 'TR001',
        consignor_id: 'CON001',
        valid_from: '2024-01-01',
        valid_to: '2024-12-31',
        active_flag: true,
        remark: 'Test mapping',
        created_by: 'SYSTEM',
        updated_by: 'SYSTEM'
      }
    ]);

    console.log('✅ Test mapping seed successful!');
  } catch (error) {
    console.error('❌ Error in test seed:', error.message);
    throw error;
  }
};