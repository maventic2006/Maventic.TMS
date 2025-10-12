exports.up = function (knex) {
  return knex.schema.createTable(
    "warehouse_sub_location_header",
    function (table) {
      table.string("sub_location_hdr_id", 10).primary();
      table.string("warehouse_unique_id", 10).notNullable();
      table.string("consignor_id", 10).notNullable();
      table.string("sub_location_id", 10).notNullable();
      table.string("subtype_name", 25);
      table.string("description", 40);
      // Audit trail properties
      table.date("created_at");
      table.time("created_on");
      table.string("created_by", 10);
      table.date("updated_at");
      table.time("updated_on");
      table.string("updated_by", 10);
      table.string("status", 10);

      // Foreign key relationships (disabled for initial setup)
      // table
      //   .foreign("warehouse_unique_id")
      //   .references("warehouse_id")
      //   .inTable("warehouse_basic_information");

      // Indexes
      table.index(["warehouse_unique_id"]);
      table.index(["consignor_id"]);
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable("warehouse_sub_location_header");
};
