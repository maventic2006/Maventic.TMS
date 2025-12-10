/**
 * Migration: Create vehicle bulk upload tables
 * Date: 2024-12-03
 * Purpose: Add tables for vehicle bulk upload functionality
 */

exports.up = async function(knex) {
  console.log("��� Creating vehicle bulk upload tables...");
  
  // 1. Create vehicle bulk upload batches table
  await knex.schema.createTable("tms_bulk_upload_vehicle_batches", function(table) {
    table.increments("id").primary();
    table.string("batch_id", 50).notNullable().unique();
    table.string("uploaded_by", 20).notNullable(); // Changed from integer to string to match user_id format
    table.string("filename", 255).notNullable();
    table.integer("total_rows").notNullable(); // Changed to notNullable
    table.integer("processed_rows").defaultTo(0); // ✅ KEPT - Required for progress tracking
    table.integer("total_valid").defaultTo(0); // ✅ ADDED - Matches actual schema
    table.integer("total_invalid").defaultTo(0); // ✅ ADDED - Matches actual schema
    table.integer("total_created").defaultTo(0); // ✅ ADDED - Matches actual schema
    table.integer("total_creation_failed").defaultTo(0); // ✅ ADDED - Matches actual schema
    table.enum("status", ["processing", "completed", "failed"]).defaultTo("processing");
    table.timestamp("upload_timestamp").defaultTo(knex.fn.now());
    table.timestamp("processed_timestamp").nullable();
    table.string("error_report_path", 500).nullable(); // Reduced from 1000
    table.text("error_message").nullable(); // ✅ ADDED - For batch-level error messages
    
    table.index(["batch_id"]);
    table.index(["uploaded_by"]);
    table.index(["status"]);
    table.index(["upload_timestamp"]);
  });
  
  // 2. Create vehicle bulk upload records table
  await knex.schema.createTable("tms_bulk_upload_vehicles", function(table) {
    table.increments("id").primary();
    table.string("batch_id", 50).notNullable(); // Matches batch_id size
    table.string("vehicle_ref_id", 50).nullable(); // ✅ CHANGED - Can be null for invalid records
    table.integer("excel_row_number").notNullable(); // ✅ RENAMED from row_number
    table.enum("validation_status", ["valid", "invalid"]).notNullable();
    table.json("validation_errors").nullable(); // JSON array of error messages
    table.json("data").nullable(); // ✅ RENAMED from raw_data - Parsed vehicle data
    table.string("created_vehicle_id", 10).nullable(); // ✅ REDUCED - VEH0001 format
    
    table.index(["batch_id"]);
    table.index(["vehicle_ref_id"]);
    table.index(["validation_status"]);
    table.index(["created_vehicle_id"]);
    
    // Foreign key to batch table
    table.foreign("batch_id").references("batch_id").inTable("tms_bulk_upload_vehicle_batches").onDelete("CASCADE");
  });
  
  console.log("✅ Vehicle bulk upload tables created successfully");
};

exports.down = async function(knex) {
  console.log("���️ Dropping vehicle bulk upload tables...");
  
  await knex.schema.dropTableIfExists("tms_bulk_upload_vehicles");
  await knex.schema.dropTableIfExists("tms_bulk_upload_vehicle_batches");
  
  console.log("✅ Vehicle bulk upload tables dropped");
};
