/**
 * Common error messages used throughout the application
 */
const errorMessages = {
  // Authentication errors
  INVALID_CREDENTIALS: "Invalid email or password",
  UNAUTHORIZED: "Unauthorized access",
  TOKEN_EXPIRED: "Token has expired",
  TOKEN_INVALID: "Invalid token",
  
  // Validation errors
  VALIDATION_ERROR: "Validation failed",
  REQUIRED_FIELD: "This field is required",
  INVALID_FORMAT: "Invalid format",
  DUPLICATE_ENTRY: "Record already exists",
  
  // Database errors
  DATABASE_ERROR: "Database operation failed",
  RECORD_NOT_FOUND: "Record not found",
  FOREIGN_KEY_CONSTRAINT: "Cannot delete record due to existing references",
  
  // Server errors
  INTERNAL_SERVER_ERROR: "Internal server error occurred",
  SERVICE_UNAVAILABLE: "Service temporarily unavailable",
  
  // File upload errors
  FILE_TOO_LARGE: "File size exceeds maximum limit",
  INVALID_FILE_TYPE: "Invalid file type",
  UPLOAD_FAILED: "File upload failed",
  
  // Business logic errors
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions to perform this action",
  OPERATION_NOT_ALLOWED: "Operation not allowed",
  RESOURCE_LIMIT_EXCEEDED: "Resource limit exceeded"
};

/**
 * Send standardized success response
 * @param {Response} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Response} Express response
 */
const sendSuccessResponse = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Send standardized error response
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} errors - Additional error details (optional)
 * @returns {Response} Express response
 */
const sendErrorResponse = (res, statusCode = 500, message = errorMessages.INTERNAL_SERVER_ERROR, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  // Include additional error details if provided
  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send standardized pagination response
 * @param {Response} res - Express response object
 * @param {Array} data - Array of data items
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 * @returns {Response} Express response
 */
const sendPaginatedResponse = (res, data, pagination, message = "Data retrieved successfully") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.currentPage || 1,
      totalPages: pagination.totalPages || 1,
      totalRecords: pagination.totalRecords || data.length,
      limit: pagination.limit || 10,
      hasNext: pagination.hasNext || false,
      hasPrev: pagination.hasPrev || false
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Handle async errors in Express middleware
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Format validation errors for consistent response structure
 * @param {Array} errors - Array of validation error objects
 * @returns {Array} Formatted error array
 */
const formatValidationErrors = (errors) => {
  if (!Array.isArray(errors)) {
    return [];
  }

  return errors.map(error => ({
    field: error.field || error.path || 'unknown',
    message: error.message || 'Validation error',
    value: error.value || null
  }));
};

/**
 * Extract meaningful error message from database errors
 * @param {Error} error - Database error object
 * @returns {string} User-friendly error message
 */
const extractDatabaseError = (error) => {
  if (!error) return errorMessages.DATABASE_ERROR;

  // Handle specific MySQL error codes
  switch (error.code) {
    case 'ER_DUP_ENTRY':
      return errorMessages.DUPLICATE_ENTRY;
    case 'ER_NO_REFERENCED_ROW_2':
      return "Referenced record does not exist";
    case 'ER_ROW_IS_REFERENCED_2':
      return errorMessages.FOREIGN_KEY_CONSTRAINT;
    case 'ER_DATA_TOO_LONG':
      return "Data too long for column";
    case 'ER_BAD_NULL_ERROR':
      return "Required field cannot be null";
    case 'ER_ACCESS_DENIED_ERROR':
      return "Database access denied";
    case 'ECONNREFUSED':
      return "Database connection refused";
    case 'ETIMEDOUT':
      return "Database connection timeout";
    default:
      return error.message || errorMessages.DATABASE_ERROR;
  }
};

/**
 * Log error details for debugging
 * @param {Error} error - Error object
 * @param {Object} context - Additional context (optional)
 */
const logError = (error, context = {}) => {
  const timestamp = new Date().toISOString();
  const errorDetails = {
    timestamp,
    message: error.message,
    stack: error.stack,
    context
  };

  console.error('Application Error:', JSON.stringify(errorDetails, null, 2));
};

/**
 * Create a standardized API response wrapper
 * @param {*} data - Response data
 * @param {string} message - Response message
 * @param {boolean} success - Success status
 * @returns {Object} Standardized response object
 */
const createResponse = (data = null, message = "Success", success = true) => {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  errorMessages,
  sendSuccessResponse,
  sendErrorResponse,
  sendPaginatedResponse,
  asyncHandler,
  formatValidationErrors,
  extractDatabaseError,
  logError,
  createResponse
};