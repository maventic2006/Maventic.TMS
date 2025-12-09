exports.up = function (knex) {
  return knex.schema.createTable("transporter_consignor_mapping_item", function (table) {
    table.increments("tc_mapping_item_unique_id").primary();
    table.string("tc_mapping_item_id", 20).notNullable().unique();
    table.string("tc_mapping_hdr_id", 20); // References tc_mapping_id from header table
    table.string("contract_id", 20);
    table.string("contract_name", 100);
    table.date("valid_from");
    table.date("valid_to");
    table.boolean("active_flag").defaultTo(true);
    table.text("remark");
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["tc_mapping_item_id"]);
    table.index(["tc_mapping_hdr_id"]);
    table.index(["contract_id"]);
    table.index(["active_flag"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("transporter_consignor_mapping_item");
};