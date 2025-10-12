exports.up = function(knex) {
  return knex.schema.alterTable('indent_header', function(table) {
    // Rename indent_status to indent_status_id
    table.renameColumn('indent_status', 'indent_status_id');
    
    // Change data type to match master table
    // Note: This will be handled in a separate step if needed
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('indent_header', function(table) {
    // Revert the column name change
    table.renameColumn('indent_status_id', 'indent_status');
  });
};