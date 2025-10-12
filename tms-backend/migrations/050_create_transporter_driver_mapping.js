exports.up = function (knex) {
  return knex.schema.createTable("transporter_driver_mapping", function (table) {
    table.increments("td_mapping_unique_id").primary();
    table.string("td_mapping_id", 20).notNullable().unique();
    table.string("driver_id", 10); // Will add foreign key if driver table exists
    table.string("transporter_id", 10); // Will add foreign key if transporter table exists
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
    table.index(["td_mapping_id"]);
    table.index(["driver_id"]);
    table.index(["transporter_id"]);
    table.index(["active_flag"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("transporter_driver_mapping");
};