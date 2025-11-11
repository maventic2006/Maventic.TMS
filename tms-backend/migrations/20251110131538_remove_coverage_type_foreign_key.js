/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable("vehicle_documents", (table) => {
    // Drop the foreign key constraint
    table.dropForeign(["coverage_type_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable("vehicle_documents", (table) => {
    // Re-add the foreign key constraint if rolling back
    table.foreign("coverage_type_id").references("coverage_type_id").inTable("coverage_type_master");
  });
};
