// Direct database test for e-bidding configuration auto-ID generation
import mysql from 'mysql2/promise';

const dbConfig = {
  host: '192.168.2.27',
  user: 'root',
  password: 'Ventic*2025#',
  database: 'tms_dev'
};

const testDirectCreation = async () => {
  let connection;
  
  try {
    console.log('��� Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Database connected successfully');
    
    // Check if e_bidding_config table exists and get its structure
    const [tableInfo] = await connection.execute(`
      SHOW COLUMNS FROM e_bidding_config
    `);
    
    console.log('\n��� E-Bidding Config Table Structure:');
    tableInfo.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Key ? `(${col.Key})` : ''} ${col.Extra || ''}`);
    });
    
    // Test manual insertion to understand constraints
    console.log('\n��� Testing manual insertion...');
    
    const testData = {
      vehicle_type: 'Test Truck',
      max_rate: 1000.50,
      min_rate: 500.25,
      e_bidding_tolerance_value: 10.0,
      status: 'ACTIVE',
      created_by: 'TEST',
      created_at: new Date(),
      created_on: new Date()
    };
    
    console.log('��� Inserting data:', testData);
    
    const [insertResult] = await connection.execute(`
      INSERT INTO e_bidding_config 
      (vehicle_type, max_rate, min_rate, e_bidding_tolerance_value, status, created_by, created_at, created_on) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      testData.vehicle_type,
      testData.max_rate,
      testData.min_rate,
      testData.e_bidding_tolerance_value,
      testData.status,
      testData.created_by,
      testData.created_at,
      testData.created_on
    ]);
    
    console.log('✅ Record inserted with ID:', insertResult.insertId);
    
    // Fetch the created record
    const [records] = await connection.execute(`
      SELECT * FROM e_bidding_config WHERE e_bidding_config_id = ?
    `, [insertResult.insertId]);
    
    if (records.length > 0) {
      console.log('\n��� Created record:');
      console.log(JSON.stringify(records[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('��� Database connection closed');
    }
  }
};

testDirectCreation();
