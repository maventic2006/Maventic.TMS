exports.up = function (knex) {
  return knex.schema.createTable(
    "transporter_service_area_itm",
    function (table) {
      table.increments("service_area_itm_unique_id").primary();
      table.string("service_area_itm_id", 10).notNullable();
      table.string("service_area_hdr_id", 10).notNullable();
      table.string("service_state", 100);

      // Audit trail properties
      table.datetime("created_at").defaultTo(knex.fn.now());
      table.datetime("created_on").defaultTo(knex.fn.now());
      table.string("created_by", 10);
      table.datetime("updated_at").defaultTo(knex.fn.now());
      table.datetime("updated_on").defaultTo(knex.fn.now());
      table.string("updated_by", 10);
      table.string("status", 10).defaultTo("ACTIVE");

      // Foreign key relationships (disabled for initial setup)
      // table.foreign("service_area_hdr_id").references("service_area_hdr_id").inTable("transporter_service_area_hdr");

      // Indexes
      table.index(["service_area_hdr_id"], "idx_trans_srv_area_itm_hdr_id");
      table.index(["service_area_itm_id"], "idx_trans_srv_area_itm_id");
      table.index(["service_state"], "idx_trans_srv_area_itm_state");
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable("transporter_service_area_itm");
};
