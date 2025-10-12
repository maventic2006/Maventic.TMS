exports.up = function (knex) {
  return knex.schema.alterTable(
    "consignor_approval_hierarchy_configuration",
    function (table) {
      // Drop old columns
      table.dropColumn("role");
      table.dropColumn("approval_type");
      // Add new ID columns
      table.string("role_id", 10);
      table.string("approval_type_id", 10);
      // Add indexes
      table.index(["role_id"]);
      table.index(["approval_type_id"]);
    }
  );
};

exports.down = function (knex) {
  return knex.schema.alterTable(
    "consignor_approval_hierarchy_configuration",
    function (table) {
      // Rollback changes
      table.dropColumn("role_id");
      table.dropColumn("approval_type_id");
      table.string("role", 100);
      table.string("approval_type", 100);
    }
  );
};
