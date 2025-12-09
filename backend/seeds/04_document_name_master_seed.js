/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Clean existing entries
  await knex("document_name_master").del();

  // Insert document name master data
  await knex("document_name_master").insert([
    {
      doc_name_master_id: "DOC001",
      document_name: "PAN/TIN",
      user_type: "Consignor",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      doc_name_master_id: "DOC002",
      document_name: "Aadhar Card",
      user_type: "Consignor",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      doc_name_master_id: "DOC003",
      document_name: "TAN",
      user_type: "Consignor",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      doc_name_master_id: "DOC004",
      document_name: "GSTIN Document",
      user_type: "Consignor",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      doc_name_master_id: "DOC005",
      document_name: "VAT Certificate",
      user_type: "Consignor",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      doc_name_master_id: "DOC006",
      document_name: "Any License",
      user_type: "Consignor",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      doc_name_master_id: "DOC007",
      document_name: "Any Agreement Document",
      user_type: "Consignor",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      doc_name_master_id: "DOC008",
      document_name: "Contact Person ID Proof",
      user_type: "Consignor",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      doc_name_master_id: "DOC009",
      document_name: "NDA",
      user_type: "Consignor",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
  ]);
};
