exports.up = function(knex) {
  return knex.schema.alterTable('indent_document', function(table) {
    // Rename document_type to document_type_id
    table.renameColumn('document_type', 'document_type_id');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('indent_document', function(table) {
    // Revert the column name change
    table.renameColumn('document_type_id', 'document_type');
  });
};