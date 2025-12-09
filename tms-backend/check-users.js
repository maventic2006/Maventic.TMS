const mysql = require('mysql2/promise');

const checkUsers = async () => {
  try {
    const connection = await mysql.createConnection({
      host: '192.168.2.27',
      port: 3306,
      user: 'root',
      password: 'Ventic*2025#',
      database: 'tms_dev'
    });
    
    console.log('Ì¥ç Checking users in user_master table...');
    
    // Check all users with PO001
    const [po001Users] = await connection.execute(
      'SELECT user_id, user_name, email, password, is_active FROM user_master WHERE user_id LIKE ?',
      ['PO%']
    );
    
    console.log('\nÌ≥ã Users starting with PO:');
    po001Users.forEach(user => {
      console.log(`  User ID: ${user.user_id}`);
      console.log(`  Name: ${user.user_name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Active: ${user.is_active}`);
      console.log('  ---');
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('‚ùå Error checking users:', error.message);
  }
};

checkUsers();
