/**
 * Migration: Create milestone_master table
 * 
 * This table stores milestone information for tracking shipment/delivery milestones
 * across different countries with document requirements.
 */

exports.up = function(knex) {
  return knex.schema.createTable('milestone_master', function(table) {
    // Primary Key
    table.string('milestone_id', 10).primary().comment('Primary key - Milestone identifier');
    
    // Core Fields
    table.string('description', 30).notNullable().comment('Milestone description');
    table.string('country_id', 30).notNullable().comment('Country identifier for the milestone');
    table.string('document_required', 30).notNullable().comment('Document requirement indicator');
    
    // Audit Fields - Using DATETIME instead of separate DATE and TIME
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now()).comment('Timestamp when record was created');
    table.datetime('created_on').nullable().comment('Legacy timestamp field');
    table.string('created_by', 10).notNullable().comment('User who created the record');
    
    table.datetime('updated_at').nullable().comment('Timestamp when record was last updated');
    table.datetime('updated_on').nullable().comment('Legacy timestamp field');
    table.string('updated_by', 10).nullable().comment('User who last updated the record');
    
    // Status
    table.string('status', 10).nullable().defaultTo('ACTIVE').comment('Record status: ACTIVE/INACTIVE');
    
    // Indexes for better query performance
    table.index('country_id', 'idx_milestone_country');
    table.index('status', 'idx_milestone_status');
    table.index(['country_id', 'status'], 'idx_milestone_country_status');
  })
  .then(() => {
    console.log('✅ milestone_master table created successfully');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('milestone_master')
    .then(() => {
      console.log('✅ milestone_master table dropped successfully');
    });
};
