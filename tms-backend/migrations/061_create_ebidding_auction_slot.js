exports.up = function (knex) {
  return knex.schema.createTable("ebidding_auction_slot", function (table) {
    table.increments("auction_slot_unique_id").primary();
    table.string("ebidding_auction_id", 20).notNullable().unique();
    table.string("consignor_id", 10);
    table.string("ebidding_slot_number", 10);
    table.string("warehouse_id", 10);
    table.date("auction_start_date");
    table.time("auction_start_time");
    table.date("auction_end_date");
    table.time("auction_end_time");
    table.integer("auction_duration");
    table.string("status", 50);
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status_audit", 10).nullable();

    // Indexes
    table.index(["ebidding_auction_id"]);
    table.index(["consignor_id"]);
    table.index(["warehouse_id"]);
    table.index(["auction_start_date"]);
    table.index(["status"]);
    table.index(["status_audit"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("ebidding_auction_slot");
};