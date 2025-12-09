exports.up = function(knex) {
  return knex.schema.createTable('indent_transporter_assignment', function(table) {
    // Primary Key
    table.string('assignment_id', 10).primary();
    
    // Foreign Keys
    table.string('indent_id', 10).notNullable();
    table.string('transporter_id', 10).notNullable();
    
    // Assignment Details
    table.string('status', 50).defaultTo('PENDING');
    table.string('rejection_reason', 200).nullable();
    table.text('remark').nullable();
    table.string('assignment_cycle', 50).nullable();
    table.string('contract_id', 20).nullable();
    
    // Audit Trail
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.date('created_on').nullable();
    table.string('created_by', 50).defaultTo('SYSTEM');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.date('updated_on').nullable();
    table.string('updated_by', 50).defaultTo('SYSTEM');
    table.string('status_audit', 10).defaultTo('ACTIVE');
    
    // Indexes
    table.index(['indent_id'], 'idx_indent_transporter_assignment_indent_id');
    table.index(['transporter_id'], 'idx_indent_transporter_assignment_transporter_id');
    table.index(['status'], 'idx_indent_transporter_assignment_status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('indent_transporter_assignment');
};