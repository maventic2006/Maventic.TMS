require('dotenv').config();
const knex = require('knex')(require('./knexfile').development);

async function createBulkUploadTables() {
  try {
    console.log('Checking and creating bulk upload tables...\n');

    // Check if tms_bulk_upload_batches exists
    const batchesExists = await knex.schema.hasTable('tms_bulk_upload_batches');
    
    if (!batchesExists) {
      console.log('Creating tms_bulk_upload_batches table...');
      await knex.schema.createTable('tms_bulk_upload_batches', (table) => {
        table.increments('id').primary();
        table.string('batch_id', 50).notNullable().unique();
        table.integer('uploaded_by').unsigned().notNullable();
        table.string('filename', 255).notNullable();
        table.integer('total_rows').notNullable();
        table.integer('valid_rows').defaultTo(0);
        table.integer('invalid_rows').defaultTo(0);
        table.enum('status', ['processing', 'completed', 'failed']).defaultTo('processing');
        table.timestamp('upload_timestamp').defaultTo(knex.fn.now());
        table.timestamp('processed_timestamp').nullable();
        table.string('error_file_path', 500).nullable();
        
        // Foreign key to user_master table
        table.foreign('uploaded_by').references('id').inTable('user_master');
        
        // Indexes for performance
        table.index('uploaded_by');
        table.index('status');
        table.index('upload_timestamp');
      });
      console.log('✓ tms_bulk_upload_batches table created successfully\n');
    } else {
      console.log('✓ tms_bulk_upload_batches table already exists\n');
    }

    // Check if tms_bulk_upload_transporters exists
    const transportersExists = await knex.schema.hasTable('tms_bulk_upload_transporters');
    
    if (!transportersExists) {
      console.log('Creating tms_bulk_upload_transporters table...');
      await knex.schema.createTable('tms_bulk_upload_transporters', (table) => {
        table.increments('id').primary();
        table.string('batch_id', 50).notNullable();
        table.string('transporter_ref_id', 50).nullable();
        table.integer('excel_row_number').notNullable();
        table.enum('validation_status', ['valid', 'invalid']).notNullable();
        table.json('validation_errors').nullable();
        table.string('created_transporter_id', 10).nullable();
        
        // Foreign keys
        table.foreign('batch_id').references('batch_id').inTable('tms_bulk_upload_batches').onDelete('CASCADE');
        table.foreign('created_transporter_id').references('transporter_id').inTable('transporter_general_info');
        
        // Indexes for performance
        table.index('batch_id');
        table.index('validation_status');
      });
      console.log('✓ tms_bulk_upload_transporters table created successfully\n');
    } else {
      console.log('✓ tms_bulk_upload_transporters table already exists\n');
    }

    console.log('All bulk upload tables are ready!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating bulk upload tables:', error);
    process.exit(1);
  }
}

createBulkUploadTables();