const express = require("express");
const router = express.Router();
const {
  createDriver,
  updateDriver,
  getMasterData,
  getStatesByCountry,
  getCitiesByCountryAndState,
  getDrivers,
  getDriverById,
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
router.get("/", authenticateToken, checkProductOwnerAccess, getDrivers);
router.get("/:id", authenticateToken, checkProductOwnerAccess, getDriverById);
router.post("/", authenticateToken, checkProductOwnerAccess, createDriver);
router.put("/:id", authenticateToken, checkProductOwnerAccess, updateDriver);
router.get(
  "/master-data",
  authenticateToken,
  checkProductOwnerAccess,
  getMasterData
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

module.exports = router;
