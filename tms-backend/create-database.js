const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  try {
    console.log('🔍 Attempting to connect to MySQL...');
    console.log(`📍 Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`👤 User: ${process.env.DB_USER || 'root'}`);
    console.log(`🔑 Password: ${process.env.DB_PASSWORD ? '***' : '(empty)'}`);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ MySQL connection successful!');

    const dbName = process.env.DB_NAME || 'tms_dev';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' created/exists`);

    // Test the database
    await connection.query(`USE ${dbName}`);
    const [rows] = await connection.query('SHOW TABLES');
    console.log(`📊 Tables in database: ${rows.length}`);

    await connection.end();
    console.log('✅ Connection closed');
    console.log('\n🎉 Database setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run migrations: npx knex migrate:latest');
    console.log('   2. Seed data (optional): npx knex seed:run');
    console.log('   3. Start server: npm start');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MySQL Error:', error.message);
    console.error('\n📋 Troubleshooting:');
    
    if (error.message.includes('Access denied')) {
      console.error('   ⚠️  AUTHENTICATION FAILED');
      console.error('   1. Check DB_PASSWORD in .env file');
      console.error('   2. Verify MySQL root user password');
      console.error('   3. Try resetting MySQL root password');
      console.error('\n   💡 To reset MySQL password:');
      console.error('      - Stop-Service MySQL80');
      console.error('      - Create C:\\mysql-init.txt with: ALTER USER \'root\'@\'localhost\' IDENTIFIED BY \'new_password\';');
      console.error('      - Run: & "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqld.exe" --init-file=C:\\mysql-init.txt');
      console.error('      - Stop and Start-Service MySQL80');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('   ⚠️  MYSQL SERVICE NOT RUNNING');
      console.error('   1. Start MySQL: Start-Service MySQL80');
      console.error('   2. Check if MySQL is installed');
    } else {
      console.error('   1. Ensure MySQL service is running: Get-Service MySQL80');
      console.error('   2. Check .env file has correct values');
      console.error('   3. Verify network connectivity to database host');
    }
    
    process.exit(1);
  }
}

createDatabase();
