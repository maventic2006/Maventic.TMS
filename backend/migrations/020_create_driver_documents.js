exports.up = function (knex) {
  return knex.schema.createTable("driver_documents", function (table) {
    table.increments("document_auto_id").primary();
    table.string("document_unique_id", 20).notNullable();
    table.string("driver_id", 10).notNullable();
    table.string("document_id", 20).notNullable();
    table.string("document_type_id", 10);
    table.string("document_number", 100);
    table.string("issuing_country", 100);
    table.string("issuing_state", 100);
    table.boolean("active_flag").defaultTo(true);
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

    // Foreign key relationships
    table.foreign("driver_id").references("driver_id").inTable("driver_basic_information");

    // Indexes
    table.index(["document_unique_id"], "idx_driver_docs_unique_id");
    table.index(["driver_id"], "idx_driver_docs_driver_id");
    table.index(["document_id"], "idx_driver_docs_doc_id");
    table.index(["document_type_id"], "idx_driver_docs_type_id");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("driver_documents");
};
