/**
 * Test the full consignor details authentication flow
 * Debug why logout API is being called during navigation
 */

const axios = require('axios');

class ConsignorDetailsFlowTester {
    constructor() {
        this.baseURL = 'http://localhost:5001';
        this.cookies = '';
        this.userId = 'TESTUSER'; // UT006 user we created before
        this.password = 'TestPass123!';
    }

    async testFullFlow() {
        console.log('Ì∑™ Testing Complete Consignor Details Navigation Flow\n');
        
        // Step 1: Login
        await this.login();
        
        // Step 2: Test consignor details API call that should happen on page load
        await this.testConsignorDetailsAPI();
        
        // Step 3: Monitor for any additional API calls
        await this.testPotentialLogoutTriggers();
        
        console.log('\nÌæØ Flow Test Complete!');
    }

    async login() {
        try {
            console.log('1Ô∏è‚É£ Logging in with TESTUSER (UT006)...');
            const response = await axios.post(`${this.baseURL}/api/auth/login`, {
                user_id: this.userId,
                password: this.password
            }, {
                timeout: 10000,
                withCredentials: true,
                validateStatus: () => true
            });
            
            if (response.status === 200 && response.data.success) {
                console.log('‚úÖ Login successful!');
                console.log(`Ì±§ User: ${response.data.user.user_id}`);
                console.log(`Ì¥ë User Type: ${response.data.user.user_type_id}`);
                
                // Extract cookies for subsequent requests
                const setCookieHeader = response.headers['set-cookie'];
                if (setCookieHeader) {
                    this.cookies = setCookieHeader.join('; ');
                    console.log('ÌΩ™ Authentication cookies captured');
                } else {
                    console.log('‚ö†Ô∏è No cookies in response');
                }
                
                return true;
            } else {
                console.log(`‚ùå Login failed: ${response.status} - ${JSON.stringify(response.data, null, 2)}`);
                return false;
            }
        } catch (error) {
            console.error('‚ùå Login error:', error.message);
            return false;
        }
    }

    async testConsignorDetailsAPI() {
        try {
            console.log('\n2Ô∏è‚É£ Testing Consignor Details API Call...');
            console.log('ÔøΩÔøΩ Simulating the API call that happens when ConsignorDetailsPage loads');
            
            // This is the exact API call that ConsignorDetailsPage makes
            const consignorId = 'CON0070'; // Known test consignor
            console.log(`Ì≥° GET /api/consignors/${consignorId}`);
            
            const response = await axios.get(`${this.baseURL}/api/consignors/${consignorId}`, {
                headers: { 
                    Cookie: this.cookies 
                },
                timeout: 10000,
                withCredentials: true,
                validateStatus: () => true
            });
            
            console.log(`Ì≥ä Response Status: ${response.status}`);
            
            if (response.status === 200 && response.data.success) {
                console.log('‚úÖ Consignor details API successful!');
                console.log(`Ì≥ã Consignor: ${response.data.data.general?.customer_name || 'N/A'}`);
                console.log(`Ì∂î Customer ID: ${response.data.data.general?.customer_id || 'N/A'}`);
                return true;
            } else if (response.status === 403) {
                console.log('‚ùå 403 Forbidden - Access control issue!');
                console.log('Ì¥ç Error details:', JSON.stringify(response.data, null, 2));
                console.log('\nÌ∫® THIS IS THE PROBLEM! 403 error triggers axios interceptor');
                console.log('Ì≥û Axios interceptor tries to refresh token');
                console.log('Ì¥Ñ If refresh fails, it calls logout API');
                return false;
            } else if (response.status === 401) {
                console.log('‚ùå 401 Unauthorized - Authentication issue!');
                console.log('Ì¥ç Error details:', JSON.stringify(response.data, null, 2));
                console.log('\nÌ∫® THIS IS THE PROBLEM! 401 error triggers axios interceptor');
                console.log('Ì≥û Axios interceptor immediately redirects to login');
                return false;
            } else {
                console.log(`‚ùå Unexpected response: ${response.status}`);
                console.log('Ì≥Ñ Response:', JSON.stringify(response.data, null, 2));
                return false;
            }
        } catch (error) {
            console.error('‚ùå API call error:', error.message);
            return false;
        }
    }

    async testPotentialLogoutTriggers() {
        console.log('\n3Ô∏è‚É£ Testing Potential Logout Trigger Scenarios...');
        
        // Test token verification (happens automatically in React app)
        await this.testTokenVerification();
        
        // Test token refresh (might be called by axios interceptor)
        await this.testTokenRefresh();
        
        // Test if consignor route access control is the issue
        await this.testAccessControl();
    }

    async testTokenVerification() {
        try {
            console.log('\nÌ¥ç Testing Token Verification (GET /api/auth/verify)...');
            const response = await axios.get(`${this.baseURL}/api/auth/verify`, {
                headers: { Cookie: this.cookies },
                timeout: 10000,
                withCredentials: true,
                validateStatus: () => true
            });
            
            if (response.status === 200 && response.data.success) {
                console.log('‚úÖ Token verification successful');
                console.log(`Ì±§ Verified user: ${response.data.user?.user_id}`);
            } else {
                console.log(`‚ùå Token verification failed: ${response.status}`);
                console.log('Ì¥ç This might trigger logout in axios interceptor');
            }
        } catch (error) {
            console.error('‚ùå Token verification error:', error.message);
        }
    }

    async testTokenRefresh() {
        try {
            console.log('\nÌ¥Ñ Testing Token Refresh (POST /api/auth/refresh)...');
            const response = await axios.post(`${this.baseURL}/api/auth/refresh`, {}, {
                headers: { Cookie: this.cookies },
                timeout: 10000,
                withCredentials: true,
                validateStatus: () => true
            });
            
            if (response.status === 200 && response.data.success) {
                console.log('‚úÖ Token refresh successful');
            } else {
                console.log(`‚ùå Token refresh failed: ${response.status}`);
                console.log('Ì¥ç Failed refresh triggers logout in axios interceptor');
                console.log('Ì≥û Logout API would be called here');
            }
        } catch (error) {
            console.error('‚ùå Token refresh error:', error.message);
        }
    }

    async testAccessControl() {
        try {
            console.log('\nÌª°Ô∏è Testing Access Control for Consignor Routes...');
            
            // Test different consignor endpoints to see which ones fail
            const endpoints = [
                '/api/consignors/master-data',
                '/api/consignors',
                '/api/consignors/CON0070'
            ];
            
            for (const endpoint of endpoints) {
                console.log(`\nÌ≥° Testing: ${endpoint}`);
                const response = await axios.get(`${this.baseURL}${endpoint}`, {
                    headers: { Cookie: this.cookies },
                    timeout: 10000,
                    withCredentials: true,
                    validateStatus: () => true
                });
                
                console.log(`Ì≥ä Status: ${response.status}`);
                if (response.status === 200) {
                    console.log('‚úÖ Access granted');
                } else if (response.status === 403) {
                    console.log('‚ùå 403 Forbidden - Access control blocks this endpoint');
                    console.log(`Ì¥ç Error: ${response.data.error?.message || 'Unknown'}`);
                } else if (response.status === 401) {
                    console.log('‚ùå 401 Unauthorized - Authentication required');
                } else {
                    console.log(`‚ùå Unexpected status: ${response.status}`);
                }
            }
        } catch (error) {
            console.error('‚ùå Access control test error:', error.message);
        }
    }
}

// Run the test
const tester = new ConsignorDetailsFlowTester();
tester.testFullFlow();
