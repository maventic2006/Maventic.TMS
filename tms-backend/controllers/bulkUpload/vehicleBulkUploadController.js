const { generateVehicleBulkUploadTemplate } = require('../../services/vehicleBulkUploadTemplate');
const vehicleBulkUploadQueue = require('../../queues/vehicleBulkUploadQueue');
const knex = require('knex')(require('../../knexfile').development);
const fs = require('fs');

/**
 * Vehicle Bulk Upload Controller
 * Handles all vehicle bulk upload operations
 */

/**
 * Download Excel template for vehicle bulk upload
 * @route GET /api/vehicle/bulk-upload/template
 */
exports.downloadTemplate = async (req, res) => {
  try {
    console.log('📥 Generating vehicle bulk upload template...');
    
    const buffer = await generateVehicleBulkUploadTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Vehicle_Bulk_Upload_Template.xlsx');
    
    res.send(buffer);
    
    console.log('✓ Vehicle template generated and sent successfully');
  } catch (error) {
    console.error('Error generating vehicle template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate template',
      error: error.message
    });
  }
};

/**
 * Upload Excel file and queue for processing
 * @route POST /api/vehicle/bulk-upload/upload
 * 
 * Performance Optimized:
 * - Returns immediately after queuing job (~500ms)
 * - Database operations happen asynchronously
 * - Client polls for status updates
 */
exports.uploadFile = async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Get authenticated user ID
    const userId = req.user?.user_id || req.user?.id || 1;
    
    console.log('📤 Vehicle bulk upload file received:', req.file.originalname);
    console.log('  Uploaded by user:', userId);
    console.log('  File size:', (req.file.size / 1024).toFixed(2), 'KB');
    
    // Generate unique batch ID
    const batchId = `VEH-BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Queue the processing job FIRST (fastest operation)
    console.log(`⚡ Queuing job for batch: ${batchId}`);
    const queueStart = Date.now();
    
    // Add timeout to queue operation (5 seconds max)
    const job = await Promise.race([
      vehicleBulkUploadQueue.add({
        batchId,
        filePath: req.file.path,
        userId,
        originalName: req.file.originalname
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('REDIS_TIMEOUT: Redis connection timeout after 5 seconds')), 5000)
      )
    ]);
    
    console.log(`✓ Job queued in ${Date.now() - queueStart}ms (Job ID: ${job.id})`);
    
    // Create batch record asynchronously (don't wait for completion)
    // The processor will update this record as it progresses
    const dbStart = Date.now();
    knex('tms_bulk_upload_vehicle_batches').insert({
      batch_id: batchId,
      uploaded_by: userId,
      filename: req.file.originalname,
      total_rows: 0, // Will be updated by processor
      status: 'processing'
    }).then(() => {
      console.log(`✓ Batch record created in ${Date.now() - dbStart}ms`);
    }).catch(err => {
      console.error('⚠️  Failed to create batch record:', err.message);
      // Non-critical error - processor will retry
    });
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ Upload processed in ${totalTime}ms (OPTIMIZED)`);
    
    // Return immediately - client will poll for status
    res.json({
      success: true,
      message: 'File uploaded and queued for processing',
      data: {
        batchId,
        jobId: job.id,
        filename: req.file.originalname,
        status: 'processing',
        processingTime: totalTime
      }
    });
    
  } catch (error) {
    console.error('❌ Error uploading vehicle file:', error);
    console.error('   Stack trace:', error.stack);
    
    // Check if error is Redis timeout
    if (error.message.includes('REDIS_TIMEOUT')) {
      console.error('');
      console.error('🔴 REDIS CONNECTION TIMEOUT!');
      console.error('   Redis/Memurai is not responding within 5 seconds');
      console.error('   This is likely because Redis is not running');
      console.error('');
      console.error('📋 IMMEDIATE SOLUTION:');
      console.error('   1. Install Memurai: https://www.memurai.com/get-memurai');
      console.error('   2. Or use Docker: docker run -d -p 6379:6379 redis:alpine');
      console.error('   3. Restart backend after Redis is running');
      console.error('');
      
      return res.status(503).json({
        success: false,
        message: 'Redis connection timeout. The bulk upload feature requires Redis to be running.',
        error: 'Redis connection failed',
        solution: 'Install and start Redis/Memurai, then restart the backend server.',
        quickFix: {
          windows: 'Download Memurai from https://www.memurai.com/get-memurai',
          docker: 'docker run -d -p 6379:6379 redis:alpine',
          linux: 'sudo service redis-server start'
        },
        redisConfig: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          timeout: '5 seconds'
        }
      });
    }
    
    // Check if error is Redis-related
    if (error.message.includes('ECONNREFUSED') || 
        error.message.includes('Redis') ||
        error.message.includes('connect') ||
        error.code === 'ECONNREFUSED') {
      console.error('');
      console.error('🔴 REDIS CONNECTION ERROR DETECTED!');
      console.error('   Redis/Memurai is not running or not accessible');
      console.error('   Solution: Run setup-redis-windows.ps1 to install/start Redis');
      console.error('');
      
      return res.status(503).json({
        success: false,
        message: 'Redis connection failed. The bulk upload feature requires Redis to be running.',
        error: error.message,
        solution: 'Please ensure Redis/Memurai is installed and running. Run setup-redis-windows.ps1 for help.',
        redisConfig: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

/**
 * Get batch processing status
 * @route GET /api/vehicle/bulk-upload/status/:batchId
 */
exports.getBatchStatus = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    console.log(`📊 Fetching status for batch: ${batchId}`);
    
    const batch = await knex('tms_bulk_upload_vehicle_batches')
      .where({ batch_id: batchId })
      .first();
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    // Get vehicle counts by validation status
    const vehicles = await knex('tms_bulk_upload_vehicles')
      .where({ batch_id: batchId })
      .select('validation_status')
      .count('* as count')
      .groupBy('validation_status');
    
    const statusCounts = {
      valid: 0,
      invalid: 0
    };
    
    vehicles.forEach(v => {
      statusCounts[v.validation_status] = parseInt(v.count);
    });
    
    res.json({
      success: true,
      data: {
        batch,
        statusCounts
      }
    });
    
  } catch (error) {
    console.error('Error fetching vehicle batch status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch status',
      error: error.message
    });
  }
};

/**
 * Get upload history for authenticated user
 * @route GET /api/vehicle/bulk-upload/history
 */
exports.getUploadHistory = async (req, res) => {
  try {
    // Get authenticated user ID
    const userId = req.user?.user_id || req.user?.id || 1;
    
    console.log(`📜 Fetching vehicle upload history for user: ${userId}`);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await knex('tms_bulk_upload_vehicle_batches')
      .where({ uploaded_by: userId })
      .count('* as count')
      .first();
    
    const total = parseInt(countResult.count);
    
    // Get paginated history
    const batches = await knex('tms_bulk_upload_vehicle_batches')
      .where({ uploaded_by: userId })
      .orderBy('upload_timestamp', 'desc')
      .limit(limit)
      .offset(offset);
    
    console.log(`✓ Found ${batches.length} vehicle batches for user ${userId}`);
    
    res.json({
      success: true,
      data: {
        batches,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching vehicle upload history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upload history',
      error: error.message
    });
  }
};

/**
 * Download error report for a batch
 * @route GET /api/vehicle/bulk-upload/error-report/:batchId
 */
exports.downloadErrorReport = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    console.log(`📄 Downloading error report for batch: ${batchId}`);
    
    // Get batch record
    const batch = await knex('tms_bulk_upload_vehicle_batches')
      .where({ batch_id: batchId })
      .first();
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    if (!batch.error_report_path) {
      return res.status(404).json({
        success: false,
        message: 'Error report not available for this batch'
      });
    }
    
    if (!fs.existsSync(batch.error_report_path)) {
      return res.status(404).json({
        success: false,
        message: 'Error report file not found'
      });
    }
    
    console.log(`✓ Sending error report: ${batch.error_report_path}`);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Vehicle_Error_Report_${batchId}.xlsx`);
    
    const fileStream = fs.createReadStream(batch.error_report_path);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading vehicle error report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download error report',
      error: error.message
    });
  }
};

module.exports = exports;
