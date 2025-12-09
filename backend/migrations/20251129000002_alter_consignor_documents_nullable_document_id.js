/**
 * Migration: Make document_id nullable in consignor_documents table
 * 
 * Reason: Documents can exist as metadata-only records (especially in draft mode)
 * without actual file uploads. The document_id references the document_upload table
 * and should be nullable to support this use case.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("consignor_documents", (table) => {
    table.string("document_id", 20).nullable().alter();
  });
};

/**
 * Rollback: Make document_id NOT NULL again
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("consignor_documents", (table) => {
    table.string("document_id", 20).notNullable().alter();
  });
};
