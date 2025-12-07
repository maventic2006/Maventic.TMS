console.log('Ì∑™ Testing Login and Finding Consignor with Documents');

async function testLoginAndFindConsignor() {
    try {
        // Login first
        console.log('1. Logging in...');
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: 'test1',
                password: 'test456'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }

        const loginData = await loginResponse.json();
        console.log('‚úÖ Login successful');

        // Get consignors
        console.log('2. Fetching consignors...');
        const consignorsResponse = await fetch('http://localhost:5000/api/consignors', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!consignorsResponse.ok) {
            throw new Error(`Failed to get consignors: ${consignorsResponse.status}`);
        }

        const consignorsData = await consignorsResponse.json();
        console.log(`‚úÖ Found ${consignorsData.data.length} consignors`);
        
        // Find one with documents or NDA/MSA
        for (const consignor of consignorsData.data.slice(0, 5)) {
            console.log(`\nÌ≥ã Checking consignor: ${consignor.customer_id} - ${consignor.company_name}`);
            
            // Check details for this consignor
            const detailResponse = await fetch(`http://localhost:5000/api/consignors/${consignor.customer_id}`, {
                credentials: 'include'
            });

            if (detailResponse.ok) {
                const details = await detailResponse.json();
                const hasNDA = !!details.data.upload_nda;
                const hasMSA = !!details.data.upload_msa;
                const hasDocuments = details.data.documents && details.data.documents.length > 0;
                
                console.log(`   Has NDA: ${hasNDA}`);
                console.log(`   Has MSA: ${hasMSA}`);
                console.log(`   Has Documents: ${hasDocuments ? details.data.documents.length : 0}`);
                
                if (hasNDA || hasMSA || hasDocuments) {
                    console.log(`\nÌæØ PERFECT! Use this consignor for testing:`);
                    console.log(`   URL: http://localhost:5174/consignor/${consignor.customer_id}`);
                    console.log(`   Company: ${consignor.company_name}`);
                    console.log(`   ID: ${consignor.customer_id}`);
                    return consignor.customer_id;
                }
            }
        }
        
        console.log('\n‚ùå No consignors found with documents for testing');
        console.log('Ì≤° You can still test with any consignor - the preview functionality should handle missing documents gracefully');
        
        if (consignorsData.data.length > 0) {
            const firstConsignor = consignorsData.data[0];
            console.log(`\nÌ¥ß Use this consignor for basic testing:`);
            console.log(`   URL: http://localhost:5174/consignor/${firstConsignor.customer_id}`);
            console.log(`   Company: ${firstConsignor.company_name}`);
            console.log(`   ID: ${firstConsignor.customer_id}`);
            return firstConsignor.customer_id;
        }
        
    } catch (error) {
        console.error('‚ùå Error:', error.message);
    }
}

testLoginAndFindConsignor();
