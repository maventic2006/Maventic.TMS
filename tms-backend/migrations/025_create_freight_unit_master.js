exports.up = function (knex) {
  return knex.schema.createTable("freight_unit_master", function (table) {
    table.string("freight_unit_id", 10).primary();
    table.string("freight_unit", 30);
    // Audit trail properties
    table.date("created_at");
    table.time("created_on");
    table.string("created_by", 10);
    table.date("updated_at");
    table.time("updated_on");
    table.string("updated_by", 10);
    table.string("status", 10);

    // Indexes
    table.index(["freight_unit"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("freight_unit_master");
};
