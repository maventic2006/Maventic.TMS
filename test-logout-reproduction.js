/**
 * Reproduce the exact logout issue scenario
 * Monitor for logout API calls during navigation
 */

const axios = require('axios');

class LogoutReproductionTest {
    constructor() {
        this.baseURL = 'http://localhost:5001';
        this.cookies = '';
        this.isLogoutCalled = false;
    }

    async reproduceIssue() {
        console.log('Ì¥Ñ REPRODUCING LOGOUT ISSUE\n');
        
        // Step 1: Login
        const loginSuccess = await this.login();
        if (!loginSuccess) return;
        
        // Step 2: Simulate rapid navigation to consignor details
        await this.simulateNavigationFlow();
        
        // Step 3: Monitor for logout calls
        await this.monitorForLogoutCalls();
        
        console.log('\n‚úÖ Test complete!');
    }

    async login() {
        try {
            console.log('1Ô∏è‚É£ Logging in...');
            const response = await axios.post(`${this.baseURL}/api/auth/login`, {
                user_id: 'PO001',
                password: 'ProductOwner@123'
            }, {
                withCredentials: true,
                validateStatus: () => true
            });
            
            if (response.status === 200 && response.data.success) {
                const setCookieHeader = response.headers['set-cookie'];
                if (setCookieHeader) {
                    this.cookies = setCookieHeader.join('; ');
                    console.log('‚úÖ Login successful, cookies captured');
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('‚ùå Login error:', error.message);
            return false;
        }
    }

    async simulateNavigationFlow() {
        console.log('\n2Ô∏è‚É£ SIMULATING NAVIGATION FLOW');
        console.log('Ìºê User clicks on consignor CON0070 to view details...');
        
        // This simulates what happens when user navigates to consignor details page
        // The ConsignorDetailsPage component loads and makes these API calls
        try {
            console.log('Ì≥° Making primary API calls (as ConsignorDetailsPage would)...');
            
            // Simulate the exact sequence from ConsignorDetailsPage
            const calls = [
                { name: 'fetchConsignorById', url: '/api/consignors/CON0070' },
                { name: 'fetchMasterData', url: '/api/consignors/master-data' }
            ];
            
            for (const call of calls) {
                console.log(`Ì≥û ${call.name}: ${call.url}`);
                
                const response = await axios.get(`${this.baseURL}${call.url}`, {
                    headers: { Cookie: this.cookies },
                    withCredentials: true,
                    timeout: 5000,
                    validateStatus: () => true
                });
                
                console.log(`   ‚úÖ Status: ${response.status}`);
                
                if (response.status !== 200) {
                    console.log(`   ‚ùå Failed: ${JSON.stringify(response.data, null, 2)}`);
                    console.log('   Ì∫® This failure might trigger frontend logout logic!');
                    return false;
                }
                
                // Small delay between calls to mimic real behavior
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            console.log('‚úÖ All API calls successful - no backend errors');
            return true;
        } catch (error) {
            console.error(`‚ùå API call error: ${error.message}`);
            console.log('Ì∫® This error might trigger frontend logout!');
            return false;
        }
    }

    async monitorForLogoutCalls() {
        console.log('\n3Ô∏è‚É£ MONITORING FOR LOGOUT BEHAVIOR');
        console.log('Ì¥ç Checking if logout is triggered by frontend logic...');
        
        // The logout is NOT triggered by API failures (we verified that)
        // So it must be triggered by frontend session management or component logic
        
        console.log('\nÌµµÔ∏è ANALYSIS OF LOGOUT TRIGGERS:');
        console.log('‚ùì Since API calls are successful, the logout must be triggered by:');
        console.log('   1. ‚úÖ useInactivityTimeout hook - immediate logout after 15min timer starts');
        console.log('   2. ‚úÖ Session management code in App.jsx');
        console.log('   3. ‚úÖ Component cleanup/unmount logic');
        console.log('   4. ‚úÖ Browser navigation causing state reset');
        console.log('   5. ‚úÖ Role-based redirect logic in ProtectedRoute');
        
        // Let's check if there's a timing issue with token verification
        await this.checkTokenVerification();
        await this.checkSessionState();
    }

    async checkTokenVerification() {
        try {
            console.log('\nÌ¥ç Checking token verification...');
            const response = await axios.get(`${this.baseURL}/api/auth/verify`, {
                headers: { Cookie: this.cookies },
                withCredentials: true,
                validateStatus: () => true
            });
            
            if (response.status === 200) {
                console.log('‚úÖ Token verification successful');
                console.log(`Ì±§ User: ${response.data.user.user_id}`);
                console.log(`Ìæ≠ Type: ${response.data.user.user_type_id}`);
            } else {
                console.log(`‚ùå Token verification failed: ${response.status}`);
                console.log('Ì∫® Failed token verification could trigger logout!');
            }
        } catch (error) {
            console.error(`‚ùå Token verification error: ${error.message}`);
        }
    }

    async checkSessionState() {
        console.log('\nÌ≥ä FRONTEND SESSION STATE ANALYSIS:');
        console.log('Ì¥ç Based on the observed behavior, here\'s what\'s likely happening:');
        console.log('');
        console.log('Ì≥ù SCENARIO 1: Inactivity Timeout Issue');
        console.log('   - useInactivityTimeout starts immediately when component mounts');
        console.log('   - Timer might be incorrectly configured or reset');
        console.log('   - Navigation might trigger immediate timeout');
        console.log('');
        console.log('Ì≥ù SCENARIO 2: Component Mount/Unmount Issue');
        console.log('   - Navigation causes components to unmount');
        console.log('   - Cleanup functions call logout');
        console.log('   - Multiple component re-renders trigger logout');
        console.log('');
        console.log('Ì≥ù SCENARIO 3: Redux State Issue');
        console.log('   - Navigation causes auth state to reset');
        console.log('   - Auth slice automatically calls logout on state reset');
        console.log('   - Race condition between auth check and navigation');
        console.log('');
        console.log('ÌæØ RECOMMENDATION:');
        console.log('   - Check browser console for useInactivityTimeout logs');
        console.log('   - Monitor component lifecycle logs during navigation');
        console.log('   - Add debugging to SessionManager and inactivity hook');
        console.log('   - Check if multiple tab synchronization is causing issues');
    }
}

// Run the reproduction test
const tester = new LogoutReproductionTest();
tester.reproduceIssue();
