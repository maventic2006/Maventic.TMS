exports.up = function (knex) {
  return knex.schema.createTable(
    "warehouse_sub_location_master",
    function (table) {
      table.string("sub_location_id", 10).primary();
      table.string("warehouse_sub_location_description", 40);
      table.boolean("is_mandatory");
      // Audit trail properties
      table.date("created_at");
      table.time("created_on");
      table.string("created_by", 10);
      table.date("updated_at");
      table.time("updated_on");
      table.string("updated_by", 10);
      table.string("status", 10);

      // Indexes
      table.index(
        ["warehouse_sub_location_description"],
        "idx_wh_sub_loc_desc"
      );
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable("warehouse_sub_location_master");
};
