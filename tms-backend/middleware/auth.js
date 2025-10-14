const jwt = require("jsonwebtoken");

// JWT Secret
const JWT_SECRET =
  process.env.JWT_SECRET || "tms-secret-key-change-in-production";

/**
 * Middleware to authenticate JWT token from cookies
 */
const authenticateToken = (req, res, next) => {
  const token = req.cookies?.authToken;

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

module.exports = {
  authenticateToken,
};
