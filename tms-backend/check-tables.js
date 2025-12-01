const db = require('./config/database');

async function checkTables() {
  try {
    const result = await db.raw('SHOW TABLES');
    const allTables = result[0].map(row => Object.values(row)[0]);
    
    console.log('Consignor configuration tables:');
    allTables.filter(table => 
      table.includes('consignor') && table.includes('config')
    ).forEach(table => console.log(' -', table));
    
    console.log('\nTesting consignor_general_config_master:');
    const data = await db('consignor_general_config_master').select('*').limit(3);
    console.log(`Found ${data.length} records`);
    if (data.length > 0) {
      console.log('Sample record:', JSON.stringify(data[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
}

checkTables();