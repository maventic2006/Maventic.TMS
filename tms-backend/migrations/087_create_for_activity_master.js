exports.up = function(knex) {
  return knex.schema.createTable('for_activity_master', function(table) {
    // Primary Key
    table.string('for_activity_id', 10).primary();
    
    // Main Fields
    table.string('for_activity', 30).notNullable();
    
    // Audit Trail
    table.date('created_at').nullable();
    table.time('created_on').nullable();
    table.string('created_by', 10).nullable();
    table.date('updated_at').nullable();
    table.time('updated_on').nullable();
    table.string('updated_by', 10).nullable();
    table.string('status', 10).nullable();
    
    // Indexes
    table.index(['for_activity'], 'idx_for_activity_master_activity');
    table.index(['status'], 'idx_for_activity_master_status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('for_activity_master');
};