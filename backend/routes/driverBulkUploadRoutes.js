const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const driverBulkUploadController = require("../controllers/bulkUpload/driverBulkUploadController");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads/driver-bulk-upload");
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
    cb(null, `driver-bulk-upload-`);
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

// Routes
router.get("/template", driverBulkUploadController.downloadTemplate);
router.post(
  "/upload",
  upload.single("file"),
  driverBulkUploadController.uploadFile
);
router.get("/status/:batchId", driverBulkUploadController.getBatchStatus);
router.get("/history", driverBulkUploadController.getUploadHistory);
router.get(
  "/error-report/:batchId",
  driverBulkUploadController.downloadErrorReport
);

module.exports = router;
