/**
 * Migration: Add material_type_id to warehouse_basic_information
 * Date: 2025-11-13
 * Description: Adds material_type_id column to link warehouses with material types
 */

exports.up = function (knex) {
  return knex.schema.table("warehouse_basic_information", function (table) {
    table
      .string("material_type_id", 10)
      .nullable()
      .comment("Foreign key to material_types_master");
    table.index(["material_type_id"], "idx_warehouse_material_type");
  });
};

exports.down = function (knex) {
  return knex.schema.table("warehouse_basic_information", function (table) {
    table.dropIndex(["material_type_id"], "idx_warehouse_material_type");
    table.dropColumn("material_type_id");
  });
};
