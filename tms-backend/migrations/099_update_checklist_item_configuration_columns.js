exports.up = function(knex) {
  return knex.schema.alterTable('checklist_item_configuration', function(table) {
    // Rename checklist_item to checklist_item_id
    table.renameColumn('checklist_item', 'checklist_item_id');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('checklist_item_configuration', function(table) {
    // Revert the column name change
    table.renameColumn('checklist_item_id', 'checklist_item');
  });
};