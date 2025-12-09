const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const warehouseBulkUploadController = require("../controllers/bulkUpload/warehouseBulkUploadController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads/warehouse-bulk-upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `warehouse-bulk-upload-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".xlsx", ".xls"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files (.xlsx, .xls) are allowed"));
    }
  },
});

// All routes require authentication
router.use(authenticateToken);

// Routes accessible by Consignor, Admin, and Product Owner
const allowedRoles = ["consignor", "admin", "product_owner"];

// GET /api/warehouse-bulk-upload/template - Download template
router.get(
  "/template",
  authorizeRoles(allowedRoles),
  warehouseBulkUploadController.downloadTemplate
);

// POST /api/warehouse-bulk-upload/upload - Upload file
router.post(
  "/upload",
  authorizeRoles(allowedRoles),
  upload.single("file"),
  warehouseBulkUploadController.uploadFile
);

// GET /api/warehouse-bulk-upload/status/:batchId - Get batch status
router.get(
  "/status/:batchId",
  authorizeRoles(allowedRoles),
  warehouseBulkUploadController.getBatchStatus
);

// GET /api/warehouse-bulk-upload/history - Get upload history
router.get(
  "/history",
  authorizeRoles(allowedRoles),
  warehouseBulkUploadController.getUploadHistory
);

// GET /api/warehouse-bulk-upload/error-report/:batchId - Download error report
router.get(
  "/error-report/:batchId",
  authorizeRoles(allowedRoles),
  warehouseBulkUploadController.downloadErrorReport
);

module.exports = router;
