require("dotenv").config();
const knex = require("knex")(require("./knexfile").development);

async function showVehicleData() {
  try {
    console.log("🚛 Vehicle Management System - Data Overview\n");
    
    // Get vehicle basic information with type
    const vehicles = await knex('vehicle_basic_information_hdr as vh')
      .leftJoin('vehicle_type_master as vt', 'vh.vehicle_type_id', 'vt.vehicle_type_id')
      .select('vh.vehicle_id_code_hdr', 'vh.maker_brand_description', 'vh.maker_model', 
              'vh.vin_chassis_no', 'vt.vehicle_type_description', 'vh.load_capacity_in_ton');
    
    console.log("📋 VEHICLE FLEET OVERVIEW:");
    console.log("=" .repeat(80));
    vehicles.forEach(vehicle => {
      console.log(`🚚 ${vehicle.vehicle_id_code_hdr} - ${vehicle.maker_brand_description} ${vehicle.maker_model}`);
      console.log(`   Type: ${vehicle.vehicle_type_description}`);
      console.log(`   VIN: ${vehicle.vin_chassis_no}`);
      console.log(`   Load Capacity: ${vehicle.load_capacity_in_ton} tons\n`);
    });

    // Get ownership details
    const ownership = await knex('vehicle_ownership_details as vo')
      .join('vehicle_basic_information_hdr as vh', 'vo.vehicle_id_code', 'vh.vehicle_id_code_hdr')
      .select('vh.vehicle_id_code_hdr', 'vh.maker_brand_description', 'vo.ownership_name', 
              'vo.registration_number', 'vo.state_code', 'vo.registration_upto');
    
    console.log("📄 OWNERSHIP & REGISTRATION:");
    console.log("=" .repeat(80));
    ownership.forEach(owner => {
      console.log(`🏢 ${owner.vehicle_id_code_hdr} (${owner.maker_brand_description})`);
      console.log(`   Owner: ${owner.ownership_name}`);
      console.log(`   Registration: ${owner.registration_number} (${owner.state_code})`);
      console.log(`   Valid Until: ${owner.registration_upto}\n`);
    });

    // Get maintenance history
    const maintenance = await knex('vehicle_maintenance_service_history as vm')
      .join('vehicle_basic_information_hdr as vh', 'vm.vehicle_id_code', 'vh.vehicle_id_code_hdr')
      .select('vh.vehicle_id_code_hdr', 'vh.maker_brand_description', 'vm.service_date',
              'vm.type_of_service', 'vm.service_expense', 'vm.upcoming_service_date')
      .orderBy('vm.service_date', 'desc');
    
    console.log("🔧 MAINTENANCE HISTORY:");
    console.log("=" .repeat(80));
    maintenance.forEach(service => {
      console.log(`🔧 ${service.vehicle_id_code_hdr} (${service.maker_brand_description})`);
      console.log(`   Service Date: ${service.service_date}`);
      console.log(`   Type: ${service.type_of_service}`);
      console.log(`   Cost: ₹${service.service_expense}`);
      console.log(`   Next Service: ${service.upcoming_service_date}\n`);
    });

    // Get insurance details
    const insurance = await knex('vehicle_basic_information_itm as vi')
      .join('vehicle_basic_information_hdr as vh', 'vi.vehicle_id_code_hdr', 'vh.vehicle_id_code_hdr')
      .select('vh.vehicle_id_code_hdr', 'vh.maker_brand_description', 'vi.insurance_provider',
              'vi.policy_number', 'vi.coverage_type', 'vi.policy_expiry_date', 'vi.premium_amount');
    
    console.log("🛡️ INSURANCE COVERAGE:");
    console.log("=" .repeat(80));
    insurance.forEach(policy => {
      console.log(`🛡️ ${policy.vehicle_id_code_hdr} (${policy.maker_brand_description})`);
      console.log(`   Provider: ${policy.insurance_provider}`);
      console.log(`   Policy: ${policy.policy_number} (${policy.coverage_type})`);
      console.log(`   Premium: ₹${policy.premium_amount}`);
      console.log(`   Expires: ${policy.policy_expiry_date}\n`);
    });

    console.log("🎉 Vehicle data verification complete!");
    
  } catch (error) {
    console.error("❌ Error fetching vehicle data:", error.message);
  } finally {
    await knex.destroy();
  }
}

showVehicleData();