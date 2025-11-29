const knex = require("./config/database");

async function fixVEH0064Approval() {
  try {
    console.log("\n Fixing VEH0064 Approval Record...\n");
    
    // Get the Vehicle Owner user for VEH0064
    const vehicleOwnerUser = await knex("user_master")
      .where("user_type_id", "UT005")
      .where("user_full_name", "like", "%VEH0064%")
      .first();
    
    if (!vehicleOwnerUser) {
      console.log(" Vehicle Owner user not found");
      return;
    }
    
    console.log(` Found Vehicle Owner: ${vehicleOwnerUser.user_id} (Status: ${vehicleOwnerUser.status})`);
    
    // Find the approval record with wrong reference ID
    const approvalRecord = await knex("approval_flow_trans")
      .where("approval_flow_trans_id", "AF0016")
      .first();
    
    if (!approvalRecord) {
      console.log(" Approval record AF0016 not found");
      return;
    }
    
    console.log(` Current approval record:`);
    console.log(`   ID: ${approvalRecord.approval_flow_trans_id}`);
    console.log(`   User Ref: ${approvalRecord.user_id_reference_id} (WRONG - should be ${vehicleOwnerUser.user_id})`);
    console.log(`   Status: ${approvalRecord.s_status}`);
    
    // Since the user is already approved, update the approval record to match
    const updateResult = await knex("approval_flow_trans")
      .where("approval_flow_trans_id", "AF0016")
      .update({
        user_id_reference_id: vehicleOwnerUser.user_id, // Fix: Use user ID not vehicle ID
        s_status: "Approve", // Fix: Mark as approved since user is already approved
        actioned_by_id: "PO002", // Who approved it
        actioned_by_name: "Product Owner 2",
        approved_on: knex.fn.now(),
        pending_with_user_id: null, // Clear: No longer pending
        pending_with_name: null,
        remarks: "Approved by Product Owner - Fixed approval record",
        updated_at: knex.fn.now()
      });
    
    console.log(`\n Fixed approval record AF0016:`);
    console.log(`   Updated user_id_reference_id: VEH0064 -> ${vehicleOwnerUser.user_id}`);
    console.log(`   Updated status: Pending for Approval -> Approve`);
    console.log(`   Added approver: PO002`);
    console.log(`   Cleared pending status`);
    
    // Verify the fix
    const verifyRecord = await knex("approval_flow_trans")
      .where("approval_flow_trans_id", "AF0016")
      .first();
    
    console.log(`\n Verification - Updated record:`);
    console.log(`   User Ref: ${verifyRecord.user_id_reference_id}`);
    console.log(`   Status: ${verifyRecord.s_status}`);
    console.log(`   Pending With: ${verifyRecord.pending_with_user_id || "None"}`);
    console.log(`   Actioned By: ${verifyRecord.actioned_by_id}`);
    
  } catch (error) {
    console.error(" Error fixing approval:", error);
  } finally {
    await knex.destroy();
  }
}

fixVEH0064Approval();
