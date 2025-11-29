console.log('🔍 DEBUGGING STATUS CONFIGURATION DATA FLOW\n');

// Step 1: Test direct database access
console.log('1️⃣ Testing Direct Database Access...');
require('dotenv').config();
const db = require('./tms-backend/config/database');

async function testDatabaseAccess() {
  try {
    const records = await db('status_master').select('*').limit(3);
    console.log('✅ Database Query Success:');
    console.log(`   Records found: ${records.length}`);
    if (records.length > 0) {
      console.log('   Sample record keys:', Object.keys(records[0]).join(', '));
      console.table(records.map(r => ({
        ID: r.status_id,
        Name: r.status_name,
        Purpose: r.status_purpose_id,
        Status: r.status,
        Active: r.isActive
      })));
    }
    return records;
  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return null;
  }
}

// Step 2: Test configuration controller
console.log('\n2️⃣ Testing Configuration Controller...');
async function testController() {
  try {
    const { getConfigurationData } = require('./tms-backend/controllers/configurationController');
    
    const mockReq = {
      params: { configName: 'status' },
      query: { page: 1, limit: 5, status: 'ACTIVE' }
    };
    
    let controllerResponse = null;
    const mockRes = {
      json: (data) => { controllerResponse = data; },
      status: (code) => ({ 
        json: (data) => { controllerResponse = { statusCode: code, ...data }; }
      })
    };
    
    await getConfigurationData(mockReq, mockRes);
    console.log('✅ Controller Response Structure:');
    console.log('   Success:', controllerResponse?.success);
    console.log('   Message:', controllerResponse?.message);
    console.log('   Data type:', typeof controllerResponse?.data);
    
    if (controllerResponse?.success && controllerResponse?.data) {
      const { data, pagination } = controllerResponse.data;
      console.log('   Records array length:', data?.length || 0);
      console.log('   Pagination:', JSON.stringify(pagination, null, 2));
      
      if (data && data.length > 0) {
        console.log('   Sample record from controller:');
        console.log('   Keys:', Object.keys(data[0]).join(', '));
        console.log('   Values:', JSON.stringify(data[0], null, 2));
      }
    }
    
    return controllerResponse;
  } catch (error) {
    console.error('❌ Controller Error:', error.message);
    return null;
  }
}

// Step 3: Test API endpoint structure
console.log('\n3️⃣ Testing API Endpoint Structure...');
async function testAPIStructure() {
  const masterConfig = require('./tms-backend/config/master-configurations.json')['status'];
  console.log('✅ Configuration Structure:');
  console.log('   Table:', masterConfig.table);
  console.log('   Primary Key:', masterConfig.primaryKey);
  console.log('   Display Field:', masterConfig.displayField);
  console.log('   Total Fields:', Object.keys(masterConfig.fields).length);
  console.log('   Field Names:', Object.keys(masterConfig.fields).join(', '));
  
  return masterConfig;
}

// Run all tests
async function runAllTests() {
  try {
    const dbRecords = await testDatabaseAccess();
    const controllerResponse = await testController();
    const configStructure = await testAPIStructure();
    
    console.log('\n🎯 ANALYSIS SUMMARY:');
    console.log('===================');
    
    if (dbRecords && dbRecords.length > 0) {
      console.log('✅ Database: Working - Records available');
    } else {
      console.log('❌ Database: No records found');
    }
    
    if (controllerResponse && controllerResponse.success) {
      console.log('✅ Controller: Working - Returns proper structure');
    } else {
      console.log('❌ Controller: Not working properly');
    }
    
    if (configStructure && configStructure.table) {
      console.log('✅ Configuration: Valid - Table mapping exists');
    } else {
      console.log('❌ Configuration: Invalid structure');
    }
    
    console.log('\n🔧 Expected Frontend Redux Flow:');
    console.log('1. API Call: GET /configuration/status/data');
    console.log('2. Response: { success: true, data: { data: [...], pagination: {...} } }');
    console.log('3. Redux: state.data = response.data.data (records array)');
    console.log('4. Redux: state.pagination = response.data.pagination');
    console.log('5. Component: Uses data directly as array');
    
    if (controllerResponse && controllerResponse.success) {
      console.log('\n✅ Backend is working correctly!');
      console.log('👀 Issue is likely in frontend Redux state handling or authentication');
    }
    
  } catch (error) {
    console.error('❌ Test Suite Error:', error.message);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

runAllTests();