exports.up = function (knex) {
  return knex.schema.alterTable("packaging_type_master", function (table) {
    // Rename the column to match standard naming
    table.renameColumn("package_types", "packing_type");
    // Update audit trail to use DATE/TIME format
    table.dropColumn("created_at");
    table.dropColumn("created_on");
    table.dropColumn("updated_at");
    table.dropColumn("updated_on");
    // Add new audit trail columns
    table.date("created_at");
    table.time("created_on");
    table.date("updated_at");
    table.time("updated_on");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("packaging_type_master", function (table) {
    // Reverse changes
    table.renameColumn("packing_type", "package_types");
    table.dropColumn("created_at");
    table.dropColumn("created_on");
    table.dropColumn("updated_at");
    table.dropColumn("updated_on");
    // Restore original audit trail
    table.datetime("created_at").defaultTo(knex.fn.now());
    table.datetime("created_on").defaultTo(knex.fn.now());
    table.datetime("updated_at").defaultTo(knex.fn.now());
    table.datetime("updated_on").defaultTo(knex.fn.now());
  });
};
