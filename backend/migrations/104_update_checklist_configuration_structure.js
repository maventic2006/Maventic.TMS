exports.up = async function(knex) {
  // Step 1: Rename existing table to backup
  await knex.schema.renameTable('checklist_configuration', 'checklist_configuration_backup');
  
  // Step 2: Create new table with correct structure
  await knex.schema.createTable('checklist_configuration', function(table) {
    // Primary Key
    table.string('checklist_config_id', 10).primary();
    
    // Configuration Details - Updated to match specification
    table.string('consignor_id', 10).notNullable().unique();
    table.string('warehouse_id', 10).notNullable().unique();
    table.string('checking_point', 10).notNullable().unique();
    table.string('status_id', 10).notNullable();
    table.date('valid_from').notNullable();
    table.date('valid_to').notNullable();
    
    // Audit Trail - Updated to match specification
    table.date('created_at').notNullable();
    table.time('created_on').notNullable();
    table.string('created_by', 10).notNullable();
    table.date('updated_at').notNullable();
    table.time('updated_on').notNullable();
    table.string('updated_by', 10).notNullable();
    table.string('status', 10).nullable();
    
    // Indexes
    table.index(['consignor_id'], 'idx_checklist_configuration_consignor_id');
    table.index(['warehouse_id'], 'idx_checklist_configuration_warehouse_id');
    table.index(['checking_point'], 'idx_checklist_configuration_checking_point');
    table.index(['status_id'], 'idx_checklist_configuration_status_id');
  });
  
  // Step 3: Copy data from backup table (with data type conversions)
  await knex.raw(`
    INSERT INTO checklist_configuration (
      checklist_config_id, consignor_id, warehouse_id, checking_point, status_id,
      valid_from, valid_to, created_at, created_on, created_by, 
      updated_at, updated_on, updated_by, status
    )
    SELECT 
      checklist_config_id, consignor_id, warehouse_id, 
      LEFT(checking_point, 10) as checking_point,
      COALESCE(checklist_fail_action_id, 'CFA001') as status_id,
      COALESCE(valid_from, CURDATE()) as valid_from,
      COALESCE(valid_to, DATE_ADD(CURDATE(), INTERVAL 1 YEAR)) as valid_to,
      DATE(created_at) as created_at,
      TIME(created_at) as created_on,
      LEFT(created_by, 10) as created_by,
      DATE(updated_at) as updated_at,
      TIME(updated_at) as updated_on,
      LEFT(updated_by, 10) as updated_by,
      LEFT(status, 10) as status
    FROM checklist_configuration_backup
  `);
  
  // Step 4: Drop backup table
  await knex.schema.dropTable('checklist_configuration_backup');
};

exports.down = async function(knex) {
  // Step 1: Rename current table to backup
  await knex.schema.renameTable('checklist_configuration', 'checklist_configuration_new');
  
  // Step 2: Recreate original table structure
  await knex.schema.createTable('checklist_configuration', function(table) {
    // Primary Key
    table.string('checklist_config_id', 10).primary();
    
    // Configuration Details - Original structure
    table.string('consignor_id', 10).notNullable();
    table.string('warehouse_id', 10).notNullable();
    table.string('checking_point', 100).notNullable();
    table.string('checklist_fail_action_id', 10).nullable();
    table.string('status', 50).defaultTo('ACTIVE');
    table.date('valid_from').nullable();
    table.date('valid_to').nullable();
    
    // Audit Trail - Original structure
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
  
  // Step 3: Copy data back (with reverse conversions)
  await knex.raw(`
    INSERT INTO checklist_configuration (
      checklist_config_id, consignor_id, warehouse_id, checking_point, 
      checklist_fail_action_id, valid_from, valid_to, created_at, created_on, 
      created_by, updated_at, updated_on, updated_by, status, status_audit
    )
    SELECT 
      checklist_config_id, consignor_id, warehouse_id, checking_point,
      status_id as checklist_fail_action_id, valid_from, valid_to,
      TIMESTAMP(created_at, created_on) as created_at, created_at as created_on,
      created_by, TIMESTAMP(updated_at, updated_on) as updated_at, updated_at as updated_on,
      updated_by, status, 'ACTIVE' as status_audit
    FROM checklist_configuration_new
  `);
  
  // Step 4: Drop new table
  await knex.schema.dropTable('checklist_configuration_new');
};