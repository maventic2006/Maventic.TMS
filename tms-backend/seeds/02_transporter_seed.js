/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Clean existing entries
  await knex("transporter_general_info").del();
  await knex("transporter_contact").del();
  await knex("transporter_service_area_hdr").del();
  await knex("transporter_service_area_itm").del();
  await knex("transporter_documents").del();
  await knex("transporter_vehicle_config_data_hdr").del();
  await knex("transporter_vehicle_config_data_itm").del();
  await knex("transporter_vehicle_config_param_name").del();

  // Insert sample transporter general info
  await knex("transporter_general_info").insert([
    {
      transporter_id: "TRANS001",
      user_type: "Logistics Provider",
      business_name: "Express Transport Solutions",
      trans_mode_road: true,
      trans_mode_rail: false,
      trans_mode_air: true,
      trans_mode_sea: false,
      active_flag: true,
      from_date: "2024-01-01",
      to_date: "2025-12-31",
      address_id: "ADDR001",
      avg_rating: 4.5,
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      transporter_id: "TRANS002",
      user_type: "Freight Forwarder",
      business_name: "Global Freight Network",
      trans_mode_road: true,
      trans_mode_rail: true,
      trans_mode_air: true,
      trans_mode_sea: true,
      active_flag: true,
      from_date: "2024-01-01",
      to_date: "2025-12-31",
      address_id: "ADDR002",
      avg_rating: 4.2,
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
  ]);

  // Insert sample transporter contacts
  await knex("transporter_contact").insert([
    {
      tcontact_id: "TC001",
      transporter_id: "TRANS001",
      contact_person_name: "John Smith",
      role: "Operations Manager",
      phone_number: "+1-555-0101",
      alternate_phone_number: "+1-555-0102",
      whats_app_number: "+1-555-0101",
      email_id: "john.smith@expresstransport.com",
      alternate_email_id: "j.smith@expresstransport.com",
      address_id: "ADDR001",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      tcontact_id: "TC002",
      transporter_id: "TRANS002",
      contact_person_name: "Sarah Johnson",
      role: "Fleet Manager",
      phone_number: "+1-555-0201",
      alternate_phone_number: "+1-555-0202",
      whats_app_number: "+1-555-0201",
      email_id: "sarah.johnson@globalfreight.com",
      alternate_email_id: "s.johnson@globalfreight.com",
      address_id: "ADDR002",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
  ]);

  // Insert sample service area headers
  await knex("transporter_service_area_hdr").insert([
    {
      service_area_hdr_id: "SAH001",
      transporter_id: "TRANS001",
      service_country: "United States",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      service_area_hdr_id: "SAH002",
      transporter_id: "TRANS002",
      service_country: "Canada",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
  ]);

  // Insert sample service area items
  await knex("transporter_service_area_itm").insert([
    {
      service_area_itm_id: "SAI001",
      service_area_hdr_id: "SAH001",
      service_state: "California",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      service_area_itm_id: "SAI002",
      service_area_hdr_id: "SAH001",
      service_state: "Nevada",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      service_area_itm_id: "SAI003",
      service_area_hdr_id: "SAH002",
      service_state: "Ontario",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
  ]);

  // Insert sample documents
  await knex("transporter_documents").insert([
    {
      document_unique_id: "DOC-TRANS001-001",
      document_id: "DOC001",
      document_type_id: "DT001",
      document_number: "DOT-123456",
      reference_number: "REF-001",
      country: "United States",
      valid_from: "2024-01-01",
      valid_to: "2025-12-31",
      active: true,
      user_type: "Transporter",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
  ]);

  // Insert sample vehicle config headers
  await knex("transporter_vehicle_config_data_hdr").insert([
    {
      vehicle_config_hdr_id: "VCH001",
      vehicle_id_code: "VEH001",
      transporter_id: "TRANS001",
      consignor_id: "CONS001",
      vehicle_type_id: "VT001",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
  ]);

  // Insert sample vehicle config items
  await knex("transporter_vehicle_config_data_itm").insert([
    {
      transporter_alert_itm_id: "TAI001",
      vehicle_config_hdr_id: "VCH001",
      mobile_number: "+1-555-9001",
      email_id: "alerts@expresstransport.com",
      alert_type: "GPS_TRACKING",
      user_id: "USER001",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
  ]);

  // Insert sample parameter names
  await knex("transporter_vehicle_config_param_name").insert([
    {
      tv_config_parameter_name_id: "PARAM001",
      parameter_name: "Maximum Load Capacity",
      is_minimum_required: true,
      is_maximum_required: true,
      parameter_value_min: 1000.0,
      parameter_value_max: 25000.0,
      valid_from: "2024-01-01",
      valid_to: "2025-12-31",
      active_flag: true,
      is_alert_required: true,
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      tv_config_parameter_name_id: "PARAM002",
      parameter_name: "Fuel Efficiency Rating",
      is_minimum_required: false,
      is_maximum_required: true,
      parameter_value_min: 0.0,
      parameter_value_max: 50.0,
      valid_from: "2024-01-01",
      valid_to: "2025-12-31",
      active_flag: true,
      is_alert_required: false,
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
  ]);
};
