/**
 * Test script to get detailed response from consignor draft submission
 */

const axios = require('axios');

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

// Test payload
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
    "status": "Active"
  },
  "documents": [
    {
      "documentType": "Any License",
      "documentNumber": "7654345", 
      "referenceNumber": "",
      "country": "",
      "validFrom": "2025-08-18",
      "validTo": "2026-04-13",
      "status": "ACTIVE",
      "fileName": "ChatGPT Image Oct 11, 2025, 07_18_07 PM (1).png",
      "fileType": "image/png",
      "fileData": "",
      "_backend_document_id": "DU000591",
      "_backend_document_unique_id": "CDOC00224",
      "fileKey": null
    }
  ]
};

async function testDetailedResponse() {
  try {
    console.log('Ì∑™ Testing detailed consignor submit response...');
    
    const response = await axios.put(
      `${API_URL}/api/consignors/CON0062/submit-draft`, 
      testPayload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
        timeout: 10000
      }
    );
    
    console.log('\n‚úÖ SUCCESS Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\nÌ≥ã Full Error Response:');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received. Request:', error.request);
    } else {
      console.log('Error message:', error.message);
    }
    
    console.log('\nÌ¥ç Error analysis:');
    console.log('Error code:', error.code);
    console.log('Error name:', error.name);
  }
}

testDetailedResponse();
