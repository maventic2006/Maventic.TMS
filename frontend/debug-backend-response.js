
console.log('í´ DEBUGGING DOCUMENT PREVIEW ISSUE');

// Check if both frontend and backend are running
fetch('http://localhost:5000/api/consignors/CSG0002', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJfaWQiOiJVUzAwMDEiLCJlbWFpbF9pZCI6InNhY2hpbkBtYXZlbnRpYy5jb20iLCJmaXJzdF9uYW1lIjoiU2FjaGluIiwidXNlcl90eXBlX2lkIjoiVVQwMDQiLCJ1c2VyX3R5cGVfbmFtZSI6Ik1hdmVudGljLVVzZXIiLCJjb21wYW55X2lkIjoiTUFWMDAwMSIsImNvbXBhbnlfbmFtZSI6Ik1hdmVudGljIn0sImlhdCI6MTczODE0NjY4OSwiZXhwIjoxNzM4MzE5NDg5fQ.YnkuGy9zBq-ZAJSlB4yG_jPGZBpFCPrO2b0O1Nc9lAU'
  }
})
.then(response => response.json())
.then(data => {
  console.log('âœ… Backend response received');
  console.log('í³‹ Documents:', data.documents?.length || 0, 'items');
  if (data.documents && data.documents.length > 0) {
    console.log('í´ First document:', {
      file_name: data.documents[0].file_name,
      document_id: data.documents[0].document_id,
      document_unique_id: data.documents[0].document_unique_id,
      status: data.documents[0].status
    });
  }
  
  console.log('í±¥ Contacts:', data.contacts?.length || 0, 'items');
  if (data.contacts && data.contacts.length > 0) {
    console.log('í´ First contact:', {
      name: data.contacts[0].name || data.contacts[0].contact_name,
      contact_id: data.contacts[0].contact_id,
      contact_photo: data.contacts[0].contact_photo,
      status: data.contacts[0].status
    });
  }
})
.catch(error => console.error('âŒ Backend request failed:', error));

