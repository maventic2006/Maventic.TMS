exports.up = function (knex) {
  return knex.schema.createTable("master_trip", function (table) {
    table.increments("master_trip_unique_id").primary();
    table.string("master_trip_id", 20).notNullable().unique();
    table.string("consignor_id", 10);
    table.string("trip_status", 50);
    table.string("status", 50);
    table.string("currency", 10);
    table.date("start_date");
    table.time("start_time");
    table.string("transporter_id", 10);
    table.string("vehicle_id", 10);
    table.string("driver_id", 10);
    table.string("mode_of_transportation", 50);
    table.string("pick_up_warehouse_id", 10);
    table.string("pick_up_warehouse_gate_sub_type_id", 10);
    table.string("goods_loading_point_id", 10);
    table.decimal("distance_to_be_covered", 10, 2);
    table.boolean("is_round_trip").defaultTo(false);
    table.datetime("trip_start_date_time");
    table.string("lr_number", 50);
    table.decimal("freight_rate", 10, 2);
    table.string("freight_rate_unit", 10);
    table.decimal("freight_value", 15, 2);
    table.string("freight_value_currency", 10);
    table.string("indent_id", 20);
    table.string("reference_master_trip_id", 20); // Self-reference
    table.integer("priority_order_identifier");
    table.string("yard_entry_number", 50);
    table.datetime("gate_in_timestamp");
    table.datetime("gate_out_timestamp");
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status_audit", 10).nullable();

    // Indexes
    table.index(["master_trip_id"]);
    table.index(["consignor_id"]);
    table.index(["transporter_id"]);
    table.index(["vehicle_id"]);
    table.index(["driver_id"]);
    table.index(["indent_id"]);
    table.index(["trip_status"]);
    table.index(["status"]);
    table.index(["status_audit"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("master_trip");
};