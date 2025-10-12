exports.up = function(knex) {
  return knex.schema.createTable('vehicle_tracking_data_archival', function(table) {
    // Primary Key
    table.string('archival_tracking_id', 10).primary();
    
    // Foreign Keys
    table.string('tracking_id', 10).notNullable();
    table.string('vehicle_assignment_id', 10).nullable();
    table.string('vehicle_id', 10).nullable();
    table.string('indent_id', 10).nullable();
    
    // Archive Details
    table.date('archive_date').nullable();
    table.string('archive_reason', 100).nullable();
    
    // Original Tracking Data (JSON or serialized format)
    table.json('tracking_data_json').nullable();
    
    // Key Fields for Quick Access
    table.string('imei_number', 20).nullable();
    table.string('ignition', 10).nullable();
    table.decimal('vehicle_speed', 5, 2).nullable();
    table.string('object_class', 50).nullable();
    table.string('unit_id', 20).nullable();
    table.string('measurement_unit', 50).nullable();
    table.bigInteger('timestamp_utc').nullable();
    table.boolean('position_validity_flag').nullable();
    table.integer('location_source').nullable();
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 10, 8).nullable();
    
    // Audit Trail
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.date('created_on').nullable();
    table.string('created_by', 50).defaultTo('SYSTEM');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.date('updated_on').nullable();
    table.string('updated_by', 50).defaultTo('SYSTEM');
    table.string('status', 10).defaultTo('ACTIVE');
    
    // Indexes
    table.index(['tracking_id'], 'idx_vehicle_tracking_archival_tracking_id');
    table.index(['vehicle_id'], 'idx_vehicle_tracking_archival_vehicle_id');
    table.index(['archive_date'], 'idx_vehicle_tracking_archival_date');
    table.index(['imei_number'], 'idx_vehicle_tracking_archival_imei');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('vehicle_tracking_data_archival');
};