const db = require('./config/database');

async function fixAndPopulateStatusPurpose() {
  try {
    console.log(' Fixing status_purpose_master table...');
    
    // First, drop the existing table if it exists
    await db.schema.dropTableIfExists('status_purpose_master');
    console.log(' Dropped existing table');
    
    // Create the table with larger column size
    await db.schema.createTable('status_purpose_master', function(table) {
      // Primary Key
      table.string('status_purpose_id', 10).primary().notNullable().unique().comment('Primary key for status purpose');
      
      // Business Fields - Increased size to accommodate longer descriptions
      table.string('status_purpose', 50).notNullable().comment('Purpose description for status usage');
      
      // Audit Fields
      table.date('created_at').notNullable().comment('Creation date');
      table.time('created_on').notNullable().comment('Creation time');
      table.string('created_by', 10).notNullable().comment('User who created the record');
      table.date('updated_at').notNullable().comment('Last update date');
      table.time('updated_on').notNullable().comment('Last update time');
      table.string('updated_by', 10).notNullable().comment('User who last updated the record');
      table.string('status', 10).nullable().defaultTo('ACTIVE').comment('Record status (ACTIVE/INACTIVE)');
      
      // Indexes for better performance
      table.index('status_purpose', 'idx_status_purpose_name');
      table.index('status', 'idx_status_purpose_status');
      table.index(['created_at', 'status'], 'idx_status_purpose_created_status');
      
      console.log(' Table recreated with VARCHAR(50) for status_purpose');
    });
    
    // Now populate with data (with shortened text for long purposes)
    console.log('\n Populating table with initial data...');
    
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];
    
    const statusPurposes = [
      {
        status_purpose_id: 'SP001',
        status_purpose: 'User Master',
        created_at: currentDate,
        created_on: currentTime,
        created_by: 'SYSTEM',
        updated_at: currentDate,
        updated_on: currentTime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        status_purpose_id: 'SP002',
        status_purpose: 'Approval Flow Status',
        created_at: currentDate,
        created_on: currentTime,
        created_by: 'SYSTEM',
        updated_at: currentDate,
        updated_on: currentTime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        status_purpose_id: 'SP003',
        status_purpose: 'Signup Status',
        created_at: currentDate,
        created_on: currentTime,
        created_by: 'SYSTEM',
        updated_at: currentDate,
        updated_on: currentTime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        status_purpose_id: 'SP004',
        status_purpose: 'RFQ',
        created_at: currentDate,
        created_on: currentTime,
        created_by: 'SYSTEM',
        updated_at: currentDate,
        updated_on: currentTime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        status_purpose_id: 'SP005',
        status_purpose: 'Quotation',
        created_at: currentDate,
        created_on: currentTime,
        created_by: 'SYSTEM',
        updated_at: currentDate,
        updated_on: currentTime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        status_purpose_id: 'SP006',
        status_purpose: 'Indent',
        created_at: currentDate,
        created_on: currentTime,
        created_by: 'SYSTEM',
        updated_at: currentDate,
        updated_on: currentTime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        status_purpose_id: 'SP007',
        status_purpose: 'Drop Location',
        created_at: currentDate,
        created_on: currentTime,
        created_by: 'SYSTEM',
        updated_at: currentDate,
        updated_on: currentTime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        status_purpose_id: 'SP008',
        status_purpose: 'Vehicle',
        created_at: currentDate,
        created_on: currentTime,
        created_by: 'SYSTEM',
        updated_at: currentDate,
        updated_on: currentTime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        status_purpose_id: 'SP009',
        status_purpose: 'Checklist',
        created_at: currentDate,
        created_on: currentTime,
        created_by: 'SYSTEM',
        updated_at: currentDate,
        updated_on: currentTime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        status_purpose_id: 'SP010',
        status_purpose: 'Vehicle Driver Replacement Request',
        created_at: currentDate,
        created_on: currentTime,
        created_by: 'SYSTEM',
        updated_at: currentDate,
        updated_on: currentTime,
        updated_by: 'SYSTEM',
        status: 'ACTIVE'
      }
    ];

    await db('status_purpose_master').insert(statusPurposes);
    
    console.log(' Inserted', statusPurposes.length, 'status purpose records');
    console.log(' Populated purposes:');
    statusPurposes.forEach(sp => {
      console.log('   - ' + sp.status_purpose_id + ': ' + sp.status_purpose);
    });
    
    // Verify the data
    console.log('\n Verifying inserted data...');
    const verifyData = await db('status_purpose_master').select('*').orderBy('status_purpose_id');
    console.table(verifyData);
    
    console.log('\n Table structure:');
    const columns = await db('status_purpose_master').columnInfo();
    console.table(columns);
    
    console.log('\n Status Purpose Master table created and populated successfully!');
    console.log(' Table Details:');
    console.log('    Table Name: status_purpose_master');
    console.log('    Primary Key: status_purpose_id (VARCHAR 10)');
    console.log('    Purpose Column: status_purpose (VARCHAR 50)');
    console.log('    Records: 10 status purposes for various system modules');
    console.log('    All records have ACTIVE status with audit fields populated');
    
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await db.destroy();
  }
}

fixAndPopulateStatusPurpose();
