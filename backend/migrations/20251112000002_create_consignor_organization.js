/**
 * Migration: Create consignor_organization table
 * Description: Stores organization details for consignors (company code, business area)
 * Dependencies: consignor_basic_information table
 */

exports.up = function (knex) {
  return knex.schema.createTable("consignor_organization", function (table) {
    // Primary Key
    table.increments("organization_unique_id").primary().comment("Auto-increment unique identifier");
    
    // Foreign Key to Consignor Basic Information
    table.string("customer_id", 10).notNullable().comment("Foreign key from consignor_basic_information");
    
    // Organization Fields
    table.string("company_code", 20).notNullable().unique().comment("Unique company code identifier");
    table.string("business_area", 30).notNullable().unique().comment("Business area classification");
    
    // Audit Trail
    table.datetime("created_at").defaultTo(knex.fn.now()).comment("Creation date and time");
    table.string("created_by", 10).notNullable().comment("User who created the record");
    table.datetime("updated_at").defaultTo(knex.fn.now()).comment("Last update date and time");
    table.string("updated_by", 10).notNullable().comment("User who last updated the record");
    table.string("status", 10).notNullable().defaultTo("ACTIVE").comment("Record status (ACTIVE/INACTIVE)");

    // Indexes for performance
    table.index(["customer_id"], "idx_consignor_org_customer_id");
    table.index(["company_code"], "idx_consignor_org_company_code");
    table.index(["business_area"], "idx_consignor_org_business_area");
    table.index(["status"], "idx_consignor_org_status");

    // Foreign Key Constraint (will be added in separate migration after all tables are created)
    // customer_id references consignor_basic_information.customer_id
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("consignor_organization");
};
