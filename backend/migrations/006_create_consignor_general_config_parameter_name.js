exports.up = function (knex) {
  return knex.schema.createTable(
    "consignor_general_config_parameter_name",
    function (table) {
      table.string("parameter_name_key", 10).primary();
      table.string("parameter_name_description", 200).notNullable();
      table.text("probable_values");

      // Audit trail properties
      table.date("created_at");
      table.time("created_on");
      table.string("created_by", 10);
      table.date("updated_at");
      table.time("updated_on");
      table.string("updated_by", 10);
      table.string("status", 10);

      // Indexes
      table.index(["parameter_name_description"], "idx_param_desc");
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable("consignor_general_config_parameter_name");
};
