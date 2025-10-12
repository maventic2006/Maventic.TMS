const http = require('http');

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testVehicleAPIs() {
  console.log('🧪 Testing Vehicle Management APIs\n');
  
  try {
    // Test 1: Get all vehicles
    console.log('📋 Test 1: GET /api/vehicles (All vehicles)');
    const allVehicles = await makeRequest('/api/vehicles');
    console.log(`Status: ${allVehicles.status}`);
    if (allVehicles.data.success) {
      console.log(`✅ Found ${allVehicles.data.count} vehicles`);
      allVehicles.data.data.forEach(vehicle => {
        console.log(`   🚚 ${vehicle.vehicle_id_code_hdr} - ${vehicle.maker_brand_description} ${vehicle.maker_model}`);
      });
    }
    console.log();

    // Test 2: Get specific vehicle details
    console.log('📋 Test 2: GET /api/vehicles/VH001 (Specific vehicle)');
    const vehicleDetails = await makeRequest('/api/vehicles/VH001');
    console.log(`Status: ${vehicleDetails.status}`);
    if (vehicleDetails.data.success) {
      const vehicle = vehicleDetails.data.data.vehicle;
      console.log(`✅ Vehicle: ${vehicle.maker_brand_description} ${vehicle.maker_model}`);
      console.log(`   VIN: ${vehicle.vin_chassis_no}`);
      console.log(`   Insurance Policies: ${vehicleDetails.data.data.insurance.length}`);
      console.log(`   Maintenance Records: ${vehicleDetails.data.data.maintenance.length}`);
    }
    console.log();

    // Test 3: Get maintenance history for specific vehicle
    console.log('📋 Test 3: GET /api/vehicles/VH001/maintenance (Maintenance history)');
    const maintenanceHistory = await makeRequest('/api/vehicles/VH001/maintenance');
    console.log(`Status: ${maintenanceHistory.status}`);
    if (maintenanceHistory.data.success) {
      console.log(`✅ Found ${maintenanceHistory.data.count} maintenance records`);
      maintenanceHistory.data.data.forEach(record => {
        console.log(`   🔧 ${record.service_date} - ${record.type_of_service} (₹${record.service_expense})`);
      });
    }
    console.log();

    // Test 4: Health check
    console.log('📋 Test 4: GET /api/health (Health check)');
    const health = await makeRequest('/api/health');
    console.log(`Status: ${health.status}`);
    if (health.status === 200) {
      console.log(`✅ Server healthy - ${health.data.status}`);
    }
    console.log();

    console.log('🎉 All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error.message);
  }
}

testVehicleAPIs();