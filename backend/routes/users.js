const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { authenticateToken } = require("../middleware/auth");

// All routes require authentication
router.use(authenticateToken);

// Application list route (must come before /:id routes to avoid conflicts)
router.get("/applications/list", usersController.getApplications); // Get all applications for dropdown
router.get("/applications", usersController.getAvailableApplications); // Get available applications
router.get("/roles/master", usersController.getUserRoleMaster); // Get master roles for dropdown

// User CRUD routes
router.get("/", usersController.getUsers); // Get all users with pagination
router.post("/", usersController.createUser); // Create new user
router.get("/:id", usersController.getUserById); // Get user by ID
router.put("/:id", usersController.updateUser); // Update user
router.patch("/:id/deactivate", usersController.deactivateUser); // Deactivate user

// User role management routes
router.post("/:id/roles", usersController.addUserRole); // Add role to user
router.get("/:id/roles", usersController.getUserRoles); // Get user roles

// User application access management routes
router.get("/:userId/application-access", usersController.getUserApplicationAccess); // Get user's application access
router.post("/:userId/application-access", usersController.grantApplicationAccess); // Grant application access
router.delete("/application-access/:accessId", usersController.revokeApplicationAccess); // Revoke application access

module.exports = router;
