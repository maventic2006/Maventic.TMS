// Test E-Bidding Configuration Creation
// This script tests the auto-ID generation for e-bidding configurations

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Test authentication first
const testAuth = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      user_id: 'POWNER001',
      password: 'Powner@123'
    });
    
    if (response.data.success) {
      console.log('✅ Authentication successful');
      return response.data.data.accessToken;
    } else {
      console.log('❌ Authentication failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.response?.data?.message || error.message);
    return null;
  }
};

// Test e-bidding configuration creation
const testEbiddingConfig = async (token) => {
  try {
    console.log('\n��� Testing E-Bidding Configuration Creation...\n');
    
    const testData = {
      vehicle_type: 'Truck',
      max_rate: 1000.50,
      min_rate: 500.25,
      e_bidding_tolerance_value: 10.0
    };
    
    console.log('��� Sending data:', testData);
    
    const response = await axios.post(
      `${API_BASE_URL}/consignor-configuration/e_bidding_config`,
      testData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.success) {
      console.log('✅ E-Bidding Config created successfully!');
      console.log('��� Created record:', JSON.stringify(response.data.data, null, 2));
      
      // Check if all IDs were auto-generated
      const record = response.data.data;
      console.log('\n��� Checking Auto-Generated IDs:');
      console.log(`- e_bidding_config_id: ${record.e_bidding_config_id} ${record.e_bidding_config_id ? '✅' : '❌'}`);
      console.log(`- consignor_id: ${record.consignor_id} ${record.consignor_id ? '✅' : '❌'}`);
      console.log(`- warehouse_id: ${record.warehouse_id} ${record.warehouse_id ? '✅' : '❌'}`);
      console.log(`- created_at: ${record.created_at} ${record.created_at ? '✅' : '❌'}`);
      console.log(`- created_by: ${record.created_by} ${record.created_by ? '✅' : '❌'}`);
      
    } else {
      console.log('❌ E-Bidding Config creation failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ E-Bidding Config creation error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

// Main test function
const runTests = async () => {
  console.log('��� Starting E-Bidding Configuration Tests...\n');
  
  const token = await testAuth();
  if (!token) {
    console.log('❌ Cannot proceed without authentication token');
    return;
  }
  
  // Test e-bidding config creation
  await testEbiddingConfig(token);
  
  console.log('\n✅ All tests completed!');
};

// Run tests
runTests().catch(error => {
  console.error('❌ Test execution failed:', error);
});
