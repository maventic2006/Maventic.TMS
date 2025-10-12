exports.up = function(knex) {
  return knex.schema.createTable('conversation_thread', function(table) {
    // Primary Key
    table.string('thread_id', 10).primary();
    
    // Foreign Keys
    table.string('indent_id', 10).notNullable();
    
    // Conversation Details
    table.string('serial_no', 10).nullable();
    table.string('user_id', 10).nullable();
    table.text('message_text').nullable();
    table.string('attachment_document_id', 10).nullable();
    
    // Audit Trail
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.date('created_on').nullable();
    table.string('created_by', 50).defaultTo('SYSTEM');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.date('updated_on').nullable();
    table.string('updated_by', 50).defaultTo('SYSTEM');
    table.string('status', 10).defaultTo('ACTIVE');
    
    // Indexes
    table.index(['indent_id'], 'idx_conversation_thread_indent_id');
    table.index(['user_id'], 'idx_conversation_thread_user_id');
    table.index(['created_at'], 'idx_conversation_thread_created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('conversation_thread');
};