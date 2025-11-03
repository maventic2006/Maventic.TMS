const Queue = require('bull');
const redisConfig = require('../config/redis');

// Create Bull queue for bulk upload processing
const bulkUploadQueue = new Queue('bulk-upload-transporter', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
});

// Queue event listeners
bulkUploadQueue.on('completed', (job, result) => {
  console.log(`✓ Job ${job.id} completed successfully`);
  console.log(`  Batch ID: ${job.data.batchId}`);
  console.log(`  Valid: ${result.validCount}, Invalid: ${result.invalidCount}`);
});

bulkUploadQueue.on('failed', (job, err) => {
  console.error(`✗ Job ${job.id} failed:`, err.message);
  console.error(`  Batch ID: ${job.data.batchId}`);
});

bulkUploadQueue.on('progress', (job, progress) => {
  console.log(`⏳ Job ${job.id} progress: ${progress}%`);
});

module.exports = bulkUploadQueue;