/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("warehouse_type_master").del();

  // Inserts seed entries
  await knex("warehouse_type_master").insert([
    {
      warehouse_type_id: "WT001",
      warehouse_type: "Manufacturing",
      created_by: "SYSTEM",
      created_at: knex.fn.now(),
      updated_by: "SYSTEM",
      updated_at: knex.fn.now(),
      status: "ACTIVE",
    },
    {
      warehouse_type_id: "WT002",
      warehouse_type: "Mining",
      created_by: "SYSTEM",
      created_at: knex.fn.now(),
      updated_by: "SYSTEM",
      updated_at: knex.fn.now(),
      status: "ACTIVE",
    },
    {
      warehouse_type_id: "WT003",
      warehouse_type: "Extraction",
      created_by: "SYSTEM",
      created_at: knex.fn.now(),
      updated_by: "SYSTEM",
      updated_at: knex.fn.now(),
      status: "ACTIVE",
    },
    {
      warehouse_type_id: "WT004",
      warehouse_type: "Assembling",
      created_by: "SYSTEM",
      created_at: knex.fn.now(),
      updated_by: "SYSTEM",
      updated_at: knex.fn.now(),
      status: "ACTIVE",
    },
    {
      warehouse_type_id: "WT005",
      warehouse_type: "Food Processing",
      created_by: "SYSTEM",
      created_at: knex.fn.now(),
      updated_by: "SYSTEM",
      updated_at: knex.fn.now(),
      status: "ACTIVE",
    },
    {
      warehouse_type_id: "WT006",
      warehouse_type: "Cold Storage",
      created_by: "SYSTEM",
      created_at: knex.fn.now(),
      updated_by: "SYSTEM",
      updated_at: knex.fn.now(),
      status: "ACTIVE",
    },
    {
      warehouse_type_id: "WT007",
      warehouse_type: "Distributor",
      created_by: "SYSTEM",
      created_at: knex.fn.now(),
      updated_by: "SYSTEM",
      updated_at: knex.fn.now(),
      status: "ACTIVE",
    },
  ]);
};
