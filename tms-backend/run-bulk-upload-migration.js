const knex = require("knex")(require("./knexfile").development);

async function createWarehouseBulkUploadTables() {
  try {
    console.log("🔧 Starting warehouse bulk upload tables creation...\n");

    // Check if tables already exist
    const batchTableExists = await knex.schema.hasTable(
      "tms_warehouse_bulk_upload_batches"
    );
    const warehouseTableExists = await knex.schema.hasTable(
      "tms_warehouse_bulk_upload_warehouses"
    );

    if (batchTableExists && warehouseTableExists) {
      console.log("✅ Tables already exist. Skipping creation.");
      process.exit(0);
    }

    // Drop existing tables if they exist
    if (warehouseTableExists) {
      console.log(
        "🗑️  Dropping existing tms_warehouse_bulk_upload_warehouses table..."
      );
      await knex.schema.dropTable("tms_warehouse_bulk_upload_warehouses");
    }

    if (batchTableExists) {
      console.log(
        "🗑️  Dropping existing tms_warehouse_bulk_upload_batches table..."
      );
      await knex.schema.dropTable("tms_warehouse_bulk_upload_batches");
    }

    // Create tms_warehouse_bulk_upload_batches table
    console.log("📦 Creating tms_warehouse_bulk_upload_batches table...");
    await knex.schema.createTable(
      "tms_warehouse_bulk_upload_batches",
      (table) => {
        table.increments("id").primary();
        table.string("batch_id", 50).notNullable().unique();
        table.integer("uploaded_by").unsigned().notNullable();
        table.string("filename", 255).notNullable();
        table.integer("total_rows").notNullable().defaultTo(0);
        table.integer("total_valid").defaultTo(0);
        table.integer("total_invalid").defaultTo(0);
        table.integer("total_created").defaultTo(0);
        table.integer("total_creation_failed").defaultTo(0);
        table
          .enum("status", ["processing", "completed", "failed"])
          .defaultTo("processing");
        table.timestamp("upload_timestamp").defaultTo(knex.fn.now());
        table.timestamp("processed_timestamp").nullable();
        table.string("error_report_path", 500).nullable();

        // Indexes for performance
        table.index("uploaded_by");
        table.index("status");
        table.index("upload_timestamp");
      }
    );
    console.log("✅ tms_warehouse_bulk_upload_batches table created\n");

    // Create tms_warehouse_bulk_upload_warehouses table
    console.log("📦 Creating tms_warehouse_bulk_upload_warehouses table...");
    await knex.schema.createTable(
      "tms_warehouse_bulk_upload_warehouses",
      (table) => {
        table.increments("id").primary();
        table.string("batch_id", 50).notNullable();
        table.string("warehouse_ref_id", 50).nullable(); // Reference ID from Excel (Warehouse_Name1)
        table.integer("excel_row_number").notNullable();
        table.enum("validation_status", ["valid", "invalid"]).notNullable();
        table.json("validation_errors").nullable();
        table.json("data").nullable(); // Stores the complete warehouse data JSON
        table.string("created_warehouse_id", 50).nullable(); // WH001, WH002, etc.

        // Foreign keys
        table
          .foreign("batch_id")
          .references("batch_id")
          .inTable("tms_warehouse_bulk_upload_batches")
          .onDelete("CASCADE");

        // Indexes for performance
        table.index("batch_id");
        table.index("validation_status");
        table.index("warehouse_ref_id");
      }
    );
    console.log("✅ tms_warehouse_bulk_upload_warehouses table created\n");

    // Verify tables were created
    console.log("🔍 Verifying tables...");
    const tables = await knex.raw("SHOW TABLES LIKE 'tms_warehouse_bulk%'");
    console.log("Tables created:", tables[0]);

    console.log("\n✅ All warehouse bulk upload tables created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating tables:", error.message);
    console.error(error);
    process.exit(1);
  }
}

createWarehouseBulkUploadTables();
