/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Create warehouse_bulk_upload_batches table
  const batchesTableExists = await knex.schema.hasTable("tms_warehouse_bulk_upload_batches");
  if (!batchesTableExists) {
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
  }

  // Create warehouse_bulk_upload_warehouses table
  const warehousesTableExists = await knex.schema.hasTable("tms_warehouse_bulk_upload_warehouses");
  if (!warehousesTableExists) {
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
        table
          .foreign("created_warehouse_id")
          .references("warehouse_id")
          .inTable("warehouse_basic_information");

        // Indexes for performance
        table.index("batch_id");
        table.index("validation_status");
        table.index("warehouse_ref_id");
      }
    );
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("tms_warehouse_bulk_upload_warehouses");
  await knex.schema.dropTableIfExists("tms_warehouse_bulk_upload_batches");
};
