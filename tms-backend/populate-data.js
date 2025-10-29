#!/usr/bin/env node

/**
 * Database Population Helper Script
 * 
 * Quick commands to populate or clear database data
 * 
 * Usage:
 *   node populate-data.js seed-all          # Run all seeds
 *   node populate-data.js seed-transporter  # Seed only transporters
 *   node populate-data.js check-transporter # View transporter data
 *   node populate-data.js clear-transporter # Clear transporter data
 *   node populate-data.js reset-db          # Reset entire database
 */

require('dotenv').config();
const knex = require('knex')(require('./knexfile').development);

const commands = {
  // Seed Commands
  'seed-all': async () => {
    console.log('📦 Running all seed files...\n');
    const { execSync } = require('child_process');
    execSync('npx knex seed:run', { stdio: 'inherit' });
  },

  'seed-transporter': async () => {
    console.log('🚛 Seeding transporter data...\n');
    const { execSync } = require('child_process');
    execSync('npx knex seed:run --specific=999_transporter_complete_sample_data.js', { stdio: 'inherit' });
  },

  // Check Commands
  'check-transporter': async () => {
    console.log('📊 Checking transporter data...\n');
    
    const transporters = await knex('transporter_general_info')
      .select('transporter_id', 'business_name', 'status', 'avg_rating')
      .orderBy('transporter_id');
    
    console.log(`Found ${transporters.length} transporters:`);
    console.table(transporters);
    
    const contacts = await knex('transporter_contact').count('* as count');
    const serviceAreas = await knex('transporter_service_area_itm').count('* as count');
    
    console.log(`\n📞 Contacts: ${contacts[0].count}`);
    console.log(`🗺️  Service Areas: ${serviceAreas[0].count}\n`);
  },

  'check-all': async () => {
    console.log('📊 Database Statistics:\n');
    
    const tables = [
      'transporter_general_info',
      'transporter_contact',
      'transporter_service_area_hdr',
      'transporter_service_area_itm',
      'warehouse_basic_information',
      'consignor_material_master_information'
    ];

    for (const table of tables) {
      try {
        const result = await knex(table).count('* as count');
        console.log(`${table.padEnd(40)} : ${result[0].count} records`);
      } catch (err) {
        console.log(`${table.padEnd(40)} : ❌ Error`);
      }
    }
    console.log('');
  },

  // Clear Commands
  'clear-transporter': async () => {
    console.log('🗑️  Clearing transporter data...\n');
    
    await knex('transporter_service_area_itm').del();
    console.log('✅ Cleared service area items');
    
    await knex('transporter_service_area_hdr').del();
    console.log('✅ Cleared service area headers');
    
    await knex('transporter_contact').del();
    console.log('✅ Cleared transporter contacts');
    
    await knex('transporter_general_info').del();
    console.log('✅ Cleared transporter general info');
    
    console.log('\n🎉 Transporter data cleared successfully!\n');
  },

  // Reset Commands
  'reset-db': async () => {
    console.log('⚠️  WARNING: This will reset the entire database!\n');
    console.log('Rolling back all migrations...');
    const { execSync } = require('child_process');
    
    execSync('npx knex migrate:rollback --all', { stdio: 'inherit' });
    console.log('\n✅ Database rolled back\n');
    
    console.log('Running all migrations...');
    execSync('npx knex migrate:latest', { stdio: 'inherit' });
    console.log('\n✅ Migrations completed\n');
    
    console.log('Seeding database...');
    execSync('npx knex seed:run --specific=999_transporter_complete_sample_data.js', { stdio: 'inherit' });
    console.log('\n🎉 Database reset complete!\n');
  },

  // Help Command
  'help': () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║         TMS Database Population Helper                  ║
╚══════════════════════════════════════════════════════════╝

📦 SEED COMMANDS
  seed-all              Run all seed files
  seed-transporter      Seed transporter data only

📊 CHECK COMMANDS
  check-transporter     View transporter data
  check-all             View all table statistics

🗑️  CLEAR COMMANDS
  clear-transporter     Clear all transporter data

⚠️  RESET COMMANDS
  reset-db              Reset entire database (migrations + seeds)

📖 USAGE
  node populate-data.js <command>

📝 EXAMPLES
  node populate-data.js seed-transporter
  node populate-data.js check-all
  node populate-data.js clear-transporter

`);
  }
};

// Main execution
const command = process.argv[2];

if (!command || !commands[command]) {
  console.log('❌ Invalid command\n');
  commands.help();
  process.exit(1);
}

commands[command]()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
