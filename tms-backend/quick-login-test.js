const http = require('http');

const postData = JSON.stringify({
  user_id: 'PO001',
  password: '123456'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`‚úÖ Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('‚úÖ Response Body:', body);
    if (res.statusCode === 200) {
      console.log('Ìæâ LOGIN SUCCESSFUL! Backend is working properly.');
    } else {
      console.log('‚ùå Login failed with status:', res.statusCode);
    }
  });
});

req.on('error', (e) => {
  console.error(`‚ùå Request error: ${e.message}`);
});

console.log('Ì¥ç Testing login for user PO001...');
req.write(postData);
req.end();
