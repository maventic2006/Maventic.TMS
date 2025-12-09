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

async function checkTestUser() {
  try {
    console.log("Ì±§ Checking TESTUSER details...\n");
    
    const user = await db("user_master")
      .where({ user_id: 'TESTUSER' })
      .first();

    if (user) {
      console.log("Ì≥ã User Details:");
      console.log(JSON.stringify(user, null, 2));
      
      console.log("\nÌ¥ç Key Fields:");
      console.log("   password_type:", user.password_type);
      console.log("   requirePasswordReset:", user.password_type === "initial" || !user.password_type);
    } else {
      console.log("‚ùå TESTUSER not found");
    }

  } catch (error) {
    console.error("‚ùå Error:", error.message);
  } finally {
    await db.destroy();
  }
}

checkTestUser();
