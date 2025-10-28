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
        message: "Only product owners can create transporters",
      },
    });
  }

  next();
};

// Routes
router.get("/", authenticateToken, getTransporters);
router.get("/:id", authenticateToken, getTransporterById);
router.post("/", authenticateToken, checkProductOwnerAccess, createTransporter);
router.get("/master-data", authenticateToken, getMasterData);
router.get("/states/:countryCode", authenticateToken, getStatesByCountry);
router.get(
  "/cities/:countryCode/:stateCode",
  authenticateToken,
  getCitiesByCountryAndState
);

module.exports = router;
