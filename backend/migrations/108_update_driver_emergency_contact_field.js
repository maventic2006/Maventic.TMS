/**
 * Migration: Update driver_basic_information table
 * - Add emergency_contact column
 * - Remove whats_app_number column (deprecated)
 *
 * Created: 2025-11-06
 */

exports.up = function (knex) {
  return knex.schema.alterTable("driver_basic_information", function (table) {
    // Add the new emergency_contact column after phone_number
    table.string("emergency_contact", 15).after("phone_number");

    // Drop the old whats_app_number column
    table.dropColumn("whats_app_number");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("driver_basic_information", function (table) {
    // Restore the whats_app_number column (rollback)
    table.string("whats_app_number", 20).after("email_id");

    // Remove the emergency_contact column
    table.dropColumn("emergency_contact");
  });
};
