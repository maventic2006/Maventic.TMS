require("dotenv").config();
const knex = require("knex")(require("./knexfile").development);

async function showWarehouseTypeData() {
  try {
    console.log("🏭 WAREHOUSE TYPE MASTER - Data Overview\n");
    
    // Get warehouse types
    const warehouseTypes = await knex("warehouse_type_master")
      .where("status", "ACTIVE")
      .orderBy("warehouse_type_id");

    console.log("📋 WAREHOUSE TYPES:");
    console.log("=".repeat(80));
    
    warehouseTypes.forEach(type => {
      console.log(`🏭 ${type.warehouse_type_id} - ${type.warehouse_type}`);
      console.log(`   Created: ${type.created_at.toLocaleDateString()}`);
      console.log(`   Status: ${type.status}\n`);
    });

    console.log("📊 SUMMARY:");
    console.log("=".repeat(80));
    console.log(`📦 Total Warehouse Types: ${warehouseTypes.length}`);
    console.log(`✅ Active Types: ${warehouseTypes.filter(t => t.status === 'ACTIVE').length}`);
    
    // Show how this can integrate with existing warehouse table
    console.log("\n🔗 INTEGRATION POTENTIAL:");
    console.log("=".repeat(80));
    console.log("This master table can be linked to:");
    console.log("• warehouse_basic_information (via warehouse_type field)");
    console.log("• Future warehouse classification and reporting");
    console.log("• Warehouse capacity and capability planning");
    
    console.log("\n🎉 Warehouse Type Master data overview complete!");
    
  } catch (error) {
    console.error("❌ Error displaying data:", error.message);
  } finally {
    await knex.destroy();
  }
}

showWarehouseTypeData();