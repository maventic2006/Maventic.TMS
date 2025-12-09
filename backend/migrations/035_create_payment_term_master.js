exports.up = function (knex) {
  return knex.schema.createTable("payment_term_master", function (table) {
    table.increments("payment_term_unique_id").primary();
    table.string("payment_term_id", 20).notNullable().unique();
    table.integer("number_of_days");
    table.text("description");
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["payment_term_id"]);
    table.index(["number_of_days"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("payment_term_master");
};