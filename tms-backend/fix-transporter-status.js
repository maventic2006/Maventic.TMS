const knex = require('./config/database');

async function fixTransporterStatus() {
  try {
    console.log(' Fixing transporter_general_info.status field length...');
    
    // Check current column definition
    const result = await knex.raw(
      `SELECT COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tms_dev' AND TABLE_NAME = 'transporter_general_info' AND COLUMN_NAME = 'status'`
    );
    
    console.log(' Current status column:', result[0][0]);
    
    // Alter the column
    await knex.raw(
      `ALTER TABLE transporter_general_info MODIFY COLUMN status VARCHAR(30) DEFAULT 'ACTIVE'`
    );
    
    console.log(' transporter_general_info.status field length increased to VARCHAR(30)');
    console.log(' Now supports: ACTIVE, INACTIVE, SAVE_AS_DRAFT, Pending, Approved, Rejected');
    
    // Verify the change
    const verifyResult = await knex.raw(
      `SELECT COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tms_dev' AND TABLE_NAME = 'transporter_general_info' AND COLUMN_NAME = 'status'`
    );
    
    console.log(' Updated status column:', verifyResult[0][0]);
    console.log(' Migration complete!');
    
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
}

fixTransporterStatus();
