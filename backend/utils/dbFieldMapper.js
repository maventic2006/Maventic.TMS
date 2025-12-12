/**
 * Database Field Mapper Utility
 * Maps API-friendly field names to database column names and vice versa
 */

/**
 * User API to DB field mapping
 */
const userApiToDb = {
  userId: 'user_id',
  userTypeId: 'user_type_id',
  firstName: null, // Derived field - combine to user_full_name
  lastName: null, // Derived field - combine to user_full_name
  fullName: 'user_full_name',
  email: 'email_id',
  mobileNumber: 'mobile_number',
  alternateMobile: 'alternet_mobile', // Note: DB has typo 'alternet'
  whatsappNumber: 'whats_app_number',
  fromDate: 'from_date',
  toDate: 'to_date',
  isActive: 'is_active',
  createdByUserId: 'created_by_user_id',
  consignorId: 'consignor_id',
  approvalCycle: 'approval_cycle',
  password: 'password',
  passwordType: 'password_type',
  status: 'status',
  createdAt: 'created_at',
  createdBy: 'created_by',
  updatedAt: 'updated_at',
  updatedBy: 'updated_by'
};

/**
 * User DB to API field mapping (reverse)
 */
const userDbToApi = Object.entries(userApiToDb).reduce((acc, [key, value]) => {
  if (value) {
    acc[value] = key;
  }
  return acc;
}, {});

/**
 * Transform API request body to DB column format
 * @param {Object} apiData - API request data with camelCase fields
 * @param {Object} mapping - Field mapping object (apiToDb)
 * @returns {Object} - Database column format
 */
const apiToDb = (apiData, mapping = userApiToDb) => {
  const dbData = {};
  
  Object.entries(apiData).forEach(([key, value]) => {
    const dbColumn = mapping[key];
    if (dbColumn) {
      dbData[dbColumn] = value;
    }
  });
  
  return dbData;
};

/**
 * Transform DB record to API response format
 * @param {Object} dbData - Database record with snake_case columns
 * @param {Object} mapping - Field mapping object (dbToApi)
 * @returns {Object} - API response format with camelCase
 */
const dbToApi = (dbData, mapping = userDbToApi) => {
  if (!dbData) return null;
  
  const apiData = {};
  
  Object.entries(dbData).forEach(([key, value]) => {
    const apiField = mapping[key] || key; // Use original if no mapping
    apiData[apiField] = value;
  });
  
  return apiData;
};

/**
 * Combine first and last name into full name
 * @param {string} firstName 
 * @param {string} lastName 
 * @returns {string}
 */
const combineFullName = (firstName, lastName) => {
  return `${firstName || ''} ${lastName || ''}`.trim();
};

/**
 * Split full name into first and last name
 * @param {string} fullName 
 * @returns {Object} - { firstName, lastName }
 */
const splitFullName = (fullName) => {
  if (!fullName) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(' ');
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || ''
  };
};

module.exports = {
  userApiToDb,
  userDbToApi,
  apiToDb,
  dbToApi,
  combineFullName,
  splitFullName
};
