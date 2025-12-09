const mysql = require('mysql2/promise');

const checkTable = async () => {
  try {
    const connection = await mysql.createConnection({
      host: '192.168.2.27',
      port: 3306,
      user: 'root',
      password: 'Ventic*2025#',
      database: 'tms_dev'
    });
    
    console.log('Ì¥ç Checking user_master table structure...');
    
    const [columns] = await connection.execute('DESCRIBE user_master');
    
    console.log('\nÌ≥ã Table Structure:');
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} (${col.Null === 'YES' ? 'Nullable' : 'Not Null'})`);
    });
    
    console.log('\nÌ¥ç Sample users:');
    const [users] = await connection.execute('SELECT * FROM user_master LIMIT 5');
    users.forEach(user => {
      console.log('User:', user);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('‚ùå Error:', error.message);
  }
};

checkTable();
