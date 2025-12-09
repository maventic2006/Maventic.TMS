// Test draft edit data rehydration logic
const mockBackendResponse = {
  general: {
    customer_id: 'CON0059',
    customer_name: 'tribhuwan',
    search_term: 'test',
    industry_type: 'Retail',
    currency_type: 'INR',
    payment_term: 'IMMEDIATE',
    upload_nda: 'DU000123', // Existing NDA document ID
    upload_msa: 'DU000124', // Existing MSA document ID
    status: 'SAVE_AS_DRAFT'
  },
  contacts: [
    {
      contact_id: 'CON00202',
      name: 'John Doe',
      number: '8765432347', // This should be preserved
      email: 'john@example.com'
    }
  ],
  organization: {
    company_code: 'TEST123',
    business_area: ['Area1', 'Area2']
  },
  documents: [
    {
      documentType: 'PAN',
      documentNumber: '123456',
      fileName: 'pan.pdf'
    }
  ]
};

console.log('Ì∑™ Testing Draft Edit Data Rehydration');
console.log('');

// Simulate Redux flattening
const { general, contacts, organization, documents } = mockBackendResponse;
const flattenedData = {
  ...general,
  contacts,
  organization, 
  documents
};

console.log('1Ô∏è‚É£ Redux flattened data:');
console.log('   upload_nda:', flattenedData.upload_nda);
console.log('   upload_msa:', flattenedData.upload_msa);
console.log('   contact number:', flattenedData.contacts[0]?.number);

// Simulate ConsignorDetailsPage transformation
const { contacts: c, organization: o, documents: d, userApprovalStatus, ...generalFields } = flattenedData;
const transformedData = {
  general: generalFields,
  contacts: c || [],
  organization: o || {},
  documents: d || []
};

console.log('');
console.log('2Ô∏è‚É£ Transformed for edit mode:');
console.log('   general.upload_nda:', transformedData.general?.upload_nda);
console.log('   general.upload_msa:', transformedData.general?.upload_msa);
console.log('   contacts[0].number:', transformedData.contacts[0]?.number);

console.log('');
console.log('‚úÖ Results:');
console.log('   NDA document preserved:', !!transformedData.general?.upload_nda);
console.log('   MSA document preserved:', !!transformedData.general?.upload_msa);
console.log('   Phone number preserved:', !!transformedData.contacts[0]?.number);
console.log('   Data types correct:', typeof transformedData.general?.upload_nda);
