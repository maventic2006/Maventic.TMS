exports.up = function (knex) {
  return knex.schema.createTable("user_signup_request", function (table) {
    table.increments("signup_unique_id").primary();
    table.string("signup_id", 20).notNullable().unique();
    table.string("user_type", 50);
    table.string("full_name", 200);
    table.string("phone_number", 20);
    table.string("alternate_phone_number", 20);
    table.string("email_id", 150);
    table.string("address_id", 20);
    table.string("status_value", 50);
    table.integer("number_of_vehicle");
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Foreign key constraints
    table.foreign("address_id").references("address_id").inTable("tms_address");

    // Indexes
    table.index(["signup_id"]);
    table.index(["user_type"]);
    table.index(["email_id"]);
    table.index(["phone_number"]);
    table.index(["status_value"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_signup_request");
};