const jwt = require("jsonwebtoken");

// JWT Secret
const JWT_SECRET =
  process.env.JWT_SECRET || "tms-secret-key-change-in-production";

/**
 * Middleware to authenticate JWT token from cookies OR Authorization header
 * Supports both:
 * 1. HTTP-only cookie (for browser-based frontend)
 * 2. Authorization: Bearer <token> header (for Postman/mobile apps)
 */
const authenticateToken = (req, res, next) => {
  console.log("\n🔐 ===== AUTHENTICATION MIDDLEWARE CALLED =====");
  console.log(`📍 Route: ${req.method} ${req.path}`);
  console.log(`🌐 Origin: ${req.get("origin") || "No origin"}`);
  console.log(
    `🔑 Authorization Header: ${req.headers.authorization || "None"}`
  );
  console.log(
    `🍪 Cookie authToken: ${req.cookies?.authToken ? "Present" : "None"}`
  );

  // Try to get token from cookie first
  let token = req.cookies?.authToken;

  // If not in cookie, check Authorization header
  if (!token) {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove "Bearer " prefix
      console.log("✅ Token extracted from Authorization header");
    }
  } else {
    console.log("✅ Token found in cookie");
  }

  // If no token found in either location, return 401
  if (!token) {
    console.log("❌ NO TOKEN FOUND - Returning 401");
    console.log("🔐 ===== AUTHENTICATION FAILED =====\n");
    return res.status(401).json({
      success: false,
      message:
        "Access token required. Please provide token in cookie or Authorization header.",
      error: {
        code: "NO_TOKEN",
        details: "Authentication required to access this resource",
      },
    });
  }

  console.log("🔍 Verifying token...");
  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("❌ TOKEN VERIFICATION FAILED:", err.message);
      console.log("🔐 ===== AUTHENTICATION FAILED =====\n");
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
        error: {
          code: "INVALID_TOKEN",
          details: err.message,
        },
      });
    }
    console.log("✅ Token verified successfully for user:", user.user_id);
    console.log("🔐 ===== AUTHENTICATION SUCCESS =====\n");
    req.user = user;
    next();
  });
};

/**
 * Middleware to authorize specific roles
 */
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

/**
 * Middleware to validate request parameters
 */
const validateTransporterAccess = (req, res, next) => {
  const { id } = req.params; // Correct parameter name from route /:id
  const userRole = req.user.role;
  const userId = req.user.user_id; // Correct property from JWT token

  // Admin, manager, and user roles can access all transporters
  if (
    userRole === "admin" ||
    userRole === "manager" ||
    userRole === "user" ||
    userRole === "consignor"
  ) {
    return next();
  }

  // Transporter can only access their own data
  if (userRole === "transporter" && id === userId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied to this transporter data",
  });
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  validateTransporterAccess,
};
