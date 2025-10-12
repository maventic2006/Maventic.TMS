exports.up = function (knex) {
  return knex.schema.createTable("blacklist_mapping", function (table) {
    table.increments("blacklist_mapping_unique_id").primary();
    table.string("blacklist_mapping_id", 20).notNullable().unique();
    table.string("blacklisted_by", 10); // The entity doing the blacklisting
    table.string("blacklisted_by_id", 10); // ID of the entity doing the blacklisting
    table.string("user_type", 50); // Type of user being blacklisted
    table.string("user_id", 10); // ID of user being blacklisted
    table.date("valid_from");
    table.date("valid_to");
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
    table.index(["blacklist_mapping_id"]);
    table.index(["blacklisted_by"]);
    table.index(["blacklisted_by_id"]);
    table.index(["user_type"]);
    table.index(["user_id"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("blacklist_mapping");
};