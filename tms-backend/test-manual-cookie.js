const axios = require('axios');

async function testLoginWithCookie() {
  try {
    console.log("Ì¥ë Testing login with TESTUSER (UT006 - Consignor Admin)...");
    
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      user_id: 'TESTUSER',
      password: 'test123'
    });
    
    console.log("‚úÖ Login successful!");
    console.log("User:", loginResponse.data.user?.user_id);
    console.log("User Type:", loginResponse.data.user?.user_type_id);
    
    // Manually check response headers
    console.log("\nÌ≥ã Full Response Headers:");
    console.log(JSON.stringify(loginResponse.headers, null, 2));
    
    // Look for set-cookie header
    const setCookieHeader = loginResponse.headers['set-cookie'];
    console.log("\nÌΩ™ Set-Cookie Header:", setCookieHeader);
    
    if (setCookieHeader) {
      // Extract cookie value manually
      const authCookie = setCookieHeader.find(cookie => cookie.includes('authToken='));
      if (authCookie) {
        const cookieValue = authCookie.split(';')[0];
        console.log("ÌæØ Extracted cookie:", cookieValue);
        
        // Now test consignor API access with manual cookie
        console.log("\nÌø¢ Testing consignor API access with manual cookie...");
        const consignorResponse = await axios.get('http://localhost:5001/api/consignors/CUST00001', {
          headers: {
            'Cookie': cookieValue
          }
        });
        
        console.log("‚úÖ Consignor API access successful!");
        console.log("Consignor Name:", consignorResponse.data.data?.customer_name);
        
        console.log("\nÌæâ SUCCESS: UT006 users can now access consignor resources without logout!");
      } else {
        console.log("‚ùå No authToken cookie found in set-cookie header");
      }
    } else {
      console.log("‚ùå No set-cookie header found in login response");
    }
    
  } catch (error) {
    console.error("‚ùå Error:", error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.log("Ì¥í Access denied - middleware configuration issue");
    }
    if (error.response?.status === 401) {
      console.log("Ì¥ê Authentication failed");
    }
  }
}

testLoginWithCookie();
