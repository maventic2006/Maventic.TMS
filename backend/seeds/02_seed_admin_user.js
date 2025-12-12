/**
 * Seed file: Sample Admin User
 * Creates a default admin user for testing
 * Password: Admin@123
 */
const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
  // Check if admin user already exists
  const existingAdmin = await knex('user_master_log')
    .where('email_id', 'admin@tms.com')
    .first();
  
  if (existingAdmin) {
    console.log('ℹ  Admin user already exists');
    return;
  }
  
  // Generate next user ID
  /* ADAPT: match existing user_id generation logic */
  const result = await knex('user_master_log').count('* as count').first();
  const count = parseInt(result.count) + 1;
  const userId = USR; // Format: USR000001
  
  // Hash password
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  // Insert admin user
  await knex('user_master_log').insert({
    user_id: userId,
    user_type_id: 'UT001', // Assuming UT001 is Admin type from user_type_master
    user_full_name: 'System Administrator',
    email_id: 'admin@tms.com',
    mobile_number: '9999999999',
    alternet_mobile: null,
    whats_app_number: '9999999999',
    from_date: knex.fn.now(),
    to_date: null,
    is_active: true,
    created_by_user_id: 'SYSTEM',
    consignor_id: null,
    approval_cycle: null,
    password: hashedPassword,
    password_type: 'initial', // User must change password on first login
    status: 'ACTIVE',
    created_by: 'SYSTEM'
  });
  
  console.log(`✅ Created admin user with ID: ${userId}`);
  console.log('   Email: admin@tms.com');
  console.log('   Password: Admin@123 (must change on first login)');
  
  // Add admin role to user_role_header (global role, no warehouse restriction)
  await knex('user_role_header').insert({
    user_id: userId,
    role: 'admin',
    warehouse_id: null, // null = global admin role
    is_active: true,
    status: 'ACTIVE',
    created_by: 'SYSTEM'
  });
  console.log('✅ Assigned global admin role to user');
};
