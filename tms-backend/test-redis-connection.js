require('dotenv').config();
const redis = require('redis');
const redisConfig = require('./config/redis');

async function testRedisConnection() {
  console.log('🔍 Testing Redis connection...\n');
  console.log('Configuration:', {
    host: redisConfig.host,
    port: redisConfig.port,
  });
  
  const client = redis.createClient(redisConfig);
  
  client.on('error', (err) => {
    console.error('❌ Redis Client Error:', err.message);
    console.log('\n⚠️  Redis is not running or not accessible.');
    console.log('📝 To install and run Redis:');
    console.log('   1. Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases');
    console.log('   2. Or use WSL: wsl --install');
    console.log('   3. Or use Docker: docker run -d -p 6379:6379 redis');
    console.log('\n💡 For development, you can skip Redis for now.');
    console.log('   The bulk upload will work without it, but without background processing.');
    process.exit(1);
  });
  
  client.on('connect', () => {
    console.log('✅ Redis connection successful!\n');
  });
  
  try {
    await client.connect();
    
    // Test basic operations
    await client.set('test_key', 'test_value');
    const value = await client.get('test_key');
    
    if (value === 'test_value') {
      console.log('✅ Redis read/write test passed!');
      console.log('✅ Redis is ready for Bull queue operations.\n');
    }
    
    await client.del('test_key');
    await client.quit();
    
    console.log('🎉 Redis connection test completed successfully!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    process.exit(1);
  }
}

testRedisConnection();