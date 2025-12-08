const knex = require("knex");
require("dotenv").config();

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password123",
    database: process.env.DB_NAME || "tms_dev",
  },
});

async function checkTables() {
  try {
    console.log("Ì≥ã Checking Tables\n");
    
    // Get all table names that contain 'consignor'
    const tables = await db.raw("SHOW TABLES LIKE '%consignor%'");
    
    console.log("Ìø¢ Consignor-related Tables:");
    console.log("============================");
    tables[0].forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`Ì≥Ñ ${tableName}`);
    });

    // Try to find consignors data in any table
    if (tables[0].length > 0) {
      const firstTable = Object.values(tables[0][0])[0];
      console.log(`\nÌ¥ç Sample data from ${firstTable}:`);
      
      const sampleData = await db(firstTable).select().limit(3);
      if (sampleData.length > 0) {
        console.log("Available fields:", Object.keys(sampleData[0]));
        sampleData.forEach((row, index) => {
          console.log(`Row ${index + 1}:`, row);
        });
      } else {
        console.log("No data found in this table");
      }
    }

  } catch (error) {
    console.error("‚ùå Error:", error.message);
  } finally {
    await db.destroy();
  }
}

checkTables();
