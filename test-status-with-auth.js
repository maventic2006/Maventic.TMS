const axios = require('axios');

async function testWithAuthentication() {
  try {
    console.log('🔐 Testing Status Configuration with Authentication...\n');
    
    // Step 1: Login with test user
    console.log('1️⃣ Attempting login with test user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      user_id: 'POWNER001',
      password: 'POWNER@1'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('   Status:', loginResponse.status);
    console.log('   User:', loginResponse.data.data?.user?.user_full_name);
    console.log('   Role:', loginResponse.data.data?.user?.role);
    
    // Extract the cookie from the response
    const cookies = loginResponse.headers['set-cookie'];
    console.log('🍪 Auth cookie received:', !!cookies);
    
    if (!cookies) {
      console.log('❌ No cookies received from login');
      return;
    }
    
    // Step 2: Test metadata endpoint with auth
    console.log('\n2️⃣ Fetching configuration metadata...');
    const metadataResponse = await axios.get('http://localhost:5000/api/configuration/status/metadata', {
      headers: {
        'Cookie': cookies.join('; ')
      },
      withCredentials: true
    });
    
    console.log('✅ Metadata fetched successfully!');
    console.log('   Table:', metadataResponse.data.data.table);
    console.log('   Primary Key:', metadataResponse.data.data.primaryKey);
    console.log('   Fields:', Object.keys(metadataResponse.data.data.fields).join(', '));
    
    // Step 3: Test data endpoint with auth
    console.log('\n3️⃣ Fetching configuration data...');
    const dataResponse = await axios.get('http://localhost:5000/api/configuration/status/data?page=1&limit=10&status=ACTIVE', {
      headers: {
        'Cookie': cookies.join('; ')
      },
      withCredentials: true
    });
    
    console.log('✅ Data fetched successfully!');
    console.log('   Total Records:', dataResponse.data.data.pagination.totalRecords);
    console.log('   Records in Page:', dataResponse.data.data.data.length);
    
    if (dataResponse.data.data.data.length > 0) {
      console.log('\n4️⃣ Sample Records:');
      console.table(dataResponse.data.data.data.map(record => ({
        ID: record.status_id,
        Name: record.status_name,
        Purpose: record.status_purpose_id,
        Description: record.status_description,
        Status: record.status,
        Active: record.isActive
      })));
      
      console.log('\n5️⃣ Raw Record Structure (First Record):');
      console.log('   Keys:', Object.keys(dataResponse.data.data.data[0]).join(', '));
      console.log('   Values:', JSON.stringify(dataResponse.data.data.data[0], null, 2));
    } else {
      console.log('❌ No records found in response');
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log('   ✅ Authentication: WORKING');
    console.log('   ✅ Metadata API: WORKING');
    console.log('   ✅ Data API: WORKING');
    console.log('   ✅ Database Query: WORKING');
    console.log('   📊 Issue: Likely in frontend data display logic');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('   Status:', error.response?.status);
    console.error('   Message:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔍 Authentication Details:');
      console.log('   The test user might need password reset or have different credentials');
      console.log('   Try checking the user_master table in the database');
    }
  }
}

testWithAuthentication();