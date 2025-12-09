/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Clean existing entries
  await knex("approval_type_master").del();

  // Insert approval type master data
  await knex("approval_type_master").insert([
    {
      approval_type_id: "APT001",
      approval_type: "Indent Creation",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      approval_type_id: "APT002",
      approval_type: "Checklist Approval",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      approval_type_id: "APT003",
      approval_type: "Indent Assignment",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      approval_type_id: "APT004",
      approval_type: "Invoice Approval",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      approval_type_id: "APT005",
      approval_type: "e-POD Confirmation",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
  ]);
};
