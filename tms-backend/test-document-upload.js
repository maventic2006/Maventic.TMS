const http = require('http');

// Sample base64 encoded test PDF
const samplePDFBase64 = 'JVBERi0xLjMKJeLjz9MKMSAwIG9iaiA8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmogPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPJ4KZW5kb2JqCjMgMCBvYmogPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmogPDwKL0xlbmd0aCAyNAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjEwMCA3MDAgVGQKKFRlc3QpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNzQgMDAwMDAgbiAKMDAwMDAwMDEzMyAwMDAwMCBuIAowMDAwMDAwMjM2IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMzA4CiUlRU9GCg==';

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testDocumentUpload() {
  try {
    console.log('\n========================================');
    console.log('Testing Vehicle Document Upload');
    console.log('========================================\n');
    
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      username: 'testuser',
      password: 'Test@1234'
    });
    
    if (loginResponse.status !== 200) {
      throw new Error('Login failed: ' + JSON.stringify(loginResponse.data));
    }
    
    const token = loginResponse.data.token;
    console.log(' Login successful\n');
    
    // Step 2: Create vehicle with document
    console.log('2. Creating vehicle with document...');
    const timestamp = Date.now();
    const vehicleData = {
      basicInformation: {
        maker_brand_description: 'Test Brand',
        maker_model: 'Test Model 2024',
        vin_chassis_no: 'TEST' + timestamp,
        vehicle_type_id: 1,
        vehicle_category: 'HEAVY',
        vehicle_class_description: 'Commercial',
        vehicle_registered_at: 'Test Location',
        usage_type_id: 'CARGO'
      },
      specifications: {
        engine_type_id: 'DIESEL',
        engine_number: 'ENG' + timestamp,
        fuel_type_id: 'DIESEL',
        transmission_type: 'MANUAL',
        financer: 'Test Bank',
        suspension_type: 'LEAF_SPRING',
        emission_standard: 'BS6'
      },
      capacityDetails: {
        unloading_weight: 3000,
        gross_vehicle_weight_kg: 5000,
        volume_capacity_cubic_meter: 20,
        seating_capacity: 2
      },
      documents: [
        {
          documentType: 'RC',
          referenceNumber: 'RC' + timestamp,
          documentProvider: 'RTO Test',
          coverageType: 'FULL',
          premiumAmount: 5000,
          validFrom: '2024-01-01',
          validTo: '2025-12-31',
          remarks: 'Test document upload',
          fileName: 'test-document.pdf',
          fileType: 'application/pdf',
          fileData: samplePDFBase64
        }
      ]
    };
    
    const createResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/vehicle',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, vehicleData);
    
    if (createResponse.status !== 201) {
      throw new Error('Create failed: ' + JSON.stringify(createResponse.data));
    }
    
    const vehicleId = createResponse.data.data.vehicleId;
    console.log(` Vehicle created: ${vehicleId}\n`);
    
    // Step 3: Retrieve vehicle
    console.log('3. Retrieving vehicle...');
    const detailsResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/vehicle/${vehicleId}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const documents = detailsResponse.data.data.documents;
    console.log(` Retrieved successfully`);
    console.log(`   Documents: ${documents.length}\n`);
    
    if (documents.length > 0) {
      console.log('Document Details:');
      documents.forEach((doc, i) => {
        console.log(`   ${i + 1}. Type: ${doc.documentType}`);
        console.log(`      Reference: ${doc.referenceNumber}`);
        console.log(`      File: ${doc.fileName || 'N/A'}`);
        console.log(`      Has Data: ${doc.fileData ? 'YES ' : 'NO '}`);
      });
    }
    
    console.log('\n========================================');
    console.log(' TEST PASSED!');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('\n TEST FAILED:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testDocumentUpload();
