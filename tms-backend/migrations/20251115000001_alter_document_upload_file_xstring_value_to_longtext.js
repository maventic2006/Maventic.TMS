/**
 * Migration: Alter document_upload.file_xstring_value from TEXT to LONGTEXT
 *
 * Purpose: Support larger base64-encoded file data (up to 4GB vs 64KB)
 * - TEXT column: max 65,535 bytes (~64KB)
 * - LONGTEXT column: max 4,294,967,295 bytes (~4GB)
 *
 * This allows storing base64-encoded files up to ~3GB raw size
 * (base64 encoding increases size by ~33%)
 */

exports.up = function (knex) {
  return knex.schema.alterTable("document_upload", function (table) {
    // Change file_xstring_value from TEXT to LONGTEXT
    table.specificType("file_xstring_value", "LONGTEXT").alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("document_upload", function (table) {
    // Rollback to TEXT (may cause data loss if large files exist)
    table.text("file_xstring_value").alter();
  });
};
