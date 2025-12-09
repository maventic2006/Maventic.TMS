exports.up = function (knex) {
  return knex.schema.createTable("material_types_master", function (table) {
    table.string("material_types_id", 10).primary();
    table.string("material_types", 30).notNullable().unique();
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status", 10).nullable();

    // Indexes
    table.index(["material_types_id"]);
    table.index(["material_types"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("material_types_master");
};