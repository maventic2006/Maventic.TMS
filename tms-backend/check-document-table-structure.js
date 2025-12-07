/**
 * Check the actual structure of doc_type_configuration table
 */

const knex = require("./config/database");

async function checkTableStructure() {
  try {
    console.log("Ì¥ç CHECKING TABLE STRUCTURE");
    console.log("=" .repeat(50));
    
    // Get table structure
    console.log("\nÌ≥ã 1. DESCRIBING doc_type_configuration TABLE:");
    const structure = await knex.raw("DESCRIBE doc_type_configuration");
    console.log("‚úÖ Table structure:");
    structure[0].forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''}`);
    });
    
    // Get sample data
    console.log("\nÌ≥ã 2. SAMPLE DATA FROM doc_type_configuration:");
    const sampleData = await knex("doc_type_configuration").limit(10);
    console.log(`‚úÖ Found ${sampleData.length} records (showing first 10):`);
    sampleData.forEach((record, index) => {
      console.log(`  ${index + 1}. ${JSON.stringify(record)}`);
    });
    
    // Check if 'Any License' exists
    console.log("\nÌ¥ç 3. SEARCHING FOR 'Any License':");
    const anyLicenseSearch = await knex("doc_type_configuration")
      .where(function() {
        Object.keys(sampleData[0] || {}).forEach(key => {
          if (typeof sampleData[0][key] === 'string') {
            this.orWhere(key, "Any License")
                .orWhere(key, "like", "%Any License%");
          }
        });
      });
      
    if (anyLicenseSearch.length > 0) {
      console.log("‚úÖ Found matching records:");
      anyLicenseSearch.forEach(record => {
        console.log(`  - ${JSON.stringify(record)}`);
      });
    } else {
      console.log("‚ùå 'Any License' not found in doc_type_configuration table");
    }
    
  } catch (error) {
    console.error("‚ùå Check failed:", error.message);
  } finally {
    await knex.destroy();
  }
}

checkTableStructure();
