exports.up = function (knex) {
  return knex.schema.createTable("indent_assigned_vehicle", function (table) {
    table.increments("assigned_vehicle_unique_id").primary();
    table.string("vehicle_assignment_id", 20).notNullable().unique();
    table.string("indent_id", 20); // References indent_header
    table.string("indent_vehicle_id", 20); // References indent_vehicle
    table.string("transporter_id", 10);
    table.string("vehicle_type", 50);
    table.string("vehicle_id", 10);
    table.string("driver_id", 10);
    table.string("driver_temp_mobile_number", 15);
    table.string("vehicle_owner_id", 10);
    table.string("status", 50);
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status_audit", 10).nullable();

    // Indexes
    table.index(["vehicle_assignment_id"]);
    table.index(["indent_id"]);
    table.index(["indent_vehicle_id"]);
    table.index(["transporter_id"]);
    table.index(["vehicle_id"]);
    table.index(["driver_id"]);
    table.index(["status"]);
    table.index(["status_audit"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("indent_assigned_vehicle");
};