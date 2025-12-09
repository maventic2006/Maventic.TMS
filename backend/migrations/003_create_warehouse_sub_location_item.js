exports.up = function (knex) {
  return knex.schema.createTable(
    "warehouse_sub_location_item",
    function (table) {
      table.string("geo_fence_item_id", 10);
      table.string("sub_location_hdr_id", 10);
      table.string("sequence", 10);
      table.string("latitude", 40);
      table.string("longitude", 40);
      // Audit trail properties
      table.date("created_at");
      table.time("created_on");
      table.string("created_by", 10);
      table.date("updated_at");
      table.time("updated_on");
      table.string("updated_by", 10);
      table.string("status", 10);

      // Composite primary key
      table.primary(["geo_fence_item_id", "sub_location_hdr_id"]);

      // Foreign key relationships (disabled for initial setup)
      // table
      //   .foreign("sub_location_hdr_id")
      //   .references("sub_location_hdr_id")
      //   .inTable("warehouse_sub_location_header");

      // Indexes
      table.index(["sub_location_hdr_id"]);
      table.index(["latitude", "longitude"]);
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable("warehouse_sub_location_item");
};
