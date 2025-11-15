/**
 * Migration: Seed Product Owner 2 User
 * Purpose: Create second Product Owner for cross-approval workflow
 * Date: 2025-11-15
 */

const bcrypt = require("bcrypt");

exports.up = async function (knex) {
  console.log("🔄 Creating Product Owner users...");

  // Hash the initial password
  const initialPassword = "ProductOwner@123";
  const hashedPassword = await bcrypt.hash(initialPassword, 10);

  // Ensure user_role_hdr table exists
  const hasUserRoleHdr = await knex.schema.hasTable("user_role_hdr");

  if (!hasUserRoleHdr) {
    console.log(
      "  ⚠️  user_role_hdr table does not exist, skipping role assignments"
    );
    console.log("  ℹ️  Users will be created without role mappings");
  }

  // Check if Product Owner 1 already exists
  const po1 = await knex("user_master").where("user_id", "PO001").first();

  if (!po1) {
    await knex("user_master").insert({
      user_id: "PO001",
      user_type_id: "UT001",
      user_full_name: "Product Owner 1",
      email_id: "productowner1@tms.com",
      mobile_number: "9876543210",
      from_date: knex.fn.now(),
      is_active: true,
      password: hashedPassword,
      password_type: "initial",
      status: "ACTIVE",
      created_by: "SYSTEM",
      created_at: knex.fn.now(),
    });
    console.log("  ✅ Created Product Owner 1");
  } else {
    console.log("  ℹ️  Product Owner 1 already exists");
  }

  // Check if Product Owner 2 already exists
  const po2 = await knex("user_master").where("user_id", "PO002").first();

  if (!po2) {
    await knex("user_master").insert({
      user_id: "PO002",
      user_type_id: "UT001",
      user_full_name: "Product Owner 2",
      email_id: "productowner2@tms.com",
      mobile_number: "9876543211",
      from_date: knex.fn.now(),
      is_active: true,
      password: hashedPassword,
      password_type: "initial",
      status: "ACTIVE",
      created_by: "SYSTEM",
      created_at: knex.fn.now(),
    });
    console.log("  ✅ Created Product Owner 2");
    console.log("  📧 Email: productowner2@tms.com");
    console.log("  🔑 Initial Password: ProductOwner@123");
    console.log("  ⚠️  Must change password on first login");
  } else {
    console.log("  ℹ️  Product Owner 2 already exists");
  }

  console.log("🎉 Product Owner setup complete!");
};

exports.down = async function (knex) {
  console.log("🔄 Rolling back Product Owner users...");

  // Remove users only
  await knex("user_master").whereIn("user_id", ["PO001", "PO002"]).del();

  console.log("✅ Rollback completed");
};
