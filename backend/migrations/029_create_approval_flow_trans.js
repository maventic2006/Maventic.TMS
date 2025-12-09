exports.up = function (knex) {
  return knex.schema.createTable("approval_flow_trans", function (table) {
    table.increments("approval_flow_unique_id").primary();
    table.string("approval_flow_trans_id", 20).notNullable().unique();
    table.string("approval_id", 20);
    table.string("approval_config_id", 20);
    table.string("approval_type", 100);
    table.string("user_id_reference_id", 20);
    table.string("s_status", 50);
    table.string("approval_cycle", 50);
    table.integer("approver_level");
    table.string("pending_with_role", 100);
    table.string("pending_with_id", 20);
    table.string("pending_with_name", 200);
    table.string("actioned_by_id", 20);
    table.string("actioned_by_name", 200);
    table.text("remarks");
    table.datetime("approved_on");
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Foreign key constraints
    table.foreign("approval_config_id").references("approval_config_id").inTable("approval_configuration");

    // Indexes
    table.index(["approval_flow_trans_id"]);
    table.index(["approval_id"]);
    table.index(["approval_config_id"]);
    table.index(["approval_type"]);
    table.index(["pending_with_id"]);
    table.index(["actioned_by_id"]);
    table.index(["s_status"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("approval_flow_trans");
};