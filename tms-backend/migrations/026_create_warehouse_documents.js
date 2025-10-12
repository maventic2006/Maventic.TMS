exports.up = function (knex) {
  return knex.schema.createTable("warehouse_documents", function (table) {
    table.string("document_unique_id", 10).primary();
    table.string("warehouse_id", 10);
    table.string("document_id", 10);
    table.string("document_type_id", 10);
    table.string("document_number", 50);
    table.date("valid_from");
    table.date("valid_to");
    table.boolean("active");
    // Audit trail properties
    table.date("created_at");
    table.time("created_on");
    table.string("created_by", 10);
    table.date("updated_at");
    table.time("updated_on");
    table.string("updated_by", 10);
    table.string("status", 10);

    // Foreign key relationships (disabled for initial setup)
    // table
    //   .foreign("warehouse_id")
    //   .references("warehouse_id")
    //   .inTable("warehouse_basic_information");
    // table
    //   .foreign("document_id")
    //   .references("document_id")
    //   .inTable("document_upload");
    // table
    //   .foreign("document_type_id")
    //   .references("document_type_id")
    //   .inTable("doc_type_configuration");

    // Indexes
    table.index(["warehouse_id"]);
    table.index(["document_id"]);
    table.index(["document_type_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("warehouse_documents");
};
