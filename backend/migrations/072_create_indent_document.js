exports.up = function(knex) {
  return knex.schema.createTable('indent_document', function(table) {
    // Primary Key
    table.string('indent_doc_id', 10).primary();
    
    // Foreign Keys
    table.string('indent_id', 10).notNullable();
    table.string('drop_location_id', 10).nullable();
    table.string('vehicle_assignment_id', 10).nullable();
    table.string('document_id', 10).notNullable();
    
    // Document Details
    table.string('document_type', 50).nullable();
    table.string('reference_id', 20).nullable();
    table.date('valid_from').nullable();
    table.date('valid_to').nullable();
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
    table.index(['indent_id'], 'idx_indent_document_indent_id');
    table.index(['document_id'], 'idx_indent_document_document_id');
    table.index(['document_type'], 'idx_indent_document_type');
    table.index(['is_active'], 'idx_indent_document_is_active');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('indent_document');
};