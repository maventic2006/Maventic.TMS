/**
 * Check what the actual document names are for CONSIGNOR types
 */

const knex = require("./config/database");

async function checkDocumentNames() {
  try {
    console.log("Ì¥ç CHECKING DOCUMENT NAMES FOR CONSIGNOR TYPES");
    console.log("=" .repeat(60));
    
    // Check document_name_master table
    console.log("\nÌ≥ã 1. DOCUMENT NAME MASTER TABLE:");
    const nameMaster = await knex("document_name_master").limit(20);
    console.log(`‚úÖ Found ${nameMaster.length} records in document_name_master:`);
    nameMaster.forEach((record, index) => {
      console.log(`  ${index + 1}. ${JSON.stringify(record)}`);
    });
    
    // Join consignor document types with their names
    console.log("\nÌ≥ã 2. CONSIGNOR DOCUMENT TYPES WITH NAMES:");
    const joinQuery = await knex("doc_type_configuration as dtc")
      .leftJoin("document_name_master as dnm", "dtc.doc_name_master_id", "dnm.doc_name_master_id")
      .select(
        "dtc.document_type_id",
        "dtc.doc_name_master_id", 
        "dnm.document_name"
      )
      .where("dtc.user_type", "CONSIGNOR")
      .where("dtc.status", "ACTIVE")
      .orderBy("dtc.document_type_id");
      
    console.log(`‚úÖ Consignor document types with names:`);
    joinQuery.forEach((record, index) => {
      console.log(`  ${index + 1}. ID: "${record.document_type_id}"`);
      console.log(`      Master ID: "${record.doc_name_master_id}"`);
      console.log(`      Name: "${record.document_name}"`);
      console.log("");
    });
    
    // Check current master data implementation
    console.log("\nÌ≥ã 3. CHECKING CURRENT getMasterData IMPLEMENTATION:");
    console.log("Looking for license-related document names...");
    
    const licenseRelated = await knex("document_name_master")
      .where("document_name", "like", "%license%")
      .orWhere("document_name", "like", "%License%");
      
    if (licenseRelated.length > 0) {
      console.log("‚úÖ Found license-related document names:");
      licenseRelated.forEach(record => {
        console.log(`  - ID: "${record.doc_name_master_id}" | Name: "${record.document_name}"`);
      });
      
      // Find the corresponding document_type_id
      for (const license of licenseRelated) {
        const corresponding = await knex("doc_type_configuration")
          .where("doc_name_master_id", license.doc_name_master_id)
          .where("user_type", "CONSIGNOR")
          .where("status", "ACTIVE");
          
        if (corresponding.length > 0) {
          console.log(`    Corresponding CONSIGNOR type: "${corresponding[0].document_type_id}"`);
        }
      }
    } else {
      console.log("‚ùå No license-related document names found");
    }
    
  } catch (error) {
    console.error("‚ùå Check failed:", error.message);
  } finally {
    await knex.destroy();
  }
}

checkDocumentNames();
