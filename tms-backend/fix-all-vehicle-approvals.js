const knex = require("./config/database");

async function fixAllVehicleApprovals() {
  try {
    console.log("\n Fixing All Vehicle Approval Records...\n");
    
    // Find approval records where user_id_reference_id looks like a vehicle ID (VEH####)
    const badVehicleApprovals = await knex("approval_flow_trans as aft")
      .leftJoin("approval_type_master as atm", "aft.approval_type_id", "atm.approval_type_id")
      .where("aft.approval_type_id", "AT004") // Vehicle Owner approvals
      .where("aft.user_id_reference_id", "like", "VEH%") // Vehicle ID format
      .select("aft.*", "atm.approval_name");
    
    console.log(` Found ${badVehicleApprovals.length} vehicle approval records with incorrect user_id_reference_id:`);
    
    for (const approval of badVehicleApprovals) {
      console.log(`\n   ${approval.approval_flow_trans_id}: ${approval.user_id_reference_id} (${approval.s_status})`);
      
      // Find the vehicle owner user for this vehicle
      const vehicleOwnerUser = await knex("user_master")
        .where("user_type_id", "UT005") // Vehicle Owner
        .where("user_full_name", "like", `%${approval.user_id_reference_id}%`)
        .first();
      
      if (vehicleOwnerUser) {
        console.log(`     Found Vehicle Owner: ${vehicleOwnerUser.user_id} (${vehicleOwnerUser.status})`);
        
        // Update the approval record - if user is already active, mark as approved
        const updateData = {
          user_id_reference_id: vehicleOwnerUser.user_id
        };
        
        if (vehicleOwnerUser.status === "Active" && vehicleOwnerUser.is_active === 1) {
          updateData.s_status = "Approve";
          updateData.actioned_by_id = vehicleOwnerUser.updated_by || "PO002";
          updateData.actioned_by_name = "Product Owner";
          updateData.approved_on = knex.fn.now();
          updateData.pending_with_user_id = null;
          updateData.pending_with_name = null;
          updateData.remarks = "Auto-approved during fix - user was already active";
          updateData.updated_at = knex.fn.now();
          
          console.log(`      User is already active - marking approval as complete`);
        }
        
        await knex("approval_flow_trans")
          .where("approval_flow_trans_id", approval.approval_flow_trans_id)
          .update(updateData);
        
        console.log(`      Updated: ${approval.user_id_reference_id} -> ${vehicleOwnerUser.user_id}`);
      } else {
        console.log(`      No Vehicle Owner user found for ${approval.user_id_reference_id}`);
      }
    }
    
    console.log(`\n Vehicle approval records fix completed`);
    
  } catch (error) {
    console.error(" Error:", error);
  } finally {
    await knex.destroy();
  }
}

fixAllVehicleApprovals();
