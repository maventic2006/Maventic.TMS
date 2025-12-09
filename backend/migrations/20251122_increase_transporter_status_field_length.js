/**
 * Migration: Increase transporter_general_info.status Field Length
 * Date: November 22, 2025
 * 
 * Description: Fixes DATA_TOO_LONG error for SAVE_AS_DRAFT functionality
 * - transporter_general_info.status: VARCHAR(10)  VARCHAR(30)
 * 
 * Reason: The status field needs to accommodate longer status values:
 * - "ACTIVE" (6 chars) 
 * - "INACTIVE" (8 chars) 
 * - "SAVE_AS_DRAFT" (13 chars)  EXCEEDS CURRENT 10-CHAR LIMIT!
 * - "Pending" (7 chars) 
 * - "Approved" (8 chars) 
 * - "Rejected" (8 chars) 
 * 
 * Error encountered:
 * Data too long for column 'status' at row 1
 * 
 * This migration aligns with the user_master table which already has VARCHAR(30).
 */

exports.up = function(knex) {
  console.log(' Increasing transporter_general_info.status field length to support SAVE_AS_DRAFT...');
  
  return knex.schema.alterTable('transporter_general_info', function(table) {
    console.log(' Updating transporter_general_info.status: VARCHAR(10)  VARCHAR(30)');
    table.string('status', 30).alter();
  }).then(() => {
    console.log(' transporter_general_info.status field length increased successfully!');
    console.log(' Now supports: ACTIVE, INACTIVE, SAVE_AS_DRAFT, Pending, Approved, Rejected');
  });
};

exports.down = function(knex) {
  console.log(' Rolling back transporter_general_info.status field length...');
  return knex.schema.alterTable('transporter_general_info', function(table) {
    table.string('status', 10).alter();
  }).then(() => {
    console.log(' Rollback complete - status field reverted to VARCHAR(10)');
  });
};
