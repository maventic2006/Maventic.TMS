exports.up = function (knex) {
  return knex.schema.createTable("ebidding_transaction_hdr", function (table) {
    table.increments("ebidding_trans_hdr_unique_id").primary();
    table.string("ebidding_trans_hdr_id", 20).notNullable().unique();
    table.string("indent_id", 20); // References indent_header
    table.string("ebidding_id", 20); // References ebidding_header
    table.string("transporter_id", 10);
    table.decimal("freight_rate", 10, 2);
    table.string("freight_unit", 10);
    table.integer("rank");
    table.string("currency", 10);
    table.text("bidding_remark");
    table.decimal("qty", 10, 2);
    table.string("qty_currency", 10);
    table.decimal("freight_rate_value", 15, 2);
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status", 10).nullable();

    // Indexes
    table.index(["ebidding_trans_hdr_id"]);
    table.index(["indent_id"]);
    table.index(["ebidding_id"]);
    table.index(["transporter_id"]);
    table.index(["rank"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("ebidding_transaction_hdr");
};