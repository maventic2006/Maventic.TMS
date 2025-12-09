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

async function checkConsignors() {
  try {
    console.log("Ì≥ã Checking Consignor Data\n");
    
    const consignors = await db("consignor_master")
      .select("customer_id", "customer_name", "status")
      .limit(5);

    console.log("Ìø¢ Available Consignors:");
    console.log("=======================");
    consignors.forEach(consignor => {
      console.log(`Ìø¢ ${consignor.customer_id} - ${consignor.customer_name}`);
      console.log(`   Status: ${consignor.status}\n`);
    });

    if (consignors.length > 0) {
      console.log(`‚úÖ Test URL: http://localhost:5174/consignor/details/${consignors[0].customer_id}`);
    }

  } catch (error) {
    console.error("‚ùå Error:", error.message);
  } finally {
    await db.destroy();
  }
}

checkConsignors();
