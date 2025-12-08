
console.log('í´ SEARCHING FOR CONSIGNORS WITH DOCUMENTS');

// Check consignor list first
fetch('http://localhost:5000/api/consignors?page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJfaWQiOiJVUzAwMDEiLCJlbWFpbF9pZCI6InNhY2hpbkBtYXZlbnRpYy5jb20iLCJmaXJzdF9uYW1lIjoiU2FjaGluIiwidXNlcl90eXBlX2lkIjoiVVQwMDQiLCJ1c2VyX3R5cGVfbmFtZSI6Ik1hdmVudGljLVVzZXIiLCJjb21wYW55X2lkIjoiTUFWMDAwMSIsImNvbXBhbnlfbmFtZSI6Ik1hdmVudGljIn0sImlhdCI6MTczODE0NjY4OSwiZXhwIjoxNzM4MzE5NDg5fQ.YnkuGy9zBq-ZAJSlB4yG_jPGZBpFCPrO2b0O1Nc9lAU'
  }
})
.then(response => response.json())
.then(data => {
  console.log('í³‹ Available consignors:', data.data?.length || 0);
  if (data.data) {
    data.data.forEach((consignor, index) => {
      console.log(`  ${index + 1}. ${consignor.customer_id} - ${consignor.customer_name} (Status: ${consignor.status})`);
    });
    
    // Test with the first available consignor
    if (data.data.length > 0) {
      const testId = data.data[0].customer_id;
      console.log(`\ní´ Testing with ${testId}...`);
      
      return fetch(`http://localhost:5000/api/consignors/${testId}`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJfaWQiOiJVUzAwMDEiLCJlbWFpbF9pZCI6InNhY2hpbkBtYXZlbnRpYy5jb20iLCJmaXJzdF9uYW1lIjoiU2FjaGluIiwidXNlcl90eXBlX2lkIjoiVVQwMDQiLCJ1c2VyX3R5cGVfbmFtZSI6Ik1hdmVudGljLVVzZXIiLCJjb21wYW55X2lkIjoiTUFWMDAwMSIsImNvbXBhbnlfbmFtZSI6Ik1hdmVudGljIn0sImlhdCI6MTczODE0NjY4OSwiZXhwIjoxNzM4MzE5NDg5fQ.YnkuGy9zBq-ZAJSlB4yG_jPGZBpFCPrO2b0O1Nc9lAU'
        }
      });
    }
  }
})
.then(response => {
  if (response) {
    return response.json();
  }
})
.then(detailData => {
  if (detailData) {
    console.log('âœ… Detail response received');
    console.log('í³‹ Documents:', detailData.documents?.length || 0, 'items');
    console.log('í±¥ Contacts:', detailData.contacts?.length || 0, 'items');
    
    if (detailData.documents && detailData.documents.length > 0) {
      console.log('í´ Sample document:', {
        file_name: detailData.documents[0].file_name,
        document_id: detailData.documents[0].document_id,
        document_unique_id: detailData.documents[0].document_unique_id,
        status: detailData.documents[0].status
      });
    }
    
    if (detailData.contacts && detailData.contacts.length > 0) {
      console.log('í´ Sample contact:', {
        name: detailData.contacts[0].name || detailData.contacts[0].contact_name,
        contact_id: detailData.contacts[0].contact_id,
        contact_photo: detailData.contacts[0].contact_photo,
        status: detailData.contacts[0].status
      });
    }
  }
})
.catch(error => console.error('âŒ Request failed:', error));

