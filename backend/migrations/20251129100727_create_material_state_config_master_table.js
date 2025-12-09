/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('material_state_config_master', function(table) {
    // Primary Key
    table.string('material_state_config_id', 10).primary().notNullable().unique()
      .comment('Material State Config Master ID - Primary Key');
    
    // Core Fields
    table.string('consignor_id', 30).notNullable()
      .comment('Reference to Consignor');
    
    table.string('material_state_id', 30).notNullable()
      .comment('Reference to Material State');
    
    // Status and Active Flag
    table.string('is_active', 30).notNullable().defaultTo('Y')
      .comment('Active status flag (Y/N)');
    
    table.string('status', 10).nullable()
      .comment('Record status');
    
    // Audit Fields - Following TMS patterns
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
      .comment('Record creation timestamp');
    
    table.time('created_on').notNullable().defaultTo(knex.raw('CURTIME()'))
      .comment('Record creation time');
    
    table.string('created_by', 10).notNullable()
      .comment('User who created the record');
    
    table.timestamp('updated_at').nullable()
      .comment('Record last update timestamp');
    
    table.time('updated_on').nullable()
      .comment('Record last update time');
    
    table.string('updated_by', 10).nullable()
      .comment('User who last updated the record');
    
    // Indexes for performance
    table.index('consignor_id', 'idx_material_state_config_consignor');
    table.index('material_state_id', 'idx_material_state_config_material_state');
    table.index('is_active', 'idx_material_state_config_active');
    table.index('status', 'idx_material_state_config_status');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('material_state_config_master');
};
