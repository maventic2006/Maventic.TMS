exports.up = function (knex) {
  return knex.schema.createTable("vehicle_documents", function (table) {
    table.increments("document_unique_id").primary();
    table.string("document_id", 20).notNullable();
    table.string("document_type_id", 20);
    table.string("reference_number", 100);
    table.string("permit_category", 100);
    table.string("permit_code", 50);
    table.string("document_provider", 200);
    table.string("coverage_type_id", 10);
    table.decimal("premium_amount", 10, 2);
    table.date("valid_from");
    table.date("valid_to");
    table.text("remarks");
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["document_id"]);
    table.index(["document_type_id"]);
    table.index(["reference_number"]);
    table.index(["permit_category"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("vehicle_documents");
};