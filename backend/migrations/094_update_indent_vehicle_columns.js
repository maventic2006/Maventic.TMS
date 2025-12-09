exports.up = function(knex) {
  return knex.schema.alterTable('indent_vehicle', function(table) {
    // Rename required_vehicle_type to required_vehicle_type_id
    table.renameColumn('required_vehicle_type', 'required_vehicle_type_id');
    
    // Rename base_freight_unit to freight_unit_id
    table.renameColumn('base_freight_unit', 'freight_unit_id');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('indent_vehicle', function(table) {
    // Revert the column name changes
    table.renameColumn('required_vehicle_type_id', 'required_vehicle_type');
    table.renameColumn('freight_unit_id', 'base_freight_unit');
  });
};