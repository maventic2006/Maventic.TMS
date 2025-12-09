/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Clean existing entries
  await knex("role_master").del();

  // Insert role master data
  await knex("role_master").insert([
    {
      role_id: "RM001",
      role: "WH Manager",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      role_id: "RM002",
      role: "WH Member",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      role_id: "RM003",
      role: "Consignor Finance",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      role_id: "RM004",
      role: "Transporter Manager",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      role_id: "RM005",
      role: "Transporter Member",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      role_id: "RM006",
      role: "Transporter Finance",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
  ]);
};
