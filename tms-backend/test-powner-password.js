const bcrypt = require('bcrypt');

const testPasswordHash = async () => {
  const storedHash = '$2b$10$e8.2wzq9BtRxf.liCG1/Teas1wlEbPvX1ckxfUR50lse1A3rMGf1m';
  
  console.log('Ì¥ç Testing common password patterns for PO001...');
  
  const passwordsToTest = [
    'POWNER@1',
    'PO001@123',
    'productowner1',
    'ProductOwner1',
    'PO001',
    'test123',
    'admin123',
    'TMS@123'
  ];
  
  for (const testPass of passwordsToTest) {
    try {
      const result = await bcrypt.compare(testPass, storedHash);
      if (result) {
        console.log(`‚úÖ FOUND CORRECT PASSWORD: "${testPass}"`);
        return testPass;
      } else {
        console.log(`‚ùå "${testPass}": no match`);
      }
    } catch (error) {
      console.log(`‚ùå "${testPass}": error -`, error.message);
    }
  }
  
  console.log('\n‚ö†Ô∏è  No matching password found from common patterns');
  console.log('Ì≤° You may need to reset the password for PO001');
};

testPasswordHash();
