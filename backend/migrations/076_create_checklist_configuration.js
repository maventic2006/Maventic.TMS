exports.up = function(knex) {
  return knex.schema.createTable('checklist_configuration', function(table) {
    // Primary Key
    table.string('checklist_config_id', 10).primary();
    
    // Configuration Details
    table.string('consignor_id', 10).notNullable();
    table.string('warehouse_id', 10).notNullable();
    table.string('checking_point', 100).notNullable();
    table.string('checklist_fail_action', 100).nullable();
    table.string('status', 50).defaultTo('ACTIVE');
    table.date('valid_from').nullable();
    table.date('valid_to').nullable();
    
    // Audit Trail
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.date('created_on').nullable();
    table.string('created_by', 50).defaultTo('SYSTEM');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.date('updated_on').nullable();
    table.string('updated_by', 50).defaultTo('SYSTEM');
    table.string('status_audit', 10).defaultTo('ACTIVE');
    
    // Indexes
    table.index(['consignor_id'], 'idx_checklist_configuration_consignor_id');
    table.index(['warehouse_id'], 'idx_checklist_configuration_warehouse_id');
    table.index(['checking_point'], 'idx_checklist_configuration_checking_point');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('checklist_configuration');
};