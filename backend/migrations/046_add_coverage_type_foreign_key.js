exports.up = function (knex) {
  return knex.schema
    .alterTable("vehicle_documents", function (table) {
      table.foreign("coverage_type_id").references("coverage_type_id").inTable("coverage_type_master");
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable("vehicle_documents", function (table) {
      table.dropForeign(["coverage_type_id"]);
    });
};