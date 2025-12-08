const bcrypt = require('bcrypt');

const testPasswordHash = async () => {
  const password = '123456';
  const storedHash = '$2b$10$e8.2wzq9BtRxf.liCG1/Teas1wlEbPvX1ckxfUR50lse1A3rMGf1m';
  
  console.log('Ì¥ç Testing password comparison...');
  console.log('Input password:', password);
  console.log('Stored hash:', storedHash);
  
  try {
    const isValid = await bcrypt.compare(password, storedHash);
    console.log('‚úÖ Password comparison result:', isValid);
    
    if (!isValid) {
      console.log('\nÌ¥Ñ Testing common password variations...');
      const variations = ['123456', 'password', 'admin', 'test', '1234', '12345'];
      
      for (const testPass of variations) {
        const result = await bcrypt.compare(testPass, storedHash);
        console.log(`  "${testPass}": ${result}`);
      }
      
      // Let's also generate a new hash for 123456 to compare structure
      console.log('\nÌ¥ë Generating new hash for "123456":');
      const newHash = await bcrypt.hash('123456', 10);
      console.log('New hash:', newHash);
      
      const testNewHash = await bcrypt.compare('123456', newHash);
      console.log('New hash validates:', testNewHash);
    }
    
  } catch (error) {
    console.error('‚ùå Error during password comparison:', error);
  }
};

testPasswordHash();
