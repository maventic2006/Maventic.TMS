/**
 * Seed file: Test Users for Pagination
 * Creates multiple test users to properly test pagination functionality
 */
const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
  try {
    // Check if test users already exist
    const existingUsers = await knex('user_master')
      .where('user_type_id', 'UT_TEST')
      .count('* as count')
      .first();
    
    if (existingUsers.count > 0) {
      console.log('?  Test users already exist, skipping seed');
      return;
    }
    
    console.log(' Seeding test users for pagination...');
    
    // Generate 25 test users for proper pagination testing
    const testUsers = [];
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    
    for (let i = 1; i <= 25; i++) {
      const paddedNum = String(i).padStart(5, '0');
      testUsers.push({
        user_id: TST + paddedNum,
        user_type_id: 'UT_TEST',
        user_full_name: Test User  + i,
        email_id: 	estuser + i + @tms.com,
        mobile_number: ('900000000' + String(i).padStart(2, '0')).slice(-10),
        alternet_mobile: ('910000000' + String(i).padStart(2, '0')).slice(-10),
        whats_app_number: ('920000000' + String(i).padStart(2, '0')).slice(-10),
        from_date: new Date('2024-01-01'),
        to_date: null,
        is_active: i % 2 === 0,
        created_by_user_id: 'ADMIN',
        consignor_id: null,
        approval_cycle: null,
        password: hashedPassword,
        password_type: 'test',
        status: i % 3 === 0 ? 'PENDING' : 'ACTIVE',
        created_by: 'SEED',
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    
    // Insert all test users
    await knex('user_master').insert(testUsers);
    
    console.log( Created  + testUsers.length +  test users for pagination testing);
    console.log('   Users: TST00001 to TST00025');
    console.log('   Email pattern: testuser{1-25}@tms.com');
    console.log('   With 10 users per page, you will have 3 pages (10 + 10 + 5)');
    
  } catch (error) {
    console.error(' Error seeding test users:', error.message);
    throw error;
  }
};
