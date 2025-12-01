const fs = require('fs');
const path = require('path');

console.log('Creating transporter vehicle config routes...');
const routesContent = // Routes file content here;
fs.writeFileSync(path.join(__dirname, 'tms-backend', 'routes', 'transporter-vehicle-config.js'), routesContent);
console.log(' Routes created');
