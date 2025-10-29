/**
 * Migration to add index on reference_number in transporter_documents
 * This field will store transporter_id to establish the relationship
 */

exports.up = function(knex) {
  return knex.schema.table('transporter_documents', function(table) {
    // Add index on reference_number for better query performance
    table.index(['reference_number'], 'idx_trans_docs_reference_number');
    
    // Add comment to clarify the purpose (MySQL specific)
    // reference_number will store transporter_id, warehouse_id, driver_id, etc.
    // based on user_type
  });
};

exports.down = function(knex) {
  return knex.schema.table('transporter_documents', function(table) {
    table.dropIndex(['reference_number'], 'idx_trans_docs_reference_number');
  });
};
