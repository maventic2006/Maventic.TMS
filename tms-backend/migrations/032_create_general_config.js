exports.up = function (knex) {
  return knex.schema.createTable("general_config", function (table) {
    table.increments("general_config_unique_id").primary();
    table.string("general_config_id", 20).notNullable().unique();
    table.string("parameter_name", 200);
    table.string("parameter_value_min", 100);
    table.string("parameter_value_max", 100);
    table.date("valid_from");
    table.date("valid_to");
    table.boolean("active_flag").defaultTo(true);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["general_config_id"]);
    table.index(["parameter_name"]);
    table.index(["active_flag"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("general_config");
};