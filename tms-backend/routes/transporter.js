const express = require("express");
const router = express.Router();
const {
  createTransporter,
  getMasterData,
  getStatesByCountry,
  getCitiesByCountryAndState,
  getTransporters,
  getTransporterById,
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
router.get("/", authenticateToken, checkProductOwnerAccess, getTransporters);
router.get(
  "/:id",
  authenticateToken,
  checkProductOwnerAccess,
  getTransporterById
);
router.post("/", authenticateToken, checkProductOwnerAccess, createTransporter);
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
