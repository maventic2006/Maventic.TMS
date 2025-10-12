exports.up = function (knex) {
  return knex.schema.createTable("message_type_master", function (table) {
    table.string("message_type_id", 10).primary();
    table.string("message_type", 30).notNullable();
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status", 10).nullable();

    // Indexes
    table.index(["message_type_id"]);
    table.index(["message_type"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("message_type_master");
};