const knex = require("./config/database");

async function fixApprovedRecords() {
  try {
    console.log("\n Fixing approved records with incorrect status values...\n");
    
    // Fix records with APPROVED status -> should be Approve
    const approvedFixResult = await knex("approval_flow_trans")
      .where("s_status", "APPROVED")
      .update({
        s_status: "Approve"
      });
    
    console.log(` Fixed ${approvedFixResult} records: APPROVED -> Approve`);
    
    // Fix records with REJECTED status -> should be Sent Back
    const rejectedFixResult = await knex("approval_flow_trans")
      .where("s_status", "REJECTED")
      .update({
        s_status: "Sent Back"
      });
    
    console.log(` Fixed ${rejectedFixResult} records: REJECTED -> Sent Back`);
    
    // Check current status of VEH0064 related records
    const vehicleOwnerUser = await knex("user_master")
      .where("user_type_id", "UT005")
      .where("user_full_name", "like", "%VEH0064%")
      .first();
    
    if (vehicleOwnerUser) {
      console.log(`\n VEH0064 Vehicle Owner: ${vehicleOwnerUser.user_id}`);
      console.log(`   User Status: ${vehicleOwnerUser.status}`);
      console.log(`   Is Active: ${vehicleOwnerUser.is_active}`);
      
      const approvalRecord = await knex("approval_flow_trans")
        .where("user_id_reference_id", vehicleOwnerUser.user_id)
        .first();
      
      if (approvalRecord) {
        console.log(`\n Approval Record:`);
        console.log(`   ID: ${approvalRecord.approval_flow_trans_id}`);
        console.log(`   Status: ${approvalRecord.s_status}`);
        console.log(`   Pending With: ${approvalRecord.pending_with_user_id}`);
        console.log(`   Actioned By: ${approvalRecord.actioned_by_id || "None"}`);
        console.log(`   Approved On: ${approvalRecord.approved_on || "None"}`);
      } else {
        console.log(" No approval record found for VEH0064");
      }
    }
    
    console.log("\n Database fix completed");
    
  } catch (error) {
    console.error(" Error fixing records:", error);
  } finally {
    await knex.destroy();
  }
}

fixApprovedRecords();
