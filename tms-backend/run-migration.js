const knex = require('./config/database');

async function runMigration() {
  try {
    console.log('Ì¥ß Altering blacklist_mapping table...');
    
    await knex.schema.alterTable('blacklist_mapping', function(table) {
      table.string('blacklisted_by', 20).alter();
    });
    
    console.log('‚úÖ Successfully increased blacklisted_by column size to 20 characters');
    process.exit(0);
  } catch (error) {
    console.error('‚ùå Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
