const axios = require('axios');

async function testLogin() {
  try {
    console.log("Ì¥ë Testing login with TESTUSER (UT006 - Consignor Admin)...");
    
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      user_id: 'TESTUSER',
      password: 'test123'
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("‚úÖ Login successful!");
    console.log("User:", loginResponse.data.user?.user_id);
    console.log("User Type:", loginResponse.data.user?.user_type_id);
    
    // Get cookies for subsequent requests
    const cookies = loginResponse.headers['set-cookie'];
    const cookieHeader = cookies ? cookies.join('; ') : '';
    
    // Now test consignor API access
    console.log("\nÌø¢ Testing consignor API access...");
    const consignorResponse = await axios.get('http://localhost:5001/api/consignors/CUST00001', {
      headers: {
        'Cookie': cookieHeader
      }
    });
    
    console.log("‚úÖ Consignor API access successful!");
    console.log("Consignor Name:", consignorResponse.data.data?.customer_name);
    
    console.log("\nÌæâ SUCCESS: UT006 users can now access consignor resources without logout!");
    
  } catch (error) {
    console.error("‚ùå Error:", error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.log("Ì¥í Access denied - need to check middleware configuration");
    }
    if (error.response?.status === 401) {
      console.log("Ì¥ê Authentication failed - check credentials");
    }
  }
}

testLogin();
