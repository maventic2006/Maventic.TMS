exports.up = function (knex) {
  return knex.schema.alterTable("vehicle_basic_information_hdr", function (table) {
    // Add foreign key constraints to the new master tables
    table.foreign("fuel_type_id").references("fuel_type_id").inTable("fuel_type_master");
    table.foreign("engine_type_id").references("engine_type_id").inTable("engine_type_master");
    table.foreign("usage_type_id").references("usage_type_id").inTable("usage_type_master");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("vehicle_basic_information_hdr", function (table) {
    table.dropForeign(["fuel_type_id"]);
    table.dropForeign(["engine_type_id"]);
    table.dropForeign(["usage_type_id"]);
  });
};