exports.up = function (knex) {
  return knex.schema.alterTable(
    "consignor_general_config_master",
    function (table) {
      // Drop the old column
      table.dropColumn("parameter_name_key");
      // Add the new ID column to reference parameter name table
      table.string("parameter_name_id", 10);
      // Add index
      table.index(["parameter_name_id"]);
    }
  );
};

exports.down = function (knex) {
  return knex.schema.alterTable(
    "consignor_general_config_master",
    function (table) {
      // Rollback changes
      table.dropColumn("parameter_name_id");
      table.string("parameter_name_key", 100);
      table.index(["parameter_name_key"]);
    }
  );
};
