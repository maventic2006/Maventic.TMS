exports.up = function(knex) {
  return knex.schema.createTable('indent_trip_status_master', function(table) {
    // Primary Key
    table.string('trip_status_id', 10).primary();
    
    // Status Details
    table.string('purpose', 100).notNullable();
    table.string('key', 50).notNullable();
    table.text('description').nullable();
    table.boolean('is_active').defaultTo(true);
    
    // Audit Trail
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.date('created_on').nullable();
    table.string('created_by', 50).defaultTo('SYSTEM');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.date('updated_on').nullable();
    table.string('updated_by', 50).defaultTo('SYSTEM');
    table.string('status', 10).defaultTo('ACTIVE');
    
    // Indexes
    table.index(['purpose'], 'idx_indent_trip_status_master_purpose');
    table.index(['key'], 'idx_indent_trip_status_master_key');
    table.index(['is_active'], 'idx_indent_trip_status_master_is_active');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('indent_trip_status_master');
};