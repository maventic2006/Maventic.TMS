/**
 * Database Health Check Utility
 * Checks database connectivity and provides detailed error information
 */

const knex = require('../config/database');

/**
 * Check if database connection is healthy
 */
const checkDatabaseConnection = async () => {
  try {
    console.log('✓ Checking database connection...');
    
    // Simple query to test connection
    await knex.raw('SELECT 1 as health_check');
    
    console.log('✓ Database connection successful');
    
    // Get pool stats
    const pool = knex.client.pool;
    console.log('✓ Connection Pool Stats:', {
      used: pool.numUsed(),
      free: pool.numFree(),
      pending: pool.numPendingAcquires(),
      total: pool.numUsed() + pool.numFree()
    });
    
    return {
      success: true,
      message: 'Database connection is healthy',
      poolStats: {
        used: pool.numUsed(),
        free: pool.numFree(),
        pending: pool.numPendingAcquires()
      }
    };
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    
    // Provide specific error guidance
    if (error.message.includes('blocked because of many connection errors')) {
      console.error('\n⚠ CRITICAL: MySQL host is blocking connections!');
      console.error('  Run this command to fix: mysqladmin -h YOUR_HOST -u root -p flush-hosts');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠ CRITICAL: Cannot connect to MySQL server!');
      console.error('  - Check if MySQL is running');
      console.error('  - Verify host/port in .env file');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠ CRITICAL: Access denied!');
      console.error('  - Check username/password in .env file');
    }
    
    return {
      success: false,
      message: error.message,
      error: {
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage
      }
    };
  }
};

/**
 * Get database version information
 */
const getDatabaseVersion = async () => {
  try {
    const result = await knex.raw('SELECT VERSION() as version');
    return result[0][0].version;
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Get max_connect_errors setting
 */
const getMaxConnectErrors = async () => {
  try {
    const result = await knex.raw('SHOW VARIABLES LIKE "max_connect_errors"');
    return result[0][0].Value;
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Comprehensive health check
 */
const comprehensiveHealthCheck = async () => {
  console.log('\n╔═════ DATABASE HEALTH CHECK ══════');
  
  const connectionCheck = await checkDatabaseConnection();
  
  if (connectionCheck.success) {
    const version = await getDatabaseVersion();
    const maxErrors = await getMaxConnectErrors();
    
    console.log('\n📊 Database Information:');
    console.log('  MySQL Version:', version);
    console.log('  Max Connect Errors:', maxErrors);
    console.log('  Recommended: 1000000 or higher');
    
    if (parseInt(maxErrors) < 1000000) {
      console.log('\n⚠  WARNING: max_connect_errors is set too low!');
      console.log('  This may cause connection blocks in development.');
      console.log('  Consider increasing it in MySQL configuration.');
    }
  }
  
  console.log('\n╚═══════════════════════════════════\n');
  
  return connectionCheck;
};

module.exports = {
  checkDatabaseConnection,
  getDatabaseVersion,
  getMaxConnectErrors,
  comprehensiveHealthCheck
};
