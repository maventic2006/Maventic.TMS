/**
 * Migration: Add geo_fencing boolean column to warehouse_basic_information
 * Purpose: Enable filtering warehouses by geo-fencing availability
 * Date: 2025-12-06
 */

exports.up = function (knex) {
  return knex.schema.table("warehouse_basic_information", function (table) {
    // Add geo_fencing boolean column with default value false
    table.boolean("geo_fencing").defaultTo(false).comment("Indicates if warehouse has geofencing enabled");
  });
};

exports.down = function (knex) {
  return knex.schema.table("warehouse_basic_information", function (table) {
    table.dropColumn("geo_fencing");
  });
};
