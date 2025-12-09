/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create bulk_upload_batches table
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
    
    // Foreign key to users table
    table.foreign('uploaded_by').references('id').inTable('tms_users');
    
    // Indexes for performance
    table.index('uploaded_by');
    table.index('status');
    table.index('upload_timestamp');
  });

  // Create bulk_upload_transporters table
  await knex.schema.createTable('tms_bulk_upload_transporters', (table) => {
    table.increments('id').primary();
    table.string('batch_id', 50).notNullable();
    table.string('transporter_ref_id', 50).nullable();
    table.integer('excel_row_number').notNullable();
    table.enum('validation_status', ['valid', 'invalid']).notNullable();
    table.json('validation_errors').nullable();
    table.integer('created_transporter_id').unsigned().nullable();
    
    // Foreign keys
    table.foreign('batch_id').references('batch_id').inTable('tms_bulk_upload_batches').onDelete('CASCADE');
    table.foreign('created_transporter_id').references('id').inTable('tms_transporters');
    
    // Indexes for performance
    table.index('batch_id');
    table.index('validation_status');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('tms_bulk_upload_transporters');
  await knex.schema.dropTableIfExists('tms_bulk_upload_batches');
};
