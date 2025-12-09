const axios = require('axios');

console.log('Ì∑™ Testing Validation Error Fix\n');

async function testValidationErrorFix() {
    try {
        // Step 1: Login
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
        
        // Step 2: Test consignor creation with malformed JSON to trigger validation error
        console.log('Ì∑™ Step 2: Testing malformed JSON payload...');
        const malformedResponse = await axios.post('http://localhost:5000/api/consignors', {
            payload: '{"invalid": json}' // This will trigger JSON parse error
        }, {
            headers: {
                'Cookie': cookies,
                'Content-Type': 'application/json'
            },
            timeout: 10000,
            validateStatus: () => true
        });
        
        if (malformedResponse.status === 422) {
            console.log('‚úÖ Validation error handled correctly');
            console.log('Ì≥Ñ Response:', JSON.stringify(malformedResponse.data, null, 2));
        } else {
            console.log(`‚ùå Unexpected status: ${malformedResponse.status}`);
            console.log('Ì≥Ñ Response:', malformedResponse.data);
        }
        
        // Step 3: Test consignor creation with missing required fields
        console.log('\nÌ∑™ Step 3: Testing missing required fields...');
        const missingFieldsResponse = await axios.post('http://localhost:5000/api/consignors', {
            general: {
                // Missing customer_name (required field)
                industry_type: 'IND_FMCG',
                currency_type: 'USD'
            }
        }, {
            headers: {
                'Cookie': cookies,
                'Content-Type': 'application/json'
            },
            timeout: 10000,
            validateStatus: () => true
        });
        
        console.log(`Ì≥ä Status: ${missingFieldsResponse.status}`);
        console.log('Ì≥Ñ Response:', JSON.stringify(missingFieldsResponse.data, null, 2));
        
        console.log('\nÌæâ Validation error fix test completed!');
        
    } catch (error) {
        console.error('‚ùå Test failed:', error.message);
        if (error.response?.data) {
            console.log('Ì≥Ñ Error response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testValidationErrorFix();
