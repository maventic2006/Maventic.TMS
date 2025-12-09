exports.up = function (knex) {
  return knex.schema.createTable("indent_item", function (table) {
    table.increments("indent_item_unique_id").primary();
    table.string("indent_id_item", 20).notNullable().unique();
    table.string("indent_id", 20); // References indent_header
    table.string("material_id", 10);
    table.string("material_master_id", 10);
    table.decimal("quantity", 15, 3);
    table.string("quantity_unit", 10);
    table.text("material_description");
    table.decimal("material_value", 15, 2);
    table.string("material_value_currency", 10);
    table.decimal("volumetric_weight", 10, 3);
    table.string("volumetric_unit", 10);
    table.decimal("gross_weight", 10, 3);
    table.decimal("net_weight", 10, 3);
    table.string("weight_unit", 10);
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status", 10).nullable();

    // Indexes
    table.index(["indent_id_item"]);
    table.index(["indent_id"]);
    table.index(["material_id"]);
    table.index(["material_master_id"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("indent_item");
};