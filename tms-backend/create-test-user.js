const knex = require("knex");
const bcrypt = require("bcrypt");
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

async function createTestUser() {
  try {
    console.log("Ì±§ Creating test user for access control testing...\n");
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Create test user with UT006 type (Consignor Admin)
    await db("user_master").insert({
      user_id: 'TESTUSER',
      user_full_name: 'Test User for Access Control',
      user_type_id: 'UT006',
      email_id: 'testuser@test.com',
      password: hashedPassword,
      status: 'ACTIVE',
      created_at: new Date(),
      created_by: 'SYSTEM'
    });
    
    console.log("‚úÖ Test user created successfully!");
    console.log("Ì≥ã User Details:");
    console.log("   ID: TESTUSER");
    console.log("   Password: test123");
    console.log("   Type: UT006 (Consignor Admin)");
    console.log("   Status: ACTIVE");
    console.log("\nÌ∑™ You can now test login with these credentials");

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log("‚ÑπÔ∏è  Test user already exists, using existing user");
      console.log("Ì≥ã User Details:");
      console.log("   ID: TESTUSER");
      console.log("   Password: test123");
      console.log("   Type: UT006 (Consignor Admin)");
    } else {
      console.error("‚ùå Error:", error.message);
    }
  } finally {
    await db.destroy();
  }
}

createTestUser();
