exports.up = function (knex) {
  return knex.schema.createTable("user_role_hdr", function (table) {
    table.increments("user_role_hdr_unique_id").primary();
    table.string("user_role_hdr_id", 20).notNullable().unique();
    table.string("user_id", 20);
    table.string("role", 100);
    table.string("warehouse_id", 20);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Foreign key constraints
    table.foreign("user_id").references("user_id").inTable("user_master");

    // Indexes
    table.index(["user_role_hdr_id"]);
    table.index(["user_id"]);
    table.index(["role"]);
    table.index(["warehouse_id"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_role_hdr");
};