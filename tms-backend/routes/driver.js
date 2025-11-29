const express = require("express");
const router = express.Router();
const {
  createDriver,
  updateDriver,
  getMasterData,
  getMandatoryDocuments,
  getStatesByCountry,
  getCitiesByCountryAndState,
  getDrivers,
  getDriverById,
  saveDriverAsDraft,
  updateDriverDraft,
  deleteDriverDraft,
  submitDriverFromDraft,
} = require("../controllers/driverController");
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
  "/mandatory-documents",
  authenticateToken,
  checkProductOwnerAccess,
  getMandatoryDocuments
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
router.get("/", authenticateToken, checkProductOwnerAccess, getDrivers);
router.get("/:id", authenticateToken, checkProductOwnerAccess, getDriverById);

// Mutation routes
router.post("/", authenticateToken, checkProductOwnerAccess, createDriver);

// Save as draft routes
router.post(
  "/save-draft",
  authenticateToken,
  checkProductOwnerAccess,
  saveDriverAsDraft
);
router.put(
  "/:id/update-draft",
  authenticateToken,
  checkProductOwnerAccess,
  updateDriverDraft
);
router.put(
  "/:id/submit-draft",
  authenticateToken,
  checkProductOwnerAccess,
  submitDriverFromDraft
);
router.delete(
  "/:id/delete-draft",
  authenticateToken,
  checkProductOwnerAccess,
  deleteDriverDraft
);

router.put("/:id", authenticateToken, checkProductOwnerAccess, updateDriver);

module.exports = router;
