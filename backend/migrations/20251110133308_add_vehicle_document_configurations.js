/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const now = new Date();
  const createdBy = "SYSTEM";
  const status = "ACTIVE";

  // Add VEHICLE-specific document configurations
  // Only Fitness Certificate and Vehicle Registration Certificate are mandatory
  // Using new unique document_type_ids for VEHICLE (VDT prefix = Vehicle Document Type)
  await knex("doc_type_configuration").insert([
    {
      document_type_id: "VDT001", // Vehicle Document Type 001
      doc_name_master_id: "DN001", // Vehicle Registration Certificate
      user_type: "VEHICLE",
      service_area_country: null,
      is_mandatory: true, // ✅ MANDATORY
      is_expiry_required: false,
      is_verification_required: true,
      created_at: now,
      created_on: now,
      created_by: createdBy,
      updated_at: now,
      updated_on: now,
      updated_by: createdBy,
      status: status,
    },
    {
      document_type_id: "VDT002", // Vehicle Document Type 002
      doc_name_master_id: "DN009", // Vehicle Insurance
      user_type: "VEHICLE",
      service_area_country: null,
      is_mandatory: false, // ❌ NOT MANDATORY (changed from true)
      is_expiry_required: true,
      is_verification_required: true,
      created_at: now,
      created_on: now,
      created_by: createdBy,
      updated_at: now,
      updated_on: now,
      updated_by: createdBy,
      status: status,
    },
    {
      document_type_id: "VDT003", // Vehicle Document Type 003
      doc_name_master_id: "DN010", // PUC certificate
      user_type: "VEHICLE",
      service_area_country: null,
      is_mandatory: false, // ❌ NOT MANDATORY (changed from true)
      is_expiry_required: true,
      is_verification_required: false,
      created_at: now,
      created_on: now,
      created_by: createdBy,
      updated_at: now,
      updated_on: now,
      updated_by: createdBy,
      status: status,
    },
    {
      document_type_id: "VDT004", // Vehicle Document Type 004
      doc_name_master_id: "DN012", // Fitness Certificate
      user_type: "VEHICLE",
      service_area_country: null,
      is_mandatory: true, // ✅ MANDATORY
      is_expiry_required: true,
      is_verification_required: false,
      created_at: now,
      created_on: now,
      created_by: createdBy,
      updated_at: now,
      updated_on: now,
      updated_by: createdBy,
      status: status,
    },
    {
      document_type_id: "VDT005", // Vehicle Document Type 005
      doc_name_master_id: "DN005", // Tax Certificate (reusing VAT doc name)
      user_type: "VEHICLE",
      service_area_country: null,
      is_mandatory: false, // ❌ NOT MANDATORY (changed from true)
      is_expiry_required: true,
      is_verification_required: false,
      created_at: now,
      created_on: now,
      created_by: createdBy,
      updated_at: now,
      updated_on: now,
      updated_by: createdBy,
      status: status,
    },
    {
      document_type_id: "VDT006", // Vehicle Document Type 006
      doc_name_master_id: "DN011", // Permit certificate
      user_type: "VEHICLE",
      service_area_country: null,
      is_mandatory: false,
      is_expiry_required: true,
      is_verification_required: false,
      created_at: now,
      created_on: now,
      created_by: createdBy,
      updated_at: now,
      updated_on: now,
      updated_by: createdBy,
      status: status,
    },
    {
      document_type_id: "VDT007", // Vehicle Document Type 007
      doc_name_master_id: "DN006", // Service Bill (reusing License doc name)
      user_type: "VEHICLE",
      service_area_country: null,
      is_mandatory: false,
      is_expiry_required: false,
      is_verification_required: false,
      created_at: now,
      created_on: now,
      created_by: createdBy,
      updated_at: now,
      updated_on: now,
      updated_by: createdBy,
      status: status,
    },
    {
      document_type_id: "VDT008", // Vehicle Document Type 008
      doc_name_master_id: "DN007", // Inspection Report (reusing Agreement doc name)
      user_type: "VEHICLE",
      service_area_country: null,
      is_mandatory: false,
      is_expiry_required: true,
      is_verification_required: false,
      created_at: now,
      created_on: now,
      created_by: createdBy,
      updated_at: now,
      updated_on: now,
      updated_by: createdBy,
      status: status,
    },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Remove VEHICLE-specific document configurations
  await knex("doc_type_configuration")
    .where("user_type", "VEHICLE")
    .del();
};
