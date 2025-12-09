/**
 * Response Helper Utilities
 * Provides standardized response formatting for API endpoints
 */

/**
 * Field Length Information Map
 * Maps database column names to their maximum lengths for better error messages
 */
const FIELD_LENGTH_INFO = {
  // Consignor fields
  'customer_name': { maxLength: 100, friendlyName: 'Customer Name' },
  'search_term': { maxLength: 100, friendlyName: 'Search Term' },
  'industry_type': { maxLength: 30, friendlyName: 'Industry Type' },
  'currency_type': { maxLength: 30, friendlyName: 'Currency Type' },
  'payment_term': { maxLength: 10, friendlyName: 'Payment Term' },
  'remark': { maxLength: 255, friendlyName: 'Remark' },
  'website_url': { maxLength: 200, friendlyName: 'Website URL' },
  'name_on_po': { maxLength: 30, friendlyName: 'Name on PO' },
  'approved_by': { maxLength: 30, friendlyName: 'Approved By' },
  'company_code': { maxLength: 10, friendlyName: 'Company Code' },
  
  // Contact fields
  'contact_name': { maxLength: 100, friendlyName: 'Contact Name' },
  'contact_role': { maxLength: 100, friendlyName: 'Contact Role' },
  'contact_team': { maxLength: 100, friendlyName: 'Contact Team' },
  'phone_number': { maxLength: 20, friendlyName: 'Phone Number' },
  'alternate_phone_number': { maxLength: 20, friendlyName: 'Alternate Phone Number' },
  'email': { maxLength: 100, friendlyName: 'Email' },
  'alternate_email': { maxLength: 100, friendlyName: 'Alternate Email' },
  'linkedin_link': { maxLength: 500, friendlyName: 'LinkedIn Link' },
  'designation': { maxLength: 50, friendlyName: 'Designation' },
  
  // Document fields
  'file_name': { maxLength: 500, friendlyName: 'Document File Name' },
  'document_number': { maxLength: 50, friendlyName: 'Document Number' },
  'document_type': { maxLength: 50, friendlyName: 'Document Type' },
  'issuing_authority': { maxLength: 100, friendlyName: 'Issuing Authority' },
  
  // Address fields
  'address_line_1': { maxLength: 200, friendlyName: 'Address Line 1' },
  'address_line_2': { maxLength: 200, friendlyName: 'Address Line 2' },
  'city': { maxLength: 100, friendlyName: 'City' },
  'state': { maxLength: 100, friendlyName: 'State' },
  'country': { maxLength: 100, friendlyName: 'Country' },
  'postal_code': { maxLength: 20, friendlyName: 'Postal Code' },
  
  // Driver fields
  'full_name': { maxLength: 100, friendlyName: 'Driver Full Name' },
  'driver_id': { maxLength: 10, friendlyName: 'Driver ID' },
  'license_number': { maxLength: 50, friendlyName: 'License Number' },
  
  // Transporter fields
  'business_name': { maxLength: 100, friendlyName: 'Business Name' },
  'vat_number': { maxLength: 50, friendlyName: 'VAT Number' },
  'tan_number': { maxLength: 50, friendlyName: 'TAN Number' },
  
  // Vehicle fields
  'registration_number': { maxLength: 20, friendlyName: 'Vehicle Registration Number' },
  'chassis_number': { maxLength: 50, friendlyName: 'Chassis Number' },
  'engine_number': { maxLength: 50, friendlyName: 'Engine Number' },
  'make': { maxLength: 50, friendlyName: 'Vehicle Make' },
  'model': { maxLength: 50, friendlyName: 'Vehicle Model' },
  
  // Warehouse fields
  'warehouse_name': { maxLength: 100, friendlyName: 'Warehouse Name' },
  'warehouse_code': { maxLength: 20, friendlyName: 'Warehouse Code' }
};

/**
 * Get field length information for error messages
 * @param {string} columnName - Database column name
 * @returns {object|null} - Field info or null if not found
 */
const getFieldLengthInfo = (columnName) => {
  return FIELD_LENGTH_INFO[columnName] || null;
};

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
 * Formats validation errors into field-level error details
 * Supports both Joi validation errors and manual validation errors
 * @param {Object} res - Express response object
 * @param {Object} error - Validation error object
 */
const validationErrorResponse = (res, error) => {
  const details = error.details.map(detail => {
    let fieldPath;
    
    // Handle Joi validation error format (has path array)
    if (detail.path && Array.isArray(detail.path)) {
      fieldPath = detail.path.join('.');
    }
    // Handle manual validation error format (has field string)
    else if (detail.field) {
      fieldPath = detail.field;
    }
    // Fallback for malformed error objects
    else {
      fieldPath = 'unknown';
    }
    
    return {
      field: fieldPath,
      message: detail.message || 'Validation error'
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
    // MySQL error format: "Cannot add or update a child row: a foreign key constraint fails 
    // (`database`.`table`, CONSTRAINT `constraint_name` FOREIGN KEY (`column`) REFERENCES `ref_table` (`ref_column`))"
    
    // Try to extract detailed information from the error message
    const constraintMatch = error.sqlMessage?.match(/CONSTRAINT `([^`]+)`/);
    const foreignKeyMatch = error.sqlMessage?.match(/FOREIGN KEY \(`([^`]+)`\) REFERENCES `([^`]+)` \(`([^`]+)`\)/);
    const tableMatch = error.sqlMessage?.match(/`[^`]+`\.`([^`]+)`/);
    
    let message = 'Referenced record does not exist.';
    const details = [];
    
    if (foreignKeyMatch && tableMatch) {
      const columnName = foreignKeyMatch[1];
      const refTable = foreignKeyMatch[2];
      const refColumn = foreignKeyMatch[3];
      const table = tableMatch[1];
      
      message = `Foreign key constraint failed: The value provided for '${columnName}' does not exist in '${refTable}' table.`;
      
      details.push({
        table: table,
        column: columnName,
        referencedTable: refTable,
        referencedColumn: refColumn,
        constraint: constraintMatch ? constraintMatch[1] : null,
        message: `Invalid reference: The value for '${columnName}' must exist in '${refTable}.${refColumn}'`,
        code: 'FOREIGN_KEY_VIOLATION'
      });
      
      console.log(`\n❌ FOREIGN KEY VIOLATION DETAILS:`);
      console.log(`   Table: ${table}`);
      console.log(`   Column: ${columnName}`);
      console.log(`   Referenced Table: ${refTable}`);
      console.log(`   Referenced Column: ${refColumn}`);
      console.log(`   Constraint: ${constraintMatch ? constraintMatch[1] : 'N/A'}`);
      console.log(`   SQL Message: ${error.sqlMessage}\n`);
    }
    
    return errorResponse(
      res,
      'FOREIGN_KEY_VIOLATION',
      message,
      details,
      400
    );
  }

  // Data too long error
  if (error.code === 'ER_DATA_TOO_LONG' || error.errno === 1406) {
    // MySQL error message format: "Data too long for column 'column_name' at row N"
    const match = error.sqlMessage?.match(/Data too long for column '([^']+)' at row (\d+)/i);
    
    if (match) {
      const columnName = match[1];
      const rowNumber = match[2];
      
      // Get field type information if available
      const fieldInfo = getFieldLengthInfo(columnName);
      const friendlyName = fieldInfo ? fieldInfo.friendlyName : columnName;
      const maxLength = fieldInfo ? fieldInfo.maxLength : 'unknown';
      
      const details = [{
        field: columnName,
        friendlyName: friendlyName,
        maxLength: fieldInfo ? fieldInfo.maxLength : null,
        message: `Data exceeds maximum allowed length${fieldInfo ? ` (max: ${maxLength} characters)` : ''}`,
        code: 'DATA_TOO_LONG'
      }];
      
      return errorResponse(
        res,
        'DATA_TOO_LONG',
        `Field '${friendlyName}' exceeds maximum allowed length of ${maxLength} characters. Please shorten your input.`,
        details,
        400
      );
    }
    
    // Fallback if we can't parse the error message
    return errorResponse(
      res,
      'DATA_TOO_LONG',
      'One or more fields exceed maximum length. Please check your input data.',
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
