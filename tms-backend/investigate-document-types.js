/**
 * Investigate document types in database to fix foreign key constraint error
 */

const knex = require("./config/database");

async function investigateDocumentTypes() {
  try {
    console.log("Ì¥ç INVESTIGATING DOCUMENT TYPE FOREIGN KEY CONSTRAINT ERROR");
    console.log("=" .repeat(70));
    
    console.log("\nÌ≥ã 1. CHECKING doc_type_configuration TABLE:");
    const docTypes = await knex("doc_type_configuration")
      .select("document_type_id", "document_type_name", "category", "status")
      .orderBy("document_type_id");
      
    console.log(`‚úÖ Found ${docTypes.length} document types:`);
    docTypes.forEach((type, index) => {
      console.log(`  ${index + 1}. ID: "${type.document_type_id}" | Name: "${type.document_type_name}" | Category: ${type.category} | Status: ${type.status}`);
    });
    
    console.log("\nÌ¥ç 2. SEARCHING FOR 'Any License':");
    const anyLicense = await knex("doc_type_configuration")
      .where("document_type_id", "Any License")
      .orWhere("document_type_name", "like", "%Any License%");
      
    if (anyLicense.length > 0) {
      console.log("‚úÖ Found matching records:");
      anyLicense.forEach(type => {
        console.log(`  - ID: "${type.document_type_id}" | Name: "${type.document_type_name}"`);
      });
    } else {
      console.log("‚ùå 'Any License' not found in doc_type_configuration table");
    }
    
    console.log("\nÌ¥ç 3. CHECKING FOR LICENSE-RELATED DOCUMENT TYPES:");
    const licenseTypes = await knex("doc_type_configuration")
      .where("document_type_name", "like", "%license%")
      .orWhere("document_type_name", "like", "%License%");
      
    if (licenseTypes.length > 0) {
      console.log("‚úÖ Found license-related document types:");
      licenseTypes.forEach(type => {
        console.log(`  - ID: "${type.document_type_id}" | Name: "${type.document_type_name}"`);
      });
    } else {
      console.log("‚ùå No license-related document types found");
    }
    
    console.log("\nÌ¥ç 4. CHECKING CONSIGNOR MASTER DATA API:");
    // This simulates what the frontend master data API returns
    const masterData = await knex("doc_type_configuration")
      .select("document_type_id", "document_type_name")
      .where("status", "ACTIVE")
      .orderBy("document_type_name");
      
    console.log(`‚úÖ Master data would return ${masterData.length} active document types:`);
    masterData.forEach((type, index) => {
      console.log(`  ${index + 1}. "${type.document_type_id}" - ${type.document_type_name}`);
    });
    
    console.log("\nÌ¥ç 5. CHECKING RECENT consignor_documents INSERTS:");
    const recentDocs = await knex("consignor_documents")
      .select("document_type_id", "document_number", "customer_id", "created_at")
      .orderBy("created_at", "desc")
      .limit(5);
      
    if (recentDocs.length > 0) {
      console.log("‚úÖ Recent successful document inserts:");
      recentDocs.forEach(doc => {
        console.log(`  - Customer: ${doc.customer_id} | Type: "${doc.document_type_id}" | Number: ${doc.document_number} | Created: ${doc.created_at}`);
      });
    } else {
      console.log("‚ùå No recent document inserts found");
    }
    
    console.log("\nÌ≤° RECOMMENDED SOLUTIONS:");
    console.log("1. ÔøΩÔøΩ Fix document type mapping in frontend dropdown");
    console.log("2. Ì≥ù Add 'Any License' to doc_type_configuration table if needed");
    console.log("3. Ìª°Ô∏è Add validation to prevent invalid document types");
    
  } catch (error) {
    console.error("‚ùå Investigation failed:", error.message);
  } finally {
    await knex.destroy();
  }
}

investigateDocumentTypes();
