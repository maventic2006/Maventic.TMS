exports.up = function(knex) {
  return knex.schema.alterTable('vehicle_movement_log', function(table) {
    // Rename for_activity to for_activity_id
    table.renameColumn('for_activity', 'for_activity_id');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('vehicle_movement_log', function(table) {
    // Revert the column name change
    table.renameColumn('for_activity_id', 'for_activity');
  });
};