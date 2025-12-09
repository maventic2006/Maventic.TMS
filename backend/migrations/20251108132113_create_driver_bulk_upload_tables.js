/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Create driver_bulk_upload_batches table
  await knex.schema.createTable("tms_driver_bulk_upload_batches", (table) => {
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

    // Foreign key to users table (commented out - user_master may not have proper constraints)
    // table.foreign('uploaded_by').references('id').inTable('user_master');

    // Indexes for performance
    table.index("uploaded_by");
    table.index("status");
    table.index("upload_timestamp");
  });

  // Create driver_bulk_upload_drivers table
  await knex.schema.createTable("tms_driver_bulk_upload_drivers", (table) => {
    table.increments("id").primary();
    table.string("batch_id", 50).notNullable();
    table.string("driver_ref_id", 50).nullable();
    table.integer("excel_row_number").notNullable();
    table.enum("validation_status", ["valid", "invalid"]).notNullable();
    table.json("validation_errors").nullable();
    table.json("data").nullable();
    table.string("created_driver_id", 50).nullable();

    // Foreign keys
    table
      .foreign("batch_id")
      .references("batch_id")
      .inTable("tms_driver_bulk_upload_batches")
      .onDelete("CASCADE");
    table
      .foreign("created_driver_id")
      .references("driver_id")
      .inTable("driver_basic_information");

    // Indexes for performance
    table.index("batch_id");
    table.index("validation_status");
    table.index("driver_ref_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("tms_driver_bulk_upload_drivers");
  await knex.schema.dropTableIfExists("tms_driver_bulk_upload_batches");
};
