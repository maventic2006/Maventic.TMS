exports.up = function(knex) {
  return knex.schema.createTable('checklist_item_master', function(table) {
    // Primary Key
    table.string('checklist_item_id', 10).primary();
    
    // Main Fields
    table.string('checklist_item', 30).notNullable();
    
    // Audit Trail
    table.date('created_at').nullable();
    table.time('created_on').nullable();
    table.string('created_by', 10).nullable();
    table.date('updated_at').nullable();
    table.time('updated_on').nullable();
    table.string('updated_by', 10).nullable();
    table.string('status', 10).nullable();
    
    // Indexes
    table.index(['checklist_item'], 'idx_checklist_item_master_item');
    table.index(['status'], 'idx_checklist_item_master_status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('checklist_item_master');
};