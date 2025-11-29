/**
 * Migration: Create consignor_warehouse_mapping table
 * Purpose: Map warehouses to consignors for relationship management
 * Date: 2025-11-29
 */

exports.up = function (knex) {
  return knex.schema.createTable(
    "consignor_warehouse_mapping",
    function (table) {
      // Primary key
      table.increments("mapping_unique_id").primary();

      // Business key
      table
        .string("mapping_id", 20)
        .notNullable()
        .unique()
        .comment("Unique mapping identifier (e.g., CWM00001)");

      // Foreign keys
      table
        .string("warehouse_id", 10)
        .notNullable()
        .comment("References warehouse_basic_information.warehouse_id");
      table
        .string("customer_id", 10)
        .notNullable()
        .comment("References consignor_basic_information.customer_id");

      // Validity period
      table.date("valid_from").comment("Mapping start date");
      table.date("valid_to").comment("Mapping end date");

      // Active flag
      table
        .boolean("is_active")
        .defaultTo(true)
        .comment("Is this mapping currently active");

      // Additional metadata
      table.text("remark").comment("Any additional remarks or notes");

      // Audit trail properties
      table
        .datetime("created_at")
        .defaultTo(knex.fn.now())
        .comment("Record creation timestamp");
      table
        .datetime("created_on")
        .defaultTo(knex.fn.now())
        .comment("Business date of creation");
      table.string("created_by", 10).comment("User who created the record");
      table
        .datetime("updated_at")
        .defaultTo(knex.fn.now())
        .comment("Last update timestamp");
      table
        .datetime("updated_on")
        .defaultTo(knex.fn.now())
        .comment("Business date of update");
      table
        .string("updated_by", 10)
        .comment("User who last updated the record");
      table
        .string("status", 20)
        .defaultTo("ACTIVE")
        .comment("Record status: ACTIVE, INACTIVE, PENDING");

      // Indexes for performance
      table.index(["mapping_id"], "idx_cwm_mapping_id");
      table.index(["warehouse_id"], "idx_cwm_warehouse_id");
      table.index(["customer_id"], "idx_cwm_customer_id");
      table.index(["is_active"], "idx_cwm_is_active");
      table.index(["status"], "idx_cwm_status");
      table.index(["created_at"], "idx_cwm_created_at");

      // Composite index for common queries
      table.index(["customer_id", "status"], "idx_cwm_customer_status");
      table.index(["warehouse_id", "status"], "idx_cwm_warehouse_status");
    }
  );
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("consignor_warehouse_mapping");
};
