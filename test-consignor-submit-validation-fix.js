/**
 * Test script to verify consignor draft submission validation fix
 * Tests the exact payload that was causing validation errors
 */

const axios = require('axios');

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

// Exact payload from user's error
const testPayload = {
  "general": {
    "customer_id": "CON0062",
    "customer_name": "tribuwna7878``",
    "search_term": "gjlhg", 
    "industry_type": "Retail",
    "currency_type": "INR",
    "payment_term": "NET_90",
    "remark": "kjhgfddfghmnb",
    "website_url": null,
    "name_on_po": "nbvcxasdfgh",
    "approved_by": "oiuytykj",
    "approved_date": "2025-09-08",
    "upload_nda": null,
    "upload_msa": null,
    "status": "SAVE_AS_DRAFT"
  },
  "contacts": [
    {
      "contact_id": "CON00206",
      "designation": "wertyiuyt",
      "name": "oiuytyuijhjkj",
      "number": "8765434876",
      "email": "mnbvcvb@gmail.com",
      "linkedin_link": "",
      "team": "",
      "role": "oiuerty",
      "status": "Active",
      "country_code": "",
      "photo": null
    }
  ],
  "organization": {
    "company_code": "OIUY654",
    "business_area": [
      "Andhra Pradesh",
      "Arunachal Pradesh"
    ],
    "status": "Active"  // ‚ùå This was causing "Status must be a boolean value"
  },
  "documents": [
    {
      "documentType": "Any License",
      "documentNumber": "7654345", 
      "referenceNumber": "",
      "country": "",
      "validFrom": "2025-08-18",
      "validTo": "2026-04-13",
      "status": "ACTIVE", // ‚ùå This was causing "Status must be a boolean value"
      "fileName": "ChatGPT Image Oct 11, 2025, 07_18_07 PM (1).png",
      "fileType": "image/png",
      "fileData": "",
      "_backend_document_id": "DU000591", // ‚ùå This was "not allowed"
      "_backend_document_unique_id": "CDOC00224", // ‚ùå This was "not allowed"
      "fileKey": null
    }
  ]
};

async function testConsignorSubmitValidation() {
  try {
    console.log('Ì∑™ Testing consignor submit validation fix...');
    console.log('Ì≥¶ Test payload:');
    console.log('  - organization.status:', testPayload.organization.status, '(should be converted to ACTIVE)');
    console.log('  - documents[0].status:', testPayload.documents[0].status, '(should be converted to boolean)');
    console.log('  - documents[0]._backend_document_id:', testPayload.documents[0]._backend_document_id, '(should be allowed)');
    console.log('  - documents[0]._backend_document_unique_id:', testPayload.documents[0]._backend_document_unique_id, '(should be allowed)');
    
    // Test API call (we'll check response for validation errors)
    const response = await axios.put(
      `${API_URL}/api/consignors/CON0062/submit-draft`, 
      testPayload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      }
    );
    
    if (response.data.success) {
      console.log('\n‚úÖ SUCCESS: No validation errors detected!');
      console.log('Ì≥ã Response:', response.data);
    } else {
      console.log('\n‚ùå FAILURE: Still has validation errors');
      console.log('Ì≥ã Error:', response.data.error);
    }
    
  } catch (error) {
    console.log('\nÌ¥ç Response Analysis:');
    
    if (error.response && error.response.data && error.response.data.error) {
      const errorData = error.response.data.error;
      
      if (errorData.type === 'VALIDATION_ERROR') {
        console.log('‚ùå VALIDATION ERRORS STILL EXIST:');
        errorData.details.forEach((detail, index) => {
          console.log(`  ${index + 1}. ${detail.message}`);
          console.log(`     Path: ${detail.path ? detail.path.join('.') : 'unknown'}`);
        });
        
        // Check if our specific errors are fixed
        const statusErrors = errorData.details.filter(d => 
          d.message.includes('Status must be a boolean value')
        );
        const backendFieldErrors = errorData.details.filter(d => 
          d.message.includes('_backend_document') && d.message.includes('not allowed')
        );
        
        if (statusErrors.length === 0) {
          console.log('\n‚úÖ FIXED: Status validation errors resolved!');
        } else {
          console.log('\n‚ùå NOT FIXED: Status validation errors still exist');
        }
        
        if (backendFieldErrors.length === 0) {
          console.log('‚úÖ FIXED: Backend document field errors resolved!');
        } else {
          console.log('‚ùå NOT FIXED: Backend document field errors still exist');
        }
        
      } else {
        console.log('‚úÖ FIXED: No validation errors (different error type)');
        console.log('Ì≥ã Error type:', errorData.type || 'unknown');
        console.log('ÔøΩÔøΩ Error message:', errorData.message || 'unknown');
      }
    } else {
      console.log('‚ö†Ô∏è  Network/connection error:', error.message);
    }
  }
}

testConsignorSubmitValidation();
