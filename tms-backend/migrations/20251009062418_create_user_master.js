/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("user_master", (table) => {
    // Primary Key
    table.string("user_id", 10).primary().notNullable();

    // Basic User Information
    table.string("user_type_id", 10).notNullable();
    table.string("user_full_name", 50).notNullable();
    table.string("email_id", 30).notNullable().unique();
    table.string("mobile_number", 10).notNullable().unique();
    table.string("alternet_mobile", 10).nullable().unique();
    table.string("whats_app_number", 10).nullable().unique();

    // Date Range
    table.date("from_date").notNullable();
    table.date("to_date").nullable();

    // Status and Relationships
    table.boolean("is_active").defaultTo(true);
    table.string("created_by_user_id", 10).nullable().unique();
    table.string("consignor_id", 10).nullable(); // Updated from customer_id
    table.string("approval_cycle", 10).nullable();

    // Authentication
    table.text("password").notNullable(); // For encrypted passwords
    table.string("password_type", 50).nullable();

    // Audit Trail Fields
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.time("created_on").defaultTo(knex.raw("CURRENT_TIME"));
    table.string("created_by", 10).nullable();
    table.datetime("updated_at").nullable();
    table.time("updated_on").nullable();
    table.string("updated_by", 10).nullable();
    table.string("status", 10).defaultTo("ACTIVE");

    // Foreign Key Constraints
    table
      .foreign("user_type_id")
      .references("user_type_id")
      .inTable("user_type_master");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("user_master");
};
