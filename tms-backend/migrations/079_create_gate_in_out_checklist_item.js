exports.up = function(knex) {
  return knex.schema.createTable('gate_in_out_checklist_item', function(table) {
    // Primary Key
    table.string('checklist_item_id', 10).primary();
    
    // Foreign Keys
    table.string('checklist_id', 10).notNullable();
    table.string('checklist_item_config_id', 10).notNullable();
    
    // Item Details
    table.string('status', 50).defaultTo('PENDING');
    
    // Audit Trail
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.date('created_on').nullable();
    table.string('created_by', 50).defaultTo('SYSTEM');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.date('updated_on').nullable();
    table.string('updated_by', 50).defaultTo('SYSTEM');
    table.string('status_audit', 10).defaultTo('ACTIVE');
    
    // Indexes
    table.index(['checklist_id'], 'idx_gate_in_out_checklist_item_checklist_id');
    table.index(['checklist_item_config_id'], 'idx_gate_in_out_checklist_item_config_id');
    table.index(['status'], 'idx_gate_in_out_checklist_item_status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('gate_in_out_checklist_item');
};