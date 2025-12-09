/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Clean existing entries
  await knex("freight_unit_master").del();

  // Insert freight unit master data
  await knex("freight_unit_master").insert([
    {
      freight_unit_id: "FU001",
      freight_unit: "KM",
      created_at: new Date().toISOString().split("T")[0],
      created_on: new Date().toTimeString().split(" ")[0],
      created_by: "ADMIN",
      updated_at: new Date().toISOString().split("T")[0],
      updated_on: new Date().toTimeString().split(" ")[0],
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      freight_unit_id: "FU002",
      freight_unit: "Weight",
      created_at: new Date().toISOString().split("T")[0],
      created_on: new Date().toTimeString().split(" ")[0],
      created_by: "ADMIN",
      updated_at: new Date().toISOString().split("T")[0],
      updated_on: new Date().toTimeString().split(" ")[0],
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      freight_unit_id: "FU003",
      freight_unit: "Hr",
      created_at: new Date().toISOString().split("T")[0],
      created_on: new Date().toTimeString().split(" ")[0],
      created_by: "ADMIN",
      updated_at: new Date().toISOString().split("T")[0],
      updated_on: new Date().toTimeString().split(" ")[0],
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
  ]);
};
