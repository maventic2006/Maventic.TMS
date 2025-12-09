// Load environment variables from backend .env file
require('dotenv').config({ path: './backend/.env' });

const knex = require("./backend/config/database");

async function diagnoseApprovalFlow() {
  console.log("\n��� APPROVAL FLOW DIAGNOSIS STARTED\n");

  try {
    // 1. Check total consignor records
    const consignorCount = await knex("consignor_basic_information").count("* as count").first();
    console.log(`��� Total Consignors: ${consignorCount.count}`);

    // 2. Check consignors by status
    const consignorsByStatus = await knex("consignor_basic_information")
      .select("status")
      .count("* as count")
      .groupBy("status");
    
    console.log("\n��� Consignors by Status:");
    consignorsByStatus.forEach(row => {
      console.log(`  - ${row.status}: ${row.count}`);
    });

    // 3. Check total approval flow records
    const approvalFlowCount = await knex("approval_flow_trans").count("* as count").first();
    console.log(`\n��� Total Approval Flow Records: ${approvalFlowCount.count}`);

    // 4. Check approval flows by status
    const approvalsByStatus = await knex("approval_flow_trans")
      .select("s_status")
      .count("* as count")
      .groupBy("s_status");
    
    console.log("\n��� Approval Flows by Status:");
    approvalsByStatus.forEach(row => {
      console.log(`  - ${row.s_status}: ${row.count}`);
    });

    // 5. Check consignor approval flows specifically  
    const consignorApprovals = await knex("approval_flow_trans as aft")
      .leftJoin("approval_type_master as atm", "aft.approval_type_id", "atm.approval_type_id")
      .leftJoin("consignor_basic_information as cbi", "aft.user_id_reference_id", "cbi.customer_id")
      .select(
        "aft.approval_flow_trans_id",
        "aft.user_id_reference_id as consignor_id", 
        "cbi.customer_name",
        "aft.s_status",
        "aft.pending_with_user_id",
        "aft.pending_with_name",
        "aft.created_by_user_id", 
        "aft.created_by_name",
        "aft.created_at"
      )
      .where("aft.approval_type_id", "AT002");
    
    console.log("\n��� Consignor Approval Records:");
    if (consignorApprovals.length === 0) {
      console.log("  ⚠️  No consignor approval records found!");
    } else {
      consignorApprovals.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.approval_flow_trans_id}`);
        console.log(`     Consignor: ${record.consignor_id} (${record.customer_name})`);
        console.log(`     Status: ${record.s_status}`);
        console.log(`     Pending: ${record.pending_with_user_id} (${record.pending_with_name})`);
        console.log(`     Created: ${record.created_by_user_id} (${record.created_by_name})`);
        console.log("");
      });
    }

    // 6. Check approval configuration
    const approvalConfig = await knex("approval_configuration")
      .where("approval_type_id", "AT002")
      .where("status", "ACTIVE");
    
    console.log("\n⚙️  Approval Configuration for Consignor (AT002):");
    if (approvalConfig.length === 0) {
      console.log("  ❌ No active approval configuration found!");
      console.log("  ��� Root cause: approval workflows cannot be created without configuration.");
    } else {
      approvalConfig.forEach((config, index) => {
        console.log(`  ${index + 1}. ${config.approval_config_id}`);
        console.log(`     Level: ${config.approver_level}`);
        console.log(`     Role: ${config.approver_role_id}`);
        console.log(`     Status: ${config.status}`);
      });
    }

    console.log("\n✅ APPROVAL FLOW DIAGNOSIS COMPLETED\n");

  } catch (error) {
    console.error("❌ Diagnosis error:", error);
  } finally {
    await knex.destroy();
  }
}

// Run the diagnosis
diagnoseApprovalFlow();
