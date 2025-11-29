exports.up = function(knex) {
  return knex.schema.createTable('currency_master', function(table) {
    // Primary key
    table.string('currency_id', 10).primary().notNullable().comment('Primary key for currency');
    
    // Currency information
    table.string('currency', 30).notNullable().comment('Currency name or code');
    
    // Audit fields - Date fields (no default value - application must provide)
    table.date('created_at').notNullable().comment('Creation date');
    table.time('created_on').notNullable().comment('Creation time');
    
    // Audit fields - User tracking
    table.string('created_by', 10).notNullable().comment('User who created the record');
    
    // Audit fields - Update tracking (no default value - application must provide)
    table.date('updated_at').notNullable().comment('Last update date');
    table.time('updated_on').notNullable().comment('Last update time');
    table.string('updated_by', 10).notNullable().comment('User who last updated the record');
    
    // Status field
    table.string('status', 10).nullable().defaultTo('ACTIVE').comment('Record status');
    
    // Indexes for better query performance
    table.index('status', 'currency_master_status_index');
    table.index('created_at', 'currency_master_created_at_index');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('currency_master');
};
