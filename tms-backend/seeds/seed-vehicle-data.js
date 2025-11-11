/**
 * ============================================================================
 * VEHICLE SEED DATA
 * ============================================================================
 * 
 * This seed file populates test data for vehicle maintenance module
 * 
 * Tables Populated:
 * - vehicle_basic_information_hdr
 * - vehicle_basic_information_itm
 * - vehicle_ownership_details
 * - vehicle_maintenance_service_history
 * - service_frequency_master
 * - vehicle_documents
 * 
 * Run: npx knex seed:run --specific=seed-vehicle-data.js
 */

exports.seed = async function (knex) {
  console.log(" Starting vehicle seed data population...");

  try {
    // Clear existing vehicle data (in reverse order of dependencies)
    await knex("vehicle_documents").del();
    await knex("service_frequency_master").del();
    await knex("vehicle_maintenance_service_history").del();
    await knex("vehicle_ownership_details").del();
    await knex("vehicle_basic_information_itm").del();
    await knex("vehicle_basic_information_hdr").del();

    console.log(" Cleared existing vehicle data");

    // ========================================
    // INSERT VEHICLE 1 - Tata LPT 1613
    // ========================================

    await knex("vehicle_basic_information_hdr").insert({
      vehicle_unique_id: 1,
      vehicle_id_code_hdr: "VEH0001",
      maker_brand_description: "Tata Motors",
      maker_model: "LPT 1613",
      vin_chassis_no: "MAT456789ABCD1234",
      vehicle_type_id: "VT001", // Ensure this exists in vehicle_type_master
      vehicle_category: "Medium Commercial Vehicle",
      vehicle_class_description: "Truck",
      engine_number: "ENG987654321",
      body_type_desc: "Cargo Box",
      fuel_type_id: "DIESEL",
      vehicle_colour: "White",
      engine_type_id: "TURBO_DIESEL",
      emission_standard: "BS6",
      financer: "HDFC Bank",
      manufacturing_month_year: "2022-06-01",
      unloading_weight: 3500.00,
      gross_vehicle_weight_kg: 16000.00,
      volume_capacity_cubic_meter: 45.50,
      seating_capacity: 3,
      vehicle_registered_at: "Mumbai RTO",
      transmission_type: "MANUAL",
      usage_type_id: "CARGO",
      safety_inspection_date: "2024-06-15",
      taxes_and_fees: 45000.00,
      load_capacity_in_ton: 12.50,
      cargo_dimensions_width: 2.40,
      cargo_dimensions_height: 2.60,
      cargo_dimensions_length: 6.10,
      towing_capacity: 2000.00,
      suspension_type: "LEAF_SPRING",
      tire_load_rating: "2500 KG",
      vehicle_condition: "GOOD",
      fuel_tank_capacity: 180.00,
      blacklist_status: false,
      road_tax: 25000.00,
      gps_tracker_imei_number: "123456789012345",
      gps_tracker_active_flag: true,
      leasing_flag: false,
      avg_running_speed: 55.00,
      max_running_speed: 80.00,
      created_by: "SEED",
      updated_by: "SEED",
      status: "ACTIVE",
    });

    // Insurance for Vehicle 1
    await knex("vehicle_basic_information_itm").insert({
      vehicle_item_unique_id: 1,
      vehicle_id_code_itm: "VEHITM0001",
      vehicle_id_code_hdr: "VEH0001",
      insurance_provider: "ICICI Lombard General Insurance",
      policy_number: "POL/VEH/2024/001234",
      coverage_type: "Comprehensive",
      policy_expiry_date: "2025-06-30",
      premium_amount: 45000.00,
      created_by: "SEED",
      updated_by: "SEED",
      status: "ACTIVE",
    });

    // Ownership for Vehicle 1
    await knex("vehicle_ownership_details").insert({
      vehicle_ownership_unique_id: 1,
      vehicle_ownership_id: "OWN0001",
      vehicle_id_code: "VEH0001",
      ownership_name: "ABC Logistics Pvt Ltd",
      valid_from: "2022-07-01",
      valid_to: "2042-07-01",
      registration_number: "MH12AB1234",
      registration_date: "2022-07-01",
      registration_upto: "2042-07-01",
      purchase_date: "2022-06-15",
      owner_sr_number: 1,
      state_code: "MH",
      rto_code: "MH12",
      present_address_id: "ADDR0001",
      permanent_address_id: "ADDR0001",
      sale_amount: 1850000.00,
      created_by: "SEED",
      updated_by: "SEED",
      status: "ACTIVE",
    });

    // Maintenance for Vehicle 1
    await knex("vehicle_maintenance_service_history").insert({
      vehicle_maintenance_unique_id: 1,
      vehicle_maintenance_id: "MAINT0001",
      vehicle_id_code: "VEH0001",
      service_date: "2024-09-15",
      service_remark: "Regular service completed - oil change, brake inspection",
      upcoming_service_date: "2025-03-15",
      type_of_service: "Regular Maintenance",
      service_expense: 8500.00,
      created_by: "SEED",
      updated_by: "SEED",
      status: "ACTIVE",
    });

    // Service Frequency for Vehicle 1
    await knex("service_frequency_master").insert({
      frequency_unique_id: 1,
      vehicle_id: "VEH0001",
      sequence_number: 1,
      time_period: "6 months",
      km_drove: 15000.00,
      created_by: "SEED",
      updated_by: "SEED",
      status: "ACTIVE",
    });

    // Documents for Vehicle 1
    await knex("vehicle_documents").insert([
      {
        document_unique_id: 1,
        document_id: "VDOC0001",
        document_type_id: "VEHICLE_INSURANCE",
        reference_number: "POL/VEH/2024/001234",
        permit_category: null,
        permit_code: null,
        document_provider: "ICICI Lombard General Insurance",
        coverage_type_id: "COMPREHENSIVE",
        premium_amount: 45000.00,
        valid_from: "2024-07-01",
        valid_to: "2025-06-30",
        remarks: "Comprehensive insurance coverage with 24x7 roadside assistance",
        created_by: "SEED",
        updated_by: "SEED",
        status: "ACTIVE",
      },
      {
        document_unique_id: 2,
        document_id: "VDOC0002",
        document_type_id: "PUC_CERTIFICATE",
        reference_number: "PUC/MH12/2024/56789",
        permit_category: null,
        permit_code: null,
        document_provider: "Mumbai RTO",
        coverage_type_id: null,
        premium_amount: null,
        valid_from: "2024-08-01",
        valid_to: "2025-02-01",
        remarks: "Pollution Under Control certificate valid for 6 months",
        created_by: "SEED",
        updated_by: "SEED",
        status: "ACTIVE",
      },
    ]);

    console.log(" Inserted Vehicle 1: Tata LPT 1613");

    // ========================================
    // INSERT VEHICLE 2 - Ashok Leyland Dost
    // ========================================

    await knex("vehicle_basic_information_hdr").insert({
      vehicle_unique_id: 2,
      vehicle_id_code_hdr: "VEH0002",
      maker_brand_description: "Ashok Leyland",
      maker_model: "Dost",
      vin_chassis_no: "MAL987654EFGH5678",
      vehicle_type_id: "VT001",
      vehicle_category: "Light Commercial Vehicle",
      vehicle_class_description: "Mini Truck",
      engine_number: "ENG123456789",
      body_type_desc: "Open Body",
      fuel_type_id: "DIESEL",
      vehicle_colour: "Blue",
      engine_type_id: "DIESEL",
      emission_standard: "BS6",
      financer: "State Bank of India",
      manufacturing_month_year: "2023-03-01",
      unloading_weight: 1500.00,
      gross_vehicle_weight_kg: 2460.00,
      volume_capacity_cubic_meter: 15.20,
      seating_capacity: 2,
      vehicle_registered_at: "Delhi RTO",
      transmission_type: "MANUAL",
      usage_type_id: "CARGO",
      safety_inspection_date: "2024-10-01",
      taxes_and_fees: 12000.00,
      load_capacity_in_ton: 0.96,
      cargo_dimensions_width: 1.80,
      cargo_dimensions_height: 1.70,
      cargo_dimensions_length: 2.85,
      towing_capacity: 500.00,
      suspension_type: "LEAF_SPRING",
      tire_load_rating: "800 KG",
      vehicle_condition: "EXCELLENT",
      fuel_tank_capacity: 35.00,
      blacklist_status: false,
      road_tax: 8000.00,
      gps_tracker_imei_number: "987654321098765",
      gps_tracker_active_flag: true,
      leasing_flag: true,
      avg_running_speed: 45.00,
      max_running_speed: 70.00,
      created_by: "SEED",
      updated_by: "SEED",
      status: "ACTIVE",
    });

    // Insurance for Vehicle 2
    await knex("vehicle_basic_information_itm").insert({
      vehicle_item_unique_id: 2,
      vehicle_id_code_itm: "VEHITM0002",
      vehicle_id_code_hdr: "VEH0002",
      insurance_provider: "Bajaj Allianz General Insurance",
      policy_number: "POL/VEH/2024/005678",
      coverage_type: "Third Party",
      policy_expiry_date: "2025-03-31",
      premium_amount: 8500.00,
      created_by: "SEED",
      updated_by: "SEED",
      status: "ACTIVE",
    });

    // Ownership for Vehicle 2
    await knex("vehicle_ownership_details").insert({
      vehicle_ownership_unique_id: 2,
      vehicle_ownership_id: "OWN0002",
      vehicle_id_code: "VEH0002",
      ownership_name: "XYZ Transport Services",
      valid_from: "2023-04-01",
      valid_to: "2043-04-01",
      registration_number: "DL01CD5678",
      registration_date: "2023-04-01",
      registration_upto: "2043-04-01",
      purchase_date: "2023-03-20",
      owner_sr_number: 1,
      state_code: "DL",
      rto_code: "DL01",
      present_address_id: "ADDR0002",
      permanent_address_id: "ADDR0002",
      sale_amount: 675000.00,
      created_by: "SEED",
      updated_by: "SEED",
      status: "ACTIVE",
    });

    // Maintenance for Vehicle 2
    await knex("vehicle_maintenance_service_history").insert({
      vehicle_maintenance_unique_id: 2,
      vehicle_maintenance_id: "MAINT0002",
      vehicle_id_code: "VEH0002",
      service_date: "2024-10-10",
      service_remark: "First service - engine oil replacement, filter cleaning",
      upcoming_service_date: "2025-04-10",
      type_of_service: "First Service",
      service_expense: 3500.00,
      created_by: "SEED",
      updated_by: "SEED",
      status: "ACTIVE",
    });

    // Service Frequency for Vehicle 2
    await knex("service_frequency_master").insert({
      frequency_unique_id: 2,
      vehicle_id: "VEH0002",
      sequence_number: 1,
      time_period: "6 months",
      km_drove: 10000.00,
      created_by: "SEED",
      updated_by: "SEED",
      status: "ACTIVE",
    });

    // Documents for Vehicle 2
    await knex("vehicle_documents").insert([
      {
        document_unique_id: 3,
        document_id: "VDOC0003",
        document_type_id: "VEHICLE_INSURANCE",
        reference_number: "POL/VEH/2024/005678",
        permit_category: null,
        permit_code: null,
        document_provider: "Bajaj Allianz General Insurance",
        coverage_type_id: "THIRD_PARTY",
        premium_amount: 8500.00,
        valid_from: "2024-04-01",
        valid_to: "2025-03-31",
        remarks: "Third party liability insurance",
        created_by: "SEED",
        updated_by: "SEED",
        status: "ACTIVE",
      },
      {
        document_unique_id: 4,
        document_id: "VDOC0004",
        document_type_id: "FITNESS_CERTIFICATE",
        reference_number: "FIT/DL01/2024/12345",
        permit_category: null,
        permit_code: null,
        document_provider: "Delhi RTO",
        coverage_type_id: null,
        premium_amount: null,
        valid_from: "2024-09-01",
        valid_to: "2025-09-01",
        remarks: "Fitness certificate issued by RTO",
        created_by: "SEED",
        updated_by: "SEED",
        status: "ACTIVE",
      },
      {
        document_unique_id: 5,
        document_id: "VDOC0005",
        document_type_id: "LEASING_AGREEMENT",
        reference_number: "LEASE/SBI/2023/789",
        permit_category: null,
        permit_code: null,
        document_provider: "State Bank of India",
        coverage_type_id: null,
        premium_amount: null,
        valid_from: "2023-04-01",
        valid_to: "2028-03-31",
        remarks: "Vehicle leasing agreement for 5 years with SBI",
        created_by: "SEED",
        updated_by: "SEED",
        status: "ACTIVE",
      },
    ]);

    console.log(" Inserted Vehicle 2: Ashok Leyland Dost");

    // ========================================
    // SUMMARY
    // ========================================

    const vehicleCount = await knex("vehicle_basic_information_hdr").count("* as count").first();
    const insuranceCount = await knex("vehicle_basic_information_itm").count("* as count").first();
    const ownershipCount = await knex("vehicle_ownership_details").count("* as count").first();
    const maintenanceCount = await knex("vehicle_maintenance_service_history").count("* as count").first();
    const frequencyCount = await knex("service_frequency_master").count("* as count").first();
    const documentCount = await knex("vehicle_documents").count("* as count").first();

    console.log("\n Vehicle Seed Data Summary:");
    console.log(`    Vehicles: ${vehicleCount.count}`);
    console.log(`    Insurance Records: ${insuranceCount.count}`);
    console.log(`    Ownership Records: ${ownershipCount.count}`);
    console.log(`    Maintenance Records: ${maintenanceCount.count}`);
    console.log(`    Service Frequency Records: ${frequencyCount.count}`);
    console.log(`    Documents: ${documentCount.count}`);
    console.log("\n Vehicle seed data population completed successfully!");

  } catch (error) {
    console.error(" Error populating vehicle seed data:", error);
    throw error;
  }
};
