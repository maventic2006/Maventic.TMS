exports.seed = async function(knex) {
  try {
    // Delete existing entries in reverse dependency order
    await knex('blacklist_log').del();
    await knex('blacklist_mapping').del();
    await knex('vehicle_driver_mapping').del();
    await knex('transporter_owner_mapping').del();
    await knex('transporter_driver_mapping').del();
    await knex('transporter_vehicle_mapping').del();
    await knex('transporter_consignor_mapping_item').del();
    await knex('transporter_consignor_mapping').del();

  // 1. Transporter Consignor Mapping (Header)
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
    },
    {
      tc_mapping_id: 'TCM002',
      transporter_id: 'TR002',
      consignor_id: 'CON001',
      valid_from: '2024-01-01',
      valid_to: '2024-12-31',
      active_flag: true,
      remark: 'Backup transport arrangement',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // 2. Transporter Consignor Mapping Items
  await knex('transporter_consignor_mapping_item').insert([
    {
      tc_mapping_item_id: 'TCMI001',
      tc_mapping_hdr_id: 'TCM001',
      contract_id: 'CTR001',
      contract_name: 'Mumbai-Delhi Route Contract',
      valid_from: '2024-01-01',
      valid_to: '2024-06-30',
      active_flag: true,
      remark: 'First half year contract',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      tc_mapping_item_id: 'TCMI002',
      tc_mapping_hdr_id: 'TCM001',
      contract_id: 'CTR002',
      contract_name: 'Mumbai-Bangalore Route Contract',
      valid_from: '2024-07-01',
      valid_to: '2024-12-31',
      active_flag: true,
      remark: 'Second half year contract',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // 3. Transporter Vehicle Mapping
  await knex('transporter_vehicle_mapping').insert([
    {
      tv_mapping_id: 'TVM001',
      transporter_id: 'TR001',
      vehicle_id: 'VH001',
      valid_from: '2024-01-01',
      valid_to: '2024-12-31',
      active_flag: true,
      remark: 'Primary vehicle assignment for TR001',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      tv_mapping_id: 'TVM002',
      transporter_id: 'TR001',
      vehicle_id: 'VH002',
      valid_from: '2024-01-01',
      valid_to: '2024-12-31',
      active_flag: true,
      remark: 'Secondary vehicle assignment for TR001',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // 4. Transporter Driver Mapping
  await knex('transporter_driver_mapping').insert([
    {
      td_mapping_id: 'TDM001',
      driver_id: 'DRV001',
      transporter_id: 'TR001',
      valid_from: '2024-01-01',
      valid_to: '2024-12-31',
      active_flag: true,
      remark: 'Permanent driver assignment',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      td_mapping_id: 'TDM002',
      driver_id: 'DRV002',
      transporter_id: 'TR001',
      valid_from: '2024-01-01',
      valid_to: '2024-12-31',
      active_flag: true,
      remark: 'Relief driver assignment',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // 5. Transporter Owner Mapping
  await knex('transporter_owner_mapping').insert([
    {
      to_mapping_id: 'TOM001',
      transporter_id: 'TR001',
      owner_id: 'OWN001',
      valid_from: '2024-01-01',
      valid_to: '2024-12-31',
      active_flag: true,
      remark: 'Vehicle ownership mapping',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // 6. Vehicle Driver Mapping
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
    },
    {
      vd_mapping_id: 'VDM002',
      vehicle_id: 'VH002',
      driver_id: 'DRV002',
      valid_from: '2024-01-01',
      valid_to: '2024-12-31',
      active_flag: true,
      remark: 'Primary driver for VH002',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // 7. Blacklist Mapping
  await knex('blacklist_mapping').insert([
    {
      blacklist_mapping_id: 'BLM001',
      blacklisted_by: 'CONSIGNOR',
      blacklisted_by_id: 'CON001',
      user_type: 'DRIVER',
      user_id: 'DRV003',
      valid_from: '2024-03-01',
      valid_to: '2024-06-01',
      remark: 'Blacklisted due to repeated delivery delays',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      blacklist_mapping_id: 'BLM002',
      blacklisted_by: 'TRANSPORTER',
      blacklisted_by_id: 'TR001',
      user_type: 'CONSIGNOR',
      user_id: 'CON002',
      valid_from: '2024-02-15',
      valid_to: '2024-05-15',
      remark: 'Blacklisted due to payment defaults',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // 8. Blacklist Log (excluding blacklist_status as requested)
  await knex('blacklist_log').insert([
    {
      blacklist_log_id: 'BLL001',
      blacklisted_by_id: 'CON001',
      blacklist_type: 'DRIVER_BLACKLIST',
      user_id: 'DRV003',
      actioned_by: 'ADM001',
      actioned_at: '2024-03-01',
      actioned_on: '09:30:00',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      blacklist_log_id: 'BLL002',
      blacklisted_by_id: 'TR001',
      blacklist_type: 'CONSIGNOR_BLACKLIST',
      user_id: 'CON002',
      actioned_by: 'ADM001',
      actioned_at: '2024-02-15',
      actioned_on: '14:45:00',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      blacklist_log_id: 'BLL003',
      blacklisted_by_id: 'CON001',
      blacklist_type: 'DRIVER_UNBLACKLIST',
      user_id: 'DRV003',
      actioned_by: 'ADM002',
      actioned_at: '2024-06-01',
      actioned_on: '10:15:00',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

    console.log('✅ All Mapping Tables (Transporter, Vehicle, Driver, Consignor, Blacklist) sample data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding mapping tables:', error.message);
    throw error;
  }
};