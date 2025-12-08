const mysql = require('mysql2/promise');

const checkPO001 = async () => {
  try {
    const connection = await mysql.createConnection({
      host: '192.168.2.27',
      port: 3306,
      user: 'root',
      password: 'Ventic*2025#',
      database: 'tms_dev'
    });
    
    console.log('Ì¥ç Searching for PO001 user...');
    
    const [users] = await connection.execute(
      'SELECT user_id, user_full_name, email_id, password, is_active, status FROM user_master WHERE user_id = ?',
      ['PO001']
    );
    
    if (users.length > 0) {
      const user = users[0];
      console.log('\nÌ≥ã PO001 User Details:');
      console.log(`  User ID: ${user.user_id}`);
      console.log(`  Full Name: ${user.user_full_name}`);
      console.log(`  Email: ${user.email_id}`);
      console.log(`  Password Hash: ${user.password}`);
      console.log(`  Active: ${user.is_active}`);
      console.log(`  Status: ${user.status}`);
    } else {
      console.log('‚ùå No user found with ID PO001');
      
      // Let's check for any users with similar IDs
      const [similarUsers] = await connection.execute(
        'SELECT user_id, user_full_name FROM user_master WHERE user_id LIKE ?',
        ['PO%']
      );
      
      console.log('\nÌ¥ç Users starting with PO:');
      similarUsers.forEach(user => {
        console.log(`  ${user.user_id} - ${user.user_full_name}`);
      });
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('‚ùå Error:', error.message);
  }
};

checkPO001();
