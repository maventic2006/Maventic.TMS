exports.up = async function(knex) {
  // Step 1: Handle existing backup table and rename current table
  const hasBackup = await knex.schema.hasTable('indent_header_backup');
  if (hasBackup) {
    await knex.schema.dropTable('indent_header_backup');
  }
  await knex.schema.renameTable('indent_header', 'indent_header_backup');
  
  // Step 2: Create new table with correct structure per specification
  await knex.schema.createTable('indent_header', function(table) {
    // Primary Key - as per specification
    table.string('indent_id', 10).primary().unique();
    
    // Business Fields - Updated to match specification exactly
    table.string('consignor_id', 10).nullable();
    table.string('warehouse_id', 10).notNullable().unique();  // Only warehouse_id should be unique per spec
    table.string('creation_medium_id', 10).nullable();
    table.string('warehouse_gate_sub_type_id', 10).nullable();
    table.string('goods_loading_point_id', 10).nullable();
    table.string('priority_order_identifier', 10).nullable();
    table.boolean('e_bidding_eligible').notNullable();  // Removed .unique() - not in spec
    table.string('ebidding_slot_number', 10).notNullable();  // Removed .unique() - not in spec
    table.string('comments', 30).notNullable();  // Per spec: Nullable = N means NOT NULL
    table.string('indent_status_id', 10).notNullable(); // Per spec: Nullable = N means NOT NULL
    table.string('total_freight_amount', 10).notNullable(); // Per spec: Nullable = N means NOT NULL
    table.string('currency_id', 10).notNullable(); // Per spec: Nullable = N means NOT NULL
    
    // Audit Trail - Updated to match specification exactly
    table.date('created_at').notNullable(); // Per spec: Nullable = N means NOT NULL
    table.time('created_on').notNullable(); // Per spec: Nullable = N means NOT NULL
    table.string('created_by', 10).notNullable(); // Per spec: Nullable = N means NOT NULL
    table.date('updated_at').notNullable(); // Per spec: Nullable = N means NOT NULL
    table.time('updated_on').notNullable(); // Per spec: Nullable = N means NOT NULL
    table.string('updated_by', 10).notNullable(); // Per spec: Nullable = N means NOT NULL
    table.string('status', 10).nullable(); // Per spec: Nullable = Y means NULL
    
    // Indexes
    table.index(['indent_id'], 'idx_indent_header_indent_id');
    table.index(['consignor_id'], 'idx_indent_header_consignor_id');
    table.index(['warehouse_id'], 'idx_indent_header_warehouse_id');
    table.index(['indent_status_id'], 'idx_indent_header_indent_status_id');
    table.index(['e_bidding_eligible'], 'idx_indent_header_e_bidding_eligible');
    table.index(['currency_id'], 'idx_indent_header_currency_id');
  });
  
  // Step 3: Copy data from backup table (using correct column names from backup)
  await knex.raw(`
    INSERT INTO indent_header (
      indent_id, consignor_id, warehouse_id, creation_medium_id, warehouse_gate_sub_type_id,
      goods_loading_point_id, priority_order_identifier, e_bidding_eligible, ebidding_slot_number,
      comments, indent_status_id, total_freight_amount, currency_id,
      created_at, created_on, created_by, updated_at, updated_on, updated_by, status
    )
    SELECT 
      LEFT(indent_id, 10) as indent_id,
      consignor_id,
      warehouse_id,
      COALESCE(creation_medium_id, 'WEB') as creation_medium_id,
      warehouse_gate_sub_type_id,
      goods_loading_point_id,
      priority_order_identifier,
      e_bidding_eligible,
      COALESCE(ebidding_slot_number, CONCAT('SLOT', LPAD(ROW_NUMBER() OVER (ORDER BY indent_id), 3, '0'))) as ebidding_slot_number,
      COALESCE(comments, 'No comments') as comments,
      COALESCE(indent_status_id, 'IST002') as indent_status_id,
      COALESCE(total_freight_amount, '0') as total_freight_amount,
      COALESCE(currency_id, 'CUR001') as currency_id,
      COALESCE(created_at, CURDATE()) as created_at,
      COALESCE(created_on, CURTIME()) as created_on,
      COALESCE(created_by, 'SYSTEM') as created_by,
      COALESCE(updated_at, CURDATE()) as updated_at,
      COALESCE(updated_on, CURTIME()) as updated_on,
      COALESCE(updated_by, 'SYSTEM') as updated_by,
      status
    FROM indent_header_backup
  `);
  
  // Step 4: Drop backup table
  await knex.schema.dropTable('indent_header_backup');
};

exports.down = async function(knex) {
  // Step 1: Rename current table to backup
  await knex.schema.renameTable('indent_header', 'indent_header_new');
  
  // Step 2: Recreate original table structure
  await knex.schema.createTable('indent_header', function(table) {
    table.increments("indent_header_unique_id").primary();
    table.string("indent_id", 20).notNullable().unique();
    table.string("consignor_id", 10);
    table.string("warehouse_id", 10);
    table.string("creation_medium", 50);
    table.string("warehouse_gate_sub_type_id", 10);
    table.string("goods_loading_point_id", 10);
    table.integer("priority_order_identifier");
    table.boolean("e_bidding_eligible").defaultTo(false);
    table.string("ebidding_slot_number", 10);
    table.text("comments");
    table.string("indent_status_id", 50);
    table.decimal("total_freight_amount", 15, 2);
    table.string("currency", 10);
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status", 10).nullable();

    // Indexes
    table.index(["indent_id"]);
    table.index(["consignor_id"]);
    table.index(["warehouse_id"]);
    table.index(["indent_status_id"]);
    table.index(["e_bidding_eligible"]);
    table.index(["status"]);
  });
  
  // Step 3: Copy data back (with reverse conversions)
  await knex.raw(`
    INSERT INTO indent_header (
      indent_id, consignor_id, warehouse_id, creation_medium, warehouse_gate_sub_type_id,
      goods_loading_point_id, priority_order_identifier, e_bidding_eligible, ebidding_slot_number,
      comments, indent_status_id, total_freight_amount, currency,
      created_at, created_on, created_by, updated_at, updated_on, updated_by, status
    )
    SELECT 
      indent_id, consignor_id, warehouse_id, creation_medium_id as creation_medium,
      warehouse_gate_sub_type_id, goods_loading_point_id,
      CAST(priority_order_identifier as UNSIGNED) as priority_order_identifier,
      e_bidding_eligible, ebidding_slot_number, comments, indent_status_id,
      CAST(total_freight_amount as DECIMAL(15,2)) as total_freight_amount,
      currency_id as currency, created_at, created_on, created_by,
      updated_at, updated_on, updated_by, status
    FROM indent_header_new
  `);
  
  // Step 4: Drop new table
  await knex.schema.dropTable('indent_header_new');
};