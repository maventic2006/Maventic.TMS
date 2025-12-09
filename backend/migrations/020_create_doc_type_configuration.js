exports.up = function (knex) {
  return knex.schema.createTable("doc_type_configuration", function (table) {
    table.increments("doc_type_config_unique_id").primary();
    table.string("document_type_id", 20).notNullable().unique();
    table.string("doc_name_master_id", 20);
    table.string("user_type", 50);
    table.string("service_area_country", 100);
    table.boolean("is_mandatory").defaultTo(false);
    table.boolean("is_expiry_required").defaultTo(false);
    table.boolean("is_verification_required").defaultTo(false);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["document_type_id"]);
    table.index(["user_type"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("doc_type_configuration");
};