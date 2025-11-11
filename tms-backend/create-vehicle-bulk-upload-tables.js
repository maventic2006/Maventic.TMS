require('dotenv').config();
const knex = require('knex')(require('./knexfile').development);

async function fixUploadedByColumn() {
  try {
    console.log('🔧 Fixing uploaded_by column type mismatch...\n');
    
    // Check if table exists
    const tableExists = await knex.schema.hasTable('tms_bulk_upload_vehicle_batches');
    
    if (!tableExists) {
      console.log('❌ Table tms_bulk_upload_vehicle_batches does not exist!');
      console.log('   Please run create-vehicle-bulk-upload-tables.js first.');
      process.exit(1);
    }
    
    // Get current column information
    const columnInfo = await knex.raw(`
      SELECT COLUMN_TYPE, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'tms_bulk_upload_vehicle_batches' 
      AND COLUMN_NAME = 'uploaded_by'
    `);
    
    console.log('📊 Current uploaded_by column type:', columnInfo[0][0].COLUMN_TYPE);
    
    if (columnInfo[0][0].DATA_TYPE === 'int' || columnInfo[0][0].DATA_TYPE === 'integer') {
      console.log('⚠️  Column is INTEGER type - needs to be changed to VARCHAR(20)\n');
      
      // Drop foreign key constraint if it exists
      console.log('🔓 Dropping foreign key constraint (if exists)...');
      try {
        await knex.raw(`
          ALTER TABLE tms_bulk_upload_vehicle_batches 
          DROP FOREIGN KEY tms_bulk_upload_vehicle_batches_uploaded_by_foreign
        `);
        console.log('✓ Foreign key constraint dropped\n');
      } catch (err) {
        if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.log('ℹ️  No foreign key constraint found (that\'s okay)\n');
        } else {
          throw err;
        }
      }
      
      // Modify column type to VARCHAR(20)
      console.log('🔄 Changing column type to VARCHAR(20)...');
      await knex.raw(`
        ALTER TABLE tms_bulk_upload_vehicle_batches 
        MODIFY COLUMN uploaded_by VARCHAR(20) NOT NULL
      `);
      console.log('✓ Column type changed to VARCHAR(20)\n');
      
      // Add foreign key constraint to user_master.user_id
      console.log('🔗 Adding foreign key constraint to user_master.user_id...');
      try {
        await knex.raw(`
          ALTER TABLE tms_bulk_upload_vehicle_batches 
          ADD CONSTRAINT tms_bulk_upload_vehicle_batches_uploaded_by_foreign 
          FOREIGN KEY (uploaded_by) REFERENCES user_master(user_id)
        `);
        console.log('✓ Foreign key constraint added\n');
      } catch (err) {
        console.log('⚠️  Could not add foreign key constraint:', err.message);
        console.log('   This is okay - the column will work without the constraint\n');
      }
      
      console.log('✅ uploaded_by column type fixed successfully!');
      console.log('   Now it can accept user IDs like \'POWNER001\'\n');
    } else {
      console.log('✓ Column is already VARCHAR type - no changes needed\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing uploaded_by column:', error);
    process.exit(1);
  }
}

async function createVehicleBulkUploadTables() {
  try {
    console.log('🚗 Creating vehicle bulk upload tables...\n');

    // Check if tms_bulk_upload_vehicle_batches exists
    const batchesExists = await knex.schema.hasTable('tms_bulk_upload_vehicle_batches');
    
    if (!batchesExists) {
      console.log('📦 Creating tms_bulk_upload_vehicle_batches table...');
      await knex.schema.createTable('tms_bulk_upload_vehicle_batches', (table) => {
        table.increments('id').primary();
        table.string('batch_id', 50).notNullable().unique();
        table.string('uploaded_by', 20).notNullable();
        table.string('filename', 255).notNullable();
        table.integer('total_rows').notNullable();
        table.integer('total_valid').defaultTo(0);
        table.integer('total_invalid').defaultTo(0);
        table.integer('total_created').defaultTo(0);
        table.integer('total_creation_failed').defaultTo(0);
        table.enum('status', ['processing', 'completed', 'failed']).defaultTo('processing');
        table.timestamp('upload_timestamp').defaultTo(knex.fn.now());
        table.timestamp('processed_timestamp').nullable();
        table.string('error_report_path', 500).nullable();
        table.text('error_message').nullable();
        
        // Foreign key to user_master table (user_id is varchar(20))
        table.foreign('uploaded_by').references('user_id').inTable('user_master');
        
        // Indexes for performance
        table.index('uploaded_by');
        table.index('status');
        table.index('upload_timestamp');
      });
      console.log('✓ tms_bulk_upload_vehicle_batches table created successfully\n');
    } else {
      console.log('✓ tms_bulk_upload_vehicle_batches table already exists\n');
    }

    // Check if tms_bulk_upload_vehicles exists
    const vehiclesExists = await knex.schema.hasTable('tms_bulk_upload_vehicles');
    
    if (!vehiclesExists) {
      console.log('📦 Creating tms_bulk_upload_vehicles table...');
      await knex.schema.createTable('tms_bulk_upload_vehicles', (table) => {
        table.increments('id').primary();
        table.string('batch_id', 50).notNullable();
        table.string('vehicle_ref_id', 50).nullable();
        table.integer('excel_row_number').notNullable();
        table.enum('validation_status', ['valid', 'invalid']).notNullable();
        table.json('validation_errors').nullable();
        table.json('data').nullable();
        table.string('created_vehicle_id', 10).nullable();
        
        // Foreign keys
        table.foreign('batch_id').references('batch_id').inTable('tms_bulk_upload_vehicle_batches').onDelete('CASCADE');
        table.foreign('created_vehicle_id').references('vehicle_id_code_hdr').inTable('vehicle_basic_information_hdr');
        
        // Indexes for performance
        table.index('batch_id');
        table.index('validation_status');
      });
      console.log('✓ tms_bulk_upload_vehicles table created successfully\n');
    } else {
      console.log('✓ tms_bulk_upload_vehicles table already exists\n');
    }

    console.log('✅ All vehicle bulk upload tables are ready!');
    console.log('\n📊 Summary:');
    console.log('   - tms_bulk_upload_vehicle_batches (batch tracking)');
    console.log('   - tms_bulk_upload_vehicles (vehicle records)\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating vehicle bulk upload tables:', error);
    process.exit(1);
  }
}

// Check command line argument
const command = process.argv[2];

if (command === 'fix') {
  fixUploadedByColumn();
} else {
  createVehicleBulkUploadTables();
}
