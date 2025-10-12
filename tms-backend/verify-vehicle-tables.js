require("dotenv").config();
const knex = require("knex")(require("./knexfile").development);

async function verifyTables() {
  try {
    console.log("🔍 Verifying all vehicle tables have been created...\n");
    
    const tables = [
      'vehicle_type_master',
      'service_frequency_master', 
      'vehicle_basic_information_hdr',
      'vehicle_basic_information_itm',
      'vehicle_special_permit',
      'vehicle_ownership_details',
      'vehicle_maintenance_service_history',
      'vehicle_documents'
    ];
    
    for (const tableName of tables) {
      const exists = await knex.schema.hasTable(tableName);
      console.log(`✅ Table '${tableName}': ${exists ? 'EXISTS' : 'MISSING'}`);
      
      if (exists) {
        const columns = await knex(tableName).columnInfo();
        console.log(`   📝 Columns: ${Object.keys(columns).length} columns`);
        console.log(`   🔑 Key columns: ${Object.keys(columns).slice(0, 5).join(', ')}${Object.keys(columns).length > 5 ? '...' : ''}\n`);
      }
    }
    
    console.log("🎉 Table verification complete!");
    
  } catch (error) {
    console.error("❌ Error verifying tables:", error.message);
  } finally {
    await knex.destroy();
  }
}

verifyTables();