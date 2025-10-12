exports.up = function (knex) {
  return knex.schema.createTable("role_master", function (table) {
    table.string("role_id", 10).primary();
    table.string("role", 30);
    // Audit trail properties
    table.date("created_at");
    table.time("created_on");
    table.string("created_by", 10);
    table.date("updated_at");
    table.time("updated_on");
    table.string("updated_by", 10);
    table.string("status", 10);

    // Indexes
    table.index(["role"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("role_master");
};
