exports.up = function(knex) {
  return knex.schema.createTable('gate_in_out_authentication', function(table) {
    // Primary Key
    table.string('gate_in_out_auth_id', 10).primary();
    
    // Foreign Keys
    table.string('vehicle_assignment_id', 10).notNullable();
    
    // Authentication Details
    table.string('otp_status', 20).defaultTo('PENDING');
    table.timestamp('otp_generated_on').nullable();
    table.string('signature_doc_id', 10).nullable();
    table.string('supervisor_id', 10).nullable();
    
    // Audit Trail
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.date('created_on').nullable();
    table.string('created_by', 50).defaultTo('SYSTEM');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.date('updated_on').nullable();
    table.string('updated_by', 50).defaultTo('SYSTEM');
    table.string('status', 10).defaultTo('ACTIVE');
    
    // Indexes
    table.index(['vehicle_assignment_id'], 'idx_gate_in_out_auth_assignment_id');
    table.index(['otp_status'], 'idx_gate_in_out_auth_otp_status');
    table.index(['supervisor_id'], 'idx_gate_in_out_auth_supervisor_id');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('gate_in_out_authentication');
};