require('dotenv')        // 1. Check if status_master table exists
        console.log('1️⃣ Checking if status_master table exists...');
        const tables = await knex.raw('SHOW TABLES LIKE "status_master"');nfig();

const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
});

console.log(' Investigating Status Master Table Issue...\\n');

async function checkStatusMaster() {
    try {
        // 1. Check if status_master table exists
        console.log('1 Checking if status_master table exists...');
        const tables = await knex.raw('SHOW TABLES LIKE \\'status_master\\'');
        
        if (tables[0].length === 0) {
            console.log(' status_master table does NOT exist!');
            
            // Let's check what tables do exist with 'status' in the name
            console.log('\\n Looking for tables containing \\'status\\'...');
            const allTables = await knex.raw('SHOW TABLES LIKE \\'\%status\%\\'');
            console.log(' Tables found:', allTables[0].map(t => Object.values(t)[0]));
            return;
        }
        
        console.log(' status_master table exists');
        
        // 2. Check table structure
        console.log('\\n2 Checking table structure...');
        const [structure] = await knex.raw('DESCRIBE status_master');
        console.table(structure.map(row => ({
            Field: row.Field,
            Type: row.Type,
            Null: row.Null,
            Key: row.Key,
            Default: row.Default
        })));
        
        // 3. Check data count
        console.log('\\n3 Checking data count...');
        const [{ count }] = await knex('status_master').count('* as count');
        console.log(' Total records:', count);
        
        // 4. Sample data
        if (count > 0) {
            console.log('\\n4 Sample data (first 5 records):');
            const sample = await knex('status_master').select('*').limit(5);
            console.table(sample);
        }
        
    } catch (error) {
        console.error(' Error checking status_master:', error.message);
    } finally {
        process.exit(0);
    }
}

checkStatusMaster();