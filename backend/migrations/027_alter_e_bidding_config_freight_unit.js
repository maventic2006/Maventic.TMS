exports.up = function (knex) {
  return knex.schema.alterTable("e_bidding_config", function (table) {
    // Drop the old column
    table.dropColumn("freight_unit");
    // Add the new ID column
    table.string("freight_unit_id", 10);
    // Add index
    table.index(["freight_unit_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("e_bidding_config", function (table) {
    // Rollback changes
    table.dropColumn("freight_unit_id");
    table.string("freight_unit", 50);
  });
};