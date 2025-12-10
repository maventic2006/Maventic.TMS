const express = require("express");
const router = express.Router();
const {
  createTransporter,
  updateTransporter,
  getMasterData,
  getStatesByCountry,
  getCitiesByCountryAndState,
  getTransporters,
  getTransporterStatusCounts,
  getTransporterById,
  getDocumentFile,
  saveTransporterAsDraft,
  updateTransporterDraft,
  deleteTransporterDraft,
  submitTransporterFromDraft,
  // Mapping controllers
  getConsignorMappings,
  createConsignorMapping,
  updateConsignorMapping,
  deleteConsignorMapping,
  getVehicleMappings,
  createVehicleMapping,
  updateVehicleMapping,
  deleteVehicleMapping,
  getDriverMappings,
  createDriverMapping,
  updateDriverMapping,
  deleteDriverMapping,
  getOwnerMappings,
  createOwnerMapping,
  updateOwnerMapping,
  deleteOwnerMapping,
  getBlacklistMappings,
  createBlacklistMapping,
  updateBlacklistMapping,
  deleteBlacklistMapping,
  getMappingMasterData,
} = require("../controllers/transporterController");
const { authenticateToken } = require("../middleware/auth");

// Middleware to check if user is product owner (admin/owner role)
const checkProductOwnerAccess = (req, res, next) => {
  // Get user type from token
  const userType = req.user?.user_type_id;

  // UT001 is Owner (product owner as per requirements)
  if (userType !== "UT001") {
    return res.status(403).json({
      success: false,
      error: {
        code: "ACCESS_DENIED",
        message: "Only product owners can access this resource",
      },
    });
  }

  next();
};

// Routes - All routes require product owner access
// IMPORTANT: Specific routes must come BEFORE parameterized routes
// Otherwise Express will match specific paths like "/master-data" to "/:id"

// Specific GET routes (must be first)
router.get(
  "/master-data",
  authenticateToken,
  checkProductOwnerAccess,
  getMasterData
);
router.get(
  "/status-counts",
  authenticateToken,
  checkProductOwnerAccess,
  getTransporterStatusCounts
);
router.get(
  "/mapping-master-data",
  authenticateToken,
  checkProductOwnerAccess,
  getMappingMasterData
);
router.get(
  "/states/:countryCode",
  authenticateToken,
  checkProductOwnerAccess,
  getStatesByCountry
);
router.get(
  "/cities/:countryCode/:stateCode",
  authenticateToken,
  checkProductOwnerAccess,
  getCitiesByCountryAndState
);

// List and detail routes
router.get("/", authenticateToken, checkProductOwnerAccess, getTransporters);
console.log(
  "✅ Transporter GET / route registered with authenticateToken middleware"
);
router.get(
  "/:id",
  authenticateToken,
  checkProductOwnerAccess,
  getTransporterById
);

// Mutation routes
router.post("/", authenticateToken, checkProductOwnerAccess, createTransporter);

// Save as draft routes
router.post(
  "/save-draft",
  authenticateToken,
  checkProductOwnerAccess,
  saveTransporterAsDraft
);
router.put(
  "/:id/update-draft",
  authenticateToken,
  checkProductOwnerAccess,
  updateTransporterDraft
);
router.put(
  "/:id/submit-draft",
  authenticateToken,
  checkProductOwnerAccess,
  submitTransporterFromDraft
);
router.delete(
  "/:id/delete-draft",
  authenticateToken,
  checkProductOwnerAccess,
  deleteTransporterDraft
);

// Document route (specific path must come before general /:id)
router.get(
  "/document/:documentId",
  authenticateToken,
  checkProductOwnerAccess,
  getDocumentFile
);

// ========================================
// MAPPING ROUTES
// ========================================

// Consignor mappings
router.get(
  "/:id/consignor-mappings",
  authenticateToken,
  checkProductOwnerAccess,
  getConsignorMappings
);
router.post(
  "/:id/consignor-mappings",
  authenticateToken,
  checkProductOwnerAccess,
  createConsignorMapping
);
router.put(
  "/:id/consignor-mappings/:mappingId",
  authenticateToken,
  checkProductOwnerAccess,
  updateConsignorMapping
);
router.delete(
  "/:id/consignor-mappings/:mappingId",
  authenticateToken,
  checkProductOwnerAccess,
  deleteConsignorMapping
);

// Vehicle mappings
router.get(
  "/:id/vehicle-mappings",
  authenticateToken,
  checkProductOwnerAccess,
  getVehicleMappings
);
router.post(
  "/:id/vehicle-mappings",
  authenticateToken,
  checkProductOwnerAccess,
  createVehicleMapping
);
router.put(
  "/:id/vehicle-mappings/:mappingId",
  authenticateToken,
  checkProductOwnerAccess,
  updateVehicleMapping
);
router.delete(
  "/:id/vehicle-mappings/:mappingId",
  authenticateToken,
  checkProductOwnerAccess,
  deleteVehicleMapping
);

// Driver mappings
router.get(
  "/:id/driver-mappings",
  authenticateToken,
  checkProductOwnerAccess,
  getDriverMappings
);
router.post(
  "/:id/driver-mappings",
  authenticateToken,
  checkProductOwnerAccess,
  createDriverMapping
);
router.put(
  "/:id/driver-mappings/:mappingId",
  authenticateToken,
  checkProductOwnerAccess,
  updateDriverMapping
);
router.delete(
  "/:id/driver-mappings/:mappingId",
  authenticateToken,
  checkProductOwnerAccess,
  deleteDriverMapping
);

// Owner mappings
router.get(
  "/:id/owner-mappings",
  authenticateToken,
  checkProductOwnerAccess,
  getOwnerMappings
);
router.post(
  "/:id/owner-mappings",
  authenticateToken,
  checkProductOwnerAccess,
  createOwnerMapping
);
router.put(
  "/:id/owner-mappings/:mappingId",
  authenticateToken,
  checkProductOwnerAccess,
  updateOwnerMapping
);
router.delete(
  "/:id/owner-mappings/:mappingId",
  authenticateToken,
  checkProductOwnerAccess,
  deleteOwnerMapping
);

// Blacklist mappings
router.get(
  "/:id/blacklist-mappings",
  authenticateToken,
  checkProductOwnerAccess,
  getBlacklistMappings
);
router.post(
  "/:id/blacklist-mappings",
  authenticateToken,
  checkProductOwnerAccess,
  createBlacklistMapping
);
router.put(
  "/:id/blacklist-mappings/:mappingId",
  authenticateToken,
  checkProductOwnerAccess,
  updateBlacklistMapping
);
router.delete(
  "/:id/blacklist-mappings/:mappingId",
  authenticateToken,
  checkProductOwnerAccess,
  deleteBlacklistMapping
);

// General update route (MUST be last to avoid matching specific routes)
router.put(
  "/:id",
  authenticateToken,
  checkProductOwnerAccess,
  updateTransporter
);

module.exports = router;
