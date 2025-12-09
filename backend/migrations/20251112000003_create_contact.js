/**
 * Migration: Create contact table
 * Description: Stores contact information for consignors (contact persons)
 * Dependencies: consignor_basic_information table
 */

exports.up = function (knex) {
  return knex.schema.createTable("contact", function (table) {
    // Primary Key
    table.increments("contact_unique_id").primary().comment("Auto-increment unique identifier");
    
    // Business Key
    table.string("contact_id", 10).notNullable().unique().comment("Primary business key for contact");
    
    // Foreign Key to Consignor Basic Information
    table.string("customer_id", 10).notNullable().comment("Foreign key from consignor_basic_information");
    
    // Contact Fields
    table.string("contact_designation", 50).notNullable().comment("Job title or designation");
    table.string("contact_name", 100).notNullable().comment("Full name of the contact person");
    table.string("contact_number", 15).nullable().comment("Phone number with country code");
    table.text("contact_photo").nullable().comment("Base64 encoded photo or file path");
    table.string("contact_role", 40).nullable().comment("Role in the organization");
    table.string("contact_team", 20).nullable().comment("Team or department");
    table.string("country_code", 10).nullable().comment("Country calling code (e.g., +91, +1)");
    table.string("email_id", 100).nullable().comment("Email address");
    table.string("linkedin_link", 200).nullable().comment("LinkedIn profile URL");
    
    // Audit Trail
    table.datetime("created_at").defaultTo(knex.fn.now()).comment("Creation date and time");
    table.string("created_by", 10).notNullable().comment("User who created the record");
    table.datetime("updated_at").defaultTo(knex.fn.now()).comment("Last update date and time");
    table.string("updated_by", 10).notNullable().comment("User who last updated the record");
    table.string("status", 10).notNullable().defaultTo("ACTIVE").comment("Record status (ACTIVE/INACTIVE)");

    // Indexes for performance
    table.index(["contact_id"], "idx_contact_id");
    table.index(["customer_id"], "idx_contact_customer_id");
    table.index(["contact_name"], "idx_contact_name");
    table.index(["email_id"], "idx_contact_email");
    table.index(["contact_number"], "idx_contact_number");
    table.index(["status"], "idx_contact_status");

    // Foreign Key Constraint (will be added in separate migration after all tables are created)
    // customer_id references consignor_basic_information.customer_id
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("contact");
};
