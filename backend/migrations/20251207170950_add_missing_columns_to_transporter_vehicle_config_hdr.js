/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table(
    "transporter_vehicle_config_data_hdr",
    function (table) {
      table
        .string("tv_config_parameter_name_id", 20)
        .nullable()
        .comment("Parameter ID from transporter_vehicle_config_param_name");
      table
        .decimal("parameter_value_min", 10, 2)
        .nullable()
        .comment("Minimum parameter value");
      table
        .decimal("parameter_value_max", 10, 2)
        .nullable()
        .comment("Maximum parameter value");
      table
        .date("valid_from")
        .nullable()
        .comment("Configuration validity start date");
      table
        .date("valid_to")
        .nullable()
        .comment("Configuration validity end date");

      // Add indexes
      table.index(
        ["tv_config_parameter_name_id"],
        "idx_trans_veh_cfg_param_id"
      );
      table.index(["valid_from"], "idx_trans_veh_cfg_valid_from");
      table.index(["valid_to"], "idx_trans_veh_cfg_valid_to");
    }
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table(
    "transporter_vehicle_config_data_hdr",
    function (table) {
      table.dropIndex(
        ["tv_config_parameter_name_id"],
        "idx_trans_veh_cfg_param_id"
      );
      table.dropIndex(["valid_from"], "idx_trans_veh_cfg_valid_from");
      table.dropIndex(["valid_to"], "idx_trans_veh_cfg_valid_to");
      table.dropColumn("tv_config_parameter_name_id");
      table.dropColumn("parameter_value_min");
      table.dropColumn("parameter_value_max");
      table.dropColumn("valid_from");
      table.dropColumn("valid_to");
    }
  );
};
