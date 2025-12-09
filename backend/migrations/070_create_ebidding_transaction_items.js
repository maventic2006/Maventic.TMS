exports.up = function(knex) {
  return knex.schema.createTable('ebidding_transaction_items', function(table) {
    // Primary Key
    table.string('ebidding_trans_itm_id', 10).primary();
    
    // Foreign Keys
    table.string('ebidding_trans_hdr_id', 10).notNullable();
    table.string('indent_id', 10).notNullable();
    table.string('indent_vehicle_id', 10).notNullable();
    table.string('transporter_id', 10).notNullable();
    
    // Bidding Details
    table.decimal('freight_rate', 10, 2).nullable();
    table.string('freight_unit', 20).nullable();
    table.decimal('qty', 10, 3).nullable();
    table.string('currency', 10).defaultTo('INR');
    table.text('bidding_remark').nullable();
    table.integer('rank').nullable();
    
    // Audit Trail
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.date('created_on').nullable();
    table.string('created_by', 50).defaultTo('SYSTEM');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.date('updated_on').nullable();
    table.string('updated_by', 50).defaultTo('SYSTEM');
    table.string('status', 10).defaultTo('ACTIVE');
    
    // Indexes
    table.index(['ebidding_trans_hdr_id'], 'idx_ebidding_trans_items_hdr_id');
    table.index(['indent_id'], 'idx_ebidding_trans_items_indent_id');
    table.index(['transporter_id'], 'idx_ebidding_trans_items_transporter_id');
    table.index(['rank'], 'idx_ebidding_trans_items_rank');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('ebidding_transaction_items');
};