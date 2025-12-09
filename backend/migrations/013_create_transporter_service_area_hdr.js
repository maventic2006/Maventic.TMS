exports.up = function (knex) {
  return knex.schema.createTable(
    "transporter_service_area_hdr",
    function (table) {
      table.increments("service_area_hdr_unique_id").primary();
      table.string("service_area_hdr_id", 10).notNullable();
      table.string("transporter_id", 10).notNullable();
      table.string("service_country", 100);

      // Audit trail properties
      table.datetime("created_at").defaultTo(knex.fn.now());
      table.datetime("created_on").defaultTo(knex.fn.now());
      table.string("created_by", 10);
      table.datetime("updated_at").defaultTo(knex.fn.now());
      table.datetime("updated_on").defaultTo(knex.fn.now());
      table.string("updated_by", 10);
      table.string("status", 10).defaultTo("ACTIVE");

      // Foreign key relationships (disabled for initial setup)
      // table.foreign("transporter_id").references("transporter_id").inTable("transporter_general_info");

      // Indexes
      table.index(["transporter_id"], "idx_trans_srv_area_hdr_trans_id");
      table.index(["service_area_hdr_id"], "idx_trans_srv_area_hdr_id");
      table.index(["service_country"], "idx_trans_srv_area_hdr_country");
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable("transporter_service_area_hdr");
};
