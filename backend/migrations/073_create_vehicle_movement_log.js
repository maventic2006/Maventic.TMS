exports.up = function(knex) {
  return knex.schema.createTable('vehicle_movement_log', function(table) {
    // Primary Key
    table.string('vehicle_log_id', 10).primary();
    
    // Foreign Keys
    table.string('indent_id', 10).notNullable();
    table.string('vehicle_id', 10).notNullable();
    table.string('transporter_id', 10).nullable();
    table.string('drop_location_id', 10).nullable();
    table.string('vehicle_assignment_id', 10).nullable();
    
    // Movement Details
    table.string('for_activity', 100).nullable();
    table.date('date').nullable();
    table.time('time').nullable();
    
    // Audit Trail
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.date('created_on').nullable();
    table.string('created_by', 50).defaultTo('SYSTEM');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.date('updated_on').nullable();
    table.string('updated_by', 50).defaultTo('SYSTEM');
    table.string('status', 10).defaultTo('ACTIVE');
    
    // Indexes
    table.index(['indent_id'], 'idx_vehicle_movement_log_indent_id');
    table.index(['vehicle_id'], 'idx_vehicle_movement_log_vehicle_id');
    table.index(['transporter_id'], 'idx_vehicle_movement_log_transporter_id');
    table.index(['date'], 'idx_vehicle_movement_log_date');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('vehicle_movement_log');
};