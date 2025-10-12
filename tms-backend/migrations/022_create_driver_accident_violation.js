exports.up = function (knex) {
  return knex.schema.createTable("driver_accident_violation", function (table) {
    table.increments("violation_auto_id").primary();
    table.string("driver_violation_id", 20).notNullable();
    table.string("driver_id", 10).notNullable();
    table.string("type", 50);
    table.text("description");
    table.date("date");
    table.string("vehicle_regn_number", 30);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Foreign key relationships
    table.foreign("driver_id").references("driver_id").inTable("driver_basic_information");

    // Indexes
    table.index(["driver_violation_id"], "idx_driver_viol_viol_id");
    table.index(["driver_id"], "idx_driver_viol_driver_id");
    table.index(["type"], "idx_driver_viol_type");
    table.index(["date"], "idx_driver_viol_date");
    table.index(["vehicle_regn_number"], "idx_driver_viol_vehicle");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("driver_accident_violation");
};
