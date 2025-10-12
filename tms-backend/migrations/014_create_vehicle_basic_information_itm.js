exports.up = function (knex) {
  return knex.schema.createTable("vehicle_basic_information_itm", function (table) {
    table.increments("vehicle_item_unique_id").primary();
    table.string("vehicle_id_code_itm", 20).notNullable();
    table.string("vehicle_id_code_hdr", 20).notNullable();
    table.string("insurance_provider", 100);
    table.string("policy_number", 50);
    table.string("coverage_type", 50);
    table.date("policy_expiry_date");
    table.decimal("premium_amount", 10, 2);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Foreign key constraints
    table.foreign("vehicle_id_code_hdr").references("vehicle_id_code_hdr").inTable("vehicle_basic_information_hdr");

    // Indexes
    table.index(["vehicle_id_code_itm"]);
    table.index(["vehicle_id_code_hdr"]);
    table.index(["policy_number"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("vehicle_basic_information_itm");
};