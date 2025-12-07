const axios = require('axios');

async function finalVerification() {
    console.log('ÌæØ FINAL VERIFICATION: Draft Timeout and Privacy Fixes');
    console.log('=' .repeat(60));
    
    const users = [
        { user_id: 'USR001', password: 'POWNER@2', name: 'User 1' },
        { user_id: 'USR002', password: 'POWNER@3', name: 'User 2' }
    ];
    
    // Login both users
    const tokens = {};
    for (const user of users) {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            user_id: user.user_id,
            password: user.password
        });
        tokens[user.user_id] = response.data.token;
    }
    
    // Test 1: Timeout Fix - Create drafts
    console.log('\nÌ∫Ä TEST 1: TIMEOUT FIX');
    console.log('-'.repeat(40));
    
    for (const user of users) {
        try {
            const FormData = require('form-data');
            const formData = new FormData();
            formData.append('payload', JSON.stringify({
                general: { customer_name: `Final Test ${user.name}` }
            }));
            
            const start = Date.now();
            await axios.post('http://localhost:5000/api/consignors/save-draft', formData, {
                headers: { 
                    'Authorization': `Bearer ${tokens[user.user_id]}`,
                    ...formData.getHeaders()
                },
                timeout: 150000
            });
            const duration = Date.now() - start;
            
            console.log(`‚úÖ ${user.name}: Draft saved in ${duration}ms (no timeout)`);
        } catch (error) {
            console.log(`‚ùå ${user.name}: ${error.message}`);
        }
    }
    
    // Test 2: Privacy Fix - Check draft visibility
    console.log('\nÌ¥í TEST 2: PRIVACY FIX');
    console.log('-'.repeat(40));
    
    for (const user of users) {
        // Get drafts by explicitly filtering for SAVE_AS_DRAFT status
        const response = await axios.get('http://localhost:5000/api/consignors?status=SAVE_AS_DRAFT&limit=50', {
            headers: { 'Authorization': `Bearer ${tokens[user.user_id]}` }
        });
        
        const drafts = response.data.data;
        const uniqueCreators = [...new Set(drafts.map(d => d.created_by))];
        
        console.log(`Ì±§ ${user.name} (${user.user_id}):`);
        console.log(`   Ì≥ã Can see ${drafts.length} drafts`);
        console.log(`   Ì±• Created by: ${uniqueCreators.join(', ')}`);
        
        if (uniqueCreators.length === 1 && uniqueCreators[0] === user.user_id) {
            console.log(`   ‚úÖ PRIVACY: Only sees own drafts`);
        } else {
            console.log(`   ‚ùå PRIVACY VIOLATION: Sees other users' drafts`);
        }
    }
    
    console.log('\nÌæâ VERIFICATION COMPLETE!');
}

finalVerification().catch(console.error);
