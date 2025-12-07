/**
 * Test script to check the actual API response structure for consignor documents
 */

const axios = require('axios');

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

async function testConsignorAPI() {
  try {
    // Test with a known consignor ID that has documents
    const customerId = 'CON0001'; // Adjust this ID as needed
    
    console.log('Ì¥ç Testing API response for customer:', customerId);
    
    const response = await axios.get(`${API_URL}/api/consignors/${customerId}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });

    if (response.data.success) {
      console.log('\n‚úÖ API Response Structure:');
      console.log('Ì≥ã General Section:', Object.keys(response.data.data.general || {}));
      console.log('Ì≥ã General approved_date:', response.data.data.general?.approved_date);
      console.log('Ì≥ã General nda_validity:', response.data.data.general?.nda_validity);
      console.log('Ì≥ã General msa_validity:', response.data.data.general?.msa_validity);
      
      console.log('\nÌ≥Ñ Documents Section:');
      console.log('Ì≥ã Documents count:', (response.data.data.documents || []).length);
      
      if (response.data.data.documents && response.data.data.documents.length > 0) {
        console.log('Ì≥ã First Document Structure:', Object.keys(response.data.data.documents[0]));
        console.log('Ì≥ã First Document:', JSON.stringify(response.data.data.documents[0], null, 2));
      } else {
        console.log('‚ö†Ô∏è  No documents found for this consignor');
      }
      
      console.log('\nÔøΩÔøΩ Contacts Section:');
      console.log('Ì≥ã Contacts count:', (response.data.data.contacts || []).length);
      
      if (response.data.data.contacts && response.data.data.contacts.length > 0) {
        console.log('Ì≥ã First Contact Structure:', Object.keys(response.data.data.contacts[0]));
      }
      
    } else {
      console.error('‚ùå API Error:', response.data.error);
    }

  } catch (error) {
    console.error('‚ùå Request failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testConsignorAPI();
