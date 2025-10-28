const bcrypt = require("bcryptjs");

exports.seed = async function (knex) {
  // First clean up existing data
  await knex("message_text_language").del();
  await knex("message_master").del();
  await knex("user_signup_document").del();
  await knex("user_signup_request").del();
  await knex("approval_flow_trans").del();
  await knex("approval_configuration").del();
  await knex("user_application_access").del();
  await knex("user_role_hdr").del();
  await knex("user_master").del();
  await knex("document_upload").del();
  await knex("doc_type_configuration").del();
  await knex("document_name_master").del();
  await knex("packaging_type_master").del();
  await knex("material_master_information").del();
  await knex("tms_address").del();
  await knex("payment_term_master").del();
  await knex("general_config").del();

  // Insert general config
  await knex("general_config").insert([
    {
      general_config_id: "GC001",
      parameter_name: "Default Vehicle Service Interval",
      parameter_value_min: "3",
      parameter_value_max: "6",
      valid_from: "2024-01-01",
      valid_to: "2025-12-31",
      active_flag: true,
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      general_config_id: "GC002",
      parameter_name: "Maximum Document Upload Size",
      parameter_value_min: "5",
      parameter_value_max: "50",
      valid_from: "2024-01-01",
      valid_to: "2025-12-31",
      active_flag: true,
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
  ]);

  // Insert payment terms
  await knex("payment_term_master").insert([
    {
      payment_term_id: "PT001",
      number_of_days: 30,
      description: "Net 30 Days",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      payment_term_id: "PT002",
      number_of_days: 45,
      description: "Net 45 Days",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      payment_term_id: "PT003",
      number_of_days: 0,
      description: "Cash on Delivery",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
  ]);

  // Insert addresses
  await knex("tms_address").insert([
    {
      address_id: "ADDR001",
      user_reference_id: "USR001",
      user_type: "TRANSPORTER",
      country: "India",
      vat_number: "GST001234567890",
      street_1: "123 Transport Hub Street",
      street_2: "Logistics Park",
      city: "Mumbai",
      district: "Mumbai Suburban",
      state: "Maharashtra",
      postal_code: "400001",
      is_primary: true,
      address_type_id: "AT002",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      address_id: "ADDR002",
      user_reference_id: "USR002",
      user_type: "SHIPPER",
      country: "India",
      vat_number: "GST098765432109",
      street_1: "456 Industrial Area",
      street_2: "Phase 2",
      city: "Bangalore",
      district: "Bangalore Urban",
      state: "Karnataka",
      postal_code: "560001",
      is_primary: true,
      address_type_id: "AT002",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
  ]);

  // Insert material master
  await knex("material_master_information").insert([
    {
      material_master_id: "MAT001",
      material_id: "STEEL001",
      material_sector: "Manufacturing",
      material_types_id: "MT001",
      description: "Steel rods and bars for construction",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      material_master_id: "MAT002",
      material_id: "CHEM001",
      material_sector: "Chemical",
      material_types_id: "MT003",
      description: "Industrial chemicals requiring special handling",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      material_master_id: "MAT003",
      material_id: "FOOD001",
      material_sector: "Food & Beverage",
      material_types_id: "MT004",
      description: "Fresh produce and packaged food items",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
  ]);

  // Insert packaging types
  await knex("packaging_type_master").insert([
    {
      packaging_type_id: "PKG001",
      package_types: "Pallets",
      description: "Standard wooden pallets for bulk items",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      packaging_type_id: "PKG002",
      package_types: "Containers",
      description: "20ft and 40ft shipping containers",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      packaging_type_id: "PKG003",
      package_types: "Drums",
      description: "Steel drums for liquid materials",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
  ]);

  // Insert document name master
  await knex("document_name_master").insert([
    {
      doc_name_master_id: "DOC001",
      document_name: "Vehicle Registration Certificate",
      user_type: "TRANSPORTER",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      doc_name_master_id: "DOC002",
      document_name: "Driver License",
      user_type: "DRIVER",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      doc_name_master_id: "DOC003",
      document_name: "Insurance Policy",
      user_type: "TRANSPORTER",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
  ]);

  // Insert document type configuration
  await knex("doc_type_configuration").insert([
    {
      document_type_id: "DT001",
      doc_name_master_id: "DOC001",
      user_type: "TRANSPORTER",
      service_area_country: "India",
      is_mandatory: true,
      is_expiry_required: true,
      is_verification_required: true,
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      document_type_id: "DT002",
      doc_name_master_id: "DOC002",
      user_type: "DRIVER",
      service_area_country: "India",
      is_mandatory: true,
      is_expiry_required: true,
      is_verification_required: true,
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
  ]);

  // Insert users with hashed passwords
  const bcrypt = require("bcryptjs");

  await knex("user_master").insert([
    {
      user_id: "POWNER001",
      user_type_id: "UT001",
      user_full_name: "Test Plant Owner",
      email_id: "powner001@test.com",
      mobile_number: "9876543210",
      alternet_mobile: null,
      whats_app_number: "9876543210",
      from_date: "2024-01-01",
      to_date: "2025-12-31",
      is_active: true,
      created_by_user_id: null,
      consignor_id: "CONS001",
      approval_cycle: "STANDARD",
      password: await bcrypt.hash("POWNER@1", 10),
      password_type: "initial",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
      status: "ACTIVE",
    },
    {
      user_id: "USR001",
      user_type_id: "UT002",
      user_full_name: "ABC Transport Services",
      email_id: "admin@abctransport.com",
      mobile_number: "9876543211",
      alternet_mobile: "9876543212",
      whats_app_number: "9876543211",
      from_date: "2024-01-01",
      to_date: "2025-12-31",
      is_active: true,
      created_by_user_id: null,
      consignor_id: "CONS002",
      approval_cycle: "STANDARD",
      password: await bcrypt.hash("POWNER@2", 10),
      password_type: "initial",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
      status: "ACTIVE",
    },
    {
      user_id: "USR002",
      user_type_id: "UT003",
      user_full_name: "XYZ Manufacturing Ltd",
      email_id: "logistics@xyzmanuf.com",
      mobile_number: "8765432109",
      alternet_mobile: "8765432108",
      whats_app_number: "8765432109",
      from_date: "2024-01-01",
      to_date: "2025-12-31",
      is_active: true,
      created_by_user_id: null,
      consignor_id: "CONS003",
      approval_cycle: "STANDARD",
      password: await bcrypt.hash("POWNER@3", 10),
      password_type: "initial",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
      status: "ACTIVE",
    },
  ]);

  // Insert user roles
  await knex("user_role_hdr").insert([
    {
      user_role_hdr_id: "ROLE001",
      user_id: "USR001",
      role: "FLEET_MANAGER",
      warehouse_id: "WH001",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      user_role_hdr_id: "ROLE002",
      user_id: "USR002",
      role: "LOGISTICS_COORDINATOR",
      warehouse_id: "WH002",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
  ]);

  // Insert approval configuration
  await knex("approval_configuration").insert([
    {
      approval_config_id: "APPR001",
      approval_type: "VEHICLE_REGISTRATION",
      approver_level: 1,
      approval_control: "SEQUENTIAL",
      role: "FLEET_MANAGER",
      user_id: "USR001",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      approval_config_id: "APPR002",
      approval_type: "DOCUMENT_VERIFICATION",
      approver_level: 1,
      approval_control: "PARALLEL",
      role: "ADMIN",
      user_id: "USR001",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
  ]);

  // Insert message master
  await knex("message_master").insert([
    {
      message_master_id: "MSG001",
      message_type_id: "MSG001",
      application_id: "TMS_VEHICLE",
      subject: "Vehicle Service Due Notification",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      message_master_id: "MSG002",
      message_type_id: "MSG002",
      application_id: "TMS_DOCUMENT",
      subject: "Document Expiry Alert",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
  ]);

  // Insert message text language
  await knex("message_text_language").insert([
    {
      text_id: "TXT001",
      message_master_id: "MSG001",
      language: "English",
      message_text:
        "Your vehicle {vehicle_id} is due for service on {service_date}. Please schedule maintenance to ensure safety and compliance.",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      text_id: "TXT002",
      message_master_id: "MSG001",
      language: "Hindi",
      message_text:
        "आपका वाहन {vehicle_id} {service_date} को सेवा के लिए देय है। सुरक्षा और अनुपालन सुनिश्चित करने के लिए कृपया रखरखाव का समय निर्धारित करें।",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
    {
      text_id: "TXT003",
      message_master_id: "MSG002",
      language: "English",
      message_text:
        "Your document {document_name} will expire on {expiry_date}. Please renew it before the expiry date.",
      created_by: "SYSTEM",
      updated_by: "SYSTEM",
    },
  ]);

  console.log("✅ Common DB sample data seeded successfully!");
};
