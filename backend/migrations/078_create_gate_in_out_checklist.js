exports.up = function(knex) {
  return knex.schema.createTable('gate_in_out_checklist', function(table) {
    // Primary Key
    table.string('checklist_id', 10).primary();
    
    // Foreign Keys
    table.string('checklist_config_id', 10).notNullable();
    table.string('indent_id', 10).notNullable();
    table.string('vehicle_assignment_id', 10).notNullable();
    
    // Checklist Details
    table.string('checking_point', 100).nullable();
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
    table.index(['checklist_config_id'], 'idx_gate_in_out_checklist_config_id');
    table.index(['indent_id'], 'idx_gate_in_out_checklist_indent_id');
    table.index(['vehicle_assignment_id'], 'idx_gate_in_out_checklist_assignment_id');
    table.index(['status'], 'idx_gate_in_out_checklist_status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('gate_in_out_checklist');
};