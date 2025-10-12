exports.seed = async function(knex) {
  // First clean up existing data
  await knex('vehicle_documents').del();
  await knex('vehicle_maintenance_service_history').del(); 
  await knex('vehicle_ownership_details').del();
  await knex('vehicle_special_permit').del();
  await knex('vehicle_basic_information_itm').del();
  await knex('service_frequency_master').del();
  await knex('vehicle_basic_information_hdr').del();
  await knex('vehicle_type_master').del();

  // Insert vehicle type master data
  await knex('vehicle_type_master').insert([
    {
      vehicle_type_id: 'VT001',
      vehicle_type_description: 'Heavy Duty Truck',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      vehicle_type_id: 'VT002', 
      vehicle_type_description: 'Light Commercial Vehicle',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      vehicle_type_id: 'VT003',
      vehicle_type_description: 'Container Truck',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // Insert vehicle basic information header
  await knex('vehicle_basic_information_hdr').insert([
    {
      vehicle_id_code_hdr: 'VH001',
      maker_brand_description: 'Tata Motors',
      maker_model: 'LPT 2523',
      vin_chassis_no: 'MAT621070J3E12345',
      vehicle_type_id: 'VT001',
      vehicle_category: 'Commercial',
      vehicle_class_description: 'Heavy Motor Vehicle',
      engine_number: 'ENG123456789',
      body_type_desc: 'Open Body',
      fuel_type_id: 'FT001',
      vehicle_colour: 'White',
      engine_type_id: 'ET001',
      emission_standard: 'BS6',
      fitness_upto: '2026-12-31',
      tax_upto: '2025-03-31',
      manufacturing_month_year: '2023-06',
      gross_vehicle_weight_kg: 25000.00,
      load_capacity_in_ton: 16.20,
      fuel_tank_capacity: 300.00,
      usage_type_id: 'UT001',
      gps_tracker_active_flag: true,
      gps_tracker_imei_number: '860123456789012',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      vehicle_id_code_hdr: 'VH002',
      maker_brand_description: 'Ashok Leyland',
      maker_model: 'BOSS 1618',
      vin_chassis_no: 'MAL123456789ABCDEF',
      vehicle_type_id: 'VT001',
      vehicle_category: 'Commercial',
      vehicle_class_description: 'Heavy Motor Vehicle',
      engine_number: 'ENG987654321',
      body_type_desc: 'Container Body',
      fuel_type_id: 'FT001',
      vehicle_colour: 'Blue',
      engine_type_id: 'ET001',
      emission_standard: 'BS6',
      fitness_upto: '2027-06-30',
      tax_upto: '2025-06-30',
      manufacturing_month_year: '2024-01',
      gross_vehicle_weight_kg: 16000.00,
      load_capacity_in_ton: 10.50,
      fuel_tank_capacity: 250.00,
      usage_type_id: 'UT004',
      gps_tracker_active_flag: true,
      gps_tracker_imei_number: '860987654321098',
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // Insert vehicle basic information items (insurance details)
  await knex('vehicle_basic_information_itm').insert([
    {
      vehicle_id_code_itm: 'VI001',
      vehicle_id_code_hdr: 'VH001',
      insurance_provider: 'ICICI Lombard General Insurance',
      policy_number: 'POL123456789',
      coverage_type: 'Comprehensive',
      policy_expiry_date: '2025-12-31',
      premium_amount: 45000.00,
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      vehicle_id_code_itm: 'VI002',
      vehicle_id_code_hdr: 'VH002',
      insurance_provider: 'Bajaj Allianz General Insurance',
      policy_number: 'POL987654321',
      coverage_type: 'Third Party',
      policy_expiry_date: '2025-08-15',
      premium_amount: 25000.00,
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // Insert vehicle ownership details
  await knex('vehicle_ownership_details').insert([
    {
      vehicle_ownership_id: 'VO001',
      vehicle_id_code: 'VH001',
      ownership_name: 'ABC Transport Company',
      valid_from: '2023-06-15',
      valid_to: '2033-06-14',
      registration_number: 'MH12AB1234',
      registration_date: '2023-06-15',
      registration_upto: '2038-06-14',
      purchase_date: '2023-06-10',
      state_code: 'MH',
      rto_code: 'MH12',
      sale_amount: 2500000.00,
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      vehicle_ownership_id: 'VO002',
      vehicle_id_code: 'VH002',
      ownership_name: 'XYZ Logistics Pvt Ltd',
      valid_from: '2024-01-20',
      valid_to: '2034-01-19',
      registration_number: 'KL09CD5678',
      registration_date: '2024-01-20',
      registration_upto: '2039-01-19',
      purchase_date: '2024-01-15',
      state_code: 'KL',
      rto_code: 'KL09',
      sale_amount: 1800000.00,
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // Insert maintenance records
  await knex('vehicle_maintenance_service_history').insert([
    {
      vehicle_maintenance_id: 'VM001',
      vehicle_id_code: 'VH001',
      service_date: '2024-09-15',
      service_remark: 'Regular preventive maintenance - Oil change, filter replacement',
      upcoming_service_date: '2024-12-15',
      type_of_service: 'Preventive Maintenance',
      service_expense: 8500.00,
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      vehicle_maintenance_id: 'VM002',
      vehicle_id_code: 'VH002',
      service_date: '2024-08-20',
      service_remark: 'Brake system overhaul and clutch adjustment',
      upcoming_service_date: '2024-11-20',
      type_of_service: 'Corrective Maintenance',
      service_expense: 15000.00,
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  // Insert service frequency data
  await knex('service_frequency_master').insert([
    {
      vehicle_id: 'VH001',
      sequence_number: 1,
      time_period: '3 Months',
      km_drove: 10000.00,
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    },
    {
      vehicle_id: 'VH002',
      sequence_number: 1,
      time_period: '4 Months',
      km_drove: 12000.00,
      created_by: 'SYSTEM',
      updated_by: 'SYSTEM'
    }
  ]);

  console.log('✅ Vehicle sample data seeded successfully!');
};