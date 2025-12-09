exports.up = function (knex) {
  return knex.schema.createTable("usage_type_master", function (table) {
    table.increments("usage_type_unique_id").primary();
    table.string("usage_type_id", 10).notNullable().unique();
    table.string("usage_type", 30).notNullable();
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["usage_type_id"]);
    table.index(["usage_type"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("usage_type_master");
};