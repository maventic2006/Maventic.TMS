exports.up = function (knex) {
  return knex.schema.createTable("material_master_information", function (table) {
    table.increments("material_master_unique_id").primary();
    table.string("material_master_id", 20).notNullable().unique();
    table.string("material_id", 20);
    table.string("material_sector", 100);
    table.string("material_types_id", 10);
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
    table.index(["material_master_id"]);
    table.index(["material_id"]);
    table.index(["material_sector"]);
    table.index(["material_types_id"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("material_master_information");
};