const knex = require('../../config/database');

/**
 * Get all applications from application_master
 * @param {Object} filters - { isActive }
 * @returns {Promise<Array>} - Array of applications
 */
const listApplications = async (filters = {}) => {
  let query = knex('application_master')
    .select([
      'app_unique_id',
      'application_id',
      'application_name',
      'application_description',
      'application_url',
      'application_icon',
      'application_category',
      'display_order',
      'is_active',
      'status',
      'created_at'
    ])
    .orderBy('display_order', 'asc')
    .orderBy('application_name', 'asc');

  // Filter by active status if provided
  if (filters.isActive !== undefined) {
    query = query.where('is_active', filters.isActive);
  }

  const applications = await query;
  return applications;
};

/**
 * Get application by unique ID
 * @param {number} id - Application unique ID (app_unique_id)
 * @returns {Promise<Object>} - Application object
 */
const getApplicationById = async (id) => {
  const application = await knex('application_master')
    .where('app_unique_id', id)
    .first();

  return application;
};

/**
 * Get application by application_id (string identifier)
 * @param {string} appId - Application string ID (e.g., 'TMS', 'WMS')
 * @returns {Promise<Object>} - Application object
 */
const getApplicationByAppId = async (appId) => {
  const application = await knex('application_master')
    .where('application_id', appId)
    .first();

  return application;
};

module.exports = {
  listApplications,
  getApplicationById,
  getApplicationByAppId
};
