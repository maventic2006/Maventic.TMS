const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Generate timestamp for migration filename
const timestamp = new Date().toISOString()
  .replace(/[-:]/g, '')
  .replace(/T/, '')
  .replace(/\.\d{3}Z/, '');

const migrationContent = `/**
 * Migration: Create status_purpose_master table
 * Purpose: Master table to define purposes for which status will be fetched
 * Date: ${new Date().toISOString().split('T')[0]}
 */

exports.up = function(knex) {
  return knex.schema.createTable('status_purpose_master', function(table) {
    // Primary Key
    table.string('status_purpose_id', 10).primary().notNullable().unique().comment('Primary key for status purpose');
    
    // Business Fields
    table.string('status_purpose', 30).notNullable().comment('Purpose description for status usage');
    
    // Audit Fields
    table.date('created_at').notNullable().comment('Creation date');
    table.time('created_on').notNullable().comment('Creation time');
    table.string('created_by', 10).notNullable().comment('User who created the record');
    table.date('updated_at').notNullable().comment('Last update date');
    table.time('updated_on').notNullable().comment('Last update time');
    table.string('updated_by', 10).notNullable().comment('User who last updated the record');
    table.string('status', 10).nullable().defaultTo('ACTIVE').comment('Record status (ACTIVE/INACTIVE)');
    
    // Indexes for better performance
    table.index('status_purpose', 'idx_status_purpose_name');
    table.index('status', 'idx_status_purpose_status');
    table.index(['created_at', 'status'], 'idx_status_purpose_created_status');
    
    console.log(' status_purpose_master table structure created');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('status_purpose_master');
};
`;

const filename = `${timestamp}_create_status_purpose_master.js`;
const filepath = path.join(process.cwd(), 'migrations', filename);

fs.writeFileSync(filepath, migrationContent, 'utf8');
console.log(` Migration file created: migrations/${filename}`);
console.log(' Table structure:');
console.log('   - status_purpose_id (VARCHAR 10) - Primary Key');
console.log('   - status_purpose (VARCHAR 30) - Purpose description');
console.log('   - created_at, created_on, created_by - Audit fields');
console.log('   - updated_at, updated_on, updated_by - Audit fields');
console.log('   - status (VARCHAR 10) - Record status (ACTIVE/INACTIVE)');
