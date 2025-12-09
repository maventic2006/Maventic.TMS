const axios = require('axios');

console.log('Ì¥ç CHECKING SERVER STATUS');

const checkHealth = async () => {
  try {
    console.log('Ì≥° Testing health endpoint: http://localhost:5000/api/health');
    
    const response = await axios.get('http://localhost:5000/api/health', {
      timeout: 5000
    });
    
    console.log('‚úÖ Health Check Success:', response.data);
    
    // Now test database connection
    console.log('\nÌ≥° Testing database connection...');
    const dbResponse = await axios.get('http://localhost:5000/api/auth/user-types', {
      timeout: 10000
    });
    
    console.log('‚úÖ Database Connection Success:', dbResponse.data);
    
  } catch (error) {
    console.error('‚ùå SERVER CHECK ERROR:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Ì∫® Server is not responding - check if npm start is running');
    }
  }
};

checkHealth();
