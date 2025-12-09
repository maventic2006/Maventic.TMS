exports.up = function (knex) {
  return knex.schema.createTable("vehicle_ownership_details", function (table) {
    table.increments("vehicle_ownership_unique_id").primary();
    table.string("vehicle_ownership_id", 20).notNullable().unique();
    table.string("vehicle_id_code", 20).notNullable();
    table.string("ownership_name", 200);
    table.date("valid_from");
    table.date("valid_to");
    table.string("registration_number", 50);
    table.unique(["registration_number"], "reg_number_unique");
    table.date("registration_date");
    table.date("registration_upto");
    table.date("purchase_date");
    table.integer("owner_sr_number");
    table.string("state_code", 10);
    table.string("rto_code", 20);
    table.string("present_address_id", 20);
    table.string("permanent_address_id", 20);
    table.decimal("sale_amount", 12, 2);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Foreign key constraints
    table.foreign("vehicle_id_code").references("vehicle_id_code_hdr").inTable("vehicle_basic_information_hdr");

    // Indexes
    table.index(["vehicle_ownership_id"]);
    table.index(["vehicle_id_code"]);
    table.index(["registration_number"]);
    table.index(["state_code"]);
    table.index(["rto_code"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("vehicle_ownership_details");
};