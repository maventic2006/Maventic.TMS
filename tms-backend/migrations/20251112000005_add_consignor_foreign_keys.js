/**
 * Migration: Add foreign key constraints for consignor tables
 * Description: Establishes relationships between consignor tables and related tables
 * Dependencies: All consignor tables, tms_address, document_upload, doc_type_configuration
 */

exports.up = async function (knex) {
  // Add foreign key for consignor_basic_information.address_id
  await knex.schema.alterTable("consignor_basic_information", function (table) {
    table.foreign("address_id")
      .references("address_id")
      .inTable("tms_address")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");
  });

  // Add foreign key for consignor_organization.customer_id
  await knex.schema.alterTable("consignor_organization", function (table) {
    table.foreign("customer_id")
      .references("customer_id")
      .inTable("consignor_basic_information")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });

  // Add foreign key for contact.customer_id
  await knex.schema.alterTable("contact", function (table) {
    table.foreign("customer_id")
      .references("customer_id")
      .inTable("consignor_basic_information")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });

  // Add foreign keys for consignor_documents
  await knex.schema.alterTable("consignor_documents", function (table) {
    // Foreign key to consignor_basic_information
    table.foreign("customer_id")
      .references("customer_id")
      .inTable("consignor_basic_information")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // Foreign key to document_upload
    table.foreign("document_id")
      .references("document_id")
      .inTable("document_upload")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // Foreign key to doc_type_configuration
    table.foreign("document_type_id")
      .references("document_type_id")
      .inTable("doc_type_configuration")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");
  });
};

exports.down = async function (knex) {
  // Drop foreign keys in reverse order
  
  // Drop consignor_documents foreign keys
  await knex.schema.alterTable("consignor_documents", function (table) {
    table.dropForeign("customer_id");
    table.dropForeign("document_id");
    table.dropForeign("document_type_id");
  });

  // Drop contact foreign key
  await knex.schema.alterTable("contact", function (table) {
    table.dropForeign("customer_id");
  });

  // Drop consignor_organization foreign key
  await knex.schema.alterTable("consignor_organization", function (table) {
    table.dropForeign("customer_id");
  });

  // Drop consignor_basic_information foreign key
  await knex.schema.alterTable("consignor_basic_information", function (table) {
    table.dropForeign("address_id");
  });
};
