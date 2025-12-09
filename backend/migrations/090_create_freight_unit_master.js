exports.up = function(knex) {
  return knex.schema.createTable('freight_unit_master', function(table) {
    // Primary Key
    table.string('freight_unit_id', 10).primary();
    
    // Main Fields
    table.string('freight_unit', 30).notNullable();
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
    table.index(['freight_unit'], 'idx_freight_unit_master_unit');
    table.index(['status'], 'idx_freight_unit_master_status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('freight_unit_master');
};