exports.up = function (knex) {
  return knex.schema.createTable("approval_type_master", function (table) {
    table.string("approval_type_id", 10).primary();
    table.string("approval_type", 30);
    // Audit trail properties
    table.date("created_at");
    table.time("created_on");
    table.string("created_by", 10);
    table.date("updated_at");
    table.time("updated_on");
    table.string("updated_by", 10);
    table.string("status", 10);

    // Indexes
    table.index(["approval_type"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("approval_type_master");
};
