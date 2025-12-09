/**
 * Migration: Add Consignor Admin Approval Configuration
 * Purpose: Enable Level 1 approval for Consignor Admin users
 * Date: 2025-11-16
 * 
 * This migration adds approval configuration for Consignor Admin (AT002)
 * following the same pattern as Transporter Admin (AT001)
 */

exports.up = async function (knex) {
  console.log('🔄 Adding Consignor Admin approval configuration...');

  // Check if AC0002 already exists
  const existing = await knex('approval_configuration')
    .where('approval_config_id', 'AC0002')
    .first();

  if (existing) {
    console.log('ℹ️  Consignor Admin approval config already exists (AC0002)');
    return;
  }

  // Add Consignor Admin approval configuration
  await knex('approval_configuration').insert({
    approval_config_id: 'AC0002',
    approval_type_id: 'AT002', // Consignor Admin
    approver_level: 1,
    approval_control: null,
    role_id: 'RL001', // Product Owner
    user_id: null, // Any Product Owner can approve
    status: 'ACTIVE',
    created_by: 'SYSTEM',
    updated_by: 'SYSTEM',
    created_at: knex.fn.now(),
    updated_at: knex.fn.now(),
  });

  console.log('✅ Added Consignor Admin approval configuration (AC0002)');
  console.log('   Approval Type: AT002 (Consignor Admin)');
  console.log('   Approver Level: 1');
  console.log('   Approver Role: RL001 (Product Owner)');
  console.log('   Cross-Approval: PO1 ↔ PO2');
};

exports.down = async function (knex) {
  console.log('🔄 Removing Consignor Admin approval configuration...');

  await knex('approval_configuration')
    .where('approval_config_id', 'AC0002')
    .del();

  console.log('✅ Removed approval configuration AC0002');
};
