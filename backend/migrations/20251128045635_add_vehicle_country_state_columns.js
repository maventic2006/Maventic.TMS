/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table("vehicle_basic_information_hdr", function (table) {
    // Add country and state columns for vehicle registration location
    table
      .string("vehicle_registered_at_country", 10)
      .nullable()
      .after("vehicle_registered_at");
    table
      .string("vehicle_registered_at_state", 10)
      .nullable()
      .after("vehicle_registered_at_country");

    // Add GPS provider, leasing details, mileage, current driver, transporter fields
    table
      .string("gps_provider", 100)
      .nullable()
      .after("gps_tracker_active_flag");
    table.string("leased_from", 200).nullable().after("leasing_flag");
    table.date("lease_start_date").nullable().after("leased_from");
    table.date("lease_end_date").nullable().after("lease_start_date");
    table.decimal("mileage", 10, 2).nullable().after("lease_end_date");
    table.string("current_driver", 50).nullable().after("mileage");
    table.string("transporter_id", 20).nullable().after("current_driver");
    table.string("transporter_name", 200).nullable().after("transporter_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("vehicle_basic_information_hdr", function (table) {
    table.dropColumn("vehicle_registered_at_country");
    table.dropColumn("vehicle_registered_at_state");
    table.dropColumn("gps_provider");
    table.dropColumn("leased_from");
    table.dropColumn("lease_start_date");
    table.dropColumn("lease_end_date");
    table.dropColumn("mileage");
    table.dropColumn("current_driver");
    table.dropColumn("transporter_id");
    table.dropColumn("transporter_name");
  });
};
