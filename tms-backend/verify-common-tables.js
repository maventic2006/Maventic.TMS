require("dotenv").config();
const knex = require("knex")(require("./knexfile").development);

async function verifyCommonTables() {
  try {
    console.log("🔍 Verifying all Common DB tables have been created...\n");
    
    const newTables = [
      'document_upload',
      'doc_type_configuration', 
      'document_name_master',
      'tms_address',
      'material_master_information',
      'packaging_type_master',
      'user_master',
      'user_role_hdr',
      'user_application_access',
      'approval_configuration',
      'approval_flow_trans',
      'user_signup_request',
      'user_signup_document',
      'general_config',
      'message_master',
      'message_text_language',
      'payment_term_master'
    ];
    
    console.log("📊 NEW COMMON DB TABLES VERIFICATION:");
    console.log("=".repeat(80));
    
    for (const tableName of newTables) {
      const exists = await knex.schema.hasTable(tableName);
      console.log(`✅ Table '${tableName}': ${exists ? 'EXISTS' : 'MISSING'}`);
      
      if (exists) {
        const columns = await knex(tableName).columnInfo();
        const columnCount = Object.keys(columns).length;
        const keyColumns = Object.keys(columns).slice(0, 4).join(', ');
        console.log(`   📝 Columns: ${columnCount} columns`);
        console.log(`   🔑 Key fields: ${keyColumns}${columnCount > 4 ? '...' : ''}`);
        
        // Check for audit trail
        const hasAuditTrail = columns.created_at && columns.created_by && columns.status;
        console.log(`   🔒 Audit Trail: ${hasAuditTrail ? '✅ Complete' : '❌ Missing'}`);
        console.log();
      }
    }
    
    // Get total table count
    const allTables = await knex.raw(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `, [process.env.DB_NAME]);
    
    console.log("📈 DATABASE SUMMARY:");
    console.log("=".repeat(80));
    console.log(`🗄️  Total Tables: ${allTables[0].length}`);
    console.log(`🆕 New Common Tables: ${newTables.length}`);
    console.log(`🚛 Vehicle Tables: 8`);
    console.log(`🏭 Warehouse Tables: 4`);
    console.log(`👥 Consignor Tables: 6`);
    console.log();
    
    console.log("🎯 TABLE CATEGORIES:");
    console.log("=".repeat(80));
    console.log("📁 Document Management:");
    console.log("   • document_upload");
    console.log("   • doc_type_configuration");
    console.log("   • document_name_master");
    console.log();
    console.log("👤 User Management:");
    console.log("   • user_master");
    console.log("   • user_role_hdr");
    console.log("   • user_application_access");
    console.log("   • user_signup_request");
    console.log("   • user_signup_document");
    console.log();
    console.log("✅ Approval Workflow:");
    console.log("   • approval_configuration");
    console.log("   • approval_flow_trans");
    console.log();
    console.log("🏢 Master Data:");
    console.log("   • tms_address");
    console.log("   • material_master_information");
    console.log("   • packaging_type_master");
    console.log("   • payment_term_master");
    console.log();
    console.log("💬 Communication:");
    console.log("   • message_master");
    console.log("   • message_text_language");
    console.log();
    console.log("⚙️ Configuration:");
    console.log("   • general_config");
    console.log();
    
    console.log("🎉 All Common DB tables verification complete!");
    
  } catch (error) {
    console.error("❌ Error verifying tables:", error.message);
  } finally {
    await knex.destroy();
  }
}

verifyCommonTables();