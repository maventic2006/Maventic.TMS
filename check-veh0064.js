const knex = require("./tms-backend/config/database");

async function checkVEH0064Status() {
  try {
    console.log("\n Checking VEH0064 Approval Status...\n");
    
    // Check for Vehicle Owner user associated with VEH0064
    const vehicleOwnerUser = await knex("user_master")
      .where("user_type_id", "UT005")
      .where("user_full_name", "like", "%VEH0064%")
      .first();
    
    if (!vehicleOwnerUser) {
      console.log(" No Vehicle Owner user found for VEH0064");
      return;
    }
    
    console.log(" Vehicle Owner User Found:");
    console.log(`   User ID: ${vehicleOwnerUser.user_id}`);
    console.log(`   Status: ${vehicleOwnerUser.status}`);
    console.log(`   Is Active: ${vehicleOwnerUser.is_active}`);
    console.log(`   Created At: ${vehicleOwnerUser.created_at}`);
    
    // Check approval flow records
    const approvalFlows = await knex("approval_flow_trans as aft")
      .leftJoin("approval_type_master as atm", "aft.approval_type_id", "atm.approval_type_id")
      .where("aft.user_id_reference_id", vehicleOwnerUser.user_id)
      .select("aft.*", "atm.approval_name")
      .orderBy("aft.created_at", "desc");
    
    console.log("\n Approval Flow Records:");
    approvalFlows.forEach((flow, index) => {
      console.log(`\n   Record ${index + 1}:`);
      console.log(`   ID: ${flow.approval_flow_trans_id}`);
      console.log(`   Status: ${flow.s_status}`);
      console.log(`   Pending With: ${flow.pending_with_name} (${flow.pending_with_user_id})`);
      console.log(`   Actioned By: ${flow.actioned_by_name || "None"}`);
      console.log(`   Approved On: ${flow.approved_on || "Not approved"}`);
      console.log(`   Remarks: ${flow.remarks || "None"}`);
    });
    
  } catch (error) {
    console.error(" Error:", error);
  } finally {
    await knex.destroy();
  }
}

checkVEH0064Status();
