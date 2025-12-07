const axios = require('axios');

console.log('Ì¥ç Testing Consignor Document Preview API Endpoints (FIXED)\n');

async function testDocumentPreviewAPIs() {
    try {
        // Step 1: Login as admin user
        console.log('Ì¥ë Step 1: Logging in...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            user_id: 'test1',
            password: 'test456'
        }, { 
            withCredentials: true,
            timeout: 10000
        });
        
        const cookies = loginResponse.headers['set-cookie']?.join('; ') || '';
        console.log('‚úÖ Login successful\n');
        
        // Step 2: Test CUST00001 details endpoint  
        console.log('Ì¥ç Step 2: Fetching CUST00001 details...');
        const detailsResponse = await axios.get('http://localhost:5000/api/consignors/CUST00001', {
            headers: {
                Cookie: cookies
            },
            timeout: 10000
        });
        
        console.log('‚úÖ Consignor details fetched successfully');
        console.log(`Ì≥ã Company: ${detailsResponse.data.data.general.customer_name || 'N/A'}`);
        console.log(`Ì≥Ñ NDA File: ${detailsResponse.data.data.general.upload_nda || 'N/A'}`);
        console.log(`Ì≥Ñ MSA File: ${detailsResponse.data.data.general.upload_msa || 'N/A'}`);
        console.log(`Ì≥Ñ Documents: ${detailsResponse.data.data.documents?.length || 0} found\n`);

        // Step 3: Test our test document download using UNIQUE ID
        console.log('Ì≥Ñ Step 3: Testing our test document download...');
        const testDocResponse = await axios.get(`http://localhost:5000/api/consignors/CUST00001/documents/DOC001/download`, {
            headers: {
                Cookie: cookies
            },
            responseType: 'arraybuffer',
            timeout: 10000,
            validateStatus: () => true
        });
        
        if (testDocResponse.status === 200) {
            console.log('‚úÖ Our test document download working!');
            console.log(`Ì≥¶ Content size: ${testDocResponse.data.byteLength} bytes`);
            console.log(`Ì≥ã Content type: ${testDocResponse.headers['content-type']}`);
            
            // Convert to string and show content
            const content = Buffer.from(testDocResponse.data).toString('utf-8');
            console.log(`Ì≥Ñ File content: "${content.trim()}"`);
        } else {
            console.log(`‚ùå Test document download failed: ${testDocResponse.status}`);
            if (testDocResponse.data) {
                console.log(`Ì≥Ñ Error:`, Buffer.from(testDocResponse.data).toString());
            }
        }

        // Step 4: Test NDA download (these may not work as files don't exist)
        if (detailsResponse.data.data.general.upload_nda) {
            console.log('\nÌ≥Ñ Step 4: Testing NDA download...');
            const ndaResponse = await axios.get('http://localhost:5000/api/consignors/CUST00001/general/nda/download', {
                headers: {
                    Cookie: cookies
                },
                responseType: 'arraybuffer',
                timeout: 10000,
                validateStatus: () => true
            });
            
            if (ndaResponse.status === 200) {
                console.log('‚úÖ NDA download endpoint working');
                console.log(`Ì≥¶ Content size: ${ndaResponse.data.byteLength} bytes`);
                console.log(`Ì≥ã Content type: ${ndaResponse.headers['content-type']}`);
            } else {
                console.log(`‚ùå NDA download failed: ${ndaResponse.status} (expected - file path not valid)`);
            }
        }

        // Step 5: Test MSA download (these may not work as files don't exist)
        if (detailsResponse.data.data.general.upload_msa) {
            console.log('ÔøΩÔøΩ Step 5: Testing MSA download...');
            const msaResponse = await axios.get('http://localhost:5000/api/consignors/CUST00001/general/msa/download', {
                headers: {
                    Cookie: cookies
                },
                responseType: 'arraybuffer',
                timeout: 10000,
                validateStatus: () => true
            });
            
            if (msaResponse.status === 200) {
                console.log('‚úÖ MSA download endpoint working');
                console.log(`Ì≥¶ Content size: ${msaResponse.data.byteLength} bytes`);
                console.log(`Ì≥ã Content type: ${msaResponse.headers['content-type']}`);
            } else {
                console.log(`‚ùå MSA download failed: ${msaResponse.status} (expected - file path not valid)`);
            }
        }
        
        console.log('\nÌæâ API endpoint tests completed!');
        
    } catch (error) {
        console.error('‚ùå API Test failed:', error.response?.status, error.response?.data?.message || error.message);
    }
}

testDocumentPreviewAPIs();
