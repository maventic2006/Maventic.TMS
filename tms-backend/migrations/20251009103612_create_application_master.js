/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("application_master", function (table) {
    table.increments("app_unique_id").primary();
    table.string("application_id", 20).unique().notNullable();
    table.string("application_name", 100).notNullable();
    table.string("application_description", 255);
    table.string("application_url", 255);
    table.string("application_icon", 50);
    table.string("application_category", 50);
    table.integer("display_order").defaultTo(0);
    table.boolean("is_active").defaultTo(true);
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Add indexes
    table.index("application_id");
    table.index("application_category");
    table.index("status");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("application_master");
};
