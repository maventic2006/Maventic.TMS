exports.up = function(knex) {
  return knex.schema.createTable('vehicle_imei_mapping', function(table) {
    // Primary Key
    table.string('vehicle_imei_mapping_id', 10).primary();
    
    // Foreign Keys
    table.string('vehicle_id', 10).notNullable();
    
    // IMEI Details
    table.string('imei_number', 20).notNullable();
    table.string('unit_id', 20).nullable();
    
    // Mapping Status
    table.boolean('is_active').defaultTo(true);
    table.date('mapping_start_date').nullable();
    table.date('mapping_end_date').nullable();
    
    // Device Information
    table.string('device_model', 50).nullable();
    table.string('device_vendor', 50).nullable();
    table.string('sim_number', 20).nullable();
    
    // Audit Trail
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.date('created_on').nullable();
    table.string('created_by', 50).defaultTo('SYSTEM');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.date('updated_on').nullable();
    table.string('updated_by', 50).defaultTo('SYSTEM');
    table.string('status', 10).defaultTo('ACTIVE');
    
    // Indexes
    table.index(['vehicle_id'], 'idx_vehicle_imei_mapping_vehicle_id');
    table.index(['imei_number'], 'idx_vehicle_imei_mapping_imei_number');
    table.index(['unit_id'], 'idx_vehicle_imei_mapping_unit_id');
    table.index(['is_active'], 'idx_vehicle_imei_mapping_is_active');
    
    // Unique constraint for active IMEI
    table.unique(['imei_number', 'is_active'], 'uk_vehicle_imei_mapping_active_imei');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('vehicle_imei_mapping');
};