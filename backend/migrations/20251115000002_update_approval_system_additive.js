/**
 * Migration: Update Approval System (ADDITIVE ONLY - NO DROPS)
 * Purpose: Add/update tables for approval workflow WITHOUT breaking existing data
 * Date: 2025-11-15
 */

exports.up = async function (knex) {
  console.log("🔄 Approval system update - checking what needs to be added...");

  // Helper to safely check column existence
  const columnExists = async (tableName, columnName) => {
    try {
      const columns = await knex("information_schema.columns")
        .where({ table_schema: knex.client.database(), table_name: tableName })
        .select("column_name");
      return columns.some(
        (col) =>
          String(col.column_name || col.COLUMN_NAME).toLowerCase() ===
          columnName.toLowerCase()
      );
    } catch (error) {
      console.log(
        `Error checking column ${columnName} in ${tableName}:`,
        error.message
      );
      return false;
    }
  };

  // STEP 1: Ensure user_master has all required columns
  try {
    const needsUserTypeId = !(await columnExists(
      "user_master",
      "user_type_id"
    ));
    const needsPassword = !(await columnExists("user_master", "password"));
    const needsPasswordType = !(await columnExists(
      "user_master",
      "password_type"
    ));
    const needsConsignorId = !(await columnExists(
      "user_master",
      "consignor_id"
    ));

    if (
      needsUserTypeId ||
      needsPassword ||
      needsPasswordType ||
      needsConsignorId
    ) {
      await knex.schema.table("user_master", function (table) {
        if (needsUserTypeId) {
          table.string("user_type_id", 10);
          console.log("  ✅ Added user_type_id to user_master");
        }
        if (needsPassword) {
          table.text("password");
          console.log("  ✅ Added password to user_master");
        }
        if (needsPasswordType) {
          table.string("password_type", 50).defaultTo("initial");
          console.log("  ✅ Added password_type to user_master");
        }
        if (needsConsignorId) {
          table.string("consignor_id", 20);
          console.log("  ✅ Added consignor_id to user_master");
        }
      });
    } else {
      console.log("  ℹ️  user_master already has all required columns");
    }
  } catch (error) {
    console.log("  ⚠️  Error updating user_master:", error.message);
  }

  // STEP 2: Ensure user_type_master and role_master exist (they should from earlier migrations)
  const hasUserTypeMaster = await knex.schema.hasTable("user_type_master");
  const hasRoleMaster = await knex.schema.hasTable("role_master");

  console.log(`  ${hasUserTypeMaster ? "✅" : "❌"} user_type_master exists`);
  console.log(`  ${hasRoleMaster ? "✅" : "❌"} role_master exists`);

  // STEP 3: Update approval tables if they exist
  if (await knex.schema.hasTable("approval_type_master")) {
    const needsCategory = !(await columnExists(
      "approval_type_master",
      "approval_category"
    ));
    if (needsCategory) {
      await knex.schema.table("approval_type_master", function (table) {
        table.string("approval_category", 50);
      });
      console.log("  ✅ Added approval_category to approval_type_master");
    }
  }

  if (await knex.schema.hasTable("approval_flow_trans")) {
    const updates = [];
    if (!(await columnExists("approval_flow_trans", "created_by_user_id")))
      updates.push("created_by_user_id");
    if (!(await columnExists("approval_flow_trans", "created_by_name")))
      updates.push("created_by_name");
    if (!(await columnExists("approval_flow_trans", "pending_with_role_id")))
      updates.push("pending_with_role_id");
    if (!(await columnExists("approval_flow_trans", "pending_with_user_id")))
      updates.push("pending_with_user_id");

    if (updates.length > 0) {
      await knex.schema.table("approval_flow_trans", function (table) {
        if (updates.includes("created_by_user_id"))
          table.string("created_by_user_id", 20);
        if (updates.includes("created_by_name"))
          table.string("created_by_name", 200);
        if (updates.includes("pending_with_role_id"))
          table.string("pending_with_role_id", 10);
        if (updates.includes("pending_with_user_id"))
          table.string("pending_with_user_id", 20);
      });
      console.log(`  ✅ Updated approval_flow_trans: ${updates.join(", ")}`);
    }
  }

  if (await knex.schema.hasTable("user_role_hdr")) {
    if (!(await columnExists("user_role_hdr", "role_id"))) {
      await knex.schema.table("user_role_hdr", function (table) {
        table.string("role_id", 10);
      });
      console.log("  ✅ Added role_id to user_role_hdr");
    }
  }

  if (await knex.schema.hasTable("approval_configuration")) {
    const needsTypeId = !(await columnExists(
      "approval_configuration",
      "approval_type_id"
    ));
    const needsRoleId = !(await columnExists(
      "approval_configuration",
      "role_id"
    ));

    if (needsTypeId || needsRoleId) {
      await knex.schema.table("approval_configuration", function (table) {
        if (needsTypeId) table.string("approval_type_id", 10);
        if (needsRoleId) table.string("role_id", 10);
      });
      console.log("  ✅ Updated approval_configuration columns");
    }
  }

  console.log("🎉 Approval system schema update complete!");
};

exports.down = async function (knex) {
  console.log("⚠️  Rollback skipped to preserve existing data");
};
