exports.up = function(knex) {
  return knex.schema.createTable('trip_invoices_item', function(table) {
    // Primary Key
    table.string('trip_invoice_item_id', 10).primary();
    
    // Foreign Keys
    table.string('trip_invoice_header_id', 10).notNullable();
    table.string('sku_code', 20).nullable();
    table.string('material_type', 50).nullable();
    table.string('material_code', 20).nullable();
    table.string('hsn_code', 20).nullable();
    
    // Item Details
    table.decimal('quantity', 10, 3).nullable();
    table.string('quantity_unit', 10).nullable();
    table.decimal('gross_weight', 10, 3).nullable();
    table.decimal('net_weight', 10, 3).nullable();
    table.string('weight_unit', 10).defaultTo('KG');
    table.string('product_name', 100).nullable();
    table.text('product_description').nullable();
    table.decimal('net_price', 10, 2).nullable();
    table.decimal('total_price', 12, 2).nullable();
    table.decimal('total_tax', 10, 2).nullable();
    
    // GST Details
    table.decimal('cgst_rate', 5, 2).defaultTo(0.00);
    table.decimal('sgst_rate', 5, 2).defaultTo(0.00);
    table.decimal('igst_rate', 5, 2).defaultTo(0.00);
    table.decimal('other_tax_rate', 5, 2).defaultTo(0.00);
    table.decimal('cgst', 10, 2).defaultTo(0.00);
    table.decimal('sgst', 10, 2).defaultTo(0.00);
    table.decimal('igst', 10, 2).defaultTo(0.00);
    table.decimal('other_tax', 10, 2).defaultTo(0.00);
    
    // Sales Order Details
    table.string('so_number', 30).nullable();
    table.decimal('so_quantity', 10, 3).nullable();
    table.date('so_date').nullable();
    table.date('so_release_date').nullable();
    table.string('po_number', 30).nullable();
    table.string('eway_bill_no', 30).nullable();
    table.date('eway_bill_expiry_date').nullable();
    table.decimal('invoice_value', 12, 2).nullable();
    table.text('remark').nullable();
    
    // Audit Trail
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.date('created_on').nullable();
    table.string('created_by', 50).defaultTo('SYSTEM');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.date('updated_on').nullable();
    table.string('updated_by', 50).defaultTo('SYSTEM');
    table.string('status', 10).defaultTo('ACTIVE');
    
    // Indexes
    table.index(['trip_invoice_header_id'], 'idx_trip_invoices_item_header_id');
    table.index(['sku_code'], 'idx_trip_invoices_item_sku_code');
    table.index(['material_code'], 'idx_trip_invoices_item_material_code');
    table.index(['so_number'], 'idx_trip_invoices_item_so_number');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('trip_invoices_item');
};