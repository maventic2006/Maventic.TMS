exports.up = function (knex) {
  return knex.schema.createTable("doc_type_configuration", function (table) {
    table.string("document_type_id", 10).primary();
    table.string("doc_name_master_id", 10);
    table.string("user_type_id", 10);
    table.string("country_id", 10);
    table.boolean("is_mandatory");
    table.boolean("is_expiry_required");
    table.boolean("is_verification_required");
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
    //   .foreign("doc_name_master_id")
    //   .references("doc_name_master_id")
    //   .inTable("document_name_master");

    // Indexes
    table.index(["doc_name_master_id"]);
    table.index(["user_type_id"]);
    table.index(["country_id"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("doc_type_configuration");
};
