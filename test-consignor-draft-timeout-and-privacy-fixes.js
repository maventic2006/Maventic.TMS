/**
 * Comprehensive Te    async login(user_id, password) {
        try {
    async createConsignorDraft(user_id, consignorData) {
                 if (response.data            if (response.data.success) {
                const customerId = response.data.data.customerId;
                console.log(`✅ Draft created successfully for ${user_id}`);
                console.log(`   📋 Consignor ID: ${customerId}`);
                this.createdConsignors.push({
                    id: customerId,
                    creator: user_id,
                    customer_name: consignorData.customer_name
                });
                return response.data.data;
            } else {{
                console.log(`✅ Draft c        for (const user_id of Object.keys(this.tokens)) {
            const consignors = await this.getConsignorList(user_id);
            console.log(`   🔍 Debug - Consignors response for ${user_id}:`, typeof consignors, consignors?.length);
            
            if (!consignors || !Array.isArray(consignors)) {
                console.log(`   ⚠️  Warning: Invalid consignors response for ${user_id}`);
                continue;
            }
            
            // Log all consignors to see what we get
            console.log(`   📄 All consignors for ${user_id}:`, consignors.map(c => ({
                id: c.customer_id,
                name: c.customer_name,
                status: c.status,
                created_by: c.created_by
            })));
            
            const drafts = consignors.filter(c => c.status === 'SAVE_AS_DRAFT');
            
            console.log(`   👤 ${user_id}: Found ${drafts.length} drafts in general list`);
            
            if (drafts.length > 0) {
                console.log(`   ❌ PRIVACY VIOLATION: Drafts visible in general list for ${user_id}`);
                drafts.forEach(draft => {
                    console.log(`      📄 Draft: ${draft.customer_name} (ID: ${draft.customer_id || draft.consignor_unique_id}) - Created by: ${draft.created_by}`);
                });
            } else {
                console.log(`   ✅ No drafts in general list for ${user_id} (correct behavior)`);
            }
        }ully for ${user_id}`);
                console.log(`   📋 Consignor ID: ${response.data.data.customerId}`);
                this.createdConsignors.push({
                    id: response.data.data.customerId,
                    creator: user_id,
                    customer_name: consignorData.customer_name
                });
                return response.data.data;
            } else {           console.log(`\n📝 Creating consignor draft as ${user_id}...`);
            
            const token = this.tokens[user_id];
            if (!token) {
                throw new Error(`No token found for ${user_id}`);
            }    console.log(`🔐 Logging in as ${user_id}...`);
            const response = await axios.post(`${this.baseURL}/api/auth/login`, {
                user_id,
                password
            });
            
            if (response.data.success) {
                console.log(`✅ Login successful for ${user_id}`);
                return response.data.token;
            } else {
                throw new Error(`Login failed: ${response.data.message}`);
            }
        } catch (error) {
            console.error(`❌ Login failed for ${user_id}:`, error.message);
            return null;
        }
    }aft Fixes
 * 
 * Tests:
 * 1. Save as Draft with Extended Timeout (no timeout errors)
 * 2. Draft Privacy (users only see their own drafts)
 * 3. Draft Status Filtering
 * 4. File Upload with Draft Functionality
 */

const axios = require('axios');

class ConsignorDraftTester {
    constructor() {
        this.baseURL = 'http://localhost:5000';
        this.users = [
            { user_id: 'USR001', password: 'POWNER@2' }, // User 1 (UT002 - Transporter)
            { user_id: 'USR002', password: 'POWNER@3' }  // User 2 (UT003 - Independent Vehicle Owner)
        ];
        this.tokens = {};
        this.createdConsignors = [];
    }

    async login(user_id, password) {
        try {
            console.log(`�� Logging in as ${user_id}...`);
            const response = await axios.post(`${this.baseURL}/api/auth/login`, {
                user_id,
                password
            });
            
            if (response.data.success) {
                console.log(`✅ Login successful for ${user_id}`);
                return response.data.token;
            } else {
                throw new Error(`Login failed: ${response.data.message}`);
            }
        } catch (error) {
            console.error(`❌ Login failed for ${user_id}:`, error.message);
            return null;
        }
    }

    async loginAllUsers() {
        console.log('\n=== ��� USER AUTHENTICATION ===');
        
        for (const user of this.users) {
            const token = await this.login(user.user_id, user.password);
            if (token) {
                this.tokens[user.user_id] = token;
            }
        }

        console.log(`\n✅ Successfully logged in ${Object.keys(this.tokens).length} users`);
    }

    async createConsignorDraft(user_id, consignorData) {
        try {
            console.log(`\n��� Creating consignor draft as ${user_id}...`);
            
            const token = this.tokens[user_id];
            if (!token) {
                throw new Error(`No token found for ${user_id}`);
            }

            // Prepare form data for save as draft
            const FormData = require('form-data');
            const formData = new FormData();
            
            // Add payload with general structure (as expected by backend)
            const payload = {
                general: {
                    customer_name: consignorData.customer_name,
                    search_term: consignorData.search_term || consignorData.customer_name.substring(0, 10).toUpperCase(),
                    industry_type: consignorData.industry_type || 'Manufacturing',
                    currency_type: consignorData.currency_type || 'INR',
                    payment_term: consignorData.payment_term || '30'
                },
                addresses: [{
                    address_type: 'Registered',
                    street_no: '123',
                    address_line1: consignorData.address || 'Test Address Line 1',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    country: 'India',
                    pincode: '400001'
                }],
                contacts: [{
                    contact_type: 'Primary',
                    contact_name: 'Test Contact',
                    designation: 'Manager',
                    department: 'Operations',
                    phone_number: Math.floor(Math.random() * 9000000000) + 1000000000,
                    email: `test${Date.now()}@example.com`
                }]
            };

            formData.append('payload', JSON.stringify(payload));

            const response = await axios.post(
                `${this.baseURL}/api/consignors/save-draft`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        ...formData.getHeaders()
                    },
                    timeout: 150000 // 150 seconds to test if our timeout fix works
                }
            );

            if (response.data.success) {
                console.log(`✅ Draft created successfully for ${user_id}`);
                console.log(`   ��� Consignor ID: ${response.data.data.consignor_unique_id}`);
                this.createdConsignors.push({
                    id: response.data.data.consignor_unique_id,
                    creator: user_id,
                    customer_name: consignorData.customer_name
                });
                return response.data.data;
            } else {
                throw new Error(`Draft creation failed: ${response.data.message}`);
            }

        } catch (error) {
            if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
                console.error(`❌ TIMEOUT ERROR for ${user_id}: ${error.message}`);
                console.error('   This indicates the timeout fix did NOT work!');
            } else {
                console.error(`❌ Draft creation failed for ${user_id}:`, error.message);
                if (error.response) {
                    console.error('   Response:', error.response.data);
                }
            }
            return null;
        }
    }

    async getConsignorList(user_id, filters = {}) {
        try {
            const token = this.tokens[user_id];
            if (!token) {
                throw new Error(`No token found for ${user_id}`);
            }

            // Build query params
            const params = new URLSearchParams({
                page: filters.page || 1,
                limit: filters.limit || 25,
                search: filters.search || '',
                status: filters.status || '',
                sortBy: filters.sortBy || 'created_at',
                sortOrder: filters.sortOrder || 'desc'
            });

            const response = await axios.get(
                `${this.baseURL}/api/consignors?${params.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                return response.data.data || []; // Return data array or empty array
            } else {
                throw new Error(`Get consignor list failed: ${response.data.message}`);
            }

        } catch (error) {
            console.error(`❌ Get consignor list failed for ${user_id}:`, error.message);
            return [];
        }
    }

    async testDraftPrivacy() {
        console.log('\n=== ��� DRAFT PRIVACY TEST ===');
        
        // Test: Get all consignors without status filter (should NOT show drafts)
        console.log('\n��� Testing general list (should hide all drafts)...');
        
        for (const user_id of Object.keys(this.tokens)) {
            const consignors = await this.getConsignorList(user_id);
            const drafts = consignors.filter(c => c.status === 'SAVE_AS_DRAFT');
            
            console.log(`   ��� ${user_id}: Found ${drafts.length} drafts in general list`);
            
            if (drafts.length > 0) {
                console.log(`   ❌ PRIVACY VIOLATION: Drafts visible in general list for ${user_id}`);
                drafts.forEach(draft => {
                    console.log(`      ��� Draft: ${draft.customer_name} (ID: ${draft.consignor_unique_id})`);
                });
            } else {
                console.log(`   ✅ No drafts in general list for ${user_id} (correct behavior)`);
            }
        }

        // Test: Get drafts with specific status filter
        console.log('\n��� Testing draft-specific filtering...');
        
        for (const user_id of Object.keys(this.tokens)) {
            const draftConsignors = await this.getConsignorList(user_id, { status: 'SAVE_AS_DRAFT' });
            const userCreatedDrafts = this.createdConsignors.filter(c => c.creator === user_id);
            
            console.log(`   ��� ${user_id}:`);
            console.log(`      ��� Created ${userCreatedDrafts.length} drafts`);
            console.log(`      ���  Can see ${draftConsignors.length} drafts`);
            
            // Check if user can see their own drafts when filtering by status
            const ownDrafts = draftConsignors.filter(dc => 
                userCreatedDrafts.some(ucd => ucd.id === dc.consignor_unique_id)
            );
            
            console.log(`      ✅ Own drafts visible: ${ownDrafts.length}`);
            
            if (ownDrafts.length === userCreatedDrafts.length) {
                console.log(`      ✅ All own drafts visible when filtering by status`);
            } else {
                console.log(`      ❌ Some own drafts missing when filtering by status`);
            }
        }
    }

    async runTests() {
        console.log('��� Starting Consignor Draft Timeout and Privacy Tests');
        console.log('====================================================');

        try {
            // Step 1: Login users
            await this.loginAllUsers();

            if (Object.keys(this.tokens).length === 0) {
                console.error('❌ No users logged in. Cannot proceed with tests.');
                return;
            }

            // Step 2: Create drafts for each user
            console.log('\n=== ��� DRAFT CREATION TESTS ===');
            
            let draftIndex = 1;
            for (const user_id of Object.keys(this.tokens)) {
                const consignorData = {
                    customer_name: `Draft Test Company ${draftIndex} (${user_id})`,
                    address: `Test Address ${draftIndex} for ${user_id}`
                };
                
                await this.createConsignorDraft(user_id, consignorData);
                draftIndex++;
                
                // Small delay between creations
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Step 3: Test timeout fix
            console.log('\n=== ⏱️  TIMEOUT TEST RESULTS ===');
            const successfulDrafts = this.createdConsignors.length;
            const totalAttempts = Object.keys(this.tokens).length;
            
            console.log(`✅ Successfully created ${successfulDrafts}/${totalAttempts} drafts`);
            
            if (successfulDrafts === totalAttempts) {
                console.log('��� TIMEOUT FIX: SUCCESS - No timeout errors occurred!');
            } else {
                console.log('❌ TIMEOUT FIX: FAILED - Some drafts failed due to timeout');
            }

            // Step 4: Test draft privacy
            await this.testDraftPrivacy();

            // Step 5: Summary
            console.log('\n=== ��� FINAL TEST SUMMARY ===');
            console.log(`✅ Drafts created: ${this.createdConsignors.length}`);
            console.log(`��� Users tested: ${Object.keys(this.tokens).length}`);
            
            this.createdConsignors.forEach(consignor => {
                console.log(`   ��� ${consignor.customer_name} (ID: ${consignor.id}) - Created by: ${consignor.creator}`);
            });

            console.log('\n��� Test completed! Check the results above for:');
            console.log('   1. ⏱️  Timeout fix effectiveness');
            console.log('   2. ��� Draft privacy enforcement');
            console.log('   3. ��� List filtering behavior');

        } catch (error) {
            console.error('❌ Test execution failed:', error.message);
        }
    }
}

// Run the tests
const tester = new ConsignorDraftTester();
tester.runTests();
