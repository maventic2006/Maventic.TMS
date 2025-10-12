exports.up = function (knex) {
  return knex.schema.createTable("consignor_material_master_information", function (table) {
    table.increments("c_material_master_id").primary();
    table.string("material_master_id", 10).notNullable();
    table.string("consignor_id", 10).notNullable();
    table.decimal("volumetric_weight_per_unit", 10, 3);
    table.decimal("net_weight_per_unit", 10, 3);
    table.decimal("dimension_l", 10, 2);
    table.decimal("dimension_b", 10, 2);
    table.decimal("dimension_h", 10, 2);
    table.integer("avg_packaging_time_in_minutes");
    table.integer("avg_loading_time_in_minutes");
    table.integer("avg_unloading_time_in_minutes");
    table.string("packing_type", 100);
    table.text("material_description");
    
    // Audit trail properties
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.string("created_by", 10);
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
    table.string("updated_by", 10);
    table.string("status", 10).defaultTo("ACTIVE");

    // Indexes
    table.index(["material_master_id"], "idx_material_master_id");
    table.index(["consignor_id"], "idx_material_consignor_id");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("consignor_material_master_information");
};
