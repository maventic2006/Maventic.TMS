/**
 * Migration: Increase blacklisted_by column size
 * 
 * Purpose: Fix "Data too long for column 'blacklisted_by'" error
 * 
 * Problem: The blacklisted_by column was varchar(10) which cannot accommodate
 * the value 'transporter' (11 characters) or 'TRANSPORTER' (11 characters).
 * 
 * Solution: Increase column size from 10 to 20 characters to accommodate
 * all entity type names (TRANSPORTER, CONSIGNOR, etc.)
 */

exports.up = function (knex) {
  return knex.schema.alterTable("blacklist_mapping", function (table) {
    table.string("blacklisted_by", 20).alter(); // Increase from 10 to 20 characters
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("blacklist_mapping", function (table) {
    table.string("blacklisted_by", 10).alter(); // Revert back to 10 characters
  });
};
