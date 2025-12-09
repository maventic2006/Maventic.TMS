/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Clean existing entries
  await knex("packaging_type_master").del();

  // Insert packaging type master data
  await knex("packaging_type_master").insert([
    {
      packaging_type_id: "PKG001",
      packing_type: "Carton",
      description: "Cardboard packaging for small to medium items",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      packaging_type_id: "PKG002",
      packing_type: "Barrel",
      description: "Cylindrical container for liquids and bulk materials",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      packaging_type_id: "PKG003",
      packing_type: "Loose",
      description: "Items without specific packaging container",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      packaging_type_id: "PKG004",
      packing_type: "Bag",
      description: "Flexible packaging for various materials",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      packaging_type_id: "PKG005",
      packing_type: "Bucket",
      description: "Rigid cylindrical container with handle",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
    {
      packaging_type_id: "PKG006",
      packing_type: "Cylinder",
      description: "Cylindrical container for gases and pressurized materials",
      created_by: "ADMIN",
      updated_by: "ADMIN",
      status: "ACTIVE",
    },
  ]);
};
