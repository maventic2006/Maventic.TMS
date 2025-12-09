exports.up = function (knex) {
  return knex.schema.createTable("user_application_access", function (table) {
    table.increments("app_access_unique_id").primary();
    table.string("application_access_id", 20).notNullable().unique();
    table.string("user_role_id", 20);
    table.string("application_id", 20);
    table.string("access_control", 100);
    table.date("valid_from");
    table.date("valid_to");
    table.boolean("is_active").defaultTo(true);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["application_access_id"]);
    table.index(["user_role_id"]);
    table.index(["application_id"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_application_access");
};