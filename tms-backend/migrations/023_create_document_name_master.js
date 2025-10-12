exports.up = function (knex) {
  return knex.schema.createTable("document_name_master", function (table) {
    table.string("doc_name_master_id", 10).primary();
    table.string("document_name", 30);
    table.string("user_type_id", 10);
    // Audit trail properties
    table.date("created_at");
    table.time("created_on");
    table.string("created_by", 10);
    table.date("updated_at");
    table.time("updated_on");
    table.string("updated_by", 10);
    table.string("status", 10);

    // Indexes
    table.index(["user_type_id"]);
    table.index(["document_name"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("document_name_master");
};
