exports.up = function (knex) {
  return knex.schema.createTable("vehicle_maintenance_service_history", function (table) {
    table.increments("vehicle_maintenance_unique_id").primary();
    table.string("vehicle_maintenance_id", 20).notNullable();
    table.unique(["vehicle_maintenance_id"], "vm_maintenance_id_unique");
    table.string("vehicle_id_code", 20).notNullable();
    table.date("service_date");
    table.text("service_remark");
    table.date("upcoming_service_date");
    table.string("type_of_service", 100);
    table.decimal("service_expense", 10, 2);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Foreign key constraints
    table.foreign("vehicle_id_code").references("vehicle_id_code_hdr").inTable("vehicle_basic_information_hdr");

    // Indexes
    table.index(["vehicle_maintenance_id"]);
    table.index(["vehicle_id_code"]);
    table.index(["service_date"]);
    table.index(["upcoming_service_date"]);
    table.index(["type_of_service"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("vehicle_maintenance_service_history");
};