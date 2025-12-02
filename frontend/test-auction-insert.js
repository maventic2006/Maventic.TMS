import mysql from 'mysql2/promise';

const dbConfig = {
  host: '192.168.2.27',
  user: 'root',
  password: 'Ventic*2025#',
  database: 'tms_dev'
};

const generateEbiddingAuctionId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `EBA${timestamp}${randomNum}`;
};

const testAuctionSlotInsertion = async () => {
  let connection;
  
  try {
    console.log('Ì¥ó Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('‚úÖ Database connected successfully');
    
    // Generate IDs
    const ebiddingAuctionId = generateEbiddingAuctionId();
    const consignorId = 'CSG001';
    const warehouseId = null;
    
    console.log('\nÌ¥ß Generated IDs:');
    console.log(`- ebidding_auction_id: ${ebiddingAuctionId}`);
    console.log(`- consignor_id: ${consignorId}`);
    console.log(`- warehouse_id: ${warehouseId}`);
    
    // Test data for auction slot
    const testData = {
      ebidding_auction_id: ebiddingAuctionId,
      consignor_id: consignorId,
      warehouse_id: warehouseId,
      ebidding_slot_number: 'SLOT001',
      auction_start_date: '2024-12-20',
      auction_start_time: '10:00:00',
      auction_end_date: '2024-12-20',  
      auction_end_time: '18:00:00',
      auction_duration: 480,
      status: 'ACTIVE',
      created_at: new Date().toISOString().split('T')[0], // Date only
      created_on: new Date().toTimeString().split(' ')[0], // Time only
      created_by: 'SYSTEM',
      status_audit: 'ACTIVE'
    };
    
    console.log('\nÌ≥§ Inserting auction slot data:', testData);
    
    const [insertResult] = await connection.execute(`
      INSERT INTO ebidding_auction_slot 
      (ebidding_auction_id, consignor_id, warehouse_id, ebidding_slot_number, 
       auction_start_date, auction_start_time, auction_end_date, auction_end_time, 
       auction_duration, status, created_at, created_on, created_by, status_audit) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      testData.ebidding_auction_id,
      testData.consignor_id,
      testData.warehouse_id,
      testData.ebidding_slot_number,
      testData.auction_start_date,
      testData.auction_start_time,
      testData.auction_end_date,
      testData.auction_end_time,
      testData.auction_duration,
      testData.status,
      testData.created_at,
      testData.created_on,
      testData.created_by,
      testData.status_audit
    ]);
    
    console.log('‚úÖ Auction slot record inserted with ID:', insertResult.insertId);
    
    // Fetch the created record
    const [records] = await connection.execute(`
      SELECT * FROM ebidding_auction_slot WHERE auction_slot_unique_id = ?
    `, [insertResult.insertId]);
    
    if (records.length > 0) {
      console.log('\nÌ≥ã Successfully created auction slot:');
      console.log(JSON.stringify(records[0], null, 2));
    }
    
  } catch (error) {
    console.error('‚ùå Auction slot insertion failed:', error.message);
    console.error('Error details:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Ì¥å Database connection closed');
    }
  }
};

testAuctionSlotInsertion();
