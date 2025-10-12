exports.up = function (knex) {
  return knex.schema.createTable(
    "consignor_general_config_master",
    function (table) {
      table.string("g_config_id", 10).primary();
      table.string("consignor_id", 10).notNullable();
      table.string("warehouse_id", 10);
      table.string("parameter_name_id", 10).notNullable();
      table.string("parameter_value", 500);
      table.text("description");
      table.boolean("active");
      table.date("valid_from");
      table.date("valid_to");
      // Audit trail properties
      table.date("created_at");
      table.time("created_on");
      table.string("created_by", 10);
      table.date("updated_at");
      table.time("updated_on");
      table.string("updated_by", 10);
      table.string("status", 10);

      // Foreign key relationships (disabled for initial setup)
      // table
      //   .foreign("parameter_name_id")
      //   .references("parameter_name_key")
      //   .inTable("consignor_general_config_parameter_name");

      // Indexes
      table.index(["consignor_id"]);
      table.index(["parameter_name_id"]);
      table.index(["active"]);
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable("consignor_general_config_master");
};
