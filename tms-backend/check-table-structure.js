const db = require('./config/database');

async function checkTableStructure() {
  try {
    const columns = await db('document_name_master').columnInfo();
    console.log('\n=== document_name_master Table Structure ===\n');
    Object.entries(columns).forEach(([name, info]) => {
      console.log(`${name}:`);
      console.log(`  Type: ${info.type}`);
      console.log(`  MaxLength: ${info.maxLength}`);
      console.log(`  Nullable: ${info.nullable}`);
      console.log('');
    });
    
    // Get a sample record
    const sample = await db('document_name_master').first();
    console.log('\nSample Record:');
    console.log(JSON.stringify(sample, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.destroy();
  }
}

checkTableStructure();
