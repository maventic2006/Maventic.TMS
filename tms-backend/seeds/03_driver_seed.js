/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Clean existing entries (in reverse order due to foreign keys)
  await knex("driver_accident_violation").del();
  await knex("driver_history_information").del();
  await knex("driver_documents").del();
  await knex("driver_basic_information").del();

  // Insert sample driver basic information
  await knex("driver_basic_information").insert([
    {
      driver_id: "DRV001",
      full_name: "Michael Johnson",
      date_of_birth: "1985-03-15",
      gender: "Male",
      blood_group: "O+",
      address_id: "ADDR101",
      phone_number: "+1-555-1001",
      email_id: "michael.johnson@email.com",
      whats_app_number: "+1-555-1001",
      alternate_phone_number: "+1-555-1002",
      avg_rating: 4.7,
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      driver_id: "DRV002",
      full_name: "Sarah Williams",
      date_of_birth: "1990-07-22",
      gender: "Female",
      blood_group: "A+",
      address_id: "ADDR102",
      phone_number: "+1-555-2001",
      email_id: "sarah.williams@email.com",
      whats_app_number: "+1-555-2001",
      alternate_phone_number: "+1-555-2002",
      avg_rating: 4.9,
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      driver_id: "DRV003",
      full_name: "Robert Davis",
      date_of_birth: "1982-11-08",
      gender: "Male",
      blood_group: "B+",
      address_id: "ADDR103",
      phone_number: "+1-555-3001",
      email_id: "robert.davis@email.com",
      whats_app_number: "+1-555-3001",
      alternate_phone_number: "+1-555-3002",
      avg_rating: 4.5,
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
  ]);

  // Insert sample driver documents
  await knex("driver_documents").insert([
    {
      document_unique_id: "DOC-DRV001-001",
      driver_id: "DRV001",
      document_id: "LIC001",
      document_type_id: "CDL",
      document_number: "CDL-CA-12345678",
      issuing_country: "United States",
      issuing_state: "California",
      active_flag: true,
      valid_from: "2023-01-01",
      valid_to: "2028-01-01",
      remarks: "Class A Commercial Drivers License",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      document_unique_id: "DOC-DRV001-002",
      driver_id: "DRV001",
      document_id: "DOT001",
      document_type_id: "DOT",
      document_number: "DOT-PHYSICAL-2024-001",
      issuing_country: "United States",
      issuing_state: "California",
      active_flag: true,
      valid_from: "2024-01-15",
      valid_to: "2026-01-15",
      remarks: "DOT Physical Examination Certificate",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      document_unique_id: "DOC-DRV002-001",
      driver_id: "DRV002",
      document_id: "LIC002",
      document_type_id: "CDL",
      document_number: "CDL-TX-87654321",
      issuing_country: "United States",
      issuing_state: "Texas",
      active_flag: true,
      valid_from: "2023-06-01",
      valid_to: "2028-06-01",
      remarks: "Class A Commercial Drivers License with HazMat endorsement",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
  ]);

  // Insert sample driver history information
  await knex("driver_history_information").insert([
    {
      driver_history_id: "HIST-DRV001-001",
      driver_id: "DRV001",
      employer: "Express Transport Solutions",
      from_date: "2020-01-15",
      to_date: "2023-12-31",
      employment_status: "Full-time",
      job_title: "Long Haul Driver",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      driver_history_id: "HIST-DRV001-002",
      driver_id: "DRV001",
      employer: "Global Freight Network",
      from_date: "2024-01-01",
      to_date: null,
      employment_status: "Full-time",
      job_title: "Senior Driver - Regional Routes",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      driver_history_id: "HIST-DRV002-001",
      driver_id: "DRV002",
      employer: "Rapid Logistics Inc",
      from_date: "2021-03-01",
      to_date: null,
      employment_status: "Full-time",
      job_title: "HazMat Certified Driver",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
  ]);

  // Insert sample driver accident & violation records
  await knex("driver_accident_violation").insert([
    {
      driver_violation_id: "VIOL-DRV003-001",
      driver_id: "DRV003",
      type: "Speeding",
      description:
        "Exceeded speed limit by 5 mph on highway I-80. Warning issued, no fine.",
      date: "2023-08-15",
      vehicle_regn_number: "TRK-001-CA",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      driver_violation_id: "ACC-DRV001-001",
      driver_id: "DRV001",
      type: "Minor Accident",
      description:
        "Minor fender bender in parking lot. No injuries. Other party at fault.",
      date: "2023-11-22",
      vehicle_regn_number: "TRK-002-CA",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
  ]);
};
