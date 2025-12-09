exports.up = function(knex) {
  return knex.schema.createTable('vehicle_driver_replacement_request', function(table) {
    // Primary Key
    table.string('replacement_id', 10).primary();
    
    // Foreign Keys
    table.string('indent_id', 10).notNullable();
    table.string('vehicle_assignment_id', 10).notNullable();
    
    // Replacement Details
    table.string('replacement_type', 50).notNullable(); // VEHICLE, DRIVER, BOTH
    table.string('request_reason', 200).nullable();
    table.string('status', 50).defaultTo('PENDING');
    table.string('old_vehicle_driver_id', 10).nullable();
    table.string('new_vehicle_driver_id', 10).nullable();
    
    // Request Tracking
    table.string('requested_user_type', 50).nullable();
    table.string('requested_by', 50).nullable();
    table.date('requested_on').nullable();
    table.timestamp('requested_at').nullable();
    table.string('actioned_user_type', 50).nullable();
    table.string('actioned_by', 50).nullable();
    table.date('actioned_on').nullable();
    table.timestamp('actioned_at').nullable();
    
    // Audit Trail
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.date('created_on').nullable();
    table.string('created_by', 50).defaultTo('SYSTEM');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.date('updated_on').nullable();
    table.string('updated_by', 50).defaultTo('SYSTEM');
    table.string('status_audit', 10).defaultTo('ACTIVE');
    
    // Indexes
    table.index(['indent_id'], 'idx_vehicle_driver_replacement_indent_id');
    table.index(['vehicle_assignment_id'], 'idx_vehicle_driver_replacement_assignment_id');
    table.index(['replacement_type'], 'idx_vehicle_driver_replacement_type');
    table.index(['status'], 'idx_vehicle_driver_replacement_status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('vehicle_driver_replacement_request');
};