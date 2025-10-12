exports.up = function(knex) {
  return knex.schema.createTable('checklist_item_configuration', function(table) {
    // Primary Key
    table.string('checklist_item_config_id', 10).primary();
    
    // Foreign Key
    table.string('checklist_config_id', 10).notNullable();
    
    // Item Configuration Details
    table.string('checklist_item', 200).notNullable();
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
    table.index(['checklist_config_id'], 'idx_checklist_item_configuration_config_id');
    table.index(['checklist_item'], 'idx_checklist_item_configuration_item');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('checklist_item_configuration');
};