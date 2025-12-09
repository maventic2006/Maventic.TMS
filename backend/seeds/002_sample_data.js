exports.seed = async function (knex) {
  // Clear existing entries
  await knex("warehouse_basic_information").del();
  await knex("consignor_material_master_information").del();

  // Insert sample warehouse data
  await knex("warehouse_basic_information").insert([
    {
      warehouse_id: "WH00000001",
      consignor_id: "CONS001",
      warehouse_type: "Distribution Center",
      warehouse_name1: "Mumbai Central Warehouse",
      warehouse_name2: "Main Distribution Hub",
      language: "English",
      vehicle_capacity: 50,
      virtual_yard_in: true,
      radius_for_virtual_yard_in: 500.0,
      speed_limit: 20.0,
      weigh_bridge_availability: true,
      gatepass_system_available: true,
      fuel_availability: true,
      staging_area_for_goods_organization: true,
      driver_waiting_area: true,
      gate_in_checklist_auth: true,
      gate_out_checklist_auth: true,
      warehouse_address_id: "ADDR001",
      region: "Western India",
      zone: "Zone A",
    },
    {
      warehouse_id: "WH00000002",
      consignor_id: "CONS001",
      warehouse_type: "Cold Storage",
      warehouse_name1: "Delhi Cold Storage Facility",
      warehouse_name2: "Temperature Controlled Warehouse",
      language: "Hindi",
      vehicle_capacity: 30,
      virtual_yard_in: false,
      radius_for_virtual_yard_in: 300.0,
      speed_limit: 15.0,
      weigh_bridge_availability: true,
      gatepass_system_available: true,
      fuel_availability: false,
      staging_area_for_goods_organization: true,
      driver_waiting_area: true,
      gate_in_checklist_auth: true,
      gate_out_checklist_auth: true,
      warehouse_address_id: "ADDR002",
      region: "Northern India",
      zone: "Zone B",
    },
  ]);

  // Insert sample material data
  await knex("consignor_material_master_information").insert([
    {
      material_master_id: "MAT0000001",
      consignor_id: "CONS001",
      volumetric_weight_per_unit: 25.5,
      net_weight_per_unit: 20.0,
      dimension_l: 100.0,
      dimension_b: 50.0,
      dimension_h: 30.0,
      avg_packaging_time_in_minutes: 15,
      avg_loading_time_in_minutes: 30,
      avg_unloading_time_in_minutes: 25,
      packing_type: "Cardboard Box",
      material_description: "Electronic goods - Consumer electronics",
    },
    {
      material_master_id: "MAT0000002",
      consignor_id: "CONS001",
      volumetric_weight_per_unit: 150.0,
      net_weight_per_unit: 120.0,
      dimension_l: 200.0,
      dimension_b: 100.0,
      dimension_h: 80.0,
      avg_packaging_time_in_minutes: 45,
      avg_loading_time_in_minutes: 60,
      avg_unloading_time_in_minutes: 45,
      packing_type: "Wooden Crate",
      material_description: "Industrial machinery parts",
    },
  ]);
};
