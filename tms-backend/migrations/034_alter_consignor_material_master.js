exports.up = function (knex) {
  return knex.schema.alterTable(
    "consignor_material_master_information",
    function (table) {
      // Drop old column
      table.dropColumn("packing_type");
      // Add new ID column
      table.string("packing_type_id", 10);
      // Add index
      table.index(["packing_type_id"]);
    }
  );
};

exports.down = function (knex) {
  return knex.schema.alterTable(
    "consignor_material_master_information",
    function (table) {
      // Rollback changes
      table.dropColumn("packing_type_id");
      table.string("packing_type", 100);
    }
  );
};
