exports.up = function (knex) {
  return knex.schema.createTable("vehicle_special_permit", function (table) {
    table.increments("vehicle_permit_unique_id").primary();
    table.string("vehicle_permit_id", 20).notNullable().unique();
    table.string("vehicle_id_code_hdr", 20).notNullable();
    table.string("permit_category", 100);
    table.string("permit_code", 50);
    table.date("permit_issue_date");
    table.string("permit_number", 50);
    table.unique(["permit_number"], "permit_number_unique");
    table.string("permit_type", 100);
    table.date("valid_from");
    table.date("valid_to");
    
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
    table.index(["vehicle_permit_id"]);
    table.index(["vehicle_id_code_hdr"]);
    table.index(["permit_number"]);
    table.index(["permit_category"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("vehicle_special_permit");
};