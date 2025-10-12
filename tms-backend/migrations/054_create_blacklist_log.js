exports.up = function (knex) {
  return knex.schema.createTable("blacklist_log", function (table) {
    table.increments("blacklist_log_unique_id").primary();
    table.string("blacklist_log_id", 20).notNullable().unique();
    table.string("blacklisted_by_id", 10); // ID of the entity that performed the action
    table.string("blacklist_type", 50); // Type of blacklist action
    table.string("user_id", 10); // ID of user affected by the action
    table.string("actioned_by", 10); // Who performed the action
    table.date("actioned_at"); // Date of action
    table.time("actioned_on"); // Time of action
    // Note: blacklist_status field excluded as requested
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["blacklist_log_id"]);
    table.index(["blacklisted_by_id"]);
    table.index(["blacklist_type"]);
    table.index(["user_id"]);
    table.index(["actioned_by"]);
    table.index(["actioned_at"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("blacklist_log");
};