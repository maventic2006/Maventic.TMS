exports.up = function (knex) {
  return knex.schema.createTable("driver_history_information", function (table) {
    table.increments("history_auto_id").primary();
    table.string("driver_history_id", 20).notNullable();
    table.string("driver_id", 10).notNullable();
    table.string("employer", 200);
    table.date("from_date");
    table.date("to_date");
    table.string("employment_status", 50);
    table.string("job_title", 100);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Foreign key relationships
    table.foreign("driver_id").references("driver_id").inTable("driver_basic_information");

    // Indexes
    table.index(["driver_history_id"], "idx_driver_hist_hist_id");
    table.index(["driver_id"], "idx_driver_hist_driver_id");
    table.index(["employer"], "idx_driver_hist_employer");
    table.index(["employment_status"], "idx_driver_hist_status");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("driver_history_information");
};
