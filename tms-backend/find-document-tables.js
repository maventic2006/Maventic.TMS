/**
 * Find all document-related tables
 */

const knex = require("./config/database");

async function findDocumentTables() {
  try {
    console.log("Ì¥ç FINDING ALL DOCUMENT-RELATED TABLES");
    console.log("=" .repeat(50));
    
    // Get all tables
    console.log("\nÌ≥ã 1. ALL TABLES IN DATABASE:");
    const allTables = await knex.raw("SHOW TABLES");
    const tableNames = allTables[0].map(t => Object.values(t)[0]);
    console.log(`‚úÖ Found ${tableNames.length} tables total`);
    
    // Filter document-related tables
    const docTables = tableNames.filter(name => 
      name.toLowerCase().includes('doc') || 
      name.toLowerCase().includes('document')
    );
    
    console.log("\nÌ¥ç 2. DOCUMENT-RELATED TABLES:");
    if (docTables.length > 0) {
      docTables.forEach(table => {
        console.log(`  - ${table}`);
      });
    } else {
      console.log("‚ùå No document-related tables found");
    }
    
    // Check master data tables
    const masterTables = tableNames.filter(name => 
      name.toLowerCase().includes('master') ||
      name.toLowerCase().includes('config')
    );
    
    console.log("\nÌ¥ç 3. MASTER/CONFIG TABLES:");
    if (masterTables.length > 0) {
      masterTables.forEach(table => {
        console.log(`  - ${table}`);
      });
    } else {
      console.log("‚ùå No master tables found");
    }
    
    // Get CONSIGNOR document types from doc_type_configuration
    console.log("\nÌ≥ã 4. CHECKING FOR CONSIGNOR DOCUMENT TYPES:");
    const consignorDocs = await knex("doc_type_configuration")
      .where("user_type", "CONSIGNOR")
      .where("status", "ACTIVE");
      
    if (consignorDocs.length > 0) {
      console.log(`‚úÖ Found ${consignorDocs.length} CONSIGNOR document types:`);
      consignorDocs.forEach((record, index) => {
        console.log(`  ${index + 1}. document_type_id: "${record.document_type_id}"`);
        console.log(`      doc_name_master_id: "${record.doc_name_master_id}"`);
        console.log(`      user_type: ${record.user_type}`);
        console.log(`      status: ${record.status}`);
        console.log("");
      });
    } else {
      console.log("‚ùå No CONSIGNOR document types found");
      
      // Check if there are ANY document types
      const anyDocs = await knex("doc_type_configuration").where("status", "ACTIVE").limit(5);
      console.log(`\nÌ¥ç Sample of ANY active document types (${anyDocs.length}):`);
      anyDocs.forEach(record => {
        console.log(`  - ${record.document_type_id} (${record.user_type})`);
      });
    }
    
    // Check master data service implementation
    console.log("\nÌ≥ã 5. CHECKING CURRENT MASTER DATA IMPLEMENTATION:");
    console.log("Checking services/consignorService.js getMasterData function...");
    
  } catch (error) {
    console.error("‚ùå Check failed:", error.message);
  } finally {
    await knex.destroy();
  }
}

findDocumentTables();
