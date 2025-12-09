const axios = require('axios');

console.log('��� Testing Consignor Document Preview API Endpoints\n');

async function testDocumentPreviewAPIs() {
    try {
        // Step 1: Login as admin user
        console.log('��� Step 1: Logging in...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            user_id: 'test1',
            password: 'test456'
        }, { 
            withCredentials: true,
            timeout: 10000
        });
        
        const cookies = loginResponse.headers['set-cookie']?.join('; ') || '';
        console.log('✅ Login successful\n');
        
        // Step 2: Test CUST00001 details endpoint  
        console.log('��� Step 2: Fetching CUST00001 details...');
        const detailsResponse = await axios.get('http://localhost:5000/api/consignors/CUST00001', {
            headers: {
                Cookie: cookies
            },
            timeout: 10000
        });
        
        console.log('✅ Consignor details fetched successfully');
        console.log(`��� Company: ${detailsResponse.data.data.general.customer_name || 'N/A'}`);
        console.log(`��� NDA File: ${detailsResponse.data.data.general.upload_nda || 'N/A'}`);
        console.log(`��� MSA File: ${detailsResponse.data.data.general.upload_msa || 'N/A'}`);
        console.log(`��� Documents: ${detailsResponse.data.data.documents?.length || 0} found\n`);

        // Step 3: Test NDA download
        if (detailsResponse.data.data.general.upload_nda) {
            console.log('��� Step 3: Testing NDA download...');
            const ndaResponse = await axios.get('http://localhost:5000/api/consignors/CUST00001/general/nda/download', {
                headers: {
                    Cookie: cookies
                },
                responseType: 'arraybuffer',
                timeout: 10000,
                validateStatus: () => true
            });
            
            if (ndaResponse.status === 200) {
                console.log('✅ NDA download endpoint working');
                console.log(`��� Content size: ${ndaResponse.data.byteLength} bytes`);
                console.log(`��� Content type: ${ndaResponse.headers['content-type']}`);
            } else {
                console.log(`❌ NDA download failed: ${ndaResponse.status}`);
            }
        } else {
            console.log('⏭️  Step 3: No NDA file to test');
        }

        // Step 4: Test MSA download
        if (detailsResponse.data.data.general.upload_msa) {
            console.log('��� Step 4: Testing MSA download...');
            const msaResponse = await axios.get('http://localhost:5000/api/consignors/CUST00001/general/msa/download', {
                headers: {
                    Cookie: cookies
                },
                responseType: 'arraybuffer',
                timeout: 10000,
                validateStatus: () => true
            });
            
            if (msaResponse.status === 200) {
                console.log('✅ MSA download endpoint working');
                console.log(`��� Content size: ${msaResponse.data.byteLength} bytes`);
                console.log(`��� Content type: ${msaResponse.headers['content-type']}`);
            } else {
                console.log(`❌ MSA download failed: ${msaResponse.status}`);
            }
        } else {
            console.log('⏭️  Step 4: No MSA file to test');
        }

        // Step 5: Test regular document download
        if (detailsResponse.data.data.documents?.length > 0) {
            console.log('��� Step 5: Testing regular document download...');
            const firstDoc = detailsResponse.data.data.documents[0];
            console.log(`Testing document: ${firstDoc.fileName || 'unnamed'} (ID: ${firstDoc.documentId})`);
            
            const docResponse = await axios.get(`http://localhost:5000/api/consignors/CUST00001/documents/${firstDoc.documentId}/download`, {
                headers: {
                    Cookie: cookies
                },
                responseType: 'arraybuffer',
                timeout: 10000,
                validateStatus: () => true
            });
            
            if (docResponse.status === 200) {
                console.log('✅ Regular document download endpoint working');
                console.log(`��� Content size: ${docResponse.data.byteLength} bytes`);
                console.log(`��� Content type: ${docResponse.headers['content-type']}`);
            } else {
                console.log(`❌ Regular document download failed: ${docResponse.status}`);
                if (docResponse.data) {
                    console.log(`��� Error data:`, Buffer.from(docResponse.data).toString());
                }
            }
        } else {
            console.log('⏭️  Step 5: No regular documents to test');
        }
        
        console.log('\n��� All API tests completed!');
        
    } catch (error) {
        console.error('❌ API Test failed:', error.response?.status, error.response?.data?.message || error.message);
    }
}

testDocumentPreviewAPIs();
