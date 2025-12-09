exports.up = function (knex) {
  return knex.schema.createTable("trip", function (table) {
    table.increments("trip_unique_id").primary();
    table.string("trip_id", 20).notNullable().unique();
    table.string("master_trip_id", 20); // References master_trip
    table.string("status", 50);
    table.decimal("unloading_point_latitude", 10, 8);
    table.decimal("unloading_point_longitude", 10, 8);
    table.string("invoice_number", 50);
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status_audit", 10).nullable();

    // Indexes
    table.index(["trip_id"]);
    table.index(["master_trip_id"]);
    table.index(["status"]);
    table.index(["invoice_number"]);
    table.index(["status_audit"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("trip");
};