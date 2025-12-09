const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const vehicleBulkUploadController = require('../controllers/bulkUpload/vehicleBulkUploadController');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/vehicle-bulk-upload');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `vehicle-bulk-upload-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  }
});

/**
 * Vehicle Bulk Upload Routes
 * All routes require authentication
 */

/**
 * @route   GET /api/vehicle/bulk-upload/template
 * @desc    Download Excel template for vehicle bulk upload
 * @access  Private
 */
router.get('/template', authenticateToken, vehicleBulkUploadController.downloadTemplate);

/**
 * @route   POST /api/vehicle/bulk-upload/upload
 * @desc    Upload Excel file and queue for processing
 * @access  Private
 * @body    {file} file - Excel file (.xlsx, .xls)
 */
router.post('/upload', authenticateToken, upload.single('file'), vehicleBulkUploadController.uploadFile);

/**
 * @route   GET /api/vehicle/bulk-upload/status/:batchId
 * @desc    Get batch processing status
 * @access  Private
 * @param   {string} batchId - Batch ID
 */
router.get('/status/:batchId', authenticateToken, vehicleBulkUploadController.getBatchStatus);

/**
 * @route   GET /api/vehicle/bulk-upload/errors/:batchId
 * @desc    Get detailed error information for a batch
 * @access  Private
 * @param   {string} batchId - Batch ID
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 50)
 */
router.get('/errors/:batchId', authenticateToken, vehicleBulkUploadController.getBatchErrors);

/**
 * @route   GET /api/vehicle/bulk-upload/history
 * @desc    Get upload history for user
 * @access  Private
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 */
router.get('/history', authenticateToken, vehicleBulkUploadController.getUploadHistory);

/**
 * @route   GET /api/vehicle/bulk-upload/error-report/:batchId
 * @desc    Download error report for a batch
 * @access  Private
 * @param   {string} batchId - Batch ID
 */
router.get('/error-report/:batchId', authenticateToken, vehicleBulkUploadController.downloadErrorReport);

module.exports = router;
