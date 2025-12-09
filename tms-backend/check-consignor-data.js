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

async function checkData() {
  try {
    console.log("Ì≥ã Checking Consignor Basic Information\n");
    
    const consignors = await db("consignor_basic_information")
      .select()
      .limit(5);

    console.log("Ìø¢ Available Consignors:");
    console.log("=======================");
    if (consignors.length > 0) {
      console.log("Fields:", Object.keys(consignors[0]));
      consignors.forEach(consignor => {
        console.log(`Ìø¢ ID: ${consignor.customer_id || consignor.consignor_id || 'N/A'}`);
        console.log(`   Name: ${consignor.customer_name || consignor.consignor_name || consignor.business_name || 'N/A'}`);
        console.log(`   Status: ${consignor.status || 'N/A'}\n`);
      });
      
      const firstConsignor = consignors[0];
      const consignorId = firstConsignor.customer_id || firstConsignor.consignor_id || Object.values(firstConsignor)[0];
      console.log(`‚úÖ Test URL: http://localhost:5174/consignor/details/${consignorId}`);
    } else {
      console.log("No consignors found");
    }

  } catch (error) {
    console.error("‚ùå Error:", error.message);
  } finally {
    await db.destroy();
  }
}

checkData();
