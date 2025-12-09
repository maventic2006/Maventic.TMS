const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const resetPassword = async () => {
  try {
    const connection = await mysql.createConnection({
      host: '192.168.2.27',
      port: 3306,
      user: 'root',
      password: 'Ventic*2025#',
      database: 'tms_dev'
    });
    
    console.log('Ì¥ë Resetting PO001 password to "123456"...');
    
    // Generate new hash for password "123456"
    const newPasswordHash = await bcrypt.hash('123456', 10);
    console.log('New password hash:', newPasswordHash);
    
    // Update the user password
    const result = await connection.execute(
      'UPDATE user_master SET password = ?, password_type = "reset", updated_at = NOW() WHERE user_id = ?',
      [newPasswordHash, 'PO001']
    );
    
    console.log('‚úÖ Password updated successfully!');
    console.log('Affected rows:', result[0].affectedRows);
    
    // Verify the update
    const [updatedUser] = await connection.execute(
      'SELECT user_id, password, password_type FROM user_master WHERE user_id = ?',
      ['PO001']
    );
    
    if (updatedUser.length > 0) {
      console.log('\n‚úÖ Verification:');
      console.log('User ID:', updatedUser[0].user_id);
      console.log('New Password Hash:', updatedUser[0].password);
      console.log('Password Type:', updatedUser[0].password_type);
      
      // Test the new password
      const isValid = await bcrypt.compare('123456', updatedUser[0].password);
      console.log('Password validation:', isValid ? '‚úÖ SUCCESS' : '‚ùå FAILED');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('‚ùå Error resetting password:', error.message);
  }
};

resetPassword();
