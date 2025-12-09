exports.up = function (knex) {
  return knex.schema.createTable(
    "consignor_general_config_parameter_value",
    function (table) {
      table.increments("parameter_value_id").primary();
      table.string("parameter_name_key", 100).notNullable();
      table.string("consignor_id", 10).notNullable();
      table.string("warehouse_id", 10);
      table.text("probable_values");

      // Audit trail properties
      table.datetime("created_at").defaultTo(knex.fn.now());
      table.datetime("created_on").defaultTo(knex.fn.now());
      table.string("created_by", 10);
      table.datetime("updated_at").defaultTo(knex.fn.now());
      table.datetime("updated_on").defaultTo(knex.fn.now());
      table.string("updated_by", 10);
      table.string("status", 10).defaultTo("ACTIVE");

      // Foreign key relationships (disabled for initial setup)
      // table
      //   .foreign("parameter_name_key")
      //   .references("parameter_name_key_code")
      //   .inTable("consignor_general_config_parameter_name");

      // Indexes
      table.index(["consignor_id"], "idx_consignor_id");
      table.index(["parameter_name_key"], "idx_param_name_key");
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable("consignor_general_config_parameter_value");
};
