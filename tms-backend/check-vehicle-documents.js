const knex = require('./config/database');

async function checkDocuments() {
  try {
    const documents = await knex('document_name_master')
      .select('*')
      .orderBy('document_name');
    
    console.log('\n=== Document Name Master Table ===');
    console.log('Total documents:', documents.length);
    console.log('\nDocuments by User Type:\n');
    
    const groupedByType = {};
    documents.forEach(doc => {
      if (!groupedByType[doc.user_type]) {
        groupedByType[doc.user_type] = [];
      }
      groupedByType[doc.user_type].push(doc.document_name);
    });
    
    Object.keys(groupedByType).sort().forEach(userType => {
      console.log(${userType}:);
      groupedByType[userType].forEach(name => {
        console.log(  - );
      });
      console.log('');
    });
    
    // Check for vehicle-related documents
    const vehicleKeywords = ['AIP', 'Permit', 'Insurance', 'PUC', 'Fitness', 'Tax', 'Warranty', 'Service', 'Leasing'];
    console.log('=== Checking for Vehicle Documents ===');
    vehicleKeywords.forEach(keyword => {
      const found = documents.filter(doc => 
        doc.document_name.toLowerCase().includes(keyword.toLowerCase())
      );
      if (found.length > 0) {
        console.log( : Found);
        found.forEach(doc => console.log(  - ));
      } else {
        console.log( : NOT FOUND);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await knex.destroy();
  }
}

checkDocuments();
