exports.up = function (knex) {
  return knex.schema.createTable("ebidding_header", function (table) {
    table.increments("ebidding_header_unique_id").primary();
    table.string("ebidding_id", 20).notNullable().unique();
    table.string("indent_id", 20); // References indent_header
    table.string("ebidding_auction_id", 20); // References ebidding_auction_slot
    table.datetime("ebidding_start_timestamp");
    table.datetime("ebidding_end_timestamp");
    table.decimal("avg_freight_rate", 10, 2);
    table.string("freight_unit", 10);
    table.string("status", 50);
    table.string("approved_by", 50);
    table.datetime("approved_on");
    table.text("approver_remark");
    table.string("approved_transporter_id", 10);
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status_audit", 10).nullable();

    // Indexes
    table.index(["ebidding_id"]);
    table.index(["indent_id"]);
    table.index(["ebidding_auction_id"]);
    table.index(["approved_transporter_id"]);
    table.index(["status"]);
    table.index(["status_audit"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("ebidding_header");
};