const fs = require('fs');
const path = require('path');

const seedContent = `/**
 * Seed: Populate status_purpose_master table
 * Purpose: Insert initial status purpose records
 * Date: ${new Date().toISOString().split('T')[0]}
 */

exports.seed = async function(knex) {
  // Delete existing entries
  await knex('status_purpose_master').del();
  
  // Get current date and time
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format
  
  // Insert seed entries
  const statusPurposes = [
    {
      status_purpose_id: 'SP001',
      status_purpose: 'User Master',
      created_at: currentDate,
      created_on: currentTime,
      created_by: 'SYSTEM',
      updated_at: currentDate,
      updated_on: currentTime,
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      status_purpose_id: 'SP002',
      status_purpose: 'Approval Flow Status',
      created_at: currentDate,
      created_on: currentTime,
      created_by: 'SYSTEM',
      updated_at: currentDate,
      updated_on: currentTime,
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      status_purpose_id: 'SP003',
      status_purpose: 'Signup Status',
      created_at: currentDate,
      created_on: currentTime,
      created_by: 'SYSTEM',
      updated_at: currentDate,
      updated_on: currentTime,
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      status_purpose_id: 'SP004',
      status_purpose: 'RFQ',
      created_at: currentDate,
      created_on: currentTime,
      created_by: 'SYSTEM',
      updated_at: currentDate,
      updated_on: currentTime,
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      status_purpose_id: 'SP005',
      status_purpose: 'Quotation',
      created_at: currentDate,
      created_on: currentTime,
      created_by: 'SYSTEM',
      updated_at: currentDate,
      updated_on: currentTime,
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      status_purpose_id: 'SP006',
      status_purpose: 'Indent',
      created_at: currentDate,
      created_on: currentTime,
      created_by: 'SYSTEM',
      updated_at: currentDate,
      updated_on: currentTime,
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      status_purpose_id: 'SP007',
      status_purpose: 'Drop Location',
      created_at: currentDate,
      created_on: currentTime,
      created_by: 'SYSTEM',
      updated_at: currentDate,
      updated_on: currentTime,
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      status_purpose_id: 'SP008',
      status_purpose: 'Vehicle',
      created_at: currentDate,
      created_on: currentTime,
      created_by: 'SYSTEM',
      updated_at: currentDate,
      updated_on: currentTime,
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      status_purpose_id: 'SP009',
      status_purpose: 'Checklist',
      created_at: currentDate,
      created_on: currentTime,
      created_by: 'SYSTEM',
      updated_at: currentDate,
      updated_on: currentTime,
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    },
    {
      status_purpose_id: 'SP010',
      status_purpose: 'Vehicle Driver Replacement Request',
      created_at: currentDate,
      created_on: currentTime,
      created_by: 'SYSTEM',
      updated_at: currentDate,
      updated_on: currentTime,
      updated_by: 'SYSTEM',
      status: 'ACTIVE'
    }
  ];

  await knex('status_purpose_master').insert(statusPurposes);
  
  console.log(' Inserted', statusPurposes.length, 'status purpose records');
  console.log(' Populated purposes:');
  statusPurposes.forEach(sp => {
    console.log(`   - ${sp.status_purpose_id}: ${sp.status_purpose}`);
  });
};
`;

const filename = '015_status_purpose_master_seed.js';
const filepath = path.join(process.cwd(), 'seeds', filename);

fs.writeFileSync(filepath, seedContent, 'utf8');
console.log(` Seed file created: seeds/${filename}`);
console.log(' Will populate 10 status purpose records:');
console.log('   - SP001: User Master');
console.log('   - SP002: Approval Flow Status');
console.log('   - SP003: Signup Status');
console.log('   - SP004: RFQ');
console.log('   - SP005: Quotation');
console.log('   - SP006: Indent');
console.log('   - SP007: Drop Location');
console.log('   - SP008: Vehicle');
console.log('   - SP009: Checklist');
console.log('   - SP010: Vehicle Driver Replacement Request');
