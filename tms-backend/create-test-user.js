require("dotenv").config();
const bcrypt = require("bcryptjs");
const knex = require("knex")(require("./knexfile").development);

async function createTestUser() {
  try {
    console.log("🔧 Creating test user...");

    // Check if test user already exists
    const existingUser = await knex("user_master")
      .where({ user_id: "test" })
      .first();

    // if (existingUser) {
    //   console.log("👤 Test user already exists");
    //   return;
    // }

    // Hash password
    const hashedPassword = await bcrypt.hash("test456", 12);

    // Create test user
    await knex("user_master").insert({
      user_id: "test1",
      user_full_name: "Test User 1",
      user_type_id: "UT001", // Consignor
      email_id: "test1@example.com",
      password: hashedPassword,
      password_type: "initial", // Set to initial to require password reset
      status: "ACTIVE",
      is_active: true,
      created_at: new Date(),
      created_by: "system",
    });

    console.log("✅ Test user created successfully");
    console.log("📝 Credentials: test1 / test456");
  } catch (error) {
    console.error("❌ Error creating test user:", error.message);
  } finally {
    await knex.destroy();
    process.exit(0);
  }
}

createTestUser();
