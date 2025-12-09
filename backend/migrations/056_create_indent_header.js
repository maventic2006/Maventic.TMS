exports.up = function (knex) {
  return knex.schema.createTable("indent_header", function (table) {
    table.increments("indent_header_unique_id").primary();
    table.string("indent_id", 20).notNullable().unique();
    table.string("consignor_id", 10); // References existing consignor
    table.string("warehouse_id", 10); // References existing warehouse
    table.string("creation_medium", 50);
    table.string("warehouse_gate_sub_type_id", 10);
    table.string("goods_loading_point_id", 10);
    table.integer("priority_order_identifier");
    table.boolean("e_bidding_eligible").defaultTo(false);
    table.string("ebidding_slot_number", 10);
    table.text("comments");
    table.string("indent_status", 50);
    table.decimal("total_freight_amount", 15, 2);
    table.string("currency", 10);
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status", 10).nullable();

    // Indexes
    table.index(["indent_id"]);
    table.index(["consignor_id"]);
    table.index(["warehouse_id"]);
    table.index(["indent_status"]);
    table.index(["e_bidding_eligible"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("indent_header");
};