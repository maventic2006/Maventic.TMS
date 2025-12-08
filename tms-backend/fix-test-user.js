const knex = require("knex");
require("dotenv").config();

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password123",
    database: process.env.DB_NAME || "tms_dev",
  },
});

async function fixTestUser() {
  try {
    console.log("Ì¥ß Fixing TESTUSER password_type...\n");
    
    await db("user_master")
      .where({ user_id: 'TESTUSER' })
      .update({ 
        password_type: 'user_defined' // This will prevent requirePasswordReset
      });
    
    console.log("‚úÖ Test user password_type updated to 'user_defined'");
    console.log("ÌΩ™ Now cookies should be set properly on login");

  } catch (error) {
    console.error("‚ùå Error:", error.message);
  } finally {
    await db.destroy();
  }
}

fixTestUser();
