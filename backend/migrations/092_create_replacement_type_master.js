exports.up = function(knex) {
  return knex.schema.createTable('replacement_type_master', function(table) {
    // Primary Key
    table.string('replacement_type_id', 10).primary();
    
    // Main Fields
    table.string('replacement_type', 50).notNullable();
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
    table.index(['replacement_type'], 'idx_replacement_type_master_type');
    table.index(['status'], 'idx_replacement_type_master_status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('replacement_type_master');
};