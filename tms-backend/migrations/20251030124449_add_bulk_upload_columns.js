/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Add missing columns to tms_bulk_upload_batches
  await knex.schema.table('tms_bulk_upload_batches', (table) => {
    // Rename existing columns to match processor
    table.renameColumn('valid_rows', 'total_valid');
    table.renameColumn('invalid_rows', 'total_invalid');
    
    // Add new columns for creation tracking
    table.integer('total_created').defaultTo(0);
    table.integer('total_creation_failed').defaultTo(0);
    table.string('error_report_path', 500).nullable();
    table.text('error_message').nullable();
  });
  
  // Add data column to tms_bulk_upload_transporters
  await knex.schema.table('tms_bulk_upload_transporters', (table) => {
    table.json('data').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.table('tms_bulk_upload_batches', (table) => {
    table.renameColumn('total_valid', 'valid_rows');
    table.renameColumn('total_invalid', 'invalid_rows');
    table.dropColumn('total_created');
    table.dropColumn('total_creation_failed');
    table.dropColumn('error_report_path');
    table.dropColumn('error_message');
  });
  
  await knex.schema.table('tms_bulk_upload_transporters', (table) => {
    table.dropColumn('data');
  });
};
