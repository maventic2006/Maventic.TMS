exports.up = function (knex) {
  return knex.schema.createTable("document_name_master", function (table) {
    table.increments("doc_name_master_unique_id").primary();
    table.string("doc_name_master_id", 20).notNullable().unique();
    table.string("document_name", 200);
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
    table.index(["doc_name_master_id"]);
    table.index(["user_type"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("document_name_master");
};