const { generateVehicleBulkUploadTemplate } = require('../../services/vehicleBulkUploadTemplate');
const { processVehicleBulkUpload } = require('../../queues/vehicleBulkUploadProcessor');
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
 * Upload Excel file and process synchronously (NO REDIS REQUIRED)
 * @route POST /api/vehicle/bulk-upload/upload
 * 
 * Uses setImmediate() for background processing, same as Driver bulk upload
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Get authenticated user ID - must be numeric for database
    const userId = req.user?.user_id || req.user?.id || 1;
    
    console.log('📤 Vehicle bulk upload file received:', req.file.originalname);
    console.log('  Uploaded by user:', userId);
    console.log('  File size:', (req.file.size / 1024).toFixed(2), 'KB');
    
    // Generate unique batch ID
    const batchId = `VEH-BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create batch record in database
    await knex('tms_bulk_upload_vehicle_batches').insert({
      batch_id: batchId,
      uploaded_by: userId,
      filename: req.file.originalname,
      total_rows: 0, // Will be updated after parsing
      status: 'processing'
    });
    
    console.log(`✅ Vehicle batch created: ${batchId}`);
    
    // Send immediate response to client
    res.json({
      success: true,
      message: 'File uploaded and processing started',
      data: {
        batchId,
        status: 'processing',
      }
    });
    
    // Process asynchronously in background (no Redis needed)
    setImmediate(async () => {
      try {
        console.log(`� Starting background processing for batch ${batchId}`);
        
        await processVehicleBulkUpload(
          {
            data: {
              batchId,
              filePath: req.file.path,
              userId,
              originalName: req.file.originalname
            }
          },
          null // No Socket.IO for now
        );
        
        console.log(`✅ Batch ${batchId} processed successfully`);
      } catch (error) {
        console.error(`❌ Background processing failed for batch ${batchId}:`, error);
        
        // Update batch status to failed
        await knex('tms_bulk_upload_vehicle_batches')
          .where({ batch_id: batchId })
          .update({
            status: 'failed',
            processed_timestamp: new Date()
          });
      }
    });
    
  } catch (error) {
    console.error('❌ Error uploading vehicle file:', error);
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
