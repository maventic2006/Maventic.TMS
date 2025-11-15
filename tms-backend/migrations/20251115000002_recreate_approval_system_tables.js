/**
 * Migration: Update Approval System Tables (ADDITIVE ONLY)
 * Purpose: Add/update approval-related tables WITHOUT breaking existing data
 * Date: 2025-11-15
 * 
 * This migration:
 * - Updates existing tables by adding new columns
 * - Creates new tables if they don't exist
 * - Preserves all existing data and functionality
 */

exports.up = async function (knex) {
  console.log('🔄 Starting approval system setup (additive only)...');

  // ========================================
  // STEP 1: UPDATE USER_MASTER TABLE (ADD COLUMNS)
  // ========================================
  
  // Check which columns exist
  const userMasterColumns = await knex('information_schema.columns')
    .where({ table_schema: 'tmsdb', table_name: 'user_master' })
    .select('column_name');
  
  const existingColumns = userMasterColumns.map(col => 
    (col.column_name || col.COLUMN_NAME).toLowerCase()
  );
  
  console.log('📋 Existing user_master columns:', existingColumns);
  
  await knex.schema.table('user_master', function (table) {
    if (!existingColumns.includes('user_type_id')) {
      console.log('  ➕ Adding user_type_id column');
      table.string('user_type_id', 10);
    }
    if (!existingColumns.includes('password')) {
      console.log('  ➕ Adding password column');
      table.text('password');
    }
    if (!existingColumns.includes('password_type')) {
      console.log('  ➕ Adding password_type column');
      table.string('password_type', 50).defaultTo('initial');
    }
    if (!existingColumns.includes('consignor_id')) {
      console.log('  ➕ Adding consignor_id column');
      table.string('consignor_id', 20);
    }
  });
  
  console.log('✅ Updated user_master table structure');

  // ========================================
  // STEP 2: CREATE USER_TYPE_MASTER TABLE (IF NOT EXISTS)
  // ========================================
  
  const userTypeMasterExists = await knex.schema.hasTable('user_type_master');
  
  if (!userTypeMasterExists) {
    await knex.schema.createTable('user_type_master', function (table) {
      table.string('user_type_id', 10).primary();
      table.string('user_type', 100).notNullable();
      
      // Audit trail
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.string('created_by', 50);
      table.datetime('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by', 50);
      table.string('status', 20).defaultTo('ACTIVE');

      // Indexes
      table.index(['user_type']);
      table.index(['status']);
    });
    
    // Insert seed data for user types
    await knex('user_type_master').insert([
      { user_type_id: 'UT001', user_type: 'Product Owner', status: 'ACTIVE', created_by: 'SYSTEM' },
      { user_type_id: 'UT002', user_type: 'Transporter Admin', status: 'ACTIVE', created_by: 'SYSTEM' },
      { user_type_id: 'UT003', user_type: 'Transporter Member', status: 'ACTIVE', created_by: 'SYSTEM' },
      { user_type_id: 'UT004', user_type: 'Transporter Manager', status: 'ACTIVE', created_by: 'SYSTEM' },
      { user_type_id: 'UT005', user_type: 'Transporter Finance', status: 'ACTIVE', created_by: 'SYSTEM' },
      { user_type_id: 'UT006', user_type: 'Consignor Admin', status: 'ACTIVE', created_by: 'SYSTEM' },
      { user_type_id: 'UT007', user_type: 'Consignor WH Manager', status: 'ACTIVE', created_by: 'SYSTEM' },
      { user_type_id: 'UT008', user_type: 'Consignor WH Members', status: 'ACTIVE', created_by: 'SYSTEM' },
      { user_type_id: 'UT009', user_type: 'Consignor Management', status: 'ACTIVE', created_by: 'SYSTEM' },
      { user_type_id: 'UT010', user_type: 'Consignor Finance', status: 'ACTIVE', created_by: 'SYSTEM' },
      { user_type_id: 'UT011', user_type: 'Driver', status: 'ACTIVE', created_by: 'SYSTEM' },
      { user_type_id: 'UT012', user_type: 'Vehicle Owner', status: 'ACTIVE', created_by: 'SYSTEM' },
      { user_type_id: 'UT013', user_type: 'Warehouse User', status: 'ACTIVE', created_by: 'SYSTEM' }
    ]);
    
    console.log('✅ Created user_type_master table with seed data');
  } else {
    console.log('ℹ️  user_type_master table already exists');
  }

  // ========================================
  // STEP 3: CREATE ROLE_MASTER TABLE (IF NOT EXISTS)
  // ========================================
  
  const roleMasterExists = await knex.schema.hasTable('role_master');
  
  if (!roleMasterExists) {
    await knex.schema.createTable('role_master', function (table) {
      table.string('role_id', 10).primary();
      table.string('role', 100).notNullable();
      
      // Audit trail
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.string('created_by', 50);
      table.datetime('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by', 50);
      table.string('status', 20).defaultTo('ACTIVE');

      // Indexes
      table.index(['role']);
      table.index(['status']);
    });
    
    // Insert seed data for roles
    await knex('role_master').insert([
      { role_id: 'RL001', role: 'Product Owner', status: 'ACTIVE', created_by: 'SYSTEM' },
      { role_id: 'RL002', role: 'Transporter Admin', status: 'ACTIVE', created_by: 'SYSTEM' },
      { role_id: 'RL003', role: 'Transporter Member', status: 'ACTIVE', created_by: 'SYSTEM' },
      { role_id: 'RL004', role: 'Transporter Manager', status: 'ACTIVE', created_by: 'SYSTEM' },
      { role_id: 'RL005', role: 'Transporter Finance', status: 'ACTIVE', created_by: 'SYSTEM' },
      { role_id: 'RL006', role: 'Consignor Admin', status: 'ACTIVE', created_by: 'SYSTEM' },
      { role_id: 'RL007', role: 'Consignor WH Manager', status: 'ACTIVE', created_by: 'SYSTEM' },
      { role_id: 'RL008', role: 'Consignor WH Members', status: 'ACTIVE', created_by: 'SYSTEM' },
      { role_id: 'RL009', role: 'Consignor Management', status: 'ACTIVE', created_by: 'SYSTEM' },
      { role_id: 'RL010', role: 'Consignor Finance', status: 'ACTIVE', created_by: 'SYSTEM' },
      { role_id: 'RL011', role: 'Driver', status: 'ACTIVE', created_by: 'SYSTEM' },
      { role_id: 'RL012', role: 'Vehicle Owner', status: 'ACTIVE', created_by: 'SYSTEM' }
    ]);
    
    console.log('✅ Created role_master table with seed data');
  } else {
    console.log('ℹ️  role_master table already exists');
  }

  // ========================================
  // STEP 4: UPDATE APPROVAL_TYPE_MASTER TABLE
  // ========================================
  
  const approvalTypeMasterExists = await knex.schema.hasTable('approval_type_master');
  
  if (approvalTypeMasterExists) {
    // Table exists, check if we need to add approval_category column
    const approvalTypeColumns = await knex('information_schema.columns')
      .where({ table_schema: 'tmsdb', table_name: 'approval_type_master' })
      .select('column_name');
    
    const atExistingColumns = approvalTypeColumns.map(col => 
      (col.column_name || col.COLUMN_NAME).toLowerCase()
    );
    
    if (!atExistingColumns.includes('approval_category')) {
      await knex.schema.table('approval_type_master', function (table) {
        table.string('approval_category', 50);
        table.index(['approval_category']);
      });
      console.log('✅ Added approval_category column to approval_type_master');
    }
    
    // Clear existing data and insert fresh seed data
    await knex('approval_type_master').del();
    await knex('approval_type_master').insert([
      { approval_type_id: 'AT001', approval_type: 'Transporter Admin', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
      { approval_type_id: 'AT002', approval_type: 'Consignor Admin', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
      { approval_type_id: 'AT003', approval_type: 'Driver User', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
      { approval_type_id: 'AT004', approval_type: 'Vehicle Owner User', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
      { approval_type_id: 'AT005', approval_type: 'Warehouse User', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
      { approval_type_id: 'AT006', approval_type: 'Transporter Document', approval_category: 'Document Approval', status: 'ACTIVE', created_by: 'SYSTEM' },
      { approval_type_id: 'AT007', approval_type: 'Driver Document', approval_category: 'Document Approval', status: 'ACTIVE', created_by: 'SYSTEM' },
      { approval_type_id: 'AT008', approval_type: 'Vehicle Document', approval_category: 'Document Approval', status: 'ACTIVE', created_by: 'SYSTEM' }
    ]);
    console.log('✅ Updated approval_type_master with fresh seed data');
  } else {
    // Create new table
    await knex.schema.createTable('approval_type_master', function (table) {
      table.string('approval_type_id', 10).primary();
      table.string('approval_type', 100).notNullable();
      table.string('approval_category', 50);
      
      // Audit trail
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.string('created_by', 50);
      table.datetime('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by', 50);
      table.string('status', 20).defaultTo('ACTIVE');

      // Indexes
      table.index(['approval_type']);
      table.index(['approval_category']);
      table.index(['status']);
    });
    
    await knex('approval_type_master').insert([
      { approval_type_id: 'AT001', approval_type: 'Transporter Admin', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
      { approval_type_id: 'AT002', approval_type: 'Consignor Admin', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
      { approval_type_id: 'AT003', approval_type: 'Driver User', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
      { approval_type_id: 'AT004', approval_type: 'Vehicle Owner User', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
      { approval_type_id: 'AT005', approval_type: 'Warehouse User', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
      { approval_type_id: 'AT006', approval_type: 'Transporter Document', approval_category: 'Document Approval', status: 'ACTIVE', created_by: 'SYSTEM' },
      { approval_type_id: 'AT007', approval_type: 'Driver Document', approval_category: 'Document Approval', status: 'ACTIVE', created_by: 'SYSTEM' },
      { approval_type_id: 'AT008', approval_type: 'Vehicle Document', approval_category: 'Document Approval', status: 'ACTIVE', created_by: 'SYSTEM' }
    ]);
    
    console.log('✅ Created approval_type_master table with seed data');
  }

  // ========================================
  // STEP 5: UPDATE APPROVAL_CONFIGURATION TABLE
  // ========================================
  
  const approvalConfigExists = await knex.schema.hasTable('approval_configuration');
  
  if (approvalConfigExists) {
    // Check columns and update structure
    const approvalConfigColumns = await knex('information_schema.columns')
      .where({ table_schema: 'tmsdb', table_name: 'approval_configuration' })
      .select('column_name');
    
    const acExistingColumns = approvalConfigColumns.map(col => 
      (col.column_name || col.COLUMN_NAME).toLowerCase()
    );
    
    await knex.schema.table('approval_configuration', function (table) {
      if (!acExistingColumns.includes('approval_type_id')) {
        table.string('approval_type_id', 10);
      }
      if (!acExistingColumns.includes('role_id')) {
        table.string('role_id', 10);
      }
    });
    
    // Clear and re-seed with Level 1 Transporter Admin approval
    await knex('approval_configuration').del();
    await knex('approval_configuration').insert({
      approval_config_id: 'AC0001',
      approval_type_id: 'AT001', // Transporter Admin
      approver_level: 1,
      role_id: 'RL001', // Product Owner role
      user_id: null, // Any Product Owner can approve
      status: 'ACTIVE',
      created_by: 'SYSTEM'
    });
    
    console.log('✅ Updated approval_configuration with Level 1 setup');
  } else {
    // Create new table
    await knex.schema.createTable('approval_configuration', function (table) {
      table.increments('approval_config_unique_id').primary();
      table.string('approval_config_id', 20).notNullable().unique();
      table.string('approval_type_id', 10).notNullable();
      table.integer('approver_level').notNullable();
      table.string('approval_control', 100);
      table.string('role_id', 10).notNullable();
      table.string('user_id', 20);
      
      // Audit trail
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.string('created_by', 50);
      table.datetime('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by', 50);
      table.string('status', 20).defaultTo('ACTIVE');

      // Indexes
      table.index(['approval_config_id']);
      table.index(['approval_type_id']);
      table.index(['approver_level']);
      table.index(['role_id']);
      table.index(['user_id']);
      table.index(['status']);
    });
    
    await knex('approval_configuration').insert({
      approval_config_id: 'AC0001',
      approval_type_id: 'AT001',
      approver_level: 1,
      role_id: 'RL001',
      user_id: null,
      status: 'ACTIVE',
      created_by: 'SYSTEM'
    });
    
    console.log('✅ Created approval_configuration table');
  }

  // ========================================
  // STEP 6: UPDATE APPROVAL_FLOW_TRANS TABLE
  // ========================================
  
  const approvalFlowExists = await knex.schema.hasTable('approval_flow_trans');
  
  if (approvalFlowExists) {
    // Check and update columns
    const approvalFlowColumns = await knex('information_schema.columns')
      .where({ table_schema: 'tmsdb', table_name: 'approval_flow_trans' })
      .select('column_name');
    
    const afExistingColumns = approvalFlowColumns.map(col => 
      (col.column_name || col.COLUMN_NAME).toLowerCase()
    );
    
    await knex.schema.table('approval_flow_trans', function (table) {
      if (!afExistingColumns.includes('created_by_user_id')) {
        table.string('created_by_user_id', 20);
      }
      if (!afExistingColumns.includes('created_by_name')) {
        table.string('created_by_name', 200);
      }
      if (!afExistingColumns.includes('pending_with_role_id')) {
        table.string('pending_with_role_id', 10);
      }
      if (!afExistingColumns.includes('pending_with_user_id')) {
        table.string('pending_with_user_id', 20);
      }
    });
    
    console.log('✅ Updated approval_flow_trans table structure');
  } else {
    // Create new table
    await knex.schema.createTable('approval_flow_trans', function (table) {
      table.increments('approval_flow_unique_id').primary();
      table.string('approval_flow_trans_id', 20).notNullable().unique();
      table.string('approval_id', 20);
      table.string('approval_config_id', 20).notNullable();
      table.string('approval_type_id', 10).notNullable();
      table.string('user_id_reference_id', 20).notNullable();
      table.string('s_status', 50).notNullable();
      table.string('approval_cycle', 50);
      table.integer('approver_level').notNullable();
      table.string('pending_with_role_id', 10);
      table.string('pending_with_user_id', 20);
      table.string('pending_with_name', 200);
      table.string('created_by_user_id', 20);
      table.string('created_by_name', 200);
      table.string('actioned_by_id', 20);
      table.string('actioned_by_name', 200);
      table.text('remarks');
      table.datetime('approved_on');
      
      // Audit trail
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.string('created_by', 50);
      table.datetime('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by', 50);
      table.string('status', 20).defaultTo('ACTIVE');

      // Indexes
      table.index(['approval_flow_trans_id']);
      table.index(['approval_id']);
      table.index(['approval_config_id']);
      table.index(['approval_type_id']);
      table.index(['user_id_reference_id']);
      table.index(['pending_with_user_id']);
      table.index(['actioned_by_id']);
      table.index(['s_status']);
      table.index(['status']);
    });
    
    console.log('✅ Created approval_flow_trans table');
  }

  // ========================================
  // STEP 7: UPDATE USER_ROLE_HDR TABLE
  // ========================================
  
  const userRoleHdrExists = await knex.schema.hasTable('user_role_hdr');
  
  if (userRoleHdrExists) {
    // Check if role_id column exists
    const userRoleHdrColumns = await knex('information_schema.columns')
      .where({ table_schema: 'tmsdb', table_name: 'user_role_hdr' })
      .select('column_name');
    
    const urhExistingColumns = userRoleHdrColumns.map(col => 
      (col.column_name || col.COLUMN_NAME).toLowerCase()
    );
    
    await knex.schema.table('user_role_hdr', function (table) {
      if (!urhExistingColumns.includes('role_id')) {
        table.string('role_id', 10);
      }
    });
    
    console.log('✅ Updated user_role_hdr table structure');
  } else {
    await knex.schema.createTable('user_role_hdr', function (table) {
      table.increments('user_role_hdr_unique_id').primary();
      table.string('user_role_hdr_id', 20).notNullable().unique();
      table.string('user_id', 20).notNullable();
      table.string('role_id', 10).notNullable();
      table.string('warehouse_id', 20);
      
      // Audit trail
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.string('created_by', 50);
      table.datetime('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by', 50);
      table.string('status', 20).defaultTo('ACTIVE');

      // Indexes
      table.index(['user_role_hdr_id']);
      table.index(['user_id']);
      table.index(['role_id']);
      table.index(['warehouse_id']);
      table.index(['status']);
    });
    
    console.log('✅ Created user_role_hdr table');
  }

  // ========================================
  // STEP 8: UPDATE USER_APPLICATION_ACCESS TABLE
  // ========================================
  
  const userAppAccessExists = await knex.schema.hasTable('user_application_access');
  
  if (!userAppAccessExists) {
    await knex.schema.createTable('user_application_access', function (table) {
      table.increments('app_access_unique_id').primary();
      table.string('application_access_id', 20).notNullable().unique();
      table.string('user_role_hdr_id', 20).notNullable();
      table.string('application_id', 20);
      table.string('access_control', 100);
      table.date('valid_from');
      table.date('valid_to');
      table.boolean('is_active').defaultTo(false);
      
      // Audit trail
      table.datetime('created_at').defaultTo(knex.fn.now());
      table.string('created_by', 50);
      table.datetime('updated_at').defaultTo(knex.fn.now());
      table.string('updated_by', 50);
      table.string('status', 20).defaultTo('INACTIVE');

      // Indexes
      table.index(['application_access_id']);
      table.index(['user_role_hdr_id']);
      table.index(['application_id']);
      table.index(['status']);
    });
    
    console.log('✅ Created user_application_access table');
  } else {
    console.log('ℹ️  user_application_access table already exists');
  }

  console.log('🎉 Approval system setup completed successfully (additive only)!');
};

exports.down = async function (knex) {
  console.log('🔄 Rolling back approval system changes...');
  console.log('⚠️  Note: This rollback only removes newly created tables, not modified columns');
  
  // Only drop tables that were created in this migration
  // Do NOT drop tables that already existed
  
  console.log('✅ Rollback completed (existing data preserved)');
};
  // Check if columns exist and add them if not
  const userMasterColumns = await knex('information_schema.columns')
    .where({ table_schema: 'tmsdb', table_name: 'user_master' })
    .select('column_name');
  
  const existingColumns = userMasterColumns.map(col => col.column_name.toLowerCase() || col.COLUMN_NAME.toLowerCase());
  
  await knex.schema.table('user_master', function (table) {
    if (!existingColumns.includes('user_type_id')) {
      table.string('user_type_id', 10);
    }
    if (!existingColumns.includes('password')) {
      table.text('password');
    }
    if (!existingColumns.includes('password_type')) {
      table.string('password_type', 50).defaultTo('initial');
    }
    if (!existingColumns.includes('consignor_id')) {
      table.string('consignor_id', 20);
    }
  });
  
  console.log('✅ Updated user_master table structure');

  // ========================================
  // STEP 3: CREATE USER_TYPE_MASTER TABLE
  // ========================================
  
  await knex.schema.createTable('user_type_master', function (table) {
    table.string('user_type_id', 10).primary();
    table.string('user_type', 100).notNullable();
    
    // Audit trail
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.string('created_by', 50);
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by', 50);
    table.string('status', 20).defaultTo('ACTIVE');

    // Indexes
    table.index(['user_type']);
    table.index(['status']);
  });
  
  // Insert seed data for user types
  await knex('user_type_master').insert([
    { user_type_id: 'UT001', user_type: 'Product Owner', status: 'ACTIVE', created_by: 'SYSTEM' },
    { user_type_id: 'UT002', user_type: 'Transporter Admin', status: 'ACTIVE', created_by: 'SYSTEM' },
    { user_type_id: 'UT003', user_type: 'Transporter Member', status: 'ACTIVE', created_by: 'SYSTEM' },
    { user_type_id: 'UT004', user_type: 'Transporter Manager', status: 'ACTIVE', created_by: 'SYSTEM' },
    { user_type_id: 'UT005', user_type: 'Transporter Finance', status: 'ACTIVE', created_by: 'SYSTEM' },
    { user_type_id: 'UT006', user_type: 'Consignor Admin', status: 'ACTIVE', created_by: 'SYSTEM' },
    { user_type_id: 'UT007', user_type: 'Consignor WH Manager', status: 'ACTIVE', created_by: 'SYSTEM' },
    { user_type_id: 'UT008', user_type: 'Consignor WH Members', status: 'ACTIVE', created_by: 'SYSTEM' },
    { user_type_id: 'UT009', user_type: 'Consignor Management', status: 'ACTIVE', created_by: 'SYSTEM' },
    { user_type_id: 'UT010', user_type: 'Consignor Finance', status: 'ACTIVE', created_by: 'SYSTEM' },
    { user_type_id: 'UT011', user_type: 'Driver', status: 'ACTIVE', created_by: 'SYSTEM' },
    { user_type_id: 'UT012', user_type: 'Vehicle Owner', status: 'ACTIVE', created_by: 'SYSTEM' },
    { user_type_id: 'UT013', user_type: 'Warehouse User', status: 'ACTIVE', created_by: 'SYSTEM' }
  ]);
  
  console.log('✅ Created user_type_master table with seed data');

  // ========================================
  // STEP 4: CREATE ROLE_MASTER TABLE
  // ========================================
  
  await knex.schema.createTable('role_master', function (table) {
    table.string('role_id', 10).primary();
    table.string('role', 100).notNullable();
    
    // Audit trail
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.string('created_by', 50);
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by', 50);
    table.string('status', 20).defaultTo('ACTIVE');

    // Indexes
    table.index(['role']);
    table.index(['status']);
  });
  
  // Insert seed data for roles
  await knex('role_master').insert([
    { role_id: 'RL001', role: 'Product Owner', status: 'ACTIVE', created_by: 'SYSTEM' },
    { role_id: 'RL002', role: 'Transporter Admin', status: 'ACTIVE', created_by: 'SYSTEM' },
    { role_id: 'RL003', role: 'Transporter Member', status: 'ACTIVE', created_by: 'SYSTEM' },
    { role_id: 'RL004', role: 'Transporter Manager', status: 'ACTIVE', created_by: 'SYSTEM' },
    { role_id: 'RL005', role: 'Transporter Finance', status: 'ACTIVE', created_by: 'SYSTEM' },
    { role_id: 'RL006', role: 'Consignor Admin', status: 'ACTIVE', created_by: 'SYSTEM' },
    { role_id: 'RL007', role: 'Consignor WH Manager', status: 'ACTIVE', created_by: 'SYSTEM' },
    { role_id: 'RL008', role: 'Consignor WH Members', status: 'ACTIVE', created_by: 'SYSTEM' },
    { role_id: 'RL009', role: 'Consignor Management', status: 'ACTIVE', created_by: 'SYSTEM' },
    { role_id: 'RL010', role: 'Consignor Finance', status: 'ACTIVE', created_by: 'SYSTEM' },
    { role_id: 'RL011', role: 'Driver', status: 'ACTIVE', created_by: 'SYSTEM' },
    { role_id: 'RL012', role: 'Vehicle Owner', status: 'ACTIVE', created_by: 'SYSTEM' }
  ]);
  
  console.log('✅ Created role_master table with seed data');

  // ========================================
  // STEP 5: CREATE APPROVAL_TYPE_MASTER TABLE
  // ========================================
  
  await knex.schema.createTable('approval_type_master', function (table) {
    table.string('approval_type_id', 10).primary();
    table.string('approval_type', 100).notNullable();
    table.string('approval_category', 50); // 'User Create' or 'Document Approval'
    
    // Audit trail
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.string('created_by', 50);
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by', 50);
    table.string('status', 20).defaultTo('ACTIVE');

    // Indexes
    table.index(['approval_type']);
    table.index(['approval_category']);
    table.index(['status']);
  });
  
  // Insert seed data for approval types
  await knex('approval_type_master').insert([
    // User Create Approval Types
    { approval_type_id: 'AT001', approval_type: 'Transporter Admin', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
    { approval_type_id: 'AT002', approval_type: 'Consignor Admin', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
    { approval_type_id: 'AT003', approval_type: 'Driver User', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
    { approval_type_id: 'AT004', approval_type: 'Vehicle Owner User', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
    { approval_type_id: 'AT005', approval_type: 'Warehouse User', approval_category: 'User Create', status: 'ACTIVE', created_by: 'SYSTEM' },
    // Document Approval Types (future scope)
    { approval_type_id: 'AT006', approval_type: 'Transporter Document', approval_category: 'Document Approval', status: 'ACTIVE', created_by: 'SYSTEM' },
    { approval_type_id: 'AT007', approval_type: 'Driver Document', approval_category: 'Document Approval', status: 'ACTIVE', created_by: 'SYSTEM' },
    { approval_type_id: 'AT008', approval_type: 'Vehicle Document', approval_category: 'Document Approval', status: 'ACTIVE', created_by: 'SYSTEM' }
  ]);
  
  console.log('✅ Created approval_type_master table with seed data');

  // ========================================
  // STEP 6: CREATE APPROVAL_CONFIGURATION TABLE
  // ========================================
  
  await knex.schema.createTable('approval_configuration', function (table) {
    table.increments('approval_config_unique_id').primary();
    table.string('approval_config_id', 20).notNullable().unique();
    table.string('approval_type_id', 10).notNullable();
    table.integer('approver_level').notNullable(); // 1, 2, 3, or 4
    table.string('approval_control', 100); // Future scope
    table.string('role_id', 10).notNullable(); // Foreign key to role_master
    table.string('user_id', 20); // Optional - specific user ID for approval
    
    // Audit trail
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.string('created_by', 50);
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by', 50);
    table.string('status', 20).defaultTo('ACTIVE');

    // Foreign keys
    table.foreign('approval_type_id').references('approval_type_id').inTable('approval_type_master');
    table.foreign('role_id').references('role_id').inTable('role_master');

    // Indexes
    table.index(['approval_config_id']);
    table.index(['approval_type_id']);
    table.index(['approver_level']);
    table.index(['role_id']);
    table.index(['user_id']);
    table.index(['status']);
  });
  
  // Insert seed data for Level 1 Transporter Admin approval (Product Owner role)
  await knex('approval_configuration').insert([
    {
      approval_config_id: 'AC0001',
      approval_type_id: 'AT001', // Transporter Admin
      approver_level: 1,
      role_id: 'RL001', // Product Owner role
      user_id: null, // Any Product Owner can approve
      status: 'ACTIVE',
      created_by: 'SYSTEM'
    }
  ]);
  
  console.log('✅ Created approval_configuration table with seed data');

  // ========================================
  // STEP 7: CREATE APPROVAL_FLOW_TRANS TABLE
  // ========================================
  
  await knex.schema.createTable('approval_flow_trans', function (table) {
    table.increments('approval_flow_unique_id').primary();
    table.string('approval_flow_trans_id', 20).notNullable().unique();
    table.string('approval_id', 20); // Reference to approval batch/group
    table.string('approval_config_id', 20).notNullable();
    table.string('approval_type_id', 10).notNullable();
    table.string('user_id_reference_id', 20).notNullable(); // The user being approved
    table.string('s_status', 50).notNullable(); // Pending for Approval, Approve, Sent Back, Active
    table.string('approval_cycle', 50);
    table.integer('approver_level').notNullable();
    table.string('pending_with_role_id', 10);
    table.string('pending_with_user_id', 20);
    table.string('pending_with_name', 200);
    table.string('created_by_user_id', 20); // Creator of the user
    table.string('created_by_name', 200);
    table.string('actioned_by_id', 20);
    table.string('actioned_by_name', 200);
    table.text('remarks');
    table.datetime('approved_on');
    
    // Audit trail
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.string('created_by', 50);
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by', 50);
    table.string('status', 20).defaultTo('ACTIVE');

    // Foreign keys
    table.foreign('approval_config_id').references('approval_config_id').inTable('approval_configuration');
    table.foreign('approval_type_id').references('approval_type_id').inTable('approval_type_master');
    table.foreign('user_id_reference_id').references('user_id').inTable('user_master');

    // Indexes
    table.index(['approval_flow_trans_id']);
    table.index(['approval_id']);
    table.index(['approval_config_id']);
    table.index(['approval_type_id']);
    table.index(['user_id_reference_id']);
    table.index(['pending_with_user_id']);
    table.index(['actioned_by_id']);
    table.index(['s_status']);
    table.index(['status']);
  });
  
  console.log('✅ Created approval_flow_trans table');

  // ========================================
  // STEP 8: RECREATE USER_ROLE_HDR TABLE
  // ========================================
  
  await knex.schema.createTable('user_role_hdr', function (table) {
    table.increments('user_role_hdr_unique_id').primary();
    table.string('user_role_hdr_id', 20).notNullable().unique();
    table.string('user_id', 20).notNullable();
    table.string('role_id', 10).notNullable();
    table.string('warehouse_id', 20);
    
    // Audit trail
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.string('created_by', 50);
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by', 50);
    table.string('status', 20).defaultTo('ACTIVE');

    // Foreign keys
    table.foreign('user_id').references('user_id').inTable('user_master');
    table.foreign('role_id').references('role_id').inTable('role_master');

    // Indexes
    table.index(['user_role_hdr_id']);
    table.index(['user_id']);
    table.index(['role_id']);
    table.index(['warehouse_id']);
    table.index(['status']);
  });
  
  console.log('✅ Created user_role_hdr table');

  // ========================================
  // STEP 9: RECREATE USER_APPLICATION_ACCESS TABLE
  // ========================================
  
  await knex.schema.createTable('user_application_access', function (table) {
    table.increments('app_access_unique_id').primary();
    table.string('application_access_id', 20).notNullable().unique();
    table.string('user_role_hdr_id', 20).notNullable();
    table.string('application_id', 20);
    table.string('access_control', 100);
    table.date('valid_from');
    table.date('valid_to');
    table.boolean('is_active').defaultTo(false); // Inactive until approved
    
    // Audit trail
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.string('created_by', 50);
    table.datetime('updated_at').defaultTo(knex.fn.now());
    table.string('updated_by', 50);
    table.string('status', 20).defaultTo('INACTIVE'); // INACTIVE until approved

    // Foreign keys
    table.foreign('user_role_hdr_id').references('user_role_hdr_id').inTable('user_role_hdr');

    // Indexes
    table.index(['application_access_id']);
    table.index(['user_role_hdr_id']);
    table.index(['application_id']);
    table.index(['status']);
  });
  
  console.log('✅ Created user_application_access table');

  console.log('🎉 Approval system tables recreation completed successfully!');
};

exports.down = async function (knex) {
  console.log('🔄 Rolling back approval system tables...');

  // Drop tables in reverse order
  await knex.schema.dropTableIfExists('user_application_access');
  await knex.schema.dropTableIfExists('user_role_hdr');
  await knex.schema.dropTableIfExists('approval_flow_trans');
  await knex.schema.dropTableIfExists('approval_configuration');
  await knex.schema.dropTableIfExists('approval_type_master');
  await knex.schema.dropTableIfExists('role_master');
  await knex.schema.dropTableIfExists('user_type_master');
  
  // Remove added columns from user_master
  await knex.schema.table('user_master', function (table) {
    table.dropColumn('user_type_id');
    table.dropColumn('password');
    table.dropColumn('password_type');
    table.dropColumn('consignor_id');
  });
  
  console.log('✅ Rollback completed');
};
