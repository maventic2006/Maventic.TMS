const db = require('./config/database');

async function checkVehicleDocuments() {
  try {
    console.log('\n=== VEHICLE DOCUMENT VERIFICATION ===\n');
    
    const requiredDocs = [
      'AIP',
      'Temp Vehicle Permit',
      'Vehicle Insurance',
      'PUC certificate',
      'Permit certificate',
      'Fitness Certificate',
      'Tax Certificate',
      'Vehicle Warranty',
      'Vehicle Service Bill',
      'Leasing Agreement'
    ];
    
    const existingDocs = await db('document_name_master')
      .select('document_name', 'doc_name_master_id', 'user_type')
      .orderBy('document_name');
    
    console.log('Current Documents in Database:');
    console.log('-'.repeat(60));
    existingDocs.forEach(doc => {
      console.log(` ${doc.document_name} (${doc.user_type})`);
    });
    
    console.log('\n\nRequired Vehicle Documents - Status Check:');
    console.log('-'.repeat(60));
    
    const missing = [];
    requiredDocs.forEach(required => {
      const found = existingDocs.find(doc => 
        doc.document_name.toLowerCase().trim() === required.toLowerCase().trim()
      );
      
      if (found) {
        console.log(` ${required} - FOUND (${found.user_type})`);
      } else {
        console.log(` ${required} - MISSING`);
        missing.push(required);
      }
    });
    
    console.log('\n\nSummary:');
    console.log('-'.repeat(60));
    console.log(`Total Required: ${requiredDocs.length}`);
    console.log(`Found: ${requiredDocs.length - missing.length}`);
    console.log(`Missing: ${missing.length}`);
    
    if (missing.length > 0) {
      console.log('\n  Missing Documents:');
      missing.forEach(doc => console.log(`   - ${doc}`));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.destroy();
  }
}

checkVehicleDocuments();
