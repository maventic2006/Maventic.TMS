const userService = require('./user.service');

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Protected (/* ADAPT: Check with auth middleware */

const createUser = async (req, res) => {
  try {
    console.log('\n📝 ===== CREATE USER REQUEST =====');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    // Get creator user ID from authenticated user
    const createdBy = req.user?.user_id || 'SYSTEM';
    const plainPassword = req.body.password; // Store plain password for response

    // Create user
    const user = await userService.createUser(req.body, createdBy);

    console.log('✅ User created successfully:', user.user_id);

    // Return success with initial password
    // NOTE: Sending plain password in response is temporary for demonstration
    // In production, send password via email or secure channel
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        userId: user.user_id,
        userTypeId: user.user_type_id,
        fullName: user.user_full_name,
        email: user.email_id,
        mobileNumber: user.mobile_number,
        alternateMobile: user.alternet_mobile,
        whatsappNumber: user.whats_app_number,
        fromDate: user.from_date,
        toDate: user.to_date,
        isActive: user.is_active,
        status: user.status,
        passwordType: user.password_type,
        createdAt: user.created_at
      },
      initialPassword: plainPassword // /* ADAPT: Replace with email notification in production */
    });
  } catch (error) {
    console.error('❌ Create user error:', error.message);

    // Handle field-specific validation errors
    if (error.field) {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: {
          field: error.field,
          details: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: {
        details: error.message
      }
    });
  }
};

/**
 * @route GET /api/users
 * @desc Get paginated list of users
 * @access Protected
 */
const listUsers = async (req, res) => {
  try {
    console.log('\n📋 ===== LIST USERS REQUEST =====');
    console.log('Query params:', req.query);

    const filters = {
      isActive: req.query.isActive !== undefined ? req.query.isActive === '1' || req.query.isActive === 'true' : undefined,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      search: req.query.search || null
    };

    const result = await userService.listUsers(filters);

    console.log(`✅ Retrieved ${result.users.length} users (page ${result.page}/${result.totalPages})`);

    res.json({
      success: true,
      data: result.users.map(user => ({
        userId: user.user_id,
        userTypeId: user.user_type_id,
        userType: user.user_type,
        fullName: user.user_full_name,
        email: user.email_id,
        mobileNumber: user.mobile_number,
        alternateMobile: user.alternet_mobile,
        whatsappNumber: user.whats_app_number,
        fromDate: user.from_date,
        toDate: user.to_date,
        isActive: user.is_active,
        status: user.status,
        passwordType: user.password_type,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      })),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error('❌ List users error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: {
        details: error.message
      }
    });
  }
};

/**
 * @route GET /api/users/:userId
 * @desc Get user by ID
 * @access Protected
 */
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`\n🔍 ===== GET USER BY ID: ${userId} =====`);

    const user = await userService.getUserById(userId);

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User retrieved successfully');

    res.json({
      success: true,
      data: {
        userId: user.user_id,
        userTypeId: user.user_type_id,
        userType: user.user_type,
        fullName: user.user_full_name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email_id,
        mobileNumber: user.mobile_number,
        alternateMobile: user.alternet_mobile,
        whatsappNumber: user.whats_app_number,
        fromDate: user.from_date,
        toDate: user.to_date,
        isActive: user.is_active,
        status: user.status,
        passwordType: user.password_type,
        consignorId: user.consignor_id,
        approvalCycle: user.approval_cycle,
        createdAt: user.created_at,
        createdBy: user.created_by,
        updatedAt: user.updated_at,
        updatedBy: user.updated_by
      }
    });
  } catch (error) {
    console.error('❌ Get user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: {
        details: error.message
      }
    });
  }
};

/**
 * @route PUT /api/users/:userId
 * @desc Update user
 * @access Protected
 */
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`\n✏️ ===== UPDATE USER: ${userId} =====`);
    console.log('Update data:', JSON.stringify(req.body, null, 2));

    const updatedBy = req.user?.user_id || 'SYSTEM';

    const user = await userService.updateUser(userId, req.body, updatedBy);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User updated successfully');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        userId: user.user_id,
        userTypeId: user.user_type_id,
        userType: user.user_type,
        fullName: user.user_full_name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email_id,
        mobileNumber: user.mobile_number,
        alternateMobile: user.alternet_mobile,
        whatsappNumber: user.whats_app_number,
        fromDate: user.from_date,
        toDate: user.to_date,
        isActive: user.is_active,
        status: user.status,
        updatedAt: user.updated_at
      }
    });
  } catch (error) {
    console.error('❌ Update user error:', error.message);

    if (error.field) {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: {
          field: error.field,
          details: error.message
        }
      });
    }

    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: {
        details: error.message
      }
    });
  }
};

/**
 * @route PATCH /api/users/:userId/deactivate
 * @desc Deactivate user (soft delete)
 * @access Protected
 */
const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`\n🚫 ===== DEACTIVATE USER: ${userId} =====`);

    const deactivatedBy = req.user?.user_id || 'SYSTEM';

    await userService.deactivateUser(userId, deactivatedBy);

    console.log('✅ User deactivated successfully');

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('❌ Deactivate user error:', error.message);

    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: {
        details: error.message
      }
    });
  }
};

/**
 * @route POST /api/users/:userId/force-change-password
 * @desc Force password change (for first-time login)
 * @access Protected
 */
const forceChangePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    console.log(`\n🔐 ===== FORCE CHANGE PASSWORD: ${userId} =====`);

    await userService.forceChangePassword(userId, newPassword);

    console.log('✅ Password changed successfully');

    res.json({
      success: true,
      message: 'Password updated successfully',
      passwordType: 'actual'
    });
  } catch (error) {
    console.error('❌ Force change password error:', error.message);

    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    // Handle password validation errors
    if (error.message.includes('Password must')) {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: {
          field: 'newPassword',
          details: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: {
        details: error.message
      }
    });
  }
};

/**
 * @route POST /api/users/:userId/roles
 * @desc Assign role(s) to user
 * @access Protected
 */
const assignRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`\n👤 ===== ASSIGN ROLES: ${userId} =====`);
    console.log('Role data:', JSON.stringify(req.body, null, 2));

    const createdBy = req.user?.user_id || 'SYSTEM';

    // Handle both single role object and array of roles
    const rolesData = Array.isArray(req.body) ? req.body : [req.body];

    const createdMappings = [];
    const errors = [];

    for (const roleData of rolesData) {
      try {
        const mapping = await userService.assignRole(
          userId,
          {
            roleName: roleData.roleName || roleData.roleId,
            warehouseId: roleData.warehouseId
          },
          createdBy
        );
        createdMappings.push(mapping);
      } catch (error) {
        errors.push({
          role: roleData.roleName || roleData.roleId,
          error: error.message
        });
      }
    }

    if (errors.length > 0 && createdMappings.length === 0) {
      // All assignments failed
      return res.status(400).json({
        success: false,
        message: 'Failed to assign roles',
        errors
      });
    }

    console.log(`✅ Assigned ${createdMappings.length} roles successfully`);

    res.status(201).json({
      success: true,
      message: `Successfully assigned ${createdMappings.length} role(s)`,
      data: createdMappings,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('❌ Assign roles error:', error.message);

    if (error.message === 'User not found' || error.message === 'Warehouse not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error assigning roles',
      error: {
        details: error.message
      }
    });
  }
};

/**
 * @route GET /api/users/:userId/roles
 * @desc Get user roles
 * @access Protected
 */
const getUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`\n📜 ===== GET USER ROLES: ${userId} =====`);

    const roles = await userService.getUserRoles(userId);

    console.log(`✅ Retrieved ${roles.length} roles`);

    res.json({
      success: true,
      data: roles.map(role => ({
        userRoleId: role.user_role_id,
        userId: role.user_id,
        role: role.role,
        warehouseId: role.warehouse_id,
        warehouseName: role.warehouse_name,
        isActive: role.is_active,
        status: role.status,
        createdAt: role.created_at
      })),
      count: roles.length
    });
  } catch (error) {
    console.error('❌ Get user roles error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching user roles',
      error: {
        details: error.message
      }
    });
  }
};

/**
 * @route DELETE /api/users/:userId/roles/:roleId
 * @desc Remove role mapping
 * @access Protected
 */
const removeRole = async (req, res) => {
  try {
    const { userId, roleId } = req.params;
    console.log(`\n🗑️ ===== REMOVE ROLE: ${userId}, Role ID: ${roleId} =====`);

    const deletedBy = req.user?.user_id || 'SYSTEM';

    await userService.removeRole(userId, parseInt(roleId), deletedBy);

    console.log('✅ Role removed successfully');

    res.json({
      success: true,
      message: 'Role removed successfully'
    });
  } catch (error) {
    console.error('❌ Remove role error:', error.message);

    if (error.message === 'Role mapping not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error removing role',
      error: {
        details: error.message
      }
    });
  }
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deactivateUser,
  forceChangePassword,
  assignRoles,
  getUserRoles,
  removeRole
};
