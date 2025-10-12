exports.up = function (knex) {
  return knex.schema.createTable(
    "warehouse_basic_information",
    function (table) {
      table.string("warehouse_id", 10).primary();
      table.string("consignor_id", 10).notNullable();
      table.string("warehouse_type_id", 10);
      table.string("warehouse_name1", 30);
      table.string("warehouse_name2", 30);
      table.string("language_id", 10);
      table.integer("vehicle_capacity");
      table.boolean("virtual_yard_in");
      table.decimal("radius_for_virtual_yard_in", 3, 2);
      table.integer("speed_limit");
      table.boolean("weigh_bridge_availability");
      table.boolean("gatepass_system_available");
      table.boolean("fuel_availability");
      table.boolean("staging_area_for_goods_organization");
      table.boolean("driver_waiting_area");
      table.boolean("gate_in_checklist_auth");
      table.boolean("gate_out_checklist_auth");
      table.string("address_id", 40);

      // Audit trail properties
      table.date("created_at");
      table.time("created_on");
      table.string("created_by", 10);
      table.date("updated_at");
      table.time("updated_on");
      table.string("updated_by", 10);
      table.string("status", 10);

      // Indexes
      table.index(["consignor_id"]);
      table.index(["warehouse_id"]);
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable("warehouse_basic_information");
};
