exports.up = function (knex) {
  return knex.schema.createTable("trip_invoices_header", function (table) {
    table.increments("trip_invoice_header_unique_id").primary();
    table.string("trip_invoice_header_id", 20).notNullable().unique();
    table.string("vehicle_assignment_id", 20);
    table.string("indent_id", 20);
    table.string("drop_location_id", 20);
    table.string("invoice_no_challan_no", 50);
    table.date("invoice_date");
    table.string("receiver_name", 100);
    table.string("receiver_gstin", 50);
    table.text("receiver_shipping_address");
    table.text("receiver_billing_address");
    table.string("receiver_contact_phone", 20);
    table.string("receiver_contact_email", 100);
    table.string("so_number", 50);
    table.decimal("so_quantity", 10, 3);
    table.date("so_date");
    table.date("so_release_date");
    table.string("po_number", 50);
    table.string("eway_bill_no", 50);
    table.date("eway_bill_expiry_date");
    table.decimal("invoice_value", 15, 2);
    table.text("remark");
    table.decimal("net_price", 10, 2);
    table.decimal("total_price", 15, 2);
    table.decimal("total_tax", 15, 2);
    table.decimal("cgst_rate", 5, 2);
    table.decimal("sgst_rate", 5, 2);
    table.decimal("igst_rate", 5, 2);
    table.decimal("other_tax_rate", 5, 2);
    table.decimal("cgst_value", 15, 2);
    table.decimal("sgst_value", 15, 2);
    table.decimal("igst_value", 15, 2);
    table.decimal("other_tax_value", 15, 2);
    
    // Audit trail properties
    table.date("created_at").notNullable();
    table.time("created_on").notNullable();
    table.string("created_by", 10).notNullable();
    table.date("updated_at").notNullable();
    table.time("updated_on").notNullable();
    table.string("updated_by", 10).notNullable();
    table.string("status", 10).nullable();

    // Indexes
    table.index(["trip_invoice_header_id"]);
    table.index(["vehicle_assignment_id"]);
    table.index(["indent_id"]);
    table.index(["invoice_no_challan_no"]);
    table.index(["invoice_date"]);
    table.index(["status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("trip_invoices_header");
};