const db = require('./config/database');

async function checkAllIds() {
  const docs = await db('document_name_master')
    .select('doc_name_master_id', 'document_name')
    .orderBy('doc_name_master_unique_id');
  
  console.log('\nAll document IDs:');
  docs.forEach(doc => {
    console.log(`  ${doc.doc_name_master_id} - ${doc.document_name}`);
  });
  
  // Find max numeric ID
  const numericIds = docs
    .map(d => {
      const match = d.doc_name_master_id.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    })
    .filter(n => !isNaN(n));
    
  const maxId = Math.max(...numericIds);
  console.log(`\nMax numeric ID: ${maxId}`);
  console.log(`Next ID should be: DN${String(maxId + 1).padStart(3, '0')}`);
  
  await db.destroy();
}

checkAllIds();
