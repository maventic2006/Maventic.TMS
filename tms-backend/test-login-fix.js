const axios = require('axios');

async function testLogin() {
  try {
    console.log("Ì¥ë Testing login with TESTUSER (UT006 - Consignor Admin)...");
    
    // Create axios instance with cookie jar
    const axiosInstance = axios.create({
      baseURL: 'http://localhost:5001/api',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const loginResponse = await axiosInstance.post('/auth/login', {
      user_id: 'TESTUSER',
      password: 'test123'
    });
    
    console.log("‚úÖ Login successful!");
    console.log("User:", loginResponse.data.user?.user_id);
    console.log("User Type:", loginResponse.data.user?.user_type_id);
    
    // Extract cookies from login response
    const cookies = loginResponse.headers['set-cookie'];
    console.log("ÌΩ™ Received cookies:", cookies);
    
    // Wait a moment for cookie to be set
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Now test consignor API access using same axios instance
    console.log("\nÌø¢ Testing consignor API access...");
    const consignorResponse = await axiosInstance.get('/consignors/CUST00001');
    
    console.log("‚úÖ Consignor API access successful!");
    console.log("Consignor Name:", consignorResponse.data.data?.customer_name);
    
    console.log("\nÌæâ SUCCESS: UT006 users can now access consignor resources without logout!");
    
  } catch (error) {
    console.error("‚ùå Error:", error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.log("Ì¥í Access denied - this means our middleware update needs to be checked");
    }
    if (error.response?.status === 401) {
      console.log("ÔøΩÔøΩ Authentication failed - cookie issue");
    }
  }
}

testLogin();
