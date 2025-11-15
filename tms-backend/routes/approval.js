const express = require("express");
const router = express.Router();
const {
  getApprovalConfiguration,
  getPendingApprovals,
  getApprovalHistory,
  approveUser,
  rejectUser,
} = require("../controllers/approvalController");
const { authenticateToken } = require("../middleware/auth");

// Middleware to check if user is product owner
const checkProductOwnerAccess = (req, res, next) => {
  const userType = req.user?.user_type_id;

  // UT001 is Product Owner
  if (userType !== "UT001") {
    return res.status(403).json({
      success: false,
      error: {
        code: "ACCESS_DENIED",
        message: "Only product owners can access approval functions",
      },
    });
  }

  next();
};

// All approval routes require authentication and product owner access
router.get(
  "/config/:approvalTypeId",
  authenticateToken,
  checkProductOwnerAccess,
  getApprovalConfiguration
);

router.get(
  "/pending",
  authenticateToken,
  checkProductOwnerAccess,
  getPendingApprovals
);

router.get(
  "/history/:userId",
  authenticateToken,
  checkProductOwnerAccess,
  getApprovalHistory
);

router.post(
  "/approve/:userId",
  authenticateToken,
  checkProductOwnerAccess,
  approveUser
);

router.post(
  "/reject/:userId",
  authenticateToken,
  checkProductOwnerAccess,
  rejectUser
);

module.exports = router;
