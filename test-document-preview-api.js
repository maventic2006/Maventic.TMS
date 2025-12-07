const axios = require('axios');

console.log('Ì¥ç Testing Consignor Document Preview API Endpoints\n');

async function testDocumentPreviewAPIs() {
    try {
        // Step 1: Login as admin user
        console.log('Ì¥ë Step 1: Logging in...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            userId: 'test1',
            password: 'test456'
        }, { 
            withCredentials: true,
            timeout: 10000
        });
        
        const cookies = loginResponse.headers['set-cookie']?.join('; ') || '';
        console.log('‚úÖ Login successful\n');
        
        // Step 2: Test CUST00001 details endpoint  
        console.log('Ì≥ã Step 2: Fetching CUST00001 details...');
        const detailsResponse = await axios.get('http://localhost:5000/api/consignors/CUST00001', {
            headers: { Cookie: cookies },
            withCredentials: true
        });
        
        const consignor = detailsResponse.data.data;
        console.log('Ì≥ä CUST00001 Details:');
        console.log('  Name:', consignor.customer_name);
        console.log('  NDA Document ID:', consignor.upload_nda || 'None');
        console.log('  MSA Document ID:', consignor.upload_msa || 'None');
        console.log('  Regular Documents Count:', consignor.documents?.length || 0);
        
        // Step 3: Test NDA download endpoint
        if (consignor.upload_nda) {
            console.log('\nÌ¥ç Step 3: Testing NDA download endpoint...');
            try {
                const ndaResponse = await axios.get(
                    `http://localhost:5000/api/consignors/CUST00001/general/nda/download`,
                    { 
                        headers: { Cookie: cookies },
                        withCredentials: true,
                        responseType: 'arraybuffer',
                        timeout: 5000
                    }
                );
                console.log('‚úÖ NDA endpoint working - Content-Type:', ndaResponse.headers['content-type']);
                console.log('  File size:', ndaResponse.data.byteLength, 'bytes');
            } catch (ndaError) {
                console.log('‚ùå NDA endpoint error:', ndaError.response?.status || ndaError.message);
            }
        }
        
        // Step 4: Test MSA download endpoint
        if (consignor.upload_msa) {
            console.log('\nÌ¥ç Step 4: Testing MSA download endpoint...');
            try {
                const msaResponse = await axios.get(
                    `http://localhost:5000/api/consignors/CUST00001/general/msa/download`,
                    { 
                        headers: { Cookie: cookies },
                        withCredentials: true,
                        responseType: 'arraybuffer',
                        timeout: 5000
                    }
                );
                console.log('‚úÖ MSA endpoint working - Content-Type:', msaResponse.headers['content-type']);
                console.log('  File size:', msaResponse.data.byteLength, 'bytes');
            } catch (msaError) {
                console.log('‚ùå MSA endpoint error:', msaError.response?.status || msaError.message);
            }
        }
        
        // Step 5: Test regular document download endpoint
        if (consignor.documents && consignor.documents.length > 0) {
            const firstDoc = consignor.documents[0];
            console.log('\nÌ¥ç Step 5: Testing regular document download endpoint...');
            console.log('  Testing document:', firstDoc.documentId);
            try {
                const docResponse = await axios.get(
                    `http://localhost:5000/api/consignors/CUST00001/documents/${firstDoc.documentId}/download`,
                    { 
                        headers: { Cookie: cookies },
                        withCredentials: true,
                        responseType: 'arraybuffer',
                        timeout: 5000
                    }
                );
                console.log('‚úÖ Document endpoint working - Content-Type:', docResponse.headers['content-type']);
                console.log('  File size:', docResponse.data.byteLength, 'bytes');
            } catch (docError) {
                console.log('‚ùå Document endpoint error:', docError.response?.status || docError.message);
            }
        }
        
        console.log('\nÌæâ API Testing Complete!');
        console.log('Ì≤ª Test in browser at: http://localhost:5175/consignor/CUST00001');
        
    } catch (error) {
        console.error('‚ùå Test failed:', error.message);
        if (error.response) {
            console.error('Ì≥ã Response status:', error.response.status);
            console.error('Ì≥ã Response data:', error.response.data);
        }
    }
}

testDocumentPreviewAPIs();
