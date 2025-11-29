const knex = require("./config/database");

async function fixWarehouseApprovals() {
  try {
    console.log("\n Fixing Warehouse Approval Records...\n");
    
    // Find approval records where user_id_reference_id looks like a warehouse ID (WH####)
    const badWarehouseApprovals = await knex("approval_flow_trans as aft")
      .leftJoin("approval_type_master as atm", "aft.approval_type_id", "atm.approval_type_id")
      .where("aft.approval_type_id", "AT002") // Warehouse/Consignor Admin approvals
      .where("aft.user_id_reference_id", "like", "WH%") // Warehouse ID format
      .select("aft.*", "atm.approval_name");
    
    console.log(` Found ${badWarehouseApprovals.length} warehouse approval records with incorrect user_id_reference_id:`);
    
    for (const approval of badWarehouseApprovals) {
      console.log(`\n   ${approval.approval_flow_trans_id}: ${approval.user_id_reference_id} (${approval.s_status})`);
      
      // Find the warehouse manager user for this warehouse
      const warehouseManagerUser = await knex("user_master")
        .where("user_type_id", "UT003") // Warehouse Manager
        .where("user_full_name", "like", `%${approval.user_id_reference_id}%`)
        .first();
      
      if (warehouseManagerUser) {
        console.log(`     Found Warehouse Manager: ${warehouseManagerUser.user_id} (${warehouseManagerUser.status})`);
        
        // Update the approval record
        await knex("approval_flow_trans")
          .where("approval_flow_trans_id", approval.approval_flow_trans_id)
          .update({
            user_id_reference_id: warehouseManagerUser.user_id
          });
        
        console.log(`      Updated: ${approval.user_id_reference_id} -> ${warehouseManagerUser.user_id}`);
      } else {
        console.log(`      No Warehouse Manager user found for ${approval.user_id_reference_id}`);
      }
    }
    
    console.log(`\n Warehouse approval records fix completed`);
    
  } catch (error) {
    console.error(" Error:", error);
  } finally {
    await knex.destroy();
  }
}

fixWarehouseApprovals();
