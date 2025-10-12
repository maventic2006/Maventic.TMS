exports.up = function (knex) {
  return knex.schema.createTable("message_text_language", function (table) {
    table.increments("message_text_unique_id").primary();
    table.string("text_id", 20).notNullable().unique();
    table.string("message_master_id", 20);
    table.string("language", 50);
    table.text("message_text");
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Foreign key constraints
    table.foreign("message_master_id").references("message_master_id").inTable("message_master");

    // Indexes
    table.index(["text_id"]);
    table.index(["message_master_id"]);
    table.index(["language"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("message_text_language");
};