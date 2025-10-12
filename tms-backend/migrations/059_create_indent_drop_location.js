exports.up = function (knex) {
  return knex.schema.createTable("indent_drop_location", function (table) {
    table.increments("drop_location_unique_id").primary();
    table.string("drop_location_id", 20).notNullable().unique();
    table.string("indent_vehicle_id", 20); // References indent_vehicle
    table.integer("vehicle_drop_serial");
    table.string("point", 100);
    table.decimal("drop_latitude", 10, 8);
    table.decimal("drop_longitude", 10, 8);
    table.text("drop_address");
    table.string("drop_warehouse_id", 10);
    table.string("warehouse_gate_sub_type_id", 10);
    table.string("goods_unloading_point_id", 10);
    table.string("receiver_name", 100);
    table.string("receiver_contact", 20);
    table.datetime("expected_delivery_date_time");
    table.string("alternate_mobile", 20);
    table.string("email_id", 100);
    table.integer("expected_transit_time");
    table.integer("estimated_transit_time");
    table.decimal("transit_distance", 10, 2);
    table.decimal("gross_weight", 10, 3);
    table.string("status", 50);
    table.text("delayed_reason");
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status_audit", 10).nullable();

    // Indexes
    table.index(["drop_location_id"]);
    table.index(["indent_vehicle_id"]);
    table.index(["drop_warehouse_id"]);
    table.index(["status"]);
    table.index(["status_audit"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("indent_drop_location");
};