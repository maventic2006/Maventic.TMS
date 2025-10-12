exports.up = function(knex) {
  return knex.schema.alterTable('vehicle_driver_replacement_request', function(table) {
    // Rename replacement_type to replacement_type_id
    table.renameColumn('replacement_type', 'replacement_type_id');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('vehicle_driver_replacement_request', function(table) {
    // Revert the column name change
    table.renameColumn('replacement_type_id', 'replacement_type');
  });
};