exports.up = function (knex) {
  return knex.schema.createTable("driver_basic_information", function (table) {
    table.increments("driver_unique_id").primary();
    table.string("driver_id", 10).notNullable();
    table.string("full_name", 200).notNullable();
    table.date("date_of_birth");
    table.string("gender", 10);
    table.string("blood_group", 5);
    table.string("address_id", 10);
    table.string("phone_number", 20);
    table.string("email_id", 100);
    table.string("whats_app_number", 20);
    table.string("alternate_phone_number", 20);
    table.decimal("avg_rating", 3, 2);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["driver_id"], "idx_driver_basic_driver_id");
    table.index(["email_id"], "idx_driver_basic_email");
    table.index(["phone_number"], "idx_driver_basic_phone");
    table.index(["full_name"], "idx_driver_basic_name");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("driver_basic_information");
};
