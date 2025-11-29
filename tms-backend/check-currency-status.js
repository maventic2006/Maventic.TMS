const db = require('./config/database');

async function checkCurrencyStatus() {
  try {
    console.log(' Checking all currency records with their status:');
    
    const allRecords = await db('currency_master')
      .select('currency_id', 'currency', 'status', 'updated_by', 'updated_at')
      .orderBy('currency_id');
    
    console.log(' All currency records:');
    console.table(allRecords);
    
    console.log('\n ACTIVE records:');
    const activeRecords = allRecords.filter(r => r.status === 'ACTIVE');
    console.table(activeRecords);
    
    console.log('\n INACTIVE (soft-deleted) records:');
    const inactiveRecords = allRecords.filter(r => r.status === 'INACTIVE');
    console.table(inactiveRecords);
    
    console.log('\n Summary:');
    console.log(`Total records: ${allRecords.length}`);
    console.log(`ACTIVE records: ${activeRecords.length}`);
    console.log(`INACTIVE records: ${inactiveRecords.length}`);
    
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await db.destroy();
  }
}

checkCurrencyStatus();
