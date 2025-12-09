exports.up = function (knex) {
  return knex.schema.createTable("e_bidding_config", function (table) {
    table.string("e_bidding_config_id", 10).primary();
    table.string("consignor_id", 10).notNullable();
    table.string("warehouse_id", 10);
    table.string("vehicle_type", 100);
    table.decimal("max_rate", 12, 2);
    table.decimal("min_rate", 12, 2);
    table.string("freight_unit_id", 10);
    table.decimal("e_bidding_tolerance_value", 10, 2);

    // Audit trail properties
    table.date("created_at");
    table.time("created_on");
    table.string("created_by", 10);
    table.date("updated_at");
    table.time("updated_on");
    table.string("updated_by", 10);
    table.string("status", 10);

    // Foreign key relationships (disabled for initial setup)
    // table
    //   .foreign("freight_unit_id")
    //   .references("freight_unit_id")
    //   .inTable("freight_unit_master");

    // Indexes
    table.index(["consignor_id"]);
    table.index(["vehicle_type"]);
    table.index(["freight_unit_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("e_bidding_config");
};
