require('dotenv').config();
const knex = require('knex')(require('./knexfile').development);

async function testLogin() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test database connection
    await knex.raw('SELECT 1');
    console.log('✅ Database connected successfully');
    
    // Check if user_master table exists
    const tableExists = await knex.schema.hasTable('user_master');
    console.log('📋 user_master table exists:', tableExists);
    
    if (tableExists) {
      // Get user count
      const userCount = await knex('user_master').count('* as count').first();
      console.log('👥 Total users in database:', userCount.count);
      
      // Get first few users
      const users = await knex('user_master')
        .select('user_id', 'user_full_name', 'status', 'password_type')
        .limit(5);
      
      console.log('👤 Sample users:', users);
      
      // Try to find a specific test user
      const testUser = await knex('user_master')
        .where({ user_id: 'admin' })
        .orWhere({ user_id: 'test' })
        .orWhere({ user_id: 'demo' })
        .first();
        
      console.log('🔍 Found test user:', testUser ? testUser.user_id : 'None found');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await knex.destroy();
    process.exit(0);
  }
}

testLogin();