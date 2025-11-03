const { generateBulkUploadTemplate } = require('../../utils/bulkUpload/excelTemplateGenerator');
const bulkUploadQueue = require('../../queues/bulkUploadQueue');
const knex = require('knex')(require('../../knexfile').development);
const { v4: uuidv4 } = require('crypto');

/**
 * Download Excel template for bulk upload
 */
exports.downloadTemplate = async (req, res) => {
  try {
    console.log('📥 Generating bulk upload template...');
    
    const buffer = await generateBulkUploadTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Transporter_Bulk_Upload_Template.xlsx');
    
    res.send(buffer);
    
    console.log('✓ Template generated and sent successfully');
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate template',
      error: error.message
    });
  }
};

/**
 * Upload Excel file and queue for processing
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // TODO: Get user from auth middleware
    // const userId = req.user?.id;
    // For development, use a mock user ID
    const userId = req.user?.id || 1; // Mock user ID for testing
    
    console.log('📤 File upload received:', req.file.originalname);
    
    // Generate unique batch ID
    const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create batch record in database
    await knex('tms_bulk_upload_batches').insert({
      batch_id: batchId,
      uploaded_by: userId,
      filename: req.file.originalname,
      total_rows: 0, // Will be updated after parsing
      status: 'processing'
    });
    
    console.log(`✓ Batch created: ${batchId}`);
    
    // Queue the processing job
    const job = await bulkUploadQueue.add({
      batchId,
      filePath: req.file.path,
      userId,
      originalName: req.file.originalname
    });
    
    console.log(`✓ Job queued: ${job.id}`);
    
    // Get the batch record
    const batch = await knex('tms_bulk_upload_batches')
      .where({ batch_id: batchId })
      .first();
    
    res.json({
      success: true,
      message: 'File uploaded and queued for processing',
      data: {
        batch,
        jobId: job.id
      }
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

/**
 * Get batch status
 */
exports.getBatchStatus = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const batch = await knex('tms_bulk_upload_batches')
      .where({ batch_id: batchId })
      .first();
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    const transporters = await knex('tms_bulk_upload_transporters')
      .where({ batch_id: batchId })
      .select('validation_status')
      .count('* as count')
      .groupBy('validation_status');
    
    const statusCounts = {
      valid: 0,
      invalid: 0
    };
    
    transporters.forEach(t => {
      statusCounts[t.validation_status] = parseInt(t.count);
    });
    
    res.json({
      success: true,
      data: {
        batch,
        statusCounts
      }
    });
    
  } catch (error) {
    console.error('Error fetching batch status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch status',
      error: error.message
    });
  }
};

/**
 * Get upload history for a user
 */
exports.getUploadHistory = async (req, res) => {
  try {
    // TODO: Get user from auth middleware
    // const userId = req.user?.id;
    // For development, use a mock user ID
    const userId = req.user?.id || 1; // Mock user ID for testing
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await knex('tms_bulk_upload_batches')
      .where({ uploaded_by: userId })
      .count('* as count')
      .first();
    
    const total = parseInt(countResult.count);
    
    // Get paginated history
    const batches = await knex('tms_bulk_upload_batches')
      .where({ uploaded_by: userId })
      .orderBy('upload_timestamp', 'desc')
      .limit(limit)
      .offset(offset);
    
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
    console.error('Error fetching upload history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upload history',
      error: error.message
    });
  }
};

/**
 * Download error report for a batch
 */
exports.downloadErrorReport = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    // Get batch record
    const batch = await knex('tms_bulk_upload_batches')
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
    
    const fs = require('fs');
    if (!fs.existsSync(batch.error_report_path)) {
      return res.status(404).json({
        success: false,
        message: 'Error report file not found'
      });
    }
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Error_Report_${batchId}.xlsx`);
    
    const fileStream = fs.createReadStream(batch.error_report_path);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading error report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download error report',
      error: error.message
    });
  }
};

module.exports = exports;