exports.up = function (knex) {
  return knex.schema.createTable("message_master", function (table) {
    table.increments("message_master_unique_id").primary();
    table.string("message_master_id", 20).notNullable().unique();
    table.string("message_type_id", 10);
    table.string("application_id", 20);
    table.string("subject", 255);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["message_master_id"]);
    table.index(["message_type_id"]);
    table.index(["application_id"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("message_master");
};