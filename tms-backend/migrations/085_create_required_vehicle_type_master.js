exports.up = function(knex) {
  return knex.schema.createTable('required_vehicle_type_master', function(table) {
    // Primary Key
    table.string('required_vehicle_type_id', 10).primary();
    
    // Main Fields
    table.string('required_vehicle_type', 30).notNullable();
    
    // Audit Trail
    table.date('created_at').nullable();
    table.time('created_on').nullable();
    table.string('created_by', 10).nullable();
    table.date('updated_at').nullable();
    table.time('updated_on').nullable();
    table.string('updated_by', 10).nullable();
    table.string('status', 10).nullable();
    
    // Indexes
    table.index(['required_vehicle_type'], 'idx_required_vehicle_type_master_type');
    table.index(['status'], 'idx_required_vehicle_type_master_status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('required_vehicle_type_master');
};