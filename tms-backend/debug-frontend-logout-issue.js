/**
 * Debug Frontend Logout Issue
 * Track the exact axios interceptor flow that causes logout API calls
 */

const axios = require('axios');

class FrontendLogoutDebugger {
    constructor() {
        this.baseURL = 'http://localhost:5001';
        this.cookies = '';
    }

    async debugLogoutIssue() {
        console.log('��� DEBUGGING FRONTEND LOGOUT ISSUE\n');
        
        console.log('��� Problem: When navigating to /consignor/details/:id, the user gets automatically logged out');
        console.log('��� Observation: POST /api/auth/logout is being called unexpectedly\n');
        
        // Step 1: Login with a working user
        const loginSuccess = await this.loginWithWorkingUser();
        if (!loginSuccess) return;
        
        // Step 2: Simulate the exact frontend navigation flow
        await this.simulateFrontendFlow();
        
        // Step 3: Analyze the axios interceptor behavior
        await this.analyzeAxiosInterceptorBehavior();
        
        console.log('\n��� DEBUG COMPLETE!');
    }

    async loginWithWorkingUser() {
        try {
            console.log('1️⃣ Logging in with PO001 (known working user)...');
            const response = await axios.post(`${this.baseURL}/api/auth/login`, {
                user_id: 'PO001',
                password: 'ProductOwner@123'
            }, {
                withCredentials: true,
                validateStatus: () => true
            });
            
            if (response.status === 200 && response.data.success) {
                console.log('✅ Login successful!');
                console.log(`��� User: ${response.data.user.user_id}`);
                console.log(`��� User Type: ${response.data.user.user_type_id}`);
                
                // Extract cookies
                const setCookieHeader = response.headers['set-cookie'];
                if (setCookieHeader) {
                    this.cookies = setCookieHeader.join('; ');
                    console.log('��� Authentication cookies captured');
                }
                
                return true;
            } else {
                console.log(`❌ Login failed: ${response.status}`);
                return false;
            }
        } catch (error) {
            console.error('❌ Login error:', error.message);
            return false;
        }
    }

    async simulateFrontendFlow() {
        console.log('\n2️⃣ SIMULATING FRONTEND NAVIGATION FLOW');
        console.log('��� User navigates to /consignor/details/CON0070');
        console.log('�� React Router loads ConsignorDetailsPage component');
        console.log('⚛️  useEffect triggers dispatch(fetchConsignorById("CON0070"))');
        console.log('��� Redux calls consignorService.getConsignorById("CON0070")');
        console.log('��� Service makes API call: GET /api/consignors/CON0070\n');
        
        // This is the exact sequence that happens in the frontend
        await this.step1_fetchConsignorById();
        await this.step2_fetchMasterData();
        await this.step3_checkForAdditionalCalls();
    }

    async step1_fetchConsignorById() {
        try {
            console.log('��� STEP 1: GET /api/consignors/CON0070 (Primary API Call)');
            const response = await axios.get(`${this.baseURL}/api/consignors/CON0070`, {
                headers: { Cookie: this.cookies },
                withCredentials: true,
                validateStatus: () => true
            });
            
            console.log(`��� Response: ${response.status} ${response.statusText}`);
            
            if (response.status === 200) {
                console.log('✅ fetchConsignorById successful - no logout trigger here');
            } else if (response.status === 401) {
                console.log('❌ 401 Unauthorized - this WOULD trigger axios interceptor');
                console.log('��� Axios interceptor would try to refresh token');
                console.log('��� If refresh fails, logout API gets called');
            } else if (response.status === 403) {
                console.log('❌ 403 Forbidden - this WOULD trigger axios interceptor');
                console.log('��� Axios interceptor would try to refresh token');
                console.log('��� If refresh fails, logout API gets called');
            } else {
                console.log(`❌ Unexpected status: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ fetchConsignorById error:', error.message);
        }
    }

    async step2_fetchMasterData() {
        try {
            console.log('\n��� STEP 2: GET /api/consignors/master-data (Secondary API Call)');
            const response = await axios.get(`${this.baseURL}/api/consignors/master-data`, {
                headers: { Cookie: this.cookies },
                withCredentials: true,
                validateStatus: () => true
            });
            
            console.log(`��� Response: ${response.status} ${response.statusText}`);
            
            if (response.status === 200) {
                console.log('✅ fetchMasterData successful - no logout trigger here');
            } else {
                console.log(`❌ Error in master data fetch - would trigger axios interceptor`);
            }
        } catch (error) {
            console.error('❌ fetchMasterData error:', error.message);
        }
    }

    async step3_checkForAdditionalCalls() {
        console.log('\n��� STEP 3: Checking for additional API calls...');
        console.log('��� In real frontend, there might be other useEffect calls or component interactions');
        console.log('��� Let\'s check if any authentication verification happens...');
        
        // Check token verification (common in React apps)
        try {
            const response = await axios.get(`${this.baseURL}/api/auth/verify`, {
                headers: { Cookie: this.cookies },
                withCredentials: true,
                validateStatus: () => true
            });
            
            console.log(`��� Token verification: ${response.status}`);
            if (response.status !== 200) {
                console.log('❌ Token verification failed - this could trigger logout');
            } else {
                console.log('✅ Token verification passed');
            }
        } catch (error) {
            console.error('❌ Token verification error:', error.message);
        }
    }

    async analyzeAxiosInterceptorBehavior() {
        console.log('\n3️⃣ ANALYZING AXIOS INTERCEPTOR BEHAVIOR');
        console.log('��� Based on frontend/src/utils/api.js, here\'s what happens:');
        console.log('');
        console.log('��� Response Interceptor Logic:');
        console.log('  1. If API returns 401 (Unauthorized):');
        console.log('     - Redirects to login page immediately');
        console.log('     - Does NOT call logout API');
        console.log('');
        console.log('  2. If API returns 403 (Forbidden):');
        console.log('     - Checks if error contains "jwt" or "token"');
        console.log('     - Tries to refresh token with POST /api/auth/refresh');
        console.log('     - If refresh succeeds: retries original request');
        console.log('     - If refresh FAILS: redirects to login');
        console.log('     - Does NOT call logout API');
        console.log('');
        console.log('❓ QUESTION: Who is calling POST /api/auth/logout?');
        console.log('��� Let\'s check if there are other logout triggers...');
        
        await this.checkForLogoutTriggers();
    }

    async checkForLogoutTriggers() {
        console.log('\n��� CHECKING FOR LOGOUT TRIGGERS');
        
        console.log('��� Potential logout trigger sources:');
        console.log('  1. TMSHeader component logout button');
        console.log('  2. Session timeout/inactivity handler');
        console.log('  3. App.jsx authentication flow');
        console.log('  4. Redux auth slice logoutUser action');
        console.log('  5. Manual logout call in components');
        console.log('');
        console.log('���️ Investigation needed:');
        console.log('  - Check browser Network tab for the exact logout call source');
        console.log('  - Look for any session management code that might auto-logout');
        console.log('  - Check if navigation triggers any cleanup functions');
        console.log('  - Verify if there are any role-based redirects');
        
        // Let's test if there's a role/permission issue
        await this.testRoleBasedAccess();
    }

    async testRoleBasedAccess() {
        console.log('\n���️ TESTING ROLE-BASED ACCESS ISSUE');
        console.log('��� Checking if user role causes automatic logout...');
        
        try {
            // Check if the user has proper permissions for the consignor route
            console.log('��� Testing frontend route access simulation...');
            
            // In App.jsx, consignor routes require USER_ROLES.PRODUCT_OWNER
            // Let's verify the current user's role
            const response = await axios.get(`${this.baseURL}/api/auth/verify`, {
                headers: { Cookie: this.cookies },
                withCredentials: true,
                validateStatus: () => true
            });
            
            if (response.status === 200 && response.data.success) {
                const user = response.data.user;
                console.log(`�� Current user: ${user.user_id}`);
                console.log(`���️ User type: ${user.user_type_id}`);
                console.log(`��� Mapped role: ${user.role || 'Not mapped'}`);
                
                // Check if this user type maps to PRODUCT_OWNER role
                if (user.user_type_id === 'UT001') {
                    console.log('✅ User should have PRODUCT_OWNER role - access granted');
                    console.log('❓ Role is not the issue - look for other causes');
                } else {
                    console.log('❌ User does NOT have UT001 (Product Owner) type');
                    console.log('��� This could cause ProtectedRoute to redirect/logout!');
                }
            }
        } catch (error) {
            console.error('❌ Role verification error:', error.message);
        }
    }
}

// Run the debugger
const logoutDebugger = new FrontendLogoutDebugger();
logoutDebugger.debugLogoutIssue();
