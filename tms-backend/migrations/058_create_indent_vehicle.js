exports.up = function (knex) {
  return knex.schema.createTable("indent_vehicle", function (table) {
    table.increments("indent_vehicle_unique_id").primary();
    table.string("indent_vehicle_id", 20).notNullable().unique();
    table.string("indent_id", 20); // References indent_header
    table.string("required_vehicle_type", 50);
    table.decimal("required_capacity", 10, 2);
    table.string("capacity_unit", 10);
    table.integer("vehicle_quantity");
    table.datetime("reporting_timestamp");
    table.datetime("dispatch_timestamp");
    table.decimal("base_freight_rate", 10, 2);
    table.string("base_freight_unit", 10);
    table.decimal("tolerance_amount", 10, 2);
    table.string("currency", 10);
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status", 10).nullable();

    // Indexes
    table.index(["indent_vehicle_id"]);
    table.index(["indent_id"]);
    table.index(["required_vehicle_type"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("indent_vehicle");
};