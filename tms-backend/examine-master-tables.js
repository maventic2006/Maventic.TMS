const knexConfig = require('./knexfile.js');
const knex = require('knex')(knexConfig.development);

(async () => {
  try {
    console.log('Examining all master tables...\n');
    
    // Get all master tables
    const tables = await knex.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name LIKE '%_master'
      ORDER BY table_name
    `);
    
    console.log(`Found ${tables[0].length} master tables:\n`);
    
    for (let table of tables[0]) {
      const tableName = table.TABLE_NAME || table.table_name;
      console.log(`--- ${tableName.toUpperCase()} ---`);
      
      // Get column information
      const columns = await knex.raw(`DESCRIBE ${tableName}`);
      columns[0].forEach(col => {
        const nullable = col.Null === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.Default ? ` | Default: ${col.Default}` : '';
        console.log(`  ${col.Field} | ${col.Type} | ${nullable}${defaultVal}`);
      });
      
      // Get sample data count
      const count = await knex(tableName).count('* as total').first();
      console.log(`  Records: ${count.total}\n`);
    }
    
    await knex.destroy();
    console.log('Master table examination complete.');
  } catch (error) {
    console.error('Error:', error.message);
    await knex.destroy();
  }
})();