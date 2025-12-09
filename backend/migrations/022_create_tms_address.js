exports.up = function (knex) {
  return knex.schema.createTable("tms_address", function (table) {
    table.increments("address_unique_id").primary();
    table.string("address_id", 20).notNullable().unique();
    table.string("user_reference_id", 20);
    table.string("user_type", 50);
    table.string("country", 100);
    table.string("vat_number", 50);
    table.string("street_1", 255);
    table.string("street_2", 255);
    table.string("city", 100);
    table.string("district", 100);
    table.string("state", 100);
    table.string("postal_code", 20);
    table.boolean("is_primary").defaultTo(false);
    table.string("address_type_id", 10);
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["address_id"]);
    table.index(["user_reference_id"]);
    table.index(["country"]);
    table.index(["state"]);
    table.index(["city"]);
    table.index(["postal_code"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tms_address");
};