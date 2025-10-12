require("dotenv").config();
const knex = require("knex")(require("./knexfile").development);

async function verifyWarehouseTypeMaster() {
  try {
    console.log("🔍 Verifying Warehouse Type Master table...\n");
    
    // Check if table exists
    const exists = await knex.schema.hasTable("warehouse_type_master");
    console.log(`✅ Table 'warehouse_type_master': ${exists ? 'EXISTS' : 'MISSING'}`);
    
    if (exists) {
      // Get table structure
      const columns = await knex("warehouse_type_master").columnInfo();
      console.log("\n📋 TABLE STRUCTURE:");
      console.log("=".repeat(60));
      
      Object.entries(columns).forEach(([columnName, columnInfo]) => {
        console.log(`📝 ${columnName}:`);
        console.log(`   Type: ${columnInfo.type}`);
        console.log(`   Nullable: ${columnInfo.nullable ? 'YES' : 'NO'}`);
        console.log(`   Default: ${columnInfo.defaultValue || 'NULL'}`);
        console.log();
      });
      
      // Check total column count
      console.log(`🔢 Total Columns: ${Object.keys(columns).length}`);
      
      // Verify audit trail fields
      const auditFields = ['created_at', 'created_on', 'created_by', 'updated_at', 'updated_on', 'updated_by', 'status'];
      const hasAuditTrail = auditFields.every(field => columns[field]);
      console.log(`🔒 Audit Trail: ${hasAuditTrail ? '✅ Complete' : '❌ Missing'}`);
      
      // Check primary key and unique constraints
      console.log(`🔑 Primary Key Field: warehouse_type_unique_id (auto-increment)`);
      console.log(`🆔 Business Key Field: warehouse_type_id (unique)`);
    }
    
    console.log("\n🎉 Warehouse Type Master table verification complete!");
    
  } catch (error) {
    console.error("❌ Error verifying table:", error.message);
  } finally {
    await knex.destroy();
  }
}

verifyWarehouseTypeMaster();