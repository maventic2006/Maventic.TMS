exports.up = function (knex) {
  return knex.schema.createTable(
    "consignor_approval_hierarchy_configuration",
    function (table) {
      table.increments("approval_hierarchy_id").primary();
      table.string("consignor_id", 10).notNullable();
      table.string("transporter_id", 10);
      table.string("approval_type", 100);
      table.integer("approval_level");
      table.string("approval_control", 100);
      table.string("role_of", 100);
      table.string("role", 100);
      table.string("user_id", 10);

      // Audit trail properties
      table.datetime("created_at").defaultTo(knex.fn.now());
      table.datetime("created_on").defaultTo(knex.fn.now());
      table.string("created_by", 10);
      table.datetime("updated_at").defaultTo(knex.fn.now());
      table.datetime("updated_on").defaultTo(knex.fn.now());
      table.string("updated_by", 10);
      table.string("status", 10).defaultTo("ACTIVE");

      // Indexes
      table.index(["consignor_id"]);
      table.index(["transporter_id"]);
      table.index(["approval_level"]);
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTable("consignor_approval_hierarchy_configuration");
};
