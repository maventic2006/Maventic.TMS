/**
 * COMPREHENSIVE DOCUMENT PREVIEW FIX VERIFICATION
 */ 

const axios = require('axios');

async function testDocumentPreviewFix() {
  console.log('Ì¥ß DOCUMENT PREVIEW FIX VERIFICATION');
  
  try {
    // Test with CSG0002 consignor 
    const response = await axios.get('http://localhost:5000/api/consignors/CSG0002', {
      headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJfaWQiOiJVUzAwMDEiLCJlbWFpbF9pZCI6InNhY2hpbkBtYXZlbnRpYy5jb20iLCJmaXJzdF9uYW1lIjoiU2FjaGluIiwidXNlcl90eXBlX2lkIjoiVVQwMDQiLCJ1c2VyX3R5cGVfbmFtZSI6Ik1hdmVudGljLVVzZXIiLCJjb21wYW55X2lkIjoiTUFWMDAwMSIsImNvbXBhbnlfbmFtZSI6Ik1hdmVudGljIn0sImlhdCI6MTczODE0NjY4OSwiZXhwIjoxNzM4MzE5NDg5fQ.YnkuGy9zBq-ZAJSlB4yG_jPGZBpFCPrO2b0O1Nc9lAU' }
    });

    console.log('Documents found:', response.data.documents.length);
    
    if (response.data.documents.length > 0) {
      const doc = response.data.documents[0];
      console.log('Testing document:', {
        fileName: doc.file_name,
        documentId: doc.document_id,
        documentUniqueId: doc.document_unique_id,
        status: doc.status
      });
      
      // Test document download with document_unique_id
      if (doc.document_unique_id) {
        const downloadUrl = `http://localhost:5000/api/consignors/CSG0002/documents/${doc.document_unique_id}/download`;
        console.log('Testing download URL:', downloadUrl);
        
        const downloadResponse = await axios.get(downloadUrl, {
          headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJfaWQiOiJVUzAwMDEiLCJlbWFpbF9pZCI6InNhY2hpbkBtYXZlbnRpYy5jb20iLCJmaXJzdF9uYW1lIjoiU2FjaGluIiwidXNlcl90eXBlX2lkIjoiVVQwMDQiLCJ1c2VyX3R5cGVfbmFtZSI6Ik1hdmVudGljLVVzZXIiLCJjb21wYW55X2lkIjoiTUFWMDAwMSIsImNvbXBhbnlfbmFtZSI6Ik1hdmVudGljIn0sImlhdCI6MTczODE0NjY4OSwiZXhwIjoxNzM4MzE5NDg5fQ.YnkuGy9zBq-ZAJSlB4yG_jPGZBpFCPrO2b0O1Nc9lAU' },
          responseType: 'arraybuffer'
        });
        
        console.log('‚úÖ Download successful!');
        console.log('Content-Type:', downloadResponse.headers['content-type']);
        console.log('File size:', downloadResponse.data.length, 'bytes');
      }
    }
    
  } catch (error) {
    console.error('‚ùå Test failed:', error.response?.data || error.message);
  }
}

testDocumentPreviewFix();
