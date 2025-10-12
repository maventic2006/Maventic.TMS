exports.up = function (knex) {
  return knex.schema.createTable("document_upload", function (table) {
    table.increments("document_upload_unique_id").primary();
    table.string("document_id", 20).notNullable().unique();
    table.string("file_name", 255);
    table.string("file_type", 50);
    table.text("file_xstring_value");
    table.string("system_reference_id", 50);
    table.boolean("is_verified").defaultTo(false);
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

    // Indexes
    table.index(["document_id"]);
    table.index(["file_type"]);
    table.index(["system_reference_id"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("document_upload");
};