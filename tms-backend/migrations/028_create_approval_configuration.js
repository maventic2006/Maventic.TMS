exports.up = function (knex) {
  return knex.schema.createTable("approval_configuration", function (table) {
    table.increments("approval_config_unique_id").primary();
    table.string("approval_config_id", 20).notNullable().unique();
    table.string("approval_type", 100);
    table.integer("approver_level");
    table.string("approval_control", 100);
    table.string("role", 100);
    table.string("user_id", 20);
    
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
    table.index(["approval_config_id"]);
    table.index(["approval_type"]);
    table.index(["approver_level"]);
    table.index(["user_id"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("approval_configuration");
};