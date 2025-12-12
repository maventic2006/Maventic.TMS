const knex = require('../../config/database');
const { hashPassword } = require('../../utils/passwordUtil');
const { combineFullName, splitFullName } = require('../../utils/dbFieldMapper');

/**
 * Generate unique user ID
 * Format: USR000001, USR000002, etc.
 * /* ADAPT: match existing user_id generation logic */

const generateUserId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx('user_master_log').count('* as count').first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `USR${count.toString().padStart(6, '0')}`;

    // Check if ID exists
    const existing = await trx('user_master_log').where('user_id', newId).first();
    if (!existing) {
      return newId;
    }

    attempts++;
  }

  throw new Error('Failed to generate unique user ID after 100 attempts');
};

/**
 * Create a new user
 * @param {Object} userData - User data from request
 * @param {string} createdBy - User ID of creator
 * @returns {Promise<Object>} - Created user object
 */
const createUser = async (userData, createdBy = 'SYSTEM') => {
  return knex.transaction(async (trx) => {
    // 1. Validate user type exists
    const userType = await trx('user_type_master')
      .where('user_type_id', userData.userTypeId)
      .where('status', 'ACTIVE')
      .first();

    if (!userType) {
      throw new Error('Invalid user type');
    }

    // 2. Check for duplicate email
    const existingEmail = await trx('user_master_log')
      .where('email_id', userData.email)
      .where('status', 'ACTIVE')
      .first();

    if (existingEmail) {
      const error = new Error('Email already exists');
      error.field = 'email';
      throw error;
    }

    // 3. Check for duplicate mobile number
    const existingMobile = await trx('user_master_log')
      .where('mobile_number', userData.mobileNumber)
      .where('status', 'ACTIVE')
      .first();

    if (existingMobile) {
      const error = new Error('Mobile number already exists');
      error.field = 'mobileNumber';
      throw error;
    }

    // 4. Generate user ID
    const userId = await generateUserId(trx);

    // 5. Hash password
    const hashedPassword = await hashPassword(userData.password);

    // 6. Combine first and last name
    const fullName = combineFullName(userData.firstName, userData.lastName);

    // 7. Insert user record
    const userRecord = {
      user_id: userId,
      user_type_id: userData.userTypeId,
      user_full_name: fullName,
      email_id: userData.email,
      mobile_number: userData.mobileNumber,
      alternet_mobile: userData.alternateMobile || null,
      whats_app_number: userData.whatsappNumber || null,
      from_date: userData.fromDate,
      to_date: userData.toDate || null,
      is_active: userData.isActive !== undefined ? userData.isActive : true,
      created_by_user_id: userData.createdByUserId || createdBy,
      consignor_id: userData.consignorId || null,
      approval_cycle: null,
      password: hashedPassword,
      password_type: 'initial', // Creator set password, user must change on first login
      status: 'ACTIVE',
      created_by: createdBy
    };

    await trx('user_master_log').insert(userRecord);

    // 8. Fetch created user (excluding password)
    const createdUser = await trx('user_master_log')
      .where('user_id', userId)
      .select([
        'user_id',
        'user_type_id',
        'user_full_name',
        'email_id',
        'mobile_number',
        'alternet_mobile',
        'whats_app_number',
        'from_date',
        'to_date',
        'is_active',
        'status',
        'password_type',
        'created_at',
        'created_by'
      ])
      .first();

    return createdUser;
  });
};

/**
 * Get paginated list of users
 * @param {Object} filters - { isActive, page, limit, search }
 * @returns {Promise<Object>} - { users, total, page, limit }
 */
const listUsers = async (filters = {}) => {
  const { isActive, page = 1, limit = 20, search } = filters;
  const offset = (page - 1) * limit;

  let query = knex('user_master_log as u')
    .leftJoin('user_type_master as ut', 'u.user_type_id', 'ut.user_type_id')
    .select([
      'u.user_id',
      'u.user_type_id',
      'ut.user_type',
      'u.user_full_name',
      'u.email_id',
      'u.mobile_number',
      'u.alternet_mobile',
      'u.whats_app_number',
      'u.from_date',
      'u.to_date',
      'u.is_active',
      'u.status',
      'u.password_type',
      'u.created_at',
      'u.updated_at'
    ])
    .where('u.status', 'ACTIVE');

  // Filter by active status if provided
  if (isActive !== undefined) {
    query = query.where('u.is_active', isActive);
  }

  // Search by name, email, or mobile
  if (search) {
    query = query.where(function () {
      this.where('u.user_full_name', 'like', `%${search}%`)
        .orWhere('u.email_id', 'like', `%${search}%`)
        .orWhere('u.mobile_number', 'like', `%${search}%`);
    });
  }

  // Get total count
  const countQuery = query.clone().clearSelect().count('* as total').first();
  const { total } = await countQuery;

  // Get paginated results
  const users = await query
    .orderBy('u.created_at', 'desc')
    .limit(limit)
    .offset(offset);

  return {
    users,
    total: parseInt(total),
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User object with type info
 */
const getUserById = async (userId) => {
  const user = await knex('user_master_log as u')
    .leftJoin('user_type_master as ut', 'u.user_type_id', 'ut.user_type_id')
    .select([
      'u.user_id',
      'u.user_type_id',
      'ut.user_type',
      'u.user_full_name',
      'u.email_id',
      'u.mobile_number',
      'u.alternet_mobile',
      'u.whats_app_number',
      'u.from_date',
      'u.to_date',
      'u.is_active',
      'u.status',
      'u.password_type',
      'u.consignor_id',
      'u.approval_cycle',
      'u.created_at',
      'u.created_by',
      'u.updated_at',
      'u.updated_by'
    ])
    .where('u.user_id', userId)
    .where('u.status', 'ACTIVE')
    .first();

  if (!user) {
    return null;
  }

  // Split full name into first and last name for API response
  const { firstName, lastName } = splitFullName(user.user_full_name);
  user.firstName = firstName;
  user.lastName = lastName;

  return user;
};

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} updateData - Fields to update
 * @param {string} updatedBy - User ID of updater
 * @returns {Promise<Object>} - Updated user object
 */
const updateUser = async (userId, updateData, updatedBy) => {
  return knex.transaction(async (trx) => {
    // 1. Check if user exists
    const existingUser = await trx('user_master_log')
      .where('user_id', userId)
      .where('status', 'ACTIVE')
      .first();

    if (!existingUser) {
      throw new Error('User not found');
    }

    // 2. Check for duplicate email (if email is being updated)
    if (updateData.email && updateData.email !== existingUser.email_id) {
      const duplicateEmail = await trx('user_master_log')
        .where('email_id', updateData.email)
        .where('status', 'ACTIVE')
        .whereNot('user_id', userId)
        .first();

      if (duplicateEmail) {
        const error = new Error('Email already exists');
        error.field = 'email';
        throw error;
      }
    }

    // 3. Check for duplicate mobile (if mobile is being updated)
    if (updateData.mobileNumber && updateData.mobileNumber !== existingUser.mobile_number) {
      const duplicateMobile = await trx('user_master_log')
        .where('mobile_number', updateData.mobileNumber)
        .where('status', 'ACTIVE')
        .whereNot('user_id', userId)
        .first();

      if (duplicateMobile) {
        const error = new Error('Mobile number already exists');
        error.field = 'mobileNumber';
        throw error;
      }
    }

    // 4. Build update object
    const dbUpdate = {};

    if (updateData.firstName || updateData.lastName) {
      const firstName = updateData.firstName || splitFullName(existingUser.user_full_name).firstName;
      const lastName = updateData.lastName || splitFullName(existingUser.user_full_name).lastName;
      dbUpdate.user_full_name = combineFullName(firstName, lastName);
    }

    if (updateData.email) dbUpdate.email_id = updateData.email;
    if (updateData.mobileNumber) dbUpdate.mobile_number = updateData.mobileNumber;
    if (updateData.alternateMobile !== undefined) dbUpdate.alternet_mobile = updateData.alternateMobile;
    if (updateData.whatsappNumber !== undefined) dbUpdate.whats_app_number = updateData.whatsappNumber;
    if (updateData.fromDate) dbUpdate.from_date = updateData.fromDate;
    if (updateData.toDate !== undefined) dbUpdate.to_date = updateData.toDate;
    if (updateData.userTypeId) dbUpdate.user_type_id = updateData.userTypeId;
    if (updateData.isActive !== undefined) dbUpdate.is_active = updateData.isActive;

    // Add audit fields
    dbUpdate.updated_by = updatedBy;
    dbUpdate.updated_at = knex.fn.now();
    dbUpdate.updated_on = knex.raw('CURRENT_TIME');

    // 5. Update user
    await trx('user_master_log')
      .where('user_id', userId)
      .update(dbUpdate);

    // 6. Fetch updated user
    return getUserById(userId);
  });
};

/**
 * Deactivate user (soft delete)
 * @param {string} userId - User ID
 * @param {string} deactivatedBy - User ID of deactivator
 * @returns {Promise<boolean>} - Success status
 */
const deactivateUser = async (userId, deactivatedBy) => {
  return knex.transaction(async (trx) => {
    const user = await trx('user_master_log')
      .where('user_id', userId)
      .where('status', 'ACTIVE')
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    await trx('user_master_log')
      .where('user_id', userId)
      .update({
        is_active: false,
        status: 'INACTIVE',
        updated_by: deactivatedBy,
        updated_at: knex.fn.now(),
        updated_on: knex.raw('CURRENT_TIME')
      });

    return true;
  });
};

/**
 * Force password change (for first-time login or password reset)
 * @param {string} userId - User ID
 * @param {string} newPassword - New plain text password
 * @returns {Promise<boolean>} - Success status
 */
const forceChangePassword = async (userId, newPassword) => {
  return knex.transaction(async (trx) => {
    const user = await trx('user_master_log')
      .where('user_id', userId)
      .where('status', 'ACTIVE')
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await hashPassword(newPassword);

    await trx('user_master_log')
      .where('user_id', userId)
      .update({
        password: hashedPassword,
        password_type: 'actual', // Mark as user-set password
        updated_at: knex.fn.now(),
        updated_on: knex.raw('CURRENT_TIME')
      });

    return true;
  });
};

/**
 * Assign role to user
 * @param {string} userId - User ID
 * @param {Object} roleData - { roleName, warehouseId }
 * @param {string} createdBy - User ID of assigner
 * @returns {Promise<Object>} - Created role mapping
 */
const assignRole = async (userId, roleData, createdBy) => {
  return knex.transaction(async (trx) => {
    // Validate user exists
    const user = await trx('user_master_log')
      .where('user_id', userId)
      .where('status', 'ACTIVE')
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Validate warehouse exists (if warehouseId provided)
    if (roleData.warehouseId) {
      const warehouse = await trx('warehouse_basic_information')
        .where('warehouse_id', roleData.warehouseId)
        .where('status', 'ACTIVE')
        .first();

      if (!warehouse) {
        throw new Error('Warehouse not found');
      }
    }

    // Check if mapping already exists
    const existing = await trx('user_role_header')
      .where('user_id', userId)
      .where('role', roleData.roleName)
      .where('warehouse_id', roleData.warehouseId || null)
      .where('status', 'ACTIVE')
      .first();

    if (existing) {
      throw new Error('Role mapping already exists');
    }

    // Insert role mapping
    const [mappingId] = await trx('user_role_header').insert({
      user_id: userId,
      role: roleData.roleName,
      warehouse_id: roleData.warehouseId || null,
      is_active: true,
      status: 'ACTIVE',
      created_by: createdBy
    });

    // Fetch created mapping
    const createdMapping = await trx('user_role_header')
      .where('user_role_id', mappingId)
      .first();

    return createdMapping;
  });
};

/**
 * Get user roles
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of role mappings with warehouse info
 */
const getUserRoles = async (userId) => {
  const roles = await knex('user_role_header as urh')
    .leftJoin('warehouse_basic_information as w', 'urh.warehouse_id', 'w.warehouse_id')
    .select([
      'urh.user_role_id',
      'urh.user_id',
      'urh.role',
      'urh.warehouse_id',
      'w.warehouse_name',
      'urh.is_active',
      'urh.status',
      'urh.created_at'
    ])
    .where('urh.user_id', userId)
    .where('urh.status', 'ACTIVE');

  return roles;
};

/**
 * Remove role mapping
 * @param {string} userId - User ID
 * @param {number} roleId - User role ID (user_role_id)
 * @param {string} deletedBy - User ID of deleter
 * @returns {Promise<boolean>} - Success status
 */
const removeRole = async (userId, roleId, deletedBy) => {
  return knex.transaction(async (trx) => {
    const mapping = await trx('user_role_header')
      .where('user_role_id', roleId)
      .where('user_id', userId)
      .where('status', 'ACTIVE')
      .first();

    if (!mapping) {
      throw new Error('Role mapping not found');
    }

    // Soft delete the mapping
    await trx('user_role_header')
      .where('user_role_id', roleId)
      .update({
        is_active: false,
        status: 'INACTIVE',
        updated_by: deletedBy,
        updated_at: knex.fn.now(),
        updated_on: knex.raw('CURRENT_TIME')
      });

    return true;
  });
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deactivateUser,
  forceChangePassword,
  assignRole,
  getUserRoles,
  removeRole,
  generateUserId
};
