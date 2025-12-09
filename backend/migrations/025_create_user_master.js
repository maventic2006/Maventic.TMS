exports.up = function (knex) {
  return knex.schema.createTable("user_master", function (table) {
    table.increments("user_unique_id").primary();
    table.string("user_id", 20).notNullable().unique();
    table.string("user_type", 50);
    table.string("user_full_name", 200);
    table.string("email_id", 150).unique();
    table.string("mobile_number", 20);
    table.string("alternate_mobile", 20);
    table.string("whatsapp_number", 20);
    table.date("from_date");
    table.date("to_date");
    table.boolean("is_active").defaultTo(true);
    table.string("created_by_user_id", 20);
    table.string("customer_id", 20);
    table.string("approval_cycle", 50);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["user_id"]);
    table.index(["user_type"]);
    table.index(["email_id"]);
    table.index(["mobile_number"]);
    table.index(["customer_id"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_master");
};