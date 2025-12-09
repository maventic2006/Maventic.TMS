// Test backend controller logic directly
import mysql from 'mysql2/promise';

// Simulate the backend auto-ID generation functions
const dbConfig = {
  host: '192.168.2.27',
  user: 'root', 
  password: 'Ventic*2025#',
  database: 'tms_dev'
};

let connection;

const generateConsignorId = async () => {
  try {
    const [rows] = await connection.execute(`
      SELECT customer_id FROM consignor_master 
      WHERE status = 'ACTIVE' 
      LIMIT 1
    `);
    
    if (rows.length > 0) {
      console.log(`Ì¥ß Using existing consignor ID: ${rows[0].customer_id}`);
      return rows[0].customer_id;
    }
    
    const defaultId = 'CSG001';
    console.log(`Ì¥ß No existing consignors found, using default: ${defaultId}`);
    return defaultId;
  } catch (error) {
    console.error('‚ùå Error generating consignor ID:', error);
    return 'CSG001';
  }
};

const generateWarehouseId = async () => {
  try {
    const [rows] = await connection.execute(`
      SELECT warehouse_id FROM warehouse_master 
      WHERE status = 'ACTIVE' 
      LIMIT 1
    `);
    
    if (rows.length > 0) {
      console.log(`Ì¥ß Using existing warehouse ID: ${rows[0].warehouse_id}`);
      return rows[0].warehouse_id;
    }
    
    console.log('Ì¥ß No existing warehouses found, leaving warehouse_id as null');
    return null;
  } catch (error) {
    console.error('‚ùå Error generating warehouse ID:', error);
    return null;
  }
};

const testBackendLogic = async () => {
  try {
    console.log('Ì¥ó Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('‚úÖ Database connected successfully');
    
    // Test ID generation
    console.log('\nÌ¥ß Testing ID generation logic...');
    const consignorId = await generateConsignorId();
    const warehouseId = await generateWarehouseId();
    
    console.log(`Generated consignor_id: ${consignorId}`);
    console.log(`Generated warehouse_id: ${warehouseId}`);
    
    // Test complete record creation with auto-generated IDs
    console.log('\nÌ¥ß Testing complete record creation...');
    
    const testData = {
      e_bidding_config_id: null, // Auto-increment  
      consignor_id: consignorId,
      warehouse_id: warehouseId,
      vehicle_type: 'Auto Test Truck',
      max_rate: 1500.75,
      min_rate: 750.25,
      e_bidding_tolerance_value: 15.0,
      status: 'ACTIVE',
      created_by: 'SYSTEM',
      created_at: new Date(),
      created_on: new Date()
    };
    
    console.log('Ì≥§ Inserting record with auto-generated IDs:', {
      consignor_id: testData.consignor_id,
      warehouse_id: testData.warehouse_id,
      vehicle_type: testData.vehicle_type
    });
    
    const [insertResult] = await connection.execute(`
      INSERT INTO e_bidding_config 
      (consignor_id, warehouse_id, vehicle_type, max_rate, min_rate, e_bidding_tolerance_value, status, created_by, created_at, created_on) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      testData.consignor_id,
      testData.warehouse_id,
      testData.vehicle_type,
      testData.max_rate,
      testData.min_rate,
      testData.e_bidding_tolerance_value,
      testData.status,
      testData.created_by,
      testData.created_at,
      testData.created_on
    ]);
    
    console.log('‚úÖ Record inserted successfully with ID:', insertResult.insertId);
    
    // Fetch and display the created record
    const [records] = await connection.execute(`
      SELECT * FROM e_bidding_config WHERE e_bidding_config_id = ?
    `, [insertResult.insertId]);
    
    if (records.length > 0) {
      console.log('\nÌ≥ã Successfully created e-bidding config:');
      console.log(JSON.stringify(records[0], null, 2));
      
      console.log('\n‚úÖ Auto-ID Generation Verification:');
      console.log(`- e_bidding_config_id: ${records[0].e_bidding_config_id} ‚úÖ`);
      console.log(`- consignor_id: ${records[0].consignor_id} ${records[0].consignor_id ? '‚úÖ' : '‚ùå'}`);
      console.log(`- warehouse_id: ${records[0].warehouse_id} ${records[0].warehouse_id ? '‚úÖ' : '‚ùì (optional)'}`);
    }
    
  } catch (error) {
    console.error('‚ùå Backend logic test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Ì¥å Database connection closed');
    }
  }
};

testBackendLogic();
