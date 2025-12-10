const express = require("express");
const router = express.Router();
const {
  getWarehouseList,
  getWarehouseStatusCounts,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  getMasterData,
  getDocumentFile,
  // Draft workflow functions
  saveWarehouseAsDraft,
  updateWarehouseDraft,
  submitWarehouseFromDraft,
  deleteWarehouseDraft,
} = require("../controllers/warehouseController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// All routes require authentication
router.use(authenticateToken);

// Routes accessible by Consignor, Admin, and Super Admin
const allowedRoles = ["consignor", "admin", "product_owner"]; // Using product_owner as super admin equivalent

// GET /api/warehouse/master-data - Get master data (warehouse types, etc.)
router.get("/master-data", authorizeRoles(allowedRoles), getMasterData);

// GET /api/warehouse/status-counts - Get warehouse status counts
router.get(
  "/status-counts",
  authorizeRoles(allowedRoles),
  getWarehouseStatusCounts
);

// ============================================================================
// DRAFT WORKFLOW ROUTES
// ============================================================================

/**
 * Save warehouse as draft
 * POST /api/warehouse/save-draft
 * - Minimal validation (warehouse_name + consignor_id only)
 * - Creates warehouse with status: DRAFT
 */
router.post("/save-draft", authorizeRoles(allowedRoles), saveWarehouseAsDraft);

/**
 * Update warehouse draft
 * PUT /api/warehouse/:id/update-draft
 * - No validation applied
 * - Only creator can update
 * - Status remains: DRAFT
 */
router.put(
  "/:id/update-draft",
  authorizeRoles(allowedRoles),
  updateWarehouseDraft
);

/**
 * Submit warehouse draft for approval
 * PUT /api/warehouse/:id/submit-draft
 * - Full validation (same as create)
 * - Only creator can submit
 * - Status changes: DRAFT → PENDING
 */
router.put(
  "/:id/submit-draft",
  authorizeRoles(allowedRoles),
  submitWarehouseFromDraft
);

/**
 * Delete warehouse draft
 * DELETE /api/warehouse/:id/delete-draft
 * - Hard delete (permanent removal)
 * - Only creator can delete
 * - Deletes all related child records
 */
router.delete(
  "/:id/delete-draft",
  authorizeRoles(allowedRoles),
  deleteWarehouseDraft
);

// GET /api/warehouse/document/:documentId - Get document file by document unique ID
router.get(
  "/document/:documentId",
  authorizeRoles(allowedRoles),
  getDocumentFile
);

// GET /api/warehouse - Get paginated warehouse list with filters (matches transporter pattern)
router.get("/", authorizeRoles(allowedRoles), getWarehouseList);

// POST /api/warehouse - Create new warehouse
router.post("/", authorizeRoles(allowedRoles), createWarehouse);

// GET /api/warehouse/:id - Get warehouse by ID (specific warehouse)
// IMPORTANT: Keep this AFTER more specific routes to prevent catching routes like /master-data
router.get("/:id", authorizeRoles(allowedRoles), getWarehouseById);

// PUT /api/warehouse/:id - Update warehouse
router.put("/:id", authorizeRoles(allowedRoles), updateWarehouse);

// POST /api/warehouse/create - Alternative create endpoint (for explicit clarity)
router.post("/create", authorizeRoles(allowedRoles), createWarehouse);

module.exports = router;
