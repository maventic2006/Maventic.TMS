/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Increase engine_type_id in engine_type_master table
  await knex.raw('ALTER TABLE engine_type_master MODIFY COLUMN engine_type_id VARCHAR(20) NOT NULL');
  
  // Increase engine_type_id in vehicle_basic_information_hdr table
  await knex.raw('ALTER TABLE vehicle_basic_information_hdr MODIFY COLUMN engine_type_id VARCHAR(20)');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Revert engine_type_id in engine_type_master table
  await knex.raw('ALTER TABLE engine_type_master MODIFY COLUMN engine_type_id VARCHAR(10) NOT NULL');
  
  // Revert engine_type_id in vehicle_basic_information_hdr table
  await knex.raw('ALTER TABLE vehicle_basic_information_hdr MODIFY COLUMN engine_type_id VARCHAR(10)');
};
