const express = require("express");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// Authentication routes
router.post("/login", authController.login);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authController.logout);
router.get("/verify", authenticateToken, authController.verifyToken);
router.get("/user-types", authController.getUserTypes);
router.get(
  "/applications",
  authenticateToken,
  authController.getUserApplications
);

module.exports = router;
