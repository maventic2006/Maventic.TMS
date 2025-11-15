/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  console.log("🔄 Creating approval system tables...");

  // ========================================
  // STEP 1: CREATE APPROVAL_TYPE_MASTER TABLE
  // ========================================

  const approvalTypeMasterExists = await knex.schema.hasTable(
    "approval_type_master"
  );

  if (!approvalTypeMasterExists) {
    await knex.schema.createTable("approval_type_master", function (table) {
      table.string("approval_type_id", 10).primary();
      table.string("approval_type", 100).notNullable();
      table.string("approval_name", 200); // Display name
      table.string("approval_category", 50); // 'User Create' or 'Document Approval'

      // Audit trail
      table.datetime("created_at").defaultTo(knex.fn.now());
      table.string("created_by", 50);
      table.datetime("updated_at").defaultTo(knex.fn.now());
      table.string("updated_by", 50);
      table.string("status", 20).defaultTo("ACTIVE");

      // Indexes
      table.index(["approval_type"]);
      table.index(["approval_category"]);
      table.index(["status"]);
    });

    // Insert seed data for approval types
    await knex("approval_type_master").insert([
      {
        approval_type_id: "AT001",
        approval_type: "Transporter Admin",
        approval_name: "Transporter Admin User Creation",
        approval_category: "User Create",
        status: "ACTIVE",
        created_by: "SYSTEM",
      },
      {
        approval_type_id: "AT002",
        approval_type: "Consignor Admin",
        approval_name: "Consignor Admin User Creation",
        approval_category: "User Create",
        status: "ACTIVE",
        created_by: "SYSTEM",
      },
      {
        approval_type_id: "AT003",
        approval_type: "Driver User",
        approval_name: "Driver User Creation",
        approval_category: "User Create",
        status: "ACTIVE",
        created_by: "SYSTEM",
      },
    ]);

    console.log("✅ Created approval_type_master table with seed data");
  } else {
    console.log("ℹ️  approval_type_master table already exists");
  }

  // ========================================
  // STEP 2: CREATE ROLE_MASTER TABLE
  // ========================================

  const roleMasterExists = await knex.schema.hasTable("role_master");

  if (!roleMasterExists) {
    await knex.schema.createTable("role_master", function (table) {
      table.string("role_id", 10).primary();
      table.string("role", 100).notNullable();

      // Audit trail
      table.datetime("created_at").defaultTo(knex.fn.now());
      table.string("created_by", 50);
      table.datetime("updated_at").defaultTo(knex.fn.now());
      table.string("updated_by", 50);
      table.string("status", 20).defaultTo("ACTIVE");

      // Indexes
      table.index(["role"]);
      table.index(["status"]);
    });

    // Insert seed data for roles
    await knex("role_master").insert([
      {
        role_id: "RL001",
        role: "Product Owner",
        status: "ACTIVE",
        created_by: "SYSTEM",
      },
      {
        role_id: "RL002",
        role: "Transporter Admin",
        status: "ACTIVE",
        created_by: "SYSTEM",
      },
      {
        role_id: "RL003",
        role: "Transporter Member",
        status: "ACTIVE",
        created_by: "SYSTEM",
      },
    ]);

    console.log("✅ Created role_master table with seed data");
  } else {
    console.log("ℹ️  role_master table already exists");
  }

  // ========================================
  // STEP 3: CREATE APPROVAL_CONFIGURATION TABLE
  // ========================================

  const approvalConfigExists = await knex.schema.hasTable(
    "approval_configuration"
  );

  if (!approvalConfigExists) {
    await knex.schema.createTable("approval_configuration", function (table) {
      table.increments("approval_config_unique_id").primary();
      table.string("approval_config_id", 20).notNullable().unique();
      table.string("approval_type_id", 10).notNullable();
      table.integer("approver_level").notNullable(); // 1, 2, 3, or 4
      table.string("approval_control", 100); // Future scope
      table.string("role_id", 10).notNullable(); // Foreign key to role_master
      table.string("user_id", 20); // Optional - specific user ID for approval

      // Audit trail
      table.datetime("created_at").defaultTo(knex.fn.now());
      table.string("created_by", 50);
      table.datetime("updated_at").defaultTo(knex.fn.now());
      table.string("updated_by", 50);
      table.string("status", 20).defaultTo("ACTIVE");

      // Foreign keys
      table
        .foreign("approval_type_id")
        .references("approval_type_id")
        .inTable("approval_type_master");
      table.foreign("role_id").references("role_id").inTable("role_master");

      // Indexes
      table.index(["approval_config_id"]);
      table.index(["approval_type_id"]);
      table.index(["approver_level"]);
      table.index(["role_id"]);
      table.index(["user_id"]);
      table.index(["status"]);
    });

    // Insert seed data for Level 1 Transporter Admin approval (Product Owner role)
    await knex("approval_configuration").insert([
      {
        approval_config_id: "AC0001",
        approval_type_id: "AT001", // Transporter Admin
        approver_level: 1,
        role_id: "RL001", // Product Owner role
        user_id: null, // Any Product Owner can approve
        status: "ACTIVE",
        created_by: "SYSTEM",
      },
    ]);

    console.log("✅ Created approval_configuration table with seed data");
  } else {
    console.log("ℹ️  approval_configuration table already exists");
  }

  // ========================================
  // STEP 4: CREATE APPROVAL_FLOW_TRANS TABLE
  // ========================================

  const approvalFlowTransExists = await knex.schema.hasTable(
    "approval_flow_trans"
  );

  if (!approvalFlowTransExists) {
    await knex.schema.createTable("approval_flow_trans", function (table) {
      table.increments("approval_flow_unique_id").primary();
      table.string("approval_flow_trans_id", 20).notNullable().unique();
      table.string("approval_id", 20); // Reference to approval batch/group
      table.string("approval_config_id", 20).notNullable();
      table.string("approval_type_id", 10).notNullable();
      table.string("user_id_reference_id", 20).notNullable(); // The user being approved
      table.string("s_status", 50).notNullable(); // PENDING, APPROVED, REJECTED
      table.string("approval_cycle", 50);
      table.integer("approver_level").notNullable();
      table.string("pending_with_role_id", 10);
      table.string("pending_with_user_id", 20);
      table.string("pending_with_name", 200);
      table.string("created_by_user_id", 20); // Creator of the user
      table.string("created_by_name", 200);
      table.string("actioned_by_id", 20);
      table.string("actioned_by_name", 200);
      table.text("remarks");
      table.datetime("approved_on");

      // Audit trail
      table.datetime("created_at").defaultTo(knex.fn.now());
      table.string("created_by", 50);
      table.datetime("updated_at").defaultTo(knex.fn.now());
      table.string("updated_by", 50);
      table.datetime("created_on").defaultTo(knex.fn.now());
      table.string("updated_on");
      table.string("status", 20).defaultTo("ACTIVE");

      // Foreign keys
      table
        .foreign("approval_config_id")
        .references("approval_config_id")
        .inTable("approval_configuration");
      table
        .foreign("approval_type_id")
        .references("approval_type_id")
        .inTable("approval_type_master");

      // Indexes
      table.index(["approval_flow_trans_id"]);
      table.index(["approval_id"]);
      table.index(["approval_config_id"]);
      table.index(["approval_type_id"]);
      table.index(["user_id_reference_id"]);
      table.index(["pending_with_user_id"]);
      table.index(["actioned_by_id"]);
      table.index(["s_status"]);
      table.index(["status"]);
    });

    console.log("✅ Created approval_flow_trans table");
  } else {
    console.log("ℹ️  approval_flow_trans table already exists");
  }

  console.log("🎉 Approval system tables creation complete!");
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  console.log("🔄 Rolling back approval system tables...");
  await knex.schema.dropTableIfExists("approval_flow_trans");
  await knex.schema.dropTableIfExists("approval_configuration");
  await knex.schema.dropTableIfExists("role_master");
  await knex.schema.dropTableIfExists("approval_type_master");
  console.log("✅ Dropped approval system tables");
};
