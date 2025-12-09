/**
 * Migration: Increase user_master.status Field Length
 * Date: November 17, 2025
 * 
 * Description: Fixes DATA_TOO_LONG error by increasing status field length:
 * - user_master.status: VARCHAR(10) → VARCHAR(30)
 * 
 * Reason: The status field needs to accommodate longer status values like
 * "Pending for Approval" (21 characters), "Sent Back" (9 characters), etc.
 * 
 * Current values:
 * - "ACTIVE" (6 chars)
 * - "INACTIVE" (8 chars)
 * - "Pending for Approval" (21 chars) - EXCEEDS CURRENT LIMIT!
 * - "Sent Back" (9 chars)
 */

exports.up = function(knex) {
  console.log('🔧 Increasing user_master.status field length to prevent DATA_TOO_LONG errors...');
  
  return knex.schema.alterTable('user_master', function(table) {
    console.log('📊 Updating user_master.status: VARCHAR(10) → VARCHAR(30)');
    table.string('status', 30).alter();
  }).then(() => {
    console.log('✅ user_master.status field length increased successfully!');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('user_master', function(table) {
    table.string('status', 10).alter();
  });
};
