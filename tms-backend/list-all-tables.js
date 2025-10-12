require("dotenv").config();
const knex = require("knex")(require("./knexfile").development);

async function listAllTables() {
  try {
    const result = await knex.raw(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `, [process.env.DB_NAME]);
    
    const tables = result[0];
    
    console.log("📊 ALL DATABASE TABLES IN TMS SYSTEM:");
    console.log("=".repeat(60));
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`Total Tables: ${tables.length}`);
    console.log("=".repeat(60));
    
    // Group tables by category
    const warehouseTables = [];
    const consignorTables = [];
    const vehicleTables = [];
    const commonTables = [];
    const systemTables = [];
    
    tables.forEach(table => {
      const tableName = table.TABLE_NAME;
      if (tableName.startsWith('warehouse_')) {
        warehouseTables.push(tableName);
      } else if (tableName.startsWith('consignor_')) {
        consignorTables.push(tableName);
      } else if (tableName.startsWith('vehicle_') || tableName.includes('vehicle')) {
        vehicleTables.push(tableName);
      } else if (tableName.startsWith('knex_')) {
        systemTables.push(tableName);
      } else {
        commonTables.push(tableName);
      }
    });
    
    console.log("\n🏭 WAREHOUSE TABLES:");
    console.log("-".repeat(40));
    warehouseTables.forEach((table, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${table}`);
    });
    
    console.log("\n👥 CONSIGNOR TABLES:");
    console.log("-".repeat(40));
    consignorTables.forEach((table, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${table}`);
    });
    
    console.log("\n🚛 VEHICLE TABLES:");
    console.log("-".repeat(40));
    vehicleTables.forEach((table, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${table}`);
    });
    
    console.log("\n🆕 COMMON DATABASE TABLES:");
    console.log("-".repeat(40));
    commonTables.forEach((table, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${table}`);
    });
    
    console.log("\n⚙️ SYSTEM TABLES:");
    console.log("-".repeat(40));
    systemTables.forEach((table, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${table}`);
    });
    
    console.log("\n📋 COMPLETE ALPHABETICAL LIST:");
    console.log("=".repeat(60));
    tables.forEach((table, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${table.TABLE_NAME}`);
    });
    
    console.log(`\n🎯 SUMMARY:`);
    console.log(`   🏭 Warehouse Tables: ${warehouseTables.length}`);
    console.log(`   👥 Consignor Tables: ${consignorTables.length}`);
    console.log(`   🚛 Vehicle Tables: ${vehicleTables.length}`);
    console.log(`   🆕 Common DB Tables: ${commonTables.length}`);
    console.log(`   ⚙️ System Tables: ${systemTables.length}`);
    console.log(`   📊 Total Tables: ${tables.length}`);
    
  } catch (error) {
    console.error("❌ Error listing tables:", error.message);
  } finally {
    await knex.destroy();
  }
}

listAllTables();