require("dotenv").config();
const bcrypt = require("bcrypt"); // Use bcrypt, not bcryptjs
const knex = require("knex")(require("./knexfile").development);

async function updatePOPasswords() {
  try {
    console.log("🔧 Updating Product Owner passwords...");

    // Hash the correct password
    const correctPassword = "ProductOwner@123";
    const hashedPassword = await bcrypt.hash(correctPassword, 10);

    console.log("Generated hash for ProductOwner@123:", hashedPassword);

    // Update PO001
    const po001Update = await knex("user_master")
      .where("user_id", "PO001")
      .update({
        password: hashedPassword,
        password_type: "actual",
        updated_at: new Date(),
        updated_by: "system"
      });

    // Update PO002  
    const po002Update = await knex("user_master")
      .where("user_id", "PO002")
      .update({
        password: hashedPassword,
        password_type: "actual", 
        updated_at: new Date(),
        updated_by: "system"
      });

    console.log(`PO001 updated: ${po001Update} rows`);
    console.log(`PO002 updated: ${po002Update} rows`);

    // Verify updates
    const users = await knex("user_master")
      .select("user_id", "status", "is_active", "password_type", "updated_at")
      .whereIn("user_id", ["PO001", "PO002"]);

    console.log("\n=== Updated User Status ===");
    users.forEach(user => {
      console.log(`${user.user_id}: status=${user.status}, active=${user.is_active}, password_type=${user.password_type}`);
    });

    // Test the new passwords
    console.log("\n=== Password Verification ===");
    const updatedUsers = await knex("user_master")
      .select("user_id", "password")
      .whereIn("user_id", ["PO001", "PO002"]);

    for (const user of updatedUsers) {
      const match = await bcrypt.compare(correctPassword, user.password);
      console.log(`${user.user_id} password 'ProductOwner@123' = ${match ? 'MATCH ✅' : 'NO MATCH ❌'}`);
    }

    console.log("\n✅ Password update completed successfully!");
    console.log("📝 Both users can now login with: ProductOwner@123");

  } catch (error) {
    console.error("❌ Error updating passwords:", error.message);
  } finally {
    await knex.destroy();
    process.exit(0);
  }
}

updatePOPasswords();
