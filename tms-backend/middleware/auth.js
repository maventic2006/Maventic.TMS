const jwt = require("jsonwebtoken");

// JWT Secret
const JWT_SECRET =
  process.env.JWT_SECRET || "tms-secret-key-change-in-production";

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
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
  if (userRole === 'admin' || userRole === 'manager' || userRole === 'user' || userRole === 'consignor') {
    return next();
  }

  // Transporter can only access their own data
  if (userRole === 'transporter' && id === userId) {
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
