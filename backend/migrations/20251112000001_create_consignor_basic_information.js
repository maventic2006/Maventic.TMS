/**
 * Migration: Create consignor_basic_information table
 * Description: Stores basic information about consignors/customers
 * Dependencies: tms_address table
 */

exports.up = function (knex) {
  return knex.schema.createTable("consignor_basic_information", function (table) {
    // Primary Key
    table.increments("consignor_unique_id").primary().comment("Auto-increment unique identifier");
    
    // Business Fields
    table.string("customer_id", 10).notNullable().unique().comment("Primary business key for consignor");
    table.string("customer_name", 100).notNullable().comment("Name of the customer/consignor");
    table.string("search_term", 100).notNullable().comment("Search term for quick lookup");
    table.string("industry_type", 30).notNullable().comment("Industry classification");
    table.string("currency_type", 30).nullable().comment("Preferred currency for transactions");
    table.string("payment_term", 10).notNullable().comment("Payment terms (e.g., NET30, NET45)");
    table.string("remark", 255).nullable().comment("Additional remarks or notes");
    
    // Document Upload Fields (NDA/MSA)
    table.string("upload_nda", 20).nullable().comment("Reference to NDA document in document_upload table");
    table.string("upload_msa", 20).nullable().comment("Reference to MSA document in document_upload table");
    
    // Additional Information
    table.string("website_url", 200).nullable().comment("Company website URL");
    table.string("name_on_po", 30).nullable().comment("Name to appear on purchase orders");
    table.string("approved_by", 30).nullable().comment("User who approved the consignor");
    table.date("approved_date").nullable().comment("Date of approval");
    
    // Foreign Key to Address
    table.string("address_id", 20).nullable().comment("Reference to primary address in tms_address");
    
    // Audit Trail
    table.datetime("created_at").defaultTo(knex.fn.now()).comment("Creation date and time");
    table.string("created_by", 10).notNullable().comment("User who created the record");
    table.datetime("updated_at").defaultTo(knex.fn.now()).comment("Last update date and time");
    table.string("updated_by", 10).notNullable().comment("User who last updated the record");
    table.string("status", 10).notNullable().defaultTo("ACTIVE").comment("Record status (ACTIVE/INACTIVE)");

    // Indexes for performance
    table.index(["customer_id"], "idx_consignor_customer_id");
    table.index(["customer_name"], "idx_consignor_customer_name");
    table.index(["search_term"], "idx_consignor_search_term");
    table.index(["industry_type"], "idx_consignor_industry_type");
    table.index(["status"], "idx_consignor_status");
    table.index(["approved_by"], "idx_consignor_approved_by");
    table.index(["created_at"], "idx_consignor_created_at");

    // Foreign Key Constraint (will be added in separate migration after all tables are created)
    // address_id references tms_address.address_id
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("consignor_basic_information");
};
