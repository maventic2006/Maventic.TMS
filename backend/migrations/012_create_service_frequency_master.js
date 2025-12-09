exports.up = function (knex) {
  return knex.schema.createTable("service_frequency_master", function (table) {
    table.increments("frequency_unique_id").primary();
    table.string("vehicle_id", 20).notNullable();
    table.integer("sequence_number");
    table.string("time_period", 50);
    table.decimal("km_drove", 10, 2);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["vehicle_id"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("service_frequency_master");
};