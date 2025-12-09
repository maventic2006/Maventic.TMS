import mysql from 'mysql2/promise';

const dbConfig = {
  host: '192.168.2.27',
  user: 'root',
  password: 'Ventic*2025#', 
  database: 'tms_dev'
};

const testAuctionSlotTable = async () => {
  let connection;
  
  try {
    console.log('Ì¥ó Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('‚úÖ Database connected successfully');
    
    // Check if ebidding_auction_slot table exists
    console.log('\nÌ¥ç Checking ebidding_auction_slot table...');
    
    try {
      const [tableInfo] = await connection.execute(`SHOW COLUMNS FROM ebidding_auction_slot`);
      
      console.log('\nÌ≥ä E-Bidding Auction Slot Table Structure:');
      tableInfo.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type} ${col.Key ? `(${col.Key})` : ''} ${col.Extra || ''}`);
      });
      
      // Check constraints
      const [constraints] = await connection.execute(`
        SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM information_schema.key_column_usage k
        JOIN information_schema.table_constraints t ON k.CONSTRAINT_NAME = t.CONSTRAINT_NAME
        WHERE k.table_schema = 'tms_dev' AND k.table_name = 'ebidding_auction_slot'
      `);
      
      if (constraints.length > 0) {
        console.log('\nÌ≥ã Table Constraints:');
        constraints.forEach(constraint => {
          console.log(`- ${constraint.COLUMN_NAME}: ${constraint.CONSTRAINT_TYPE} ${constraint.REFERENCED_TABLE_NAME ? `-> ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}` : ''}`);
        });
      }
      
    } catch (tableError) {
      console.log('‚ùå Table ebidding_auction_slot does not exist or has issues:', tableError.message);
    }
    
    // List all tables that contain 'bidding' or 'auction'
    console.log('\nÔøΩÔøΩ Searching for related tables...');
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE '%bidding%'
    `);
    
    console.log('Tables containing "bidding":');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
    const [auctionTables] = await connection.execute(`
      SHOW TABLES LIKE '%auction%'
    `);
    
    console.log('Tables containing "auction":');
    auctionTables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
  } catch (error) {
    console.error('‚ùå Database test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Ì¥å Database connection closed');
    }
  }
};

testAuctionSlotTable();
