/**
 * Migration: Add NDA and MSA validity date fields
 * Description: Adds nda_validity and msa_validity date columns to consignor_basic_information table
 * Dependencies: consignor_basic_information table
 */

exports.up = function (knex) {
  return knex.schema.alterTable('consignor_basic_information', function (table) {
    // Add NDA and MSA validity date fields
    table.date('nda_validity').nullable().comment('NDA document validity/expiry date');
    table.date('msa_validity').nullable().comment('MSA document validity/expiry date');
    
    // Add indexes for date-based queries
    table.index(['nda_validity'], 'idx_consignor_nda_validity');
    table.index(['msa_validity'], 'idx_consignor_msa_validity');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('consignor_basic_information', function (table) {
    table.dropIndex(['nda_validity'], 'idx_consignor_nda_validity');
    table.dropIndex(['msa_validity'], 'idx_consignor_msa_validity');
    table.dropColumn('nda_validity');
    table.dropColumn('msa_validity');
  });
};
