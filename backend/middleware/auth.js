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
  let tokenSource = null;

  // If not in cookie, check Authorization header
  if (!token) {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // Remove "Bearer " prefix
      tokenSource = "Authorization header";
      console.log("✅ Token extracted from Authorization header");
    }
  } else {
    tokenSource = "HTTP-only cookie";
    console.log("✅ Token found in cookie");
    
    // Debug: Show first/last few characters of token (NEVER log full token in production!)
    if (process.env.NODE_ENV === 'development') {
      const tokenPreview = token.length > 20 
        ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` 
        : token;
      console.log(`🔍 Token preview: ${tokenPreview} (length: ${token.length})`);
    }
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
  console.log(`🔐 Token source: ${tokenSource}`);
  
  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("❌ TOKEN VERIFICATION FAILED:", err.message);
      console.log("❌ Error name:", err.name);
      
      // Provide specific error messages for different JWT errors
      let errorDetails = err.message;
      let errorCode = "INVALID_TOKEN";
      
      if (err.name === 'JsonWebTokenError') {
        errorCode = "JWT_MALFORMED";
        errorDetails = "Token format is invalid or corrupted. Please log in again.";
        console.log("🔍 JWT Error Details:", {
          name: err.name,
          message: err.message,
          hint: "Token might be corrupted in cookie storage"
        });
      } else if (err.name === 'TokenExpiredError') {
        errorCode = "JWT_EXPIRED";
        errorDetails = "Authentication token has expired. Please refresh your session.";
        console.log("⏰ Token Expiration Details:", {
          expiredAt: err.expiredAt,
          hint: "Token was valid but has now expired"
        });
      } else if (err.name === 'NotBeforeError') {
        errorCode = "JWT_NOT_ACTIVE";
        errorDetails = "Token is not yet active.";
      }
      
      console.log("🔐 ===== AUTHENTICATION FAILED =====\n");
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
        error: {
          code: errorCode,
          details: errorDetails,
        },
      });
    }
    console.log("✅ Token verified successfully for user:", user.user_id);
    console.log("👤 User Type:", user.user_type_id);
    console.log("🎭 User Role:", user.role);
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
