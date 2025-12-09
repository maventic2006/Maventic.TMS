exports.up = function (knex) {
  return knex.schema.createTable("coverage_type_master", function (table) {
    table.string("coverage_type_id", 10).primary();
    table.string("coverage_type", 30).notNullable(); // Made longer for descriptive names
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status", 10).notNullable();

    // Indexes
    table.index(["coverage_type_id"]);
    table.index(["coverage_type"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("coverage_type_master");
};