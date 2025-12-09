/**
 * Migration: Add Missing User Types (Permanent Fix)
 * 
 * PURPOSE:
 * This migration ensures all required user types exist in user_type_master table.
 * It fixes the FOREIGN_KEY_VIOLATION error that occurs when creating consignors
 * because the code expects UT006 (Consignor Admin) and other types (UT007-UT013).
 * 
 * ISSUE FIXED:
 * Error: "Cannot add or update a child row: a foreign key constraint fails 
 * (`tms_dev`.`user_master`, CONSTRAINT `user_master_user_type_id_foreign` 
 * FOREIGN KEY (`user_type_id`) REFERENCES `user_type_master` (`user_type_id`))"
 * 
 * ROOT CAUSE:
 * - consignorService.js line 879 uses `user_type_id: "UT006"` (Consignor Admin)
 * - But user_type_master only had UT001-UT005
 * - Previous migration skipped insert because table already existed
 * 
 * SOLUTION:
 * - Use INSERT IGNORE to add missing user types without causing conflicts
 * - Idempotent: safe to run multiple times
 * 
 * Date: November 17, 2025
 */

exports.up = async function(knex) {
  console.log('🔧 Adding missing user types to user_type_master...');
  
  // Use INSERT IGNORE to avoid duplicates
  // This ensures idempotency - safe to run multiple times
  await knex.raw(`
    INSERT IGNORE INTO user_type_master 
    (user_type_id, user_type, status, created_by, created_at, updated_at)
    VALUES
    ('UT006', 'Consignor Admin', 'Active', 'SYSTEM', NOW(), NOW()),
    ('UT007', 'Consignor WH Manager', 'Active', 'SYSTEM', NOW(), NOW()),
    ('UT008', 'Consignor WH Members', 'Active', 'SYSTEM', NOW(), NOW()),
    ('UT009', 'Consignor Management', 'Active', 'SYSTEM', NOW(), NOW()),
    ('UT010', 'Consignor Finance', 'Active', 'SYSTEM', NOW(), NOW()),
    ('UT011', 'Driver', 'Active', 'SYSTEM', NOW(), NOW()),
    ('UT012', 'Vehicle Owner', 'Active', 'SYSTEM', NOW(), NOW()),
    ('UT013', 'Warehouse User', 'Active', 'SYSTEM', NOW(), NOW())
  `);
  
  console.log('✅ Successfully ensured all user types exist (UT001-UT013)');
  
  // Verify the fix
  const count = await knex('user_type_master').count('* as total').first();
  console.log(`📊 Total user types in database: ${count.total}`);
};

exports.down = async function(knex) {
  console.log('⏪ Rolling back: Removing user types UT006-UT013...');
  
  // Only remove if no users are using these types
  const usersWithTypes = await knex('user_master')
    .whereIn('user_type_id', ['UT006', 'UT007', 'UT008', 'UT009', 'UT010', 'UT011', 'UT012', 'UT013'])
    .count('* as count')
    .first();
  
  if (usersWithTypes.count > 0) {
    console.warn(`⚠️  Cannot remove user types - ${usersWithTypes.count} users are using them`);
    console.warn('   Skipping rollback to prevent foreign key constraint violations');
    return;
  }
  
  await knex('user_type_master')
    .whereIn('user_type_id', ['UT006', 'UT007', 'UT008', 'UT009', 'UT010', 'UT011', 'UT012', 'UT013'])
    .del();
  
  console.log('✅ Rollback complete');
};
