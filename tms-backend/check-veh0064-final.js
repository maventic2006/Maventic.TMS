const knex = require("./config/database");

async function checkVEH0064Final() {
  try {
    console.log("\n Final VEH0064 Status Check...\n");
    
    // Find the approval record for VEH0064 (should be AF0016)
    const veh0064Approval = await knex("approval_flow_trans")
      .where("approval_flow_trans_id", "AF0016")
      .first();
    
    if (veh0064Approval) {
      console.log(" AF0016 (VEH0064) Record:");
      console.log(`   User Ref: ${veh0064Approval.user_id_reference_id}`);
      console.log(`   Status: ${veh0064Approval.s_status}`);
      console.log(`   Pending With: ${veh0064Approval.pending_with_user_id || "None"}`);
      console.log(`   Actioned By: ${veh0064Approval.actioned_by_id || "None"}`);
      console.log(`   Approved On: ${veh0064Approval.approved_on || "None"}`);
      console.log(`   Remarks: ${veh0064Approval.remarks || "None"}`);
    } else {
      console.log(" AF0016 not found");
    }
    
    // Test the new approval query for PO002
    console.log("\n Testing new approval query for PO002...\n");
    
    const po002Approvals = await knex("approval_flow_trans as aft")
      .leftJoin("approval_type_master as atm", "aft.approval_type_id", "atm.approval_type_id")
      .where(function() {
        this.where("aft.pending_with_user_id", "PO002")
          .orWhere("aft.actioned_by_id", "PO002");
      })
      .select(
        "aft.approval_flow_trans_id",
        "aft.user_id_reference_id", 
        "aft.s_status",
        "aft.pending_with_user_id",
        "aft.actioned_by_id",
        "atm.approval_name"
      )
      .orderBy("aft.created_at", "desc");
    
    console.log(` PO002 Approval List (${po002Approvals.length} records):`);
    po002Approvals.forEach(approval => {
      const actionType = approval.pending_with_user_id === "PO002" ? "PENDING" : "ACTIONED";
      console.log(`   ${approval.approval_flow_trans_id}: ${approval.approval_name} for ${approval.user_id_reference_id} - ${approval.s_status} (${actionType})`);
    });
    
  } catch (error) {
    console.error(" Error:", error);
  } finally {
    await knex.destroy();
  }
}

checkVEH0064Final();
