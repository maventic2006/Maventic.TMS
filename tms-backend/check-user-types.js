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

async function checkUserData() {
  try {
    console.log("Ì¥ç Checking User Data\n");
    
    // Check if user_master table exists and get sample users
    const users = await db("user_master")
      .select("user_id", "user_full_name", "user_type_id", "email_id", "status")
      .limit(10);

    console.log("Ì±• Current Users:");
    console.log("================");
    users.forEach(user => {
      console.log(`Ì±§ ${user.user_id} - ${user.user_full_name}`);
      console.log(`   Type: ${user.user_type_id} | Status: ${user.status}`);
      console.log(`   Email: ${user.email_id}\n`);
    });

    // Check user type mappings
    const userTypes = await db("user_type_master")
      .select("user_type_id", "user_type")
      .where("status", "ACTIVE");

    console.log("Ìø∑Ô∏è  User Type Mappings:");
    console.log("======================");
    userTypes.forEach(type => {
      console.log(`${type.user_type_id}: ${type.user_type}`);
    });

  } catch (error) {
    console.error("‚ùå Error:", error.message);
  } finally {
    await db.destroy();
  }
}

checkUserData();
