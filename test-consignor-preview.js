console.log('��� Testing Consignor Document Preview Functionality');

async function testConsignorDocumentPreview() {
    try {
        // Check if we're logged in by checking for a consignor with documents
        const response = await fetch('http://localhost:5000/api/consignors', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            console.log('❌ Not authenticated. Please login first.');
            return;
        }

        const data = await response.json();
        console.log('✅ Found consignors:', data.data.length);
        
        // Find a consignor with documents
        const consignorWithDocs = data.data.find(c => 
            c.upload_nda || c.upload_msa || (c.documents && c.documents.length > 0)
        );

        if (consignorWithDocs) {
            console.log('✅ Found consignor with documents:', {
                id: consignorWithDocs.customer_id,
                name: consignorWithDocs.company_name,
                has_nda: !!consignorWithDocs.upload_nda,
                has_msa: !!consignorWithDocs.upload_msa,
                documents_count: consignorWithDocs.documents?.length || 0
            });
            
            // Test the details endpoint
            const detailsResponse = await fetch(`http://localhost:5000/api/consignors/${consignorWithDocs.customer_id}`, {
                credentials: 'include'
            });
            
            if (detailsResponse.ok) {
                const details = await detailsResponse.json();
                console.log('✅ Details endpoint working. Navigate to:', 
                    `http://localhost:5174/consignor/${consignorWithDocs.customer_id}`);
                return consignorWithDocs.customer_id;
            }
        } else {
            console.log('❌ No consignors with documents found for testing.');
        }
    } catch (error) {
        console.error('❌ Error testing consignor preview:', error);
    }
}

testConsignorDocumentPreview();
