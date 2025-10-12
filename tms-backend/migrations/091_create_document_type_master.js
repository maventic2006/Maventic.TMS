exports.up = function(knex) {
  return knex.schema.createTable('document_type_master', function(table) {
    // Primary Key
    table.string('document_type_id', 10).primary();
    
    // Main Fields
    table.string('document_type', 50).notNullable();
    table.string('description', 100).nullable();
    
    // Audit Trail
    table.date('created_at').nullable();
    table.time('created_on').nullable();
    table.string('created_by', 10).nullable();
    table.date('updated_at').nullable();
    table.time('updated_on').nullable();
    table.string('updated_by', 10).nullable();
    table.string('status', 10).nullable();
    
    // Indexes
    table.index(['document_type'], 'idx_document_type_master_type');
    table.index(['status'], 'idx_document_type_master_status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('document_type_master');
};