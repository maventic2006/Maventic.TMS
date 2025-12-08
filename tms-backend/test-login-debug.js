const axios = require('axios');

console.log('Ì¥ç DEBUGGING LOGIN ERROR - Testing PO001');

const testLogin = async () => {
  try {
    console.log('Ì≥° Making login request to: http://localhost:5000/api/auth/login');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      user_id: 'PO001',
      password: 'password123'  // Default password for testing
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('‚úÖ Login Success:', response.data);
    
  } catch (error) {
    console.error('‚ùå LOGIN ERROR DETAILS:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
    console.error('Full Error:', error.message);
    
    if (error.response?.status === 500) {
      console.error('Ì∫® SERVER ERROR - This indicates a backend issue');
      console.error('Check the server logs in the terminal where npm start is running');
    }
  }
};

testLogin();
