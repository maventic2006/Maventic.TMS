/**
 * Migration: Create consignor_documents table
 * Description: Stores document information for consignors
 * Dependencies: consignor_basic_information, document_upload, doc_type_configuration tables
 */

exports.up = function (knex) {
  return knex.schema.createTable("consignor_documents", function (table) {
    // Primary Key
    table.increments("document_unique_pk_id").primary().comment("Auto-increment unique identifier");
    
    // Business Key
    table.string("document_unique_id", 10).notNullable().unique().comment("Primary business key for document");
    
    // Foreign Keys
    table.string("document_id", 20).notNullable().comment("Foreign key from document_upload table");
    table.string("customer_id", 10).notNullable().comment("Foreign key from consignor_basic_information");
    table.string("document_type_id", 30).notNullable().comment("Foreign key from doc_type_configuration");
    
    // Document Details
    table.string("document_number", 50).nullable().comment("Document number or reference");
    table.date("valid_from").notNullable().comment("Document validity start date");
    table.date("valid_to").nullable().comment("Document validity end date (if applicable)");
    
    // Audit Trail
    table.datetime("created_at").defaultTo(knex.fn.now()).comment("Creation date and time");
    table.string("created_by", 10).notNullable().comment("User who created the record");
    table.datetime("updated_at").defaultTo(knex.fn.now()).comment("Last update date and time");
    table.string("updated_by", 10).notNullable().comment("User who last updated the record");
    table.string("status", 10).notNullable().defaultTo("ACTIVE").comment("Record status (ACTIVE/INACTIVE)");

    // Indexes for performance
    table.index(["document_unique_id"], "idx_consignor_doc_unique_id");
    table.index(["document_id"], "idx_consignor_doc_id");
    table.index(["customer_id"], "idx_consignor_doc_customer_id");
    table.index(["document_type_id"], "idx_consignor_doc_type_id");
    table.index(["document_number"], "idx_consignor_doc_number");
    table.index(["valid_from"], "idx_consignor_doc_valid_from");
    table.index(["valid_to"], "idx_consignor_doc_valid_to");
    table.index(["status"], "idx_consignor_doc_status");

    // Foreign Key Constraints (will be added in separate migration after all tables are created)
    // customer_id references consignor_basic_information.customer_id
    // document_id references document_upload.document_id
    // document_type_id references doc_type_configuration.document_type_id
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("consignor_documents");
};
