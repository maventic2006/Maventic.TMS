/**
 * Seed file for Vehicle test data
 * Populates sample vehicles for testing
 */

exports.seed = async function(knex) {
  // Delete existing entries (in reverse order of foreign key dependencies)
  await knex('vehicle_documents').del();
  await knex('service_frequency_master').del();
  await knex('vehicle_maintenance_service_history').del();
  await knex('vehicle_special_permit').del();
  await knex('vehicle_ownership_details').del();
  await knex('vehicle_basic_information_itm').del();
  await knex('vehicle_basic_information_hdr').del();

  // Insert vehicle basic information headers
  await knex('vehicle_basic_information_hdr').insert([
    {
      vehicle_id_code_hdr: 'VEH0001',
      maker_brand_description: 'TATA',
      maker_model: 'LPT 407',
      vin_chassis_no: 'MAT123456789012345',
      vehicle_type_id: 'VT001',
      vehicle_category: 'Light Commercial Vehicle',
      engine_number: 'ENG123456',
      body_type_desc: 'Closed Body',
      fuel_type_id: 'DIESEL',
      vehicle_colour: 'White',
      engine_type_id: 'DIESEL_4CYL',
      emission_standard: 'BS6',
      financer: 'HDFC Bank',
      manufacturing_month_year: '2023-06',
      unloading_weight: 1500.00,
      gross_vehicle_weight_kg: 4000.00,
      volume_capacity_cubic_meter: 15.50,
      seating_capacity: 2,
      transmission_type: 'MANUAL',
      usage_type_id: 'CARGO',
      safety_inspection_date: '2024-06-15',
      taxes_and_fees: 25000.00,
      load_capacity_in_ton: 2.50,
      cargo_dimensions_width: 2.20,
      cargo_dimensions_height: 2.10,
      cargo_dimensions_length: 4.50,
      towing_capacity: 1000.00,
      suspension_type: 'LEAF_SPRING',
      tire_load_rating: '2000 KG',
      vehicle_condition: 'GOOD',
      fuel_tank_capacity: 60.00,
      blacklist_status: false,
      road_tax: 15000.00,
      gps_tracker_imei_number: '123456789012345',
      gps_tracker_active_flag: true,
      leasing_flag: false,
      avg_running_speed: 45.00,
      max_running_speed: 80.00,
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    },
    {
      vehicle_id_code_hdr: 'VEH0002',
      maker_brand_description: 'Ashok Leyland',
      maker_model: 'Dost Plus',
      vin_chassis_no: 'MAL987654321098765',
      vehicle_type_id: 'VT002',
      vehicle_category: 'Mini Truck',
      engine_number: 'ENG987654',
      body_type_desc: 'Open Body',
      fuel_type_id: 'DIESEL',
      vehicle_colour: 'Blue',
      engine_type_id: 'DIESEL_3CYL',
      emission_standard: 'BS6',
      financer: 'ICICI Bank',
      manufacturing_month_year: '2022-12',
      unloading_weight: 1200.00,
      gross_vehicle_weight_kg: 3500.00,
      volume_capacity_cubic_meter: 12.00,
      seating_capacity: 2,
      transmission_type: 'MANUAL',
      usage_type_id: 'CARGO',
      safety_inspection_date: '2024-05-10',
      taxes_and_fees: 20000.00,
      load_capacity_in_ton: 2.30,
      cargo_dimensions_width: 2.00,
      cargo_dimensions_height: 1.80,
      cargo_dimensions_length: 4.00,
      towing_capacity: 800.00,
      suspension_type: 'LEAF_SPRING',
      tire_load_rating: '1800 KG',
      vehicle_condition: 'EXCELLENT',
      fuel_tank_capacity: 50.00,
      blacklist_status: false,
      road_tax: 12000.00,
      gps_tracker_imei_number: '987654321098765',
      gps_tracker_active_flag: true,
      leasing_flag: true,
      avg_running_speed: 42.00,
      max_running_speed: 75.00,
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    },
    {
      vehicle_id_code_hdr: 'VEH0003',
      maker_brand_description: 'Mahindra',
      maker_model: 'Bolero Pickup',
      vin_chassis_no: 'MAH456789123456789',
      vehicle_type_id: 'VT001',
      vehicle_category: 'Pickup Truck',
      engine_number: 'ENG456789',
      body_type_desc: 'Pickup',
      fuel_type_id: 'DIESEL',
      vehicle_colour: 'Red',
      engine_type_id: 'DIESEL_4CYL',
      emission_standard: 'BS6',
      financer: 'SBI Bank',
      manufacturing_month_year: '2023-03',
      unloading_weight: 1350.00,
      gross_vehicle_weight_kg: 3700.00,
      volume_capacity_cubic_meter: 10.00,
      seating_capacity: 3,
      transmission_type: 'MANUAL',
      usage_type_id: 'CARGO',
      safety_inspection_date: '2024-07-20',
      taxes_and_fees: 18000.00,
      load_capacity_in_ton: 2.35,
      cargo_dimensions_width: 1.85,
      cargo_dimensions_height: 1.70,
      cargo_dimensions_length: 3.80,
      towing_capacity: 900.00,
      suspension_type: 'COIL_SPRING',
      tire_load_rating: '1900 KG',
      vehicle_condition: 'GOOD',
      fuel_tank_capacity: 55.00,
      blacklist_status: false,
      road_tax: 14000.00,
      gps_tracker_imei_number: '456789123456789',
      gps_tracker_active_flag: true,
      leasing_flag: false,
      avg_running_speed: 48.00,
      max_running_speed: 85.00,
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    }
  ]);

  // Insert ownership details
  await knex('vehicle_ownership_details').insert([
    {
      vehicle_ownership_id: 'OWN0001',
      vehicle_id_code: 'VEH0001',
      ownership_name: 'ABC Logistics Pvt Ltd',
      valid_from: '2023-06-15',
      valid_to: '2028-06-14',
      registration_number: 'MH12AB1234',
      registration_date: '2023-06-20',
      registration_upto: '2038-06-19',
      purchase_date: '2023-06-10',
      owner_sr_number: 1,
      state_code: 'MH',
      rto_code: 'MH12',
      present_address_id: 'ADDR001',
      permanent_address_id: 'ADDR001',
      sale_amount: 1250000.00,
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    },
    {
      vehicle_ownership_id: 'OWN0002',
      vehicle_id_code: 'VEH0002',
      ownership_name: 'XYZ Transport Services',
      valid_from: '2022-12-10',
      valid_to: '2027-12-09',
      registration_number: 'KA09CD5678',
      registration_date: '2022-12-15',
      registration_upto: '2037-12-14',
      purchase_date: '2022-12-05',
      owner_sr_number: 1,
      state_code: 'KA',
      rto_code: 'KA09',
      present_address_id: 'ADDR002',
      permanent_address_id: 'ADDR002',
      sale_amount: 980000.00,
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    },
    {
      vehicle_ownership_id: 'OWN0003',
      vehicle_id_code: 'VEH0003',
      ownership_name: 'Rajesh Kumar',
      valid_from: '2023-03-15',
      valid_to: '2028-03-14',
      registration_number: 'DL05EF9012',
      registration_date: '2023-03-20',
      registration_upto: '2038-03-19',
      purchase_date: '2023-03-10',
      owner_sr_number: 1,
      state_code: 'DL',
      rto_code: 'DL05',
      present_address_id: 'ADDR003',
      permanent_address_id: 'ADDR003',
      sale_amount: 850000.00,
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    }
  ]);

  // Insert maintenance history
  await knex('vehicle_maintenance_service_history').insert([
    {
      vehicle_maintenance_id: 'MNT0001',
      vehicle_id_code: 'VEH0001',
      service_date: '2024-01-15',
      service_remark: 'Regular maintenance - Oil change, filter replacement',
      upcoming_service_date: '2024-07-15',
      type_of_service: 'Oil Change',
      service_expense: 5000.00,
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    },
    {
      vehicle_maintenance_id: 'MNT0002',
      vehicle_id_code: 'VEH0002',
      service_date: '2024-02-20',
      service_remark: 'Brake pad replacement and wheel alignment',
      upcoming_service_date: '2024-08-20',
      type_of_service: 'Brake Service',
      service_expense: 8500.00,
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    },
    {
      vehicle_maintenance_id: 'MNT0003',
      vehicle_id_code: 'VEH0003',
      service_date: '2024-03-10',
      service_remark: 'Complete service - Oil, filter, brakes checked',
      upcoming_service_date: '2024-09-10',
      type_of_service: 'Complete Service',
      service_expense: 6500.00,
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    }
  ]);

  // Insert service frequency
  await knex('service_frequency_master').insert([
    {
      vehicle_id: 'VEH0001',
      sequence_number: 1,
      time_period: '6 months',
      km_drove: 10000.00,
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    },
    {
      vehicle_id: 'VEH0002',
      sequence_number: 1,
      time_period: '6 months',
      km_drove: 8000.00,
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    },
    {
      vehicle_id: 'VEH0003',
      sequence_number: 1,
      time_period: '6 months',
      km_drove: 12000.00,
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    }
  ]);

  // Insert vehicle documents
  await knex('vehicle_documents').insert([
    {
      document_id: 'DOC0001',
      vehicle_id_code: 'VEH0001',
      document_type_id: 'VEHICLE_INSURANCE',
      reference_number: 'INS/2023/MH/123456',
      vehicle_maintenance_id: 'MNT0001',
      permit_category: 'Commercial',
      permit_code: 'COM/MH/2023',
      document_provider: 'HDFC ERGO General Insurance',
      coverage_type_id: 'COMPREHENSIVE',
      premium_amount: 25000.00,
      valid_from: '2023-06-20',
      valid_to: '2024-06-19',
      remarks: 'Comprehensive insurance coverage',
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    },
    {
      document_id: 'DOC0002',
      vehicle_id_code: 'VEH0001',
      document_type_id: 'PUC_CERTIFICATE',
      reference_number: 'PUC/MH12/2024/001',
      permit_category: null,
      permit_code: null,
      document_provider: 'Authorized PUC Center',
      coverage_type_id: null,
      premium_amount: 0.00,
      valid_from: '2024-01-10',
      valid_to: '2024-07-10',
      remarks: 'PUC certificate valid',
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    },
    {
      document_id: 'DOC0003',
      vehicle_id_code: 'VEH0002',
      document_type_id: 'VEHICLE_INSURANCE',
      reference_number: 'INS/2022/KA/987654',
      vehicle_maintenance_id: 'MNT0002',
      permit_category: 'Commercial',
      permit_code: 'COM/KA/2022',
      document_provider: 'ICICI Lombard General Insurance',
      coverage_type_id: 'THIRD_PARTY',
      premium_amount: 18000.00,
      valid_from: '2022-12-15',
      valid_to: '2023-12-14',
      remarks: 'Third party insurance',
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    },
    {
      document_id: 'DOC0004',
      vehicle_id_code: 'VEH0003',
      document_type_id: 'FITNESS_CERTIFICATE',
      reference_number: 'FIT/DL05/2024/456',
      permit_category: null,
      permit_code: null,
      document_provider: 'RTO Delhi',
      coverage_type_id: null,
      premium_amount: 0.00,
      valid_from: '2024-03-25',
      valid_to: '2025-03-24',
      remarks: 'Fitness certificate valid for 1 year',
      created_by: 'SEED001',
      updated_by: 'SEED001',
      status: 'ACTIVE'
    }
  ]);

  console.log(' Vehicle test data seeded successfully');
};
