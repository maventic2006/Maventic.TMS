exports.up = function (knex) {
  return knex.schema.createTable("user_type_master", function (table) {
    table.string("user_type_id", 10).primary();
    table.string("user_type", 30);
    // Audit trail properties
    table.date("created_at");
    table.time("created_on");
    table.string("created_by", 10);
    table.date("updated_at");
    table.time("updated_on");
    table.string("updated_by", 10);
    table.string("status", 10);

    // Indexes
    table.index(["user_type"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_type_master");
};
