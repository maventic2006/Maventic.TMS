/**
 * Response Helper Utilities
 * Provides standardized response formatting for API endpoints
 */

/**
 * Success Response Format
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {Object} meta - Optional metadata (pagination, etc.)
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data, meta = null, statusCode = 200) => {
  const response = {
    success: true,
    data
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error Response Format
 * @param {Object} res - Express response object
 * @param {String} code - Error code (e.g., 'VALIDATION_ERROR')
 * @param {String} message - Human-friendly error message
 * @param {Array} details - Field-level error details
 * @param {Number} statusCode - HTTP status code (default: 400)
 */
const errorResponse = (res, code, message, details = [], statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details.length > 0 && { details })
    }
  });
};

/**
 * Validation Error Response
 * Formats Joi validation errors into field-level error details
 * @param {Object} res - Express response object
 * @param {Object} error - Joi validation error object
 */
const validationErrorResponse = (res, error) => {
  const details = error.details.map(detail => {
    // Extract field path from Joi error
    // Example: "general.customer_name" or "contacts[0].email"
    const fieldPath = detail.path.join('.');
    
    return {
      field: fieldPath,
      message: detail.message
    };
  });

  return errorResponse(
    res,
    'VALIDATION_ERROR',
    'Validation failed. Please check your input.',
    details,
    422
  );
};

/**
 * Database Error Response Handler
 * Maps database errors to user-friendly messages
 * @param {Object} res - Express response object
 * @param {Object} error - Database error object
 */
const databaseErrorResponse = (res, error) => {
  console.error('Database Error:', error);

  // MySQL/MariaDB duplicate entry error
  if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
    // Extract field name from error message
    const match = error.sqlMessage?.match(/for key '([^']+)'/);
    const fieldName = match ? match[1] : 'unknown field';
    
    return errorResponse(
      res,
      'DUPLICATE_ENTRY',
      `This ${fieldName} already exists. Please use a different value.`,
      [{ field: fieldName, message: 'Duplicate value not allowed' }],
      409
    );
  }

  // Foreign key constraint violation
  if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
    return errorResponse(
      res,
      'FOREIGN_KEY_VIOLATION',
      'Referenced record does not exist.',
      [],
      400
    );
  }

  // Data too long error
  if (error.code === 'ER_DATA_TOO_LONG' || error.errno === 1406) {
    return errorResponse(
      res,
      'DATA_TOO_LONG',
      'One or more fields exceed maximum length.',
      [],
      400
    );
  }

  // Generic database error
  return errorResponse(
    res,
    'DATABASE_ERROR',
    'A database error occurred. Please try again later.',
    [],
    500
  );
};

/**
 * Not Found Error Response
 * @param {Object} res - Express response object
 * @param {String} resource - Resource name (e.g., 'Consignor')
 * @param {String} identifier - Resource identifier (e.g., 'C001')
 */
const notFoundResponse = (res, resource = 'Resource', identifier = '') => {
  const message = identifier
    ? `${resource} with identifier '${identifier}' not found.`
    : `${resource} not found.`;

  return errorResponse(
    res,
    'NOT_FOUND',
    message,
    [],
    404
  );
};

/**
 * Unauthorized Error Response
 * @param {Object} res - Express response object
 * @param {String} message - Custom message (optional)
 */
const unauthorizedResponse = (res, message = 'Authentication required.') => {
  return errorResponse(
    res,
    'UNAUTHORIZED',
    message,
    [],
    401
  );
};

/**
 * Forbidden Error Response
 * @param {Object} res - Express response object
 * @param {String} message - Custom message (optional)
 */
const forbiddenResponse = (res, message = 'You do not have permission to access this resource.') => {
  return errorResponse(
    res,
    'FORBIDDEN',
    message,
    [],
    403
  );
};

/**
 * Internal Server Error Response
 * @param {Object} res - Express response object
 * @param {Object} error - Error object
 */
const internalServerErrorResponse = (res, error = null) => {
  if (error) {
    console.error('Internal Server Error:', error);
  }

  return errorResponse(
    res,
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred. Please try again later.',
    [],
    500
  );
};

/**
 * Pagination Metadata Helper
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items
 */
const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  databaseErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  internalServerErrorResponse,
  getPaginationMeta
};
