const {
  generateDriverBulkUploadTemplate,
} = require("../../utils/bulkUpload/driverExcelTemplateGenerator");
const driverBulkUploadQueue = require("../../queues/driverBulkUploadQueue");
const {
  processDriverBulkUpload,
} = require("../../queues/driverBulkUploadProcessor");
const knex = require("knex")(require("../../knexfile").development);

/**
 * Download Excel template for driver bulk upload
 */
exports.downloadTemplate = async (req, res) => {
  try {
    console.log(" Generating driver bulk upload template...");

    const buffer = await generateDriverBulkUploadTemplate();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Driver_Bulk_Upload_Template.xlsx"
    );

    res.send(buffer);

    console.log(" Driver template generated and sent successfully");
  } catch (error) {
    console.error("Error generating driver template:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate template",
      error: error.message,
    });
  }
};

/**
 * Upload Excel file and process synchronously (NO REDIS REQUIRED)
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Get user ID from auth middleware - must be numeric for database
    const userId = req.user?.id || 1; // Default to 1 for testing

    console.log("📤 Driver file upload received:", req.file.originalname);

    // Generate unique batch ID
    const batchId = `DRIVER-BATCH-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Create batch record in database
    await knex("tms_driver_bulk_upload_batches").insert({
      batch_id: batchId,
      uploaded_by: userId,
      filename: req.file.originalname,
      total_rows: 0, // Will be updated after parsing
      status: "processing",
    });

    console.log(`✅ Driver batch created: ${batchId}`);

    // Send immediate response to client
    res.json({
      success: true,
      message: "File uploaded and processing started",
      data: {
        batchId,
        status: "processing",
      },
    });

    // Process asynchronously in background (no Redis needed)
    setImmediate(async () => {
      try {
        console.log(`🚀 Starting background processing for batch ${batchId}`);

        await processDriverBulkUpload(
          {
            data: {
              batchId,
              filePath: req.file.path,
              userId,
              originalName: req.file.originalname,
            },
          },
          null // No Socket.IO for now
        );

        console.log(`✅ Batch ${batchId} processed successfully`);
      } catch (error) {
        console.error(
          `❌ Background processing failed for batch ${batchId}:`,
          error
        );

        // Update batch status to failed
        await knex("tms_driver_bulk_upload_batches")
          .where({ batch_id: batchId })
          .update({
            status: "failed",
            processed_timestamp: new Date(),
          });
      }
    });
  } catch (error) {
    console.error("Error uploading driver file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload file",
      error: error.message,
    });
  }
};

/**
 * Get batch status
 */
exports.getBatchStatus = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await knex("tms_driver_bulk_upload_batches")
      .where({ batch_id: batchId })
      .first();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const drivers = await knex("tms_driver_bulk_upload_drivers")
      .where({ batch_id: batchId })
      .select("validation_status")
      .count("* as count")
      .groupBy("validation_status");

    const statusCounts = {
      valid: 0,
      invalid: 0,
    };

    drivers.forEach((d) => {
      statusCounts[d.validation_status] = parseInt(d.count);
    });

    res.json({
      success: true,
      data: {
        batch,
        statusCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching driver batch status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch batch status",
      error: error.message,
    });
  }
};

/**
 * Get upload history for a user
 */
exports.getUploadHistory = async (req, res) => {
  try {
    const userId = req.user?.id || 1; // Default to 1 for testing

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await knex("tms_driver_bulk_upload_batches")
      .where({ uploaded_by: userId })
      .count("* as count")
      .first();

    const total = parseInt(countResult.count);

    // Get paginated history
    const batches = await knex("tms_driver_bulk_upload_batches")
      .where({ uploaded_by: userId })
      .orderBy("upload_timestamp", "desc")
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
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching driver upload history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch upload history",
      error: error.message,
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
    const batch = await knex("tms_driver_bulk_upload_batches")
      .where({ batch_id: batchId })
      .first();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    if (!batch.error_report_path) {
      return res.status(404).json({
        success: false,
        message: "Error report not available for this batch",
      });
    }

    const fs = require("fs");
    if (!fs.existsSync(batch.error_report_path)) {
      return res.status(404).json({
        success: false,
        message: "Error report file not found",
      });
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Driver_Error_Report_${batchId}.xlsx`
    );

    const fileStream = fs.createReadStream(batch.error_report_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading driver error report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download error report",
      error: error.message,
    });
  }
};

module.exports = exports;
