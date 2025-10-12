exports.up = function(knex) {
  return knex.schema.alterTable('checklist_configuration', function(table) {
    // Rename checklist_fail_action to checklist_fail_action_id
    table.renameColumn('checklist_fail_action', 'checklist_fail_action_id');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('checklist_configuration', function(table) {
    // Revert the column name change
    table.renameColumn('checklist_fail_action_id', 'checklist_fail_action');
  });
};