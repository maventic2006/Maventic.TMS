const Queue = require('bull');
const redisConfig = require('../config/redis');

/**
 * Vehicle Bulk Upload Queue
 * Handles asynchronous processing of vehicle bulk upload batches
 */
const vehicleBulkUploadQueue = new Queue('bulk-upload-vehicle', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: false, // Keep completed jobs for history
    removeOnFail: false,     // Keep failed jobs for debugging
  },
});

// Queue event listeners
vehicleBulkUploadQueue.on('completed', (job, result) => {
  console.log(`✓ Vehicle bulk upload job ${job.id} completed successfully`);
  console.log(`  Batch ID: ${job.data.batchId}`);
  console.log(`  Valid: ${result.validCount}, Invalid: ${result.invalidCount}`);
  console.log(`  Created: ${result.createdCount}, Failed: ${result.failedCount}`);
});

vehicleBulkUploadQueue.on('failed', (job, err) => {
  console.error(`✗ Vehicle bulk upload job ${job.id} failed:`, err.message);
  console.error(`  Batch ID: ${job.data.batchId}`);
  console.error(`  File: ${job.data.originalName}`);
});

vehicleBulkUploadQueue.on('progress', (job, progress) => {
  console.log(`⏳ Vehicle bulk upload job ${job.id} progress: ${progress}%`);
});

vehicleBulkUploadQueue.on('stalled', (job) => {
  console.warn(`⚠️  Vehicle bulk upload job ${job.id} has stalled`);
});

vehicleBulkUploadQueue.on('active', (job) => {
  console.log(`▶️  Vehicle bulk upload job ${job.id} started processing`);
  console.log(`  Batch ID: ${job.data.batchId}`);
  console.log(`  File: ${job.data.originalName}`);
});

// Test Redis connection on queue initialization
vehicleBulkUploadQueue.isReady()
  .then(() => {
    console.log('✅ Vehicle bulk upload queue connected to Redis successfully');
  })
  .catch((error) => {
    console.error('');
    console.error('🔴 ========================================');
    console.error('🔴 REDIS CONNECTION ERROR');
    console.error('🔴 ========================================');
    console.error('❌ Failed to connect vehicle bulk upload queue to Redis');
    console.error('   Error:', error.message);
    console.error('   Redis config:', {
      host: redisConfig.host,
      port: redisConfig.port
    });
    console.error('');
    console.error('💡 SOLUTION:');
    console.error('   1. Ensure Redis/Memurai is installed and running');
    console.error('   2. Run: .\\setup-redis-windows.ps1 (from project root)');
    console.error('   3. Restart this server after Redis is running');
    console.error('');
    console.error('⚠️  WARNING: Bulk upload feature will NOT work until Redis is running!');
    console.error('🔴 ========================================');
    console.error('');
  });

module.exports = vehicleBulkUploadQueue;
