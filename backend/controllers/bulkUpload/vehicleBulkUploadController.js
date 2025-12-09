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
    const { includeErrors } = req.query; // Option to include error details
    
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

    let errorDetails = null;
    
    // If errors exist and client wants error details, fetch them
    if (statusCounts.invalid > 0 && includeErrors === 'true') {
      console.log(`📝 Fetching error details for ${statusCounts.invalid} invalid vehicles...`);
      
      const invalidVehicles = await knex('tms_bulk_upload_vehicles')
        .where({ 
          batch_id: batchId,
          validation_status: 'invalid'
        })
        .select('vehicle_ref_id', 'excel_row_number', 'validation_errors', 'data')
        .orderBy('excel_row_number')
        .limit(100); // Limit to first 100 errors for performance
      
      // Parse and format error details
      errorDetails = invalidVehicles.map(vehicle => {
        let errors = [];
        let parsedData = {};
        
        try {
          errors = JSON.parse(vehicle.validation_errors || '[]');
          parsedData = JSON.parse(vehicle.data || '{}');
        } catch (parseError) {
          console.error('Error parsing vehicle data:', parseError);
          errors = [{ message: 'Failed to parse error data', field: 'unknown' }];
        }
        
        return {
          vehicleRefId: vehicle.vehicle_ref_id,
          excelRowNumber: vehicle.excel_row_number,
          errors: errors.map(error => ({
            sheet: error.sheet || 'Unknown',
            field: error.field || 'unknown',
            message: error.message || 'Validation error',
            severity: error.severity || 'error',
            value: error.value || null
          })),
          // Include some basic vehicle info for context
          vehicleInfo: {
            make: parsedData.basicInformation?.Make_Brand || 'N/A',
            model: parsedData.basicInformation?.Model || 'N/A',
            vin: parsedData.basicInformation?.VIN_Chassis_Number || 'N/A'
          }
        };
      });
      
      console.log(`✓ Retrieved ${errorDetails.length} error records`);
    }
    
    res.json({
      success: true,
      data: {
        batch,
        statusCounts,
        errorDetails // Will be null unless explicitly requested
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
 * Get detailed error information for a batch
 * @route GET /api/vehicle/bulk-upload/errors/:batchId
 */
exports.getBatchErrors = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    
    console.log(`📋 Fetching error details for batch: ${batchId} (page ${pageNum}, limit ${limitNum})`);
    
    // Check if batch exists
    const batch = await knex('tms_bulk_upload_vehicle_batches')
      .where({ batch_id: batchId })
      .first();
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    
    // Get total count of invalid vehicles
    const countResult = await knex('tms_bulk_upload_vehicles')
      .where({ 
        batch_id: batchId,
        validation_status: 'invalid'
      })
      .count('* as count')
      .first();
    
    const totalErrors = parseInt(countResult.count);
    
    if (totalErrors === 0) {
      return res.json({
        success: true,
        data: {
          errors: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            pages: 0
          },
          summary: {
            totalErrors: 0,
            errorsBySheet: {},
            errorsByType: {}
          }
        }
      });
    }
    
    // Get paginated invalid vehicles with error details
    const invalidVehicles = await knex('tms_bulk_upload_vehicles')
      .where({ 
        batch_id: batchId,
        validation_status: 'invalid'
      })
      .select('vehicle_ref_id', 'excel_row_number', 'validation_errors', 'data')
      .orderBy('excel_row_number')
      .limit(limitNum)
      .offset(offset);
    
    // Parse and format error details
    const errorDetails = [];
    const errorsBySheet = {};
    const errorsByType = {};
    
    for (const vehicle of invalidVehicles) {
      let errors = [];
      let parsedData = {};
      
      try {
        errors = JSON.parse(vehicle.validation_errors || '[]');
        parsedData = JSON.parse(vehicle.data || '{}');
      } catch (parseError) {
        console.error('Error parsing vehicle data:', parseError);
        errors = [{ message: 'Failed to parse error data', field: 'unknown', sheet: 'System' }];
      }
      
      // Count errors by sheet and type
      errors.forEach(error => {
        const sheet = error.sheet || 'Unknown';
        const errorType = error.field || 'unknown';
        
        errorsBySheet[sheet] = (errorsBySheet[sheet] || 0) + 1;
        errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
      });
      
      const vehicleError = {
        vehicleRefId: vehicle.vehicle_ref_id,
        excelRowNumber: vehicle.excel_row_number,
        errors: errors.map(error => ({
          sheet: error.sheet || 'Unknown',
          field: error.field || 'unknown',
          message: error.message || 'Validation error',
          severity: error.severity || 'error',
          value: error.value || null,
          expectedFormat: error.expectedFormat || null
        })),
        vehicleInfo: {
          make: parsedData.basicInformation?.Make_Brand || 'N/A',
          model: parsedData.basicInformation?.Model || 'N/A',
          vin: parsedData.basicInformation?.VIN_Chassis_Number || 'N/A',
          refId: parsedData.basicInformation?.Vehicle_Ref_ID || vehicle.vehicle_ref_id
        },
        errorCount: errors.length
      };
      
      errorDetails.push(vehicleError);
    }
    
    const totalPages = Math.ceil(totalErrors / limitNum);
    
    console.log(`✓ Retrieved ${errorDetails.length} error records (page ${pageNum}/${totalPages})`);
    
    res.json({
      success: true,
      data: {
        errors: errorDetails,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalErrors,
          pages: totalPages
        },
        summary: {
          totalErrors,
          errorsBySheet,
          errorsByType
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching vehicle batch errors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch errors',
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
