/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Clean existing entries
  await knex("user_type_master").del();

  // Insert user type master data
  await knex("user_type_master").insert([
    {
      user_type_id: "UT001",
      user_type: "Consignor",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      user_type_id: "UT002",
      user_type: "Transporter",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      user_type_id: "UT003",
      user_type: "Independent Vehicle Owner",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      user_type_id: "UT004",
      user_type: "Transporter Contact",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      user_type_id: "UT005",
      user_type: "Vehicle Ownership",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      user_type_id: "UT006",
      user_type: "Consignor WH",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      user_type_id: "UT007",
      user_type: "Driver",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      user_type_id: "UT008",
      user_type: "Owner",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
  ]);
};
