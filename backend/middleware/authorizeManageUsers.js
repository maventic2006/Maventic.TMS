/**
 * Middleware to authorize users who can manage other users
 * ADAPT: Customize role-based authorization logic based on your needs
 */
const authorizeManageUsers = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: {
        code: 'NO_AUTH',
        details: 'User must be authenticated to access this resource'
      }
    });
  }

  // Check if user has admin or manager role
  // ADAPT: Integrate with your role/permission system
  const userRole = req.user.role || req.user.user_type_id;

  const allowedRoles = ['admin', 'manager', 'UT001', 'UT002']; // UT001=Admin, UT002=Manager

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions',
      error: {
        code: 'FORBIDDEN',
        details: 'You do not have permission to manage users'
      }
    });
  }

  next();
};

/**
 * Middleware to authorize only admin users
 * ADAPT: Customize admin authorization logic
 */
const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: {
        code: 'NO_AUTH',
        details: 'User must be authenticated to access this resource'
      }
    });
  }

  const userRole = req.user.role || req.user.user_type_id;

  if (userRole !== 'admin' && userRole !== 'UT001') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      error: {
        code: 'FORBIDDEN',
        details: 'This action requires admin privileges'
      }
    });
  }

  next();
};

/**
 * Middleware to check if user can access their own or is admin
 * ADAPT: Customize self-or-admin authorization logic
 */
const authorizeSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: {
        code: 'NO_AUTH',
        details: 'User must be authenticated to access this resource'
      }
    });
  }

  const targetUserId = req.params.userId;
  const currentUserId = req.user.user_id;
  const userRole = req.user.role || req.user.user_type_id;

  // Allow if user is accessing their own data or is admin
  if (currentUserId === targetUserId || userRole === 'admin' || userRole === 'UT001') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied',
    error: {
      code: 'FORBIDDEN',
      details: 'You can only access your own data'
    }
  });
};

module.exports = {
  authorizeManageUsers,
  authorizeAdmin,
  authorizeSelfOrAdmin
};
