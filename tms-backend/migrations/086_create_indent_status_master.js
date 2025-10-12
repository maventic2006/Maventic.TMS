exports.up = function(knex) {
  return knex.schema.createTable('indent_status_master', function(table) {
    // Primary Key
    table.string('indent_status_id', 10).primary();
    
    // Main Fields
    table.string('indent_status', 30).notNullable();
    
    // Audit Trail
    table.date('created_at').nullable();
    table.time('created_on').nullable();
    table.string('created_by', 10).nullable();
    table.date('updated_at').nullable();
    table.time('updated_on').nullable();
    table.string('updated_by', 10).nullable();
    table.string('status', 10).nullable();
    
    // Indexes
    table.index(['indent_status'], 'idx_indent_status_master_status');
    table.index(['status'], 'idx_indent_status_master_status_flag');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('indent_status_master');
};