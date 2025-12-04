/**
 * Migration: Create vehicle bulk upload tables
 * Date: 2024-12-03
 * Purpose: Add tables for vehicle bulk upload functionality
 */

exports.up = async function(knex) {
  console.log("Ì∫ó Creating vehicle bulk upload tables...");
  
  // 1. Create vehicle bulk upload batches table
  await knex.schema.createTable("tms_bulk_upload_vehicle_batches", function(table) {
    table.increments("id").primary();
    table.string("batch_id", 100).notNullable().unique();
    table.integer("uploaded_by").notNullable();
    table.string("filename", 500).notNullable();
    table.integer("total_rows").defaultTo(0);
    table.integer("processed_rows").defaultTo(0);
    table.integer("success_count").defaultTo(0);
    table.integer("error_count").defaultTo(0);
    table.enum("status", ["processing", "completed", "failed"]).defaultTo("processing");
    table.string("error_report_path", 1000).nullable();
    table.timestamp("upload_timestamp").defaultTo(knex.fn.now());
    table.timestamp("processed_timestamp").nullable();
    table.text("processing_notes").nullable();
    
    table.index(["batch_id"]);
    table.index(["uploaded_by"]);
    table.index(["status"]);
    table.index(["upload_timestamp"]);
  });
  
  // 2. Create vehicle bulk upload records table
  await knex.schema.createTable("tms_bulk_upload_vehicles", function(table) {
    table.increments("id").primary();
    table.string("batch_id", 100).notNullable();
    table.string("vehicle_ref_id", 50).notNullable(); // From Excel file
    table.integer("row_number").notNullable();
    table.enum("validation_status", ["valid", "invalid"]).notNullable();
    table.json("validation_errors").nullable(); // JSON array of error messages
    table.json("raw_data").nullable(); // Raw data from Excel
    table.string("created_vehicle_id", 20).nullable(); // Generated VEH0001 ID
    table.timestamp("processed_at").defaultTo(knex.fn.now());
    
    table.index(["batch_id"]);
    table.index(["vehicle_ref_id"]);
    table.index(["validation_status"]);
    table.index(["created_vehicle_id"]);
    
    // Foreign key to batch table
    table.foreign("batch_id").references("batch_id").inTable("tms_bulk_upload_vehicle_batches").onDelete("CASCADE");
  });
  
  console.log("‚úÖ Vehicle bulk upload tables created successfully");
};

exports.down = async function(knex) {
  console.log("Ì∑ëÔ∏è Dropping vehicle bulk upload tables...");
  
  await knex.schema.dropTableIfExists("tms_bulk_upload_vehicles");
  await knex.schema.dropTableIfExists("tms_bulk_upload_vehicle_batches");
  
  console.log("‚úÖ Vehicle bulk upload tables dropped");
};
