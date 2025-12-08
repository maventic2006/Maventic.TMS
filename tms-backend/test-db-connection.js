const mysql = require('mysql2/promise');

console.log('Ì¥ç TESTING DATABASE CONNECTION');
console.log('Host: 192.168.2.27:3306');
console.log('Database: tms_dev');
console.log('User: root');

const testConnection = async () => {
  try {
    console.log('Ì≥° Attempting to connect...');
    
    const connection = await mysql.createConnection({
      host: '192.168.2.27',
      port: 3306,
      user: 'root',
      password: 'Ventic*2025#',
      database: 'tms_dev',
      connectTimeout: 10000, // 10 seconds
      acquireTimeout: 10000,
      timeout: 10000
    });
    
    console.log('‚úÖ Database connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM user_master');
    console.log('‚úÖ Test query successful:', rows[0]);
    
    await connection.end();
    console.log('‚úÖ Connection closed properly');
    
  } catch (error) {
    console.error('‚ùå DATABASE CONNECTION ERROR:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('SQL State:', error.sqlState);
    
    if (error.code === 'ETIMEDOUT') {
      console.error('Ì∫® CONNECTION TIMEOUT - Database server not reachable');
      console.error('Possible issues:');
      console.error('  1. Database server is not running');
      console.error('  2. Network connectivity issues');
      console.error('  3. Firewall blocking connection');
      console.error('  4. IP address 192.168.2.27 is not accessible');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Ì∫® CONNECTION REFUSED - Database server not accepting connections');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Ì∫® ACCESS DENIED - Wrong username/password');
    }
  }
};

testConnection();
