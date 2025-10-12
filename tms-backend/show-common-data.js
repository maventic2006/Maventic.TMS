require("dotenv").config();
const knex = require("knex")(require("./knexfile").development);

async function showCommonDBData() {
  try {
    console.log("🎯 TMS Common Database - Data Overview\n");
    
    // User Management Overview
    console.log("👥 USER MANAGEMENT SYSTEM:");
    console.log("=".repeat(80));
    
    const users = await knex("user_master as u")
      .leftJoin("user_role_hdr as ur", "u.user_id", "ur.user_id")
      .leftJoin("tms_address as a", "u.user_id", "a.user_reference_id")
      .select([
        "u.user_id",
        "u.user_full_name", 
        "u.user_type",
        "u.email_id",
        "u.mobile_number",
        "ur.role",
        "a.city",
        "a.state"
      ])
      .where("u.status", "ACTIVE");

    users.forEach(user => {
      console.log(`👤 ${user.user_id} - ${user.user_full_name}`);
      console.log(`   Type: ${user.user_type} | Role: ${user.role || 'Not Assigned'}`);
      console.log(`   Email: ${user.email_id} | Phone: ${user.mobile_number}`);
      console.log(`   Location: ${user.city}, ${user.state}\n`);
    });

    // Material Management Overview
    console.log("📦 MATERIAL MANAGEMENT SYSTEM:");
    console.log("=".repeat(80));
    
    const materials = await knex("material_master_information")
      .where("status", "ACTIVE");

    materials.forEach(material => {
      console.log(`📦 ${material.material_id} - ${material.material_sector}`);
      console.log(`   Type: ${material.material_types}`);
      console.log(`   Description: ${material.description}\n`);
    });

    // Packaging Types
    console.log("📋 PACKAGING TYPES:");
    console.log("=".repeat(80));
    
    const packaging = await knex("packaging_type_master")
      .where("status", "ACTIVE");

    packaging.forEach(pkg => {
      console.log(`📦 ${pkg.packaging_type_id} - ${pkg.package_types}`);
      console.log(`   Description: ${pkg.description}\n`);
    });

    // Payment Terms
    console.log("💰 PAYMENT TERMS:");
    console.log("=".repeat(80));
    
    const paymentTerms = await knex("payment_term_master")
      .where("status", "ACTIVE")
      .orderBy("number_of_days");

    paymentTerms.forEach(term => {
      console.log(`💰 ${term.payment_term_id} - ${term.description}`);
      console.log(`   Days: ${term.number_of_days}\n`);
    });

    // Document Types
    console.log("📄 DOCUMENT MANAGEMENT:");
    console.log("=".repeat(80));
    
    const documents = await knex("document_name_master as d")
      .leftJoin("doc_type_configuration as dt", "d.doc_name_master_id", "dt.doc_name_master_id")
      .select([
        "d.doc_name_master_id",
        "d.document_name",
        "d.user_type",
        "dt.is_mandatory",
        "dt.is_expiry_required",
        "dt.service_area_country"
      ])
      .where("d.status", "ACTIVE");

    documents.forEach(doc => {
      console.log(`📄 ${doc.doc_name_master_id} - ${doc.document_name}`);
      console.log(`   User Type: ${doc.user_type} | Country: ${doc.service_area_country || 'All'}`);
      console.log(`   Mandatory: ${doc.is_mandatory ? '✅' : '❌'} | Expiry Required: ${doc.is_expiry_required ? '✅' : '❌'}\n`);
    });

    // Approval Configuration
    console.log("✅ APPROVAL WORKFLOW:");
    console.log("=".repeat(80));
    
    const approvals = await knex("approval_configuration")
      .where("status", "ACTIVE");

    approvals.forEach(approval => {
      console.log(`✅ ${approval.approval_config_id} - ${approval.approval_type}`);
      console.log(`   Level: ${approval.approver_level} | Control: ${approval.approval_control}`);
      console.log(`   Role: ${approval.role} | User: ${approval.user_id}\n`);
    });

    // Message Templates
    console.log("💬 MESSAGE TEMPLATES:");
    console.log("=".repeat(80));
    
    const messages = await knex("message_master as m")
      .leftJoin("message_text_language as mt", "m.message_master_id", "mt.message_master_id")
      .select([
        "m.message_master_id",
        "m.message_type",
        "m.subject",
        "mt.language",
        "mt.message_text"
      ])
      .where("m.status", "ACTIVE")
      .limit(5);

    const messageGroups = {};
    messages.forEach(msg => {
      if (!messageGroups[msg.message_master_id]) {
        messageGroups[msg.message_master_id] = {
          type: msg.message_type,
          subject: msg.subject,
          languages: []
        };
      }
      if (msg.language) {
        messageGroups[msg.message_master_id].languages.push({
          language: msg.language,
          text: msg.message_text?.substring(0, 100) + '...'
        });
      }
    });

    Object.entries(messageGroups).forEach(([id, msg]) => {
      console.log(`💬 ${id} - ${msg.type}`);
      console.log(`   Subject: ${msg.subject}`);
      msg.languages.forEach(lang => {
        console.log(`   ${lang.language}: ${lang.text}`);
      });
      console.log();
    });

    // System Configuration
    console.log("⚙️ SYSTEM CONFIGURATION:");
    console.log("=".repeat(80));
    
    const configs = await knex("general_config")
      .where("active_flag", true)
      .where("status", "ACTIVE");

    configs.forEach(config => {
      console.log(`⚙️ ${config.general_config_id} - ${config.parameter_name}`);
      console.log(`   Min: ${config.parameter_value_min} | Max: ${config.parameter_value_max}`);
      console.log(`   Valid: ${config.valid_from} to ${config.valid_to}\n`);
    });

    console.log("🎉 Common Database data overview complete!");
    
  } catch (error) {
    console.error("❌ Error displaying data:", error.message);
  } finally {
    await knex.destroy();
  }
}

showCommonDBData();