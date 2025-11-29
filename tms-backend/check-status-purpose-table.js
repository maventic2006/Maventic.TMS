const db = require('./config/database');

async function checkStatusPurposeTable() {
  try {
    console.log(' Checking if status_purpose_master table exists...');
    
    // Check if table exists
    const tableExists = await db.schema.hasTable('status_purpose_master');
    console.log('Table exists:', tableExists);
    
    if (tableExists) {
      console.log(' Table structure:');
      const columns = await db('status_purpose_master').columnInfo();
      console.table(columns);
      
      console.log(' Current data:');
      const data = await db('status_purpose_master').select('*');
      console.table(data);
      
      console.log(` Found ${data.length} records in status_purpose_master`);
    } else {
      console.log(' Table does not exist - will create directly');
    }
    
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await db.destroy();
  }
}

checkStatusPurposeTable();
