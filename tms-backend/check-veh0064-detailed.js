const knex = require("./config/database");

async function checkVEH0064Details() {
  try {
    console.log("\n Detailed VEH0064 Analysis...\n");
    
    // 1. Find the Vehicle Owner user for VEH0064
    const vehicleOwnerUser = await knex("user_master")
      .where("user_type_id", "UT005")
      .where("user_full_name", "like", "%VEH0064%")
      .first();
    
    if (vehicleOwnerUser) {
      console.log(" Vehicle Owner User Found:");
      console.log(`   User ID: ${vehicleOwnerUser.user_id}`);
      console.log(`   Status: ${vehicleOwnerUser.status}`);
      console.log(`   Is Active: ${vehicleOwnerUser.is_active}`);
      console.log(`   Email: ${vehicleOwnerUser.email_id}`);
      console.log(`   Created At: ${vehicleOwnerUser.created_at}`);
      console.log(`   Updated At: ${vehicleOwnerUser.updated_at}`);
      console.log(`   Updated By: ${vehicleOwnerUser.updated_by || "None"}`);
    }
    
    // 2. Find ALL approval records related to this user
    const allApprovalRecords = await knex("approval_flow_trans as aft")
      .leftJoin("approval_type_master as atm", "aft.approval_type_id", "atm.approval_type_id")
      .where(function() {
        this.where("aft.user_id_reference_id", vehicleOwnerUser?.user_id)
          .orWhere("aft.user_id_reference_id", "VEH0064")
          .orWhere("aft.user_id_reference_id", "like", "%VEH0064%");
      })
      .select("aft.*", "atm.approval_name")
      .orderBy("aft.created_at", "desc");
    
    console.log(`\n All Approval Records (${allApprovalRecords.length} found):`);
    allApprovalRecords.forEach((record, index) => {
      console.log(`\n   Record ${index + 1}:`);
      console.log(`     ID: ${record.approval_flow_trans_id}`);
      console.log(`     User Ref: ${record.user_id_reference_id}`);
      console.log(`     Status: ${record.s_status}`);
      console.log(`     Type: ${record.approval_name}`);
      console.log(`     Pending With: ${record.pending_with_user_id} (${record.pending_with_name})`);
      console.log(`     Actioned By: ${record.actioned_by_id || "None"} (${record.actioned_by_name || "None"})`);
      console.log(`     Approved On: ${record.approved_on || "None"}`);
      console.log(`     Remarks: ${record.remarks || "None"}`);
      console.log(`     Created: ${record.created_at}`);
      console.log(`     Updated: ${record.updated_at}`);
    });
    
    // 3. Check what PO002 specifically sees
    console.log(`\n What PO002 sees for VEH0064:`);
    const po002Approvals = await knex("approval_flow_trans as aft")
      .leftJoin("approval_type_master as atm", "aft.approval_type_id", "atm.approval_type_id")
      .where("aft.pending_with_user_id", "PO002")
      .where("aft.user_id_reference_id", "like", "%VEH0064%")
      .select("aft.*", "atm.approval_name");
    
    if (po002Approvals.length > 0) {
      po002Approvals.forEach(approval => {
        console.log(`   ${approval.approval_flow_trans_id}: ${approval.s_status} for ${approval.user_id_reference_id}`);
      });
    } else {
      console.log(`   No approvals found for PO002 related to VEH0064`);
    }
    
  } catch (error) {
    console.error(" Error:", error);
  } finally {
    await knex.destroy();
  }
}

checkVEH0064Details();
