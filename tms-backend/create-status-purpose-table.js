const db = require('./config/database');

async function createStatusPurposeMasterTable() {
  try {
    console.log(' Creating status_purpose_master table...');
    
    // Create the table
    await db.schema.createTable('status_purpose_master', function(table) {
      // Primary Key
      table.string('status_purpose_id', 10).primary().notNullable().unique().comment('Primary key for status purpose');
      
      // Business Fields
      table.string('status_purpose', 30).notNullable().comment('Purpose description for status usage');
      
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
      
      console.log(' Table structure created successfully');
    });
    
    console.log(' Table created with columns:');
    console.log('   - status_purpose_id (VARCHAR 10) - Primary Key');
    console.log('   - status_purpose (VARCHAR 30) - Purpose description');
    console.log('   - created_at, created_on, created_by - Audit fields');
    console.log('   - updated_at, updated_on, updated_by - Audit fields');
    console.log('   - status (VARCHAR 10) - Record status (ACTIVE/INACTIVE)');
    
    // Now populate with data
    console.log('\n Populating table with initial data...');
    
    // Get current date and time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format
    
    // Insert seed entries
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
    
    console.log('\n Status Purpose Master table created and populated successfully!');
    
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await db.destroy();
  }
}

createStatusPurposeMasterTable();
