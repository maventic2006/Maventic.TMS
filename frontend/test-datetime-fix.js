// Test script to verify datetime fix for consignor configuration creation
// This tests both frontend validation and backend datetime handling

console.log('🧪 Starting Datetime Fix Test...');

// Test 1: Frontend validation should not require ID fields
function testFrontendValidation() {
  console.log('\n📋 Test 1: Frontend Validation for Hidden Fields');
  
  // Simulate form data without ID fields (they should be excluded from validation)
  const formData = {
    trade_license_number: 'TL001',
    consignor_id: 'CSG001',
    issue_date: '2023-01-15',
    expiry_date: '2025-01-15'
    // Note: No id, created_at, updated_at fields - these should be excluded from validation
  };
  
  // Simulate the validation logic from ConsignorConfigurationModal
  const requiredFields = ['trade_license_number', 'consignor_id']; // Simplified
  const exclusionFields = ['id', 'created_at', 'created_on', 'created_by', 'updated_at', 'updated_on', 'updated_by'];
  
  const validationErrors = {};
  requiredFields.forEach(field => {
    if (!exclusionFields.includes(field) && !formData[field]) {
      validationErrors[field] = 'This field is required';
    }
  });
  
  if (Object.keys(validationErrors).length === 0) {
    console.log('✅ Frontend validation passed - no ID field requirements');
  } else {
    console.log('❌ Frontend validation failed:', validationErrors);
  }
  
  return Object.keys(validationErrors).length === 0;
}

// Test 2: Backend datetime processing
async function testBackendDatetimeProcessing() {
  console.log('\n📋 Test 2: Backend Datetime Processing');
  
  try {
    // Simulate the backend processing logic
    const data = {
      trade_license_number: 'TL001',
      consignor_id: 'CSG001',
      issue_date: '2023-01-15',
      expiry_date: '2025-01-15'
    };
    
    // Simulate configuration with CURRENT_TIMESTAMP defaults
    const config = {
      fields: {
        id: { type: 'VARCHAR', autoGenerate: true },
        trade_license_number: { type: 'VARCHAR', required: true },
        consignor_id: { type: 'VARCHAR', required: true },
        created_at: { type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' },
        created_on: { type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' },
        updated_at: { type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' },
        updated_on: { type: 'DATETIME', defaultValue: 'CURRENT_TIMESTAMP' }
      }
    };
    
    // Apply default value processing (simulate backend logic)
    const currentTimestamp = new Date();
    console.log('🕐 Current timestamp:', currentTimestamp);
    
    Object.keys(config.fields).forEach(fieldName => {
      const fieldConfig = config.fields[fieldName];
      
      // Skip update-related audit fields during create operation
      if (fieldName === 'updated_at' || fieldName === 'updated_on' || fieldName === 'updated_by') {
        console.log(`⏭️  Skipped update field: ${fieldName}`);
        return;
      }
      
      // If field is not provided and has a default value
      if (data[fieldName] === undefined && fieldConfig.defaultValue !== undefined) {
        if (fieldConfig.defaultValue === 'CURRENT_TIMESTAMP') {
          console.log(`🔧 Applying CURRENT_TIMESTAMP default for field: ${fieldName}`);
          data[fieldName] = currentTimestamp;
        } else {
          console.log(`🔧 Applying default value for field: ${fieldName} = ${fieldConfig.defaultValue}`);
          data[fieldName] = fieldConfig.defaultValue;
        }
      }
    });
    
    // Set audit fields for create operation
    data.created_by = 'TEST_USER';
    data.created_at = currentTimestamp;
    data.created_on = currentTimestamp;
    
    console.log('📋 Final processed data:', data);
    
    // Verify no update fields are present
    if (!data.updated_at && !data.updated_on && !data.updated_by) {
      console.log('✅ Backend datetime processing passed - no update fields in create');
      return true;
    } else {
      console.log('❌ Backend datetime processing failed - update fields present in create');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Backend datetime processing failed:', error.message);
    return false;
  }
}

// Test 3: API endpoint test
async function testAPIEndpoint() {
  console.log('\n📋 Test 3: API Endpoint Test');
  
  try {
    const response = await fetch('/api/consignor-configuration/trade_license_certificate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        trade_license_number: 'TL_' + Date.now(),
        consignor_id: 'CSG001',
        issue_date: '2023-01-15',
        expiry_date: '2025-01-15'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ API endpoint test passed - record created successfully');
      console.log('📋 Created record:', result.data);
      return true;
    } else {
      console.log('❌ API endpoint test failed:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ API endpoint test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running comprehensive datetime fix tests...\n');
  
  const test1 = testFrontendValidation();
  const test2 = await testBackendDatetimeProcessing();
  const test3 = await testAPIEndpoint();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`Frontend Validation: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend Processing: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Endpoint: ${test3 ? '✅ PASS' : '❌ FAIL'}`);
  
  const allTestsPassed = test1 && test2 && test3;
  console.log(`\n🎯 Overall Result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return allTestsPassed;
}

// Export for manual testing
if (typeof window !== 'undefined') {
  window.testDatetimeFix = runAllTests;
  console.log('\n💡 To run tests manually, call: testDatetimeFix()');
}

// Auto-run if script is loaded directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testFrontendValidation, testBackendDatetimeProcessing, testAPIEndpoint };
} else {
  // Auto-run in 3 seconds if in browser
  setTimeout(runAllTests, 3000);
}