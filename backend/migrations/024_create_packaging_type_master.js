exports.up = function (knex) {
  return knex.schema.createTable("packaging_type_master", function (table) {
    table.increments("packaging_type_unique_id").primary();
    table.string("packaging_type_id", 20).notNullable().unique();
    table.string("package_types", 100);
    table.text("description");
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["packaging_type_id"]);
    table.index(["package_types"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("packaging_type_master");
};