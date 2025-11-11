require('dotenv').config();
const db = require('./config/database');

async function updateTestUser() {
  try {
    await db('user_master')
      .where({ user_id: 'test1' })
      .update({ password_type: 'normal' });
    console.log(' Updated test user password_type to normal');
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
}

updateTestUser();
