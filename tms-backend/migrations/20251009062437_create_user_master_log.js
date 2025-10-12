/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("user_master_log", (table) => {
    // Primary Key - Auto Increment
    table.increments("user_master_log_id").primary();

    // User Information (from User Master)
    table.string("user_id", 10).notNullable();
    table.string("user_type_id", 10).notNullable();
    table.string("user_full_name", 50).notNullable(); // Combined first + last name
    table.string("email_id", 30).notNullable();
    table.string("mobile_number", 10).notNullable();
    table.string("alternet_mobile", 10).nullable();
    table.string("whats_app_number", 10).nullable();

    // Date Range
    table.date("from_date").notNullable();
    table.date("to_date").nullable();

    // Status and Relationships
    table.boolean("is_active").defaultTo(true);
    table.string("created_by_user_id", 10).nullable();
    table.string("consignor_id", 10).nullable(); // Updated from customer_id
    table.string("approval_cycle", 10).nullable();

    // Authentication (for audit trail)
    table.text("password").notNullable(); // Encrypted password snapshot
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
    table.foreign("user_id").references("user_id").inTable("user_master");
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
  return knex.schema.dropTableIfExists("user_master_log");
};
