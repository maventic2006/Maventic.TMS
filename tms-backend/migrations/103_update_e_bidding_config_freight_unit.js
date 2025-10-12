exports.up = function(knex) {
  return knex.schema.alterTable('e_bidding_config', function(table) {
    // Rename freight_unit to freight_unit_id
    table.renameColumn('freight_unit', 'freight_unit_id');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('e_bidding_config', function(table) {
    // Revert the column name change
    table.renameColumn('freight_unit_id', 'freight_unit');
  });
};