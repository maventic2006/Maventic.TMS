/**
 * Check document name master table to understand the relationship
 */

const knex = require("./config/database");

async function checkDocumentNameMaster() {
  try {
    console.log("Ì¥ç CHECKING DOCUMENT NAME MASTER TABLE");
    console.log("=" .repeat(60));
    
    // Check if doc_name_master table exists
    console.log("\nÌ≥ã 1. CHECKING doc_name_master TABLE:");
    try {
      const nameMaster = await knex("doc_name_master").limit(10);
      console.log(`‚úÖ Found ${nameMaster.length} records in doc_name_master:`);
      nameMaster.forEach((record, index) => {
        console.log(`  ${index + 1}. ${JSON.stringify(record)}`);
      });
    } catch (error) {
      console.log("‚ùå doc_name_master table not found or error:", error.message);
      
      // Try document_type_master or similar tables
      console.log("\nÌ¥ç Checking for alternative document master tables...");
      const tables = await knex.raw("SHOW TABLES LIKE '%document%' OR SHOW TABLES LIKE '%doc%'");
      console.log("Available doc-related tables:", tables[0].map(t => Object.values(t)[0]));
    }
    
    // Check consignor master data API
    console.log("\nÌ≥ã 2. CHECKING CONSIGNOR MASTER DATA:");
    try {
      // This is what the master data API should return
      const joinQuery = await knex("doc_type_configuration as dtc")
        .leftJoin("doc_name_master as dnm", "dtc.doc_name_master_id", "dnm.doc_name_master_id")
        .select(
          "dtc.document_type_id",
          "dnm.document_name as document_type_name"
        )
        .where("dtc.status", "ACTIVE")
        .where("dtc.user_type", "CONSIGNOR")
        .limit(10);
        
      console.log(`‚úÖ Consignor document types (with names):`);
      joinQuery.forEach((record, index) => {
        console.log(`  ${index + 1}. ID: "${record.document_type_id}" | Name: "${record.document_type_name}"`);
      });
    } catch (error) {
      console.log("‚ùå Join query failed:", error.message);
      
      // Fallback: just get CONSIGNOR document types
      console.log("\nÌ¥ç Fallback: Getting CONSIGNOR document types only:");
      const consignorDocs = await knex("doc_type_configuration")
        .where("user_type", "CONSIGNOR")
        .where("status", "ACTIVE");
        
      console.log(`‚úÖ Found ${consignorDocs.length} CONSIGNOR document types:`);
      consignorDocs.forEach((record, index) => {
        console.log(`  ${index + 1}. ID: "${record.document_type_id}" | Master ID: "${record.doc_name_master_id}"`);
      });
    }
    
    // Check what's in consignor_documents currently
    console.log("\nÌ≥ã 3. CHECKING EXISTING consignor_documents:");
    const existingDocs = await knex("consignor_documents")
      .select("document_type_id", "document_number", "customer_id")
      .limit(10);
      
    if (existingDocs.length > 0) {
      console.log("‚úÖ Existing document type IDs in consignor_documents:");
      const uniqueTypes = [...new Set(existingDocs.map(d => d.document_type_id))];
      uniqueTypes.forEach(typeId => {
        console.log(`  - "${typeId}"`);
      });
    } else {
      console.log("‚ùå No existing documents in consignor_documents table");
    }
    
  } catch (error) {
    console.error("‚ùå Check failed:", error.message);
  } finally {
    await knex.destroy();
  }
}

checkDocumentNameMaster();
