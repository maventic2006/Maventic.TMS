exports.up = function (knex) {
  return knex.schema.createTable("user_signup_document", function (table) {
    table.increments("signup_doc_unique_id").primary();
    table.string("signup_doc_id", 20).notNullable().unique();
    table.string("signup_id", 20);
    table.string("country", 100);
    table.string("document_type_id", 20);
    table.string("document_number", 100);
    table.string("document_id", 20);
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
    table.foreign("signup_id").references("signup_id").inTable("user_signup_request");

    // Indexes
    table.index(["signup_doc_id"]);
    table.index(["signup_id"]);
    table.index(["document_type_id"]);
    table.index(["document_number"]);
    table.index(["country"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_signup_document");
};