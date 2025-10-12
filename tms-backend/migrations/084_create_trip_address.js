exports.up = function(knex) {
  return knex.schema.createTable('trip_address', function(table) {
    // Primary Key
    table.string('trip_address_id', 10).primary();
    
    // Foreign Keys
    table.string('trip_id', 10).notNullable();
    
    // Address Details
    table.decimal('drop_latitude', 10, 8).nullable();
    table.decimal('drop_longitude', 10, 8).nullable();
    table.string('drop_address_id', 10).nullable();
    table.string('contact_person_name', 100).nullable();
    table.string('contact_person_mobile', 15).nullable();
    table.string('alternate_mobile', 15).nullable();
    table.string('email_id', 100).nullable();
    
    // Trip Address Configuration
    table.string('goods_loading_point_id', 10).nullable();
    table.decimal('expected_transit_time', 5, 2).nullable();
    table.decimal('erp_transit_distance', 8, 2).nullable();
    table.decimal('distance_to_be_covered', 8, 2).nullable();
    table.boolean('is_round_trip').defaultTo(false);
    table.timestamp('trip_start_date_time').nullable();
    table.string('lr_number', 30).nullable();
    table.decimal('freight_rate', 8, 2).nullable();
    table.string('freight_rate_unit', 20).nullable();
    table.decimal('freight_value', 10, 2).nullable();
    table.string('freight_value_currency', 10).defaultTo('INR');
    table.string('container_number', 30).nullable();
    table.decimal('gross_weight', 10, 3).nullable();
    table.string('indent_id', 10).nullable();
    table.string('reference_master_trip_id', 10).nullable();
    table.integer('priority_order_identifier').nullable();
    table.string('yard_entry_number', 20).nullable();
    table.timestamp('gate_in_timestamp').nullable();
    table.timestamp('gate_out_timestamp').nullable();
    
    // Drop Warehouse Details
    table.string('drop_warehouse_id', 10).nullable();
    table.string('warehouse_gate_sub_type_id', 10).nullable();
    table.string('goods_unloading_point_id', 10).nullable();
    table.decimal('unloading_point_latitude', 10, 8).nullable();
    table.decimal('unloading_point_longitude', 10, 8).nullable();
    
    // Audit Trail
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.date('created_on').nullable();
    table.string('created_by', 50).defaultTo('SYSTEM');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.date('updated_on').nullable();
    table.string('updated_by', 50).defaultTo('SYSTEM');
    table.string('status', 10).defaultTo('ACTIVE');
    
    // Indexes
    table.index(['trip_id'], 'idx_trip_address_trip_id');
    table.index(['indent_id'], 'idx_trip_address_indent_id');
    table.index(['drop_warehouse_id'], 'idx_trip_address_drop_warehouse_id');
    table.index(['lr_number'], 'idx_trip_address_lr_number');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('trip_address');
};