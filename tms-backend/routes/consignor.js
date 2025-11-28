/**
 * Consignor Routes
 * All routes for consignor CRUD operations, documents, and master data
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getConsignors,
  getConsignorById,
  createConsignor,
  updateConsignor,
  deleteConsignor,
  getMasterData,
  downloadDocument,
  downloadContactPhoto,
  downloadGeneralDocument,
  getConsignorWarehouses,
  // Draft workflow functions
  saveConsignorAsDraft,
  updateConsignorDraft,
  submitConsignorFromDraft,
  deleteConsignorDraft,
} = require("../controllers/consignorController");
const { authenticateToken } = require("../middleware/auth");

// Configure multer for file uploads (memory storage for processing)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, PNG, JPG files are allowed."
        ),
        false
      );
    }
  },
});

// Middleware to check if user is product owner (admin/owner role)
const checkProductOwnerAccess = (req, res, next) => {
  const userType = req.user?.user_type_id;
  const userId = req.user?.user_id;

  console.log("\n🔒 ===== PRODUCT OWNER ACCESS CHECK =====");
  console.log("👤 User ID:", userId);
  console.log("🏷️  User Type:", userType);
  console.log("✅ Required Type: UT001 (Product Owner)");

  // UT001 is Owner (product owner)
  if (userType !== "UT001") {
    console.log("❌ ACCESS DENIED - User is not a Product Owner");
    console.log("🔒 ===== ACCESS CHECK FAILED =====\n");
    return res.status(403).json({
      success: false,
      error: {
        code: "ACCESS_DENIED",
        message: "Only product owners can access this resource",
      },
    });
  }

  console.log("✅ ACCESS GRANTED - User is Product Owner");
  console.log("🔒 ===== ACCESS CHECK PASSED =====\n");
  next();
};

// ============================================================================
// CONSIGNOR API ROUTES - RESTful Endpoint Mapping
// ============================================================================
// IMPORTANT: Specific routes MUST come before parameterized routes
// Otherwise Express will match "/master-data" to "/:id"
//
// 📋 API ENDPOINT REFERENCE:
// -------------------------------------------------------------------------
// GET    /api/consignors/master-data  →  Get dropdown options (industries, etc.)
// GET    /api/consignors               →  Fetch list of consignors (with filters)
// POST   /api/consignors               →  **CREATE NEW CONSIGNOR**
// GET    /api/consignors/:id           →  Get single consignor details by ID
// PUT    /api/consignors/:id           →  **UPDATE EXISTING CONSIGNOR**
// DELETE /api/consignors/:id           →  Soft delete consignor (set INACTIVE)
// -------------------------------------------------------------------------

// 1️⃣ Master data route (must be first to avoid /:id conflict)
// GET /api/consignors/master-data
router.get(
  "/master-data",
  authenticateToken,
  checkProductOwnerAccess,
  getMasterData
);

// ============================================================================
// DRAFT WORKFLOW ROUTES
// ============================================================================
// These routes handle the save-as-draft, update-draft, submit-draft, and
// delete-draft operations for consignors
// ============================================================================

/**
 * Save consignor as draft
 * POST /api/consignors/save-draft
 * - Minimal validation (business_name only)
 * - Creates consignor with status: DRAFT
 */
router.post(
  "/save-draft",
  authenticateToken,
  checkProductOwnerAccess,
  upload.any(),
  saveConsignorAsDraft
);

/**
 * Update consignor draft
 * PUT /api/consignors/:id/update-draft
 * - No validation applied
 * - Only creator can update
 * - Status remains: DRAFT
 */
router.put(
  "/:id/update-draft",
  authenticateToken,
  checkProductOwnerAccess,
  upload.any(),
  updateConsignorDraft
);

/**
 * Submit consignor draft for approval
 * PUT /api/consignors/:id/submit-draft
 * - Full validation (same as create)
 * - Only creator can submit
 * - Status changes: DRAFT → PENDING
 */
router.put(
  "/:id/submit-draft",
  authenticateToken,
  checkProductOwnerAccess,
  upload.any(),
  submitConsignorFromDraft
);

/**
 * Delete consignor draft
 * DELETE /api/consignors/:id/delete-draft
 * - Hard delete (permanent removal)
 * - Only creator can delete
 * - Deletes all related child records
 */
router.delete(
  "/:id/delete-draft",
  authenticateToken,
  checkProductOwnerAccess,
  deleteConsignorDraft
);

// 2️⃣ List all consignors route (with pagination, filters, search)
// GET /api/consignors
router.get("/", authenticateToken, checkProductOwnerAccess, getConsignors);

// 3️⃣ CREATE NEW CONSIGNOR (with file upload support)
// POST /api/consignors
router.post(
  "/",
  authenticateToken,
  checkProductOwnerAccess,
  upload.any(), // Accept multiple files with any field names
  createConsignor
);

// 4️⃣ Get single consignor details by ID (must come after specific routes)
// GET /api/consignors/:id
router.get(
  "/:id",
  authenticateToken,
  checkProductOwnerAccess,
  getConsignorById
);

// 5️⃣ UPDATE EXISTING CONSIGNOR (with file upload support)
// PUT /api/consignors/:id
router.put(
  "/:id",
  authenticateToken,
  checkProductOwnerAccess,
  upload.any(), // Accept multiple files with any field names
  updateConsignor
);

// 6️⃣ SOFT DELETE CONSIGNOR (sets status to INACTIVE)
// DELETE /api/consignors/:id
router.delete(
  "/:id",
  authenticateToken,
  checkProductOwnerAccess,
  deleteConsignor
);

// ============================================================================
// DOCUMENT DOWNLOAD ROUTES
// ============================================================================

// 7️⃣ Download consignor document
// GET /api/consignors/:customerId/documents/:documentId/download
router.get(
  "/:customerId/documents/:documentId/download",
  authenticateToken,
  checkProductOwnerAccess,
  downloadDocument
);

// 8️⃣ Download contact photo
// GET /api/consignors/:customerId/contacts/:contactId/photo
router.get(
  "/:customerId/contacts/:contactId/photo",
  authenticateToken,
  checkProductOwnerAccess,
  downloadContactPhoto
);

// 9️⃣ Download NDA or MSA document
// GET /api/consignors/:customerId/general/:fileType/download
// fileType: 'nda' | 'msa'
router.get(
  "/:customerId/general/:fileType/download",
  authenticateToken,
  checkProductOwnerAccess,
  downloadGeneralDocument
);

// 🔟 Get warehouses mapped to consignor
// GET /api/consignors/:customerId/warehouses
router.get(
  "/:customerId/warehouses",
  authenticateToken,
  checkProductOwnerAccess,
  getConsignorWarehouses
);

// Error handling middleware for multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: {
          code: "FILE_TOO_LARGE",
          message: "File size exceeds maximum allowed size of 10MB",
        },
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message: err.message,
      },
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: err.message,
      },
    });
  }

  next();
});

module.exports = router;
