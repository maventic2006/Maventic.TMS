exports.up = function (knex) {
  return knex.schema.createTable("transporter_vehicle_config_param_name", function (table) {
    table.increments("tv_config_param_auto_id").primary();
    table.string("tv_config_parameter_name_id", 20).notNullable();
    table.string("parameter_name", 200).notNullable();
    table.boolean("is_minimum_required").defaultTo(false);
    table.boolean("is_maximum_required").defaultTo(false);
    table.string("tv_config_parameter_name_id_ref", 20);
    table.decimal("parameter_value_min", 10, 2);
    table.decimal("parameter_value_max", 10, 2);
    table.date("valid_from");
    table.date("valid_to");
    table.boolean("active_flag").defaultTo(true);
    table.boolean("is_alert_required").defaultTo(false);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["tv_config_parameter_name_id"], "idx_trans_veh_param_name_id");
    table.index(["parameter_name"], "idx_trans_veh_param_name");
    table.index(["tv_config_parameter_name_id_ref"], "idx_trans_veh_param_ref_id");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("transporter_vehicle_config_param_name");
};
