exports.up = function (knex) {
  return knex.schema.createTable(
    "transporter_vehicle_config_data_hdr",
    function (table) {
      table.increments("vehicle_config_auto_id").primary();
      table.string("vehicle_config_hdr_id", 20).notNullable();
      table.string("vehicle_id_code", 20).notNullable();
      table.string("transporter_id", 10).notNullable();
      table.string("consignor_id", 10);
      table.string("vehicle_type_id", 10);

      // Audit trail properties
      table.datetime("created_at").defaultTo(knex.fn.now());
      table.datetime("created_on").defaultTo(knex.fn.now());
      table.string("created_by", 10);
      table.datetime("updated_at").defaultTo(knex.fn.now());
      table.datetime("updated_on").defaultTo(knex.fn.now());
      table.string("updated_by", 10);
      table.string("status", 10).defaultTo("ACTIVE");

      // Foreign key relationships (disabled for initial setup)
      // table.foreign("transporter_id").references("transporter_id").inTable("transporter_general_info");

      // Indexes
      table.index(["vehicle_config_hdr_id"], "idx_trans_veh_cfg_hdr_id");
      table.index(["vehicle_id_code"], "idx_trans_veh_cfg_veh_id");
      table.index(["transporter_id"], "idx_trans_veh_cfg_trans_id");
      table.index(["consignor_id"], "idx_trans_veh_cfg_consignor_id");
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable("transporter_vehicle_config_data_hdr");
};
