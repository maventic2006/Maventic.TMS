const knex = require('../config/database');

// Cache for determining the column name in user_application_access that references user_role_hdr
let cachedUserApplicationRoleColumn = null;

/**
 * Determine whether user_application_access uses column 'user_role_hdr_id' or 'user_role_id'
 * Returns the column name that exists in the current DB schema
 */
const getUserApplicationRoleColumn = async () => {
  if (cachedUserApplicationRoleColumn) return cachedUserApplicationRoleColumn;

  // Prefer the canonical 'user_role_hdr_id' name, then fallback to older 'user_role_id'
  const hasHdr = await knex.schema.hasColumn('user_application_access', 'user_role_hdr_id');
  if (hasHdr) {
    cachedUserApplicationRoleColumn = 'user_role_hdr_id';
    return cachedUserApplicationRoleColumn;
  }

  const hasId = await knex.schema.hasColumn('user_application_access', 'user_role_id');
  if (hasId) {
    cachedUserApplicationRoleColumn = 'user_role_id';
    return cachedUserApplicationRoleColumn;
  }

  // If neither column exists, throw a clear and actionable error
  throw new Error("Database schema mismatch: 'user_application_access' does not contain 'user_role_hdr_id' or 'user_role_id'. Please run migration to standardize the schema.");
};

const resetCache = () => {
  cachedUserApplicationRoleColumn = null;
};

module.exports = {
  getUserApplicationRoleColumn,
  resetCache,
};
