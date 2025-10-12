exports.up = function (knex) {
  return knex.schema.createTable(
    "transporter_vehicle_config_data_itm",
    function (table) {
      table.increments("alert_itm_auto_id").primary();
      table.string("transporter_alert_itm_id", 20).notNullable();
      table.string("vehicle_config_hdr_id", 20).notNullable();
      table.string("mobile_number", 20);
      table.string("email_id", 100);
      table.string("alert_type", 50);
      table.string("user_id", 10);

      // Audit trail properties
      table.datetime("created_at").defaultTo(knex.fn.now());
      table.datetime("created_on").defaultTo(knex.fn.now());
      table.string("created_by", 10);
      table.datetime("updated_at").defaultTo(knex.fn.now());
      table.datetime("updated_on").defaultTo(knex.fn.now());
      table.string("updated_by", 10);
      table.string("status", 10).defaultTo("ACTIVE");

      // Foreign key relationships (disabled for initial setup)
      // table.foreign("vehicle_config_hdr_id").references("vehicle_config_hdr_id").inTable("transporter_vehicle_config_data_hdr");

      // Indexes
      table.index(
        ["transporter_alert_itm_id"],
        "idx_trans_veh_cfg_itm_alert_id"
      );
      table.index(["vehicle_config_hdr_id"], "idx_trans_veh_cfg_itm_hdr_id");
      table.index(["email_id"], "idx_trans_veh_cfg_itm_email");
      table.index(["user_id"], "idx_trans_veh_cfg_itm_user_id");
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable("transporter_vehicle_config_data_itm");
};
