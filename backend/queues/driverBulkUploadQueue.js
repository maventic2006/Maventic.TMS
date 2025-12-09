const Queue = require("bull");
const redisConfig = require("../config/redis");

// Create Bull queue for driver bulk upload processing
const driverBulkUploadQueue = new Queue("bulk-upload-driver", {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
});

// Queue event listeners
driverBulkUploadQueue.on("completed", (job, result) => {
  console.log(`✅ Driver job completed successfully`);
  console.log(`📦 Batch ID: ${job.data?.batchId || "Unknown"}`);
  console.log(
    `✅ Valid: ${result?.validCount || 0}, ❌ Invalid: ${
      result?.invalidCount || 0
    }`
  );
});

driverBulkUploadQueue.on("failed", (job, err) => {
  console.error(`❌ Driver job failed: ${err.message}`);
  console.error(`📦 Batch ID: ${job.data?.batchId || "Unknown"}`);
});

driverBulkUploadQueue.on("progress", (job, progress) => {
  console.log(`📈 Driver job progress: ${progress}%`);
});

module.exports = driverBulkUploadQueue;
