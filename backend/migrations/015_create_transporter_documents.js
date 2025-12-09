exports.up = function (knex) {
  return knex.schema.createTable("transporter_documents", function (table) {
    table.increments("document_auto_id").primary();
    table.string("document_unique_id", 20).notNullable();
    table.string("document_id", 20).notNullable();
    table.string("document_type_id", 10);
    table.string("document_number", 100);
    table.string("reference_number", 100);
    table.string("country", 100);
    table.date("valid_from");
    table.date("valid_to");
    table.boolean("active").defaultTo(true);
    table.string("user_type", 50);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["document_unique_id"], "idx_trans_docs_unique_id");
    table.index(["document_id"], "idx_trans_docs_id");
    table.index(["document_type_id"], "idx_trans_docs_type_id");
    table.index(["document_number"], "idx_trans_docs_number");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("transporter_documents");
};
