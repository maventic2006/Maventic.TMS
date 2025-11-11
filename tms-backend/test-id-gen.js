const db = require('./config/database');

async function testIdGeneration() {
  const lastDoc = await db('document_name_master')
    .orderBy('doc_name_master_unique_id', 'desc')
    .first();

  console.log('Last document:', lastDoc);
  
  const lastIdNumber = lastDoc 
    ? parseInt(lastDoc.doc_name_master_id.replace('DOC', ''))
    : 15;
    
  console.log('Last ID number:', lastIdNumber);
  console.log('Start ID:', lastIdNumber + 1);
  console.log('Generated IDs:');
  
  for (let i = 0; i < 6; i++) {
    const id = `DOC${String(lastIdNumber + 1 + i).padStart(3, '0')}`;
    console.log(`  ${i + 1}. ${id}`);
  }
  
  await db.destroy();
}

testIdGeneration();
