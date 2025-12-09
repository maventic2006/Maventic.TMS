exports.up = function (knex) {
  return knex.schema.createTable("additional_service", function (table) {
    table.increments("additional_service_unique_id").primary();
    table.string("add_service_id", 20).notNullable().unique();
    table.string("indent_id", 20); // References indent_header
    table.string("point", 100);
    table.string("drop_location_id", 20);
    table.string("service_name", 100);
    table.text("description");
    table.integer("count");
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status", 10).nullable();

    // Indexes
    table.index(["add_service_id"]);
    table.index(["indent_id"]);
    table.index(["drop_location_id"]);
    table.index(["service_name"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("additional_service");
};