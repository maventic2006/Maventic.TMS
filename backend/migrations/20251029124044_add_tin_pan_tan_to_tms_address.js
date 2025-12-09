/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table("tms_address", function (table) {
    // Add TIN/PAN field (Tax Identification Number / Permanent Account Number)
    table.string("tin_pan", 50).nullable().after("vat_number");
    
    // Add TAN field (Tax Deduction and Collection Account Number)
    table.string("tan", 50).nullable().after("tin_pan");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table("tms_address", function (table) {
    table.dropColumn("tin_pan");
    table.dropColumn("tan");
  });
};
