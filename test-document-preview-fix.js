const axios = require('axios');

async function testDocumentPreviewFix() {
  console.log('íº€ Testing Document Preview API Fix...\n');
  
  try {
    // Login first
    console.log('1ï¸âƒ£ Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@maventic.com',
      password: 'admin123'
    }, {
      withCredentials: true
    });
    
    const cookies = loginResponse.headers['set-cookie'];
    const cookieHeader = cookies.join('; ');
    console.log('âœ… Login successful');
    
    // Get a consignor with documents
    console.log('2ï¸âƒ£ Fetching consignors list...');
    const consignorsResponse = await axios.get('http://localhost:5000/api/consignors', {
      headers: {
        Cookie: cookieHeader
      },
      withCredentials: true
    });
    
    const consignors = consignorsResponse.data.data;
    console.log(`âœ… Found ${consignors.length} consignors`);
    
    if (consignors.length === 0) {
      console.log('âš ï¸ No consignors found to test document preview');
      return;
    }
    
    // Get details of first consignor
    const firstConsignor = consignors[0];
    console.log('3ï¸âƒ£ Fetching consignor details...');
    const detailsResponse = await axios.get(
      `http://localhost:5000/api/consignors/${firstConsignor.customer_id}`,
      {
        headers: { Cookie: cookieHeader },
        withCredentials: true
      }
    );
    
    const consignorDetails = detailsResponse.data.data;
    console.log(`âœ… Retrieved details for ${consignorDetails.general.customer_name}`);
    
    // Check if this consignor has documents
    if (!consignorDetails.documents || consignorDetails.documents.length === 0) {
      console.log('âš ï¸ No documents found for this consignor');
      return;
    }
    
    console.log(`í³„ Found ${consignorDetails.documents.length} documents`);
    
    // Test document download with first document
    const firstDocument = consignorDetails.documents[0];
    console.log('4ï¸âƒ£ Testing document download...');
    console.log('Document info:', {
      documentUniqueId: firstDocument.documentUniqueId,
      documentId: firstDocument.documentId,
      fileName: firstDocument.fileName,
      fileType: firstDocument.fileType
    });
    
    // Test with documentUniqueId (correct field)
    if (firstDocument.documentUniqueId) {
      try {
        const downloadResponse = await axios.get(
          `http://localhost:5000/api/consignors/${consignorDetails.general.customer_id}/documents/${firstDocument.documentUniqueId}/download`,
          {
            headers: { Cookie: cookieHeader },
            withCredentials: true,
            responseType: 'arraybuffer'
          }
        );
        
        console.log('âœ… Document download successful with documentUniqueId!');
        console.log(`í³ File size: ${downloadResponse.data.length} bytes`);
        console.log('í¾‰ Document preview fix is working correctly!');
        
      } catch (error) {
        console.log(`âŒ Document download failed: ${error.response?.status} ${error.response?.statusText}`);
        console.log('Error details:', error.response?.data?.toString());
      }
    } else {
      console.log('âš ï¸ Document missing documentUniqueId field');
    }
    
  } catch (error) {
    console.error('âŒ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDocumentPreviewFix()
  .then(() => {
    console.log('\nâœ… Document preview fix test completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\nâŒ Test failed:', error);
    process.exit(1);
  });
