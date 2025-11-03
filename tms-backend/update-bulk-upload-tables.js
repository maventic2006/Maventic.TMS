require('dotenv').config();
const knex = require('knex')(require('./knexfile').development);

async function updateBulkUploadTables() {
  console.log('Updating bulk upload tables...\n');
  
  try {
    // Check if columns exist before adding/modifying
    const batchColumns = await knex('tms_bulk_upload_batches').columnInfo();
    
    // Add missing columns if they don't exist
    if (!batchColumns.total_created) {
      console.log('Adding total_created column...');
      await knex.schema.table('tms_bulk_upload_batches', (table) => {
        table.integer('total_created').defaultTo(0);
      });
    }
    
    if (!batchColumns.total_creation_failed) {
      console.log('Adding total_creation_failed column...');
      await knex.schema.table('tms_bulk_upload_batches', (table) => {
        table.integer('total_creation_failed').defaultTo(0);
      });
    }
    
    if (!batchColumns.error_report_path) {
      console.log('Adding error_report_path column...');
      await knex.schema.table('tms_bulk_upload_batches', (table) => {
        table.string('error_report_path', 500).nullable();
      });
    }
    
    if (!batchColumns.error_message) {
      console.log('Adding error_message column...');
      await knex.schema.table('tms_bulk_upload_batches', (table) => {
        table.text('error_message').nullable();
      });
    }
    
    // Check transporter table
    const transporterColumns = await knex('tms_bulk_upload_transporters').columnInfo();
    
    if (!transporterColumns.data) {
      console.log('Adding data column to transporters table...');
      await knex.schema.table('tms_bulk_upload_transporters', (table) => {
        table.json('data').nullable();
      });
    }
    
    console.log('\n✓ All bulk upload tables updated successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error updating tables:', error);
    process.exit(1);
  }
}

updateBulkUploadTables();
