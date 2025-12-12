const knex = require("../config/database");
const { hashPassword, validatePasswordPolicy } = require('../utils/passwordUtil');
const { getUserApplicationRoleColumn } = require('../utils/dbHelpers');

// Helper function to generate unique user IDs
const generateUserId = async () => {
  const result = await knex("user_master").count("* as count").first();
  const count = parseInt(result.count) + 1;
  return `USR${count.toString().padStart(4, "0")}`;
};

// Helper function to generate unique user role header IDs
const generateUserRoleHdrId = async () => {
  const result = await knex("user_role_hdr").count("* as count").first();
  const count = parseInt(result.count) + 1;
  return `UROLE${count.toString().padStart(4, "0")}`;
};

// Helper function to generate unique application access IDs
const generateAppAccessId = async () => {
  const result = await knex("user_application_access")
    .count("* as count")
    .first();
  const count = parseInt(result.count) + 1;
  return `UAPP${count.toString().padStart(4, "0")}`;
};

// Helper function to format date from dd-mm-yyyy to yyyy-mm-dd
const formatDateForDB = (dateString) => {
  if (!dateString) return null;
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
};

// Helper function to format date from yyyy-mm-dd to dd-mm-yyyy
const formatDateForResponse = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Get all users with pagination and filtering
 * GET /api/users?page=1&size=10&search=&userType=&status=
 */
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      size = 10,
      search = "",
      userType = "",
      // Default to active users when no explicit status filter is provided
      status = "Active",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(size);
    const limit = parseInt(size);

    // Build query with filters
    let query = knex("user_master").select("*");

    // Search filter (name, email, mobile, user_id)
    if (search) {
      query = query.where(function () {
        this.where("user_full_name", "like", `%${search}%`)
          .orWhere("email_id", "like", `%${search}%`)
          .orWhere("mobile_number", "like", `%${search}%`)
          .orWhere("user_id", "like", `%${search}%`);
      });
    }

    // User type filter
    if (userType) {
      query = query.where("user_type", userType);
    }

    // Status filter - default is 'active' and compare case-insensitively
    if (status) {
      const statusLower = String(status).toLowerCase();
      if (statusLower === "active") {
        query = query.where("is_active", true);
      } else if (statusLower === "inactive") {
        query = query.where("is_active", false);
      }
    }

    // Get total count
    const countQuery = query.clone().clearSelect().clearOrder().count("* as total");
    const totalResult = await countQuery.first();
    const total = parseInt(totalResult.total);

    // Get paginated results
    const users = await query
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset);

    // Format dates for response
    const formattedUsers = users.map((user) => ({
      id: user.user_id,
      userId: user.user_id,
      userType: user.user_type,
      firstName: user.user_full_name?.split(" ")[0] || "",
      lastName: user.user_full_name?.split(" ").slice(1).join(" ") || "",
      fullName: user.user_full_name,
      email: user.email_id,
      mobile: user.mobile_number,
      alternateMobile: user.alternate_mobile,
      whatsapp: user.whatsapp_number,
      fromDate: formatDateForResponse(user.from_date),
      toDate: formatDateForResponse(user.to_date),
      active: user.is_active,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers,
      total,
      page: parseInt(page),
      size: parseInt(size),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

/**
 * Get a single user by ID
 * GET /api/users/:id
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await knex("user_master").where("user_id", id).first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Format response
    const formattedUser = {
      id: user.user_id,
      userId: user.user_id,
      userType: user.user_type,
      firstName: user.user_full_name?.split(" ")[0] || "",
      lastName: user.user_full_name?.split(" ").slice(1).join(" ") || "",
      fullName: user.user_full_name,
      email: user.email_id,
      mobile: user.mobile_number,
      alternateMobile: user.alternate_mobile,
      whatsapp: user.whatsapp_number,
      fromDate: formatDateForResponse(user.from_date),
      toDate: formatDateForResponse(user.to_date),
      active: user.is_active,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    res.status(200).json({
      success: true,
      data: formattedUser,
    });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

/**
 * Create a new user
 * POST /api/users
 */
exports.createUser = async (req, res) => {
  const trx = await knex.transaction();

  try {
    const {
      userType,
      firstName,
      lastName,
      email,
      mobile,
      alternateMobile,
      whatsapp,
      fromDate,
      toDate,
      active = true,
      password,
    } = req.body;

    // Validation
    if (!userType || !firstName || !lastName || !email || !mobile) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        errors: {
          userType: !userType ? "User type is required" : undefined,
          firstName: !firstName ? "First name is required" : undefined,
          lastName: !lastName ? "Last name is required" : undefined,
          email: !email ? "Email is required" : undefined,
          mobile: !mobile ? "Mobile number is required" : undefined,
        },
      });
    }

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        errors: { email: "Please provide a valid email address" },
      });
    }

    // Mobile number validation (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
        errors: { mobile: "Mobile number must be 10 digits" },
      });
    }

    // Check for duplicate email
    const existingEmail = await trx("user_master")
      .where("email_id", email)
      .first();

    if (existingEmail) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        errors: { email: "This email is already registered" },
      });
    }

    // Check for duplicate mobile
    const existingMobile = await trx("user_master")
      .where("mobile_number", mobile)
      .first();

    if (existingMobile) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Mobile number already exists",
        errors: { mobile: "This mobile number is already registered" },
      });
    }

    // Generate user ID
    const userId = await generateUserId();
    const fullName = `${firstName} ${lastName}`;

    // Validate and hash password (optional) and insert user into database
    let passwordHash = null;
    if (password) {
      const validResult = validatePasswordPolicy(password);
      if (!validResult.valid) {
        await trx.rollback();
        return res.status(400).json({ success: false, message: 'Password policy validation failed', error: validResult.message });
      }
      passwordHash = await hashPassword(password);
    }
    await trx("user_master").insert({
      user_id: userId,
      user_type: userType,
      user_full_name: fullName,
      email_id: email,
      mobile_number: mobile,
      alternate_mobile: alternateMobile || null,
      whatsapp_number: whatsapp || null,
      from_date: formatDateForDB(fromDate),
      to_date: formatDateForDB(toDate),
      is_active: active,
      status: "ACTIVE",
      password: passwordHash,
      created_by: req.user?.userId || "SYSTEM",
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      updated_by: req.user?.userId || "SYSTEM",
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
    });

    await trx.commit();

    // Fetch created user
    const createdUser = await knex("user_master")
      .where("user_id", userId)
      .first();

    const formattedUser = {
      id: createdUser.user_id,
      userId: createdUser.user_id,
      userType: createdUser.user_type,
      firstName,
      lastName,
      fullName: createdUser.user_full_name,
      email: createdUser.email_id,
      mobile: createdUser.mobile_number,
      alternateMobile: createdUser.alternate_mobile,
      whatsapp: createdUser.whatsapp_number,
      fromDate: formatDateForResponse(createdUser.from_date),
      toDate: formatDateForResponse(createdUser.to_date),
      active: createdUser.is_active,
      status: createdUser.status,
      createdAt: createdUser.created_at,
    };

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: formattedUser,
    });
  } catch (error) {
    await trx.rollback();
    console.error("❌ Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

/**
 * Update an existing user
 * PUT /api/users/:id
 */
exports.updateUser = async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { id } = req.params;
    const {
      userType,
      firstName,
      lastName,
      email,
      mobile,
      alternateMobile,
      whatsapp,
      fromDate,
      toDate,
      active,
    } = req.body;

    // Check if user exists
    const existingUser = await trx("user_master").where("user_id", id).first();

    if (!existingUser) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validation
    if (!userType || !firstName || !lastName || !email || !mobile) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        errors: {
          userType: !userType ? "User type is required" : undefined,
          firstName: !firstName ? "First name is required" : undefined,
          lastName: !lastName ? "Last name is required" : undefined,
          email: !email ? "Email is required" : undefined,
          mobile: !mobile ? "Mobile number is required" : undefined,
        },
      });
    }

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
        errors: { email: "Please provide a valid email address" },
      });
    }

    // Mobile number validation (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
        errors: { mobile: "Mobile number must be 10 digits" },
      });
    }

    // Check for duplicate email (excluding current user)
    const duplicateEmail = await trx("user_master")
      .where("email_id", email)
      .whereNot("user_id", id)
      .first();

    if (duplicateEmail) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        errors: { email: "This email is already registered" },
      });
    }

    // Check for duplicate mobile (excluding current user)
    const duplicateMobile = await trx("user_master")
      .where("mobile_number", mobile)
      .whereNot("user_id", id)
      .first();

    if (duplicateMobile) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Mobile number already exists",
        errors: { mobile: "This mobile number is already registered" },
      });
    }

    const fullName = `${firstName} ${lastName}`;

    // Update user
    await trx("user_master").where("user_id", id).update({
      user_type: userType,
      user_full_name: fullName,
      email_id: email,
      mobile_number: mobile,
      alternate_mobile: alternateMobile || null,
      whatsapp_number: whatsapp || null,
      from_date: formatDateForDB(fromDate),
      to_date: formatDateForDB(toDate),
      is_active: active !== undefined ? active : existingUser.is_active,
      updated_by: req.user?.userId || "SYSTEM",
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
    });

    await trx.commit();

    // Fetch updated user
    const updatedUser = await knex("user_master").where("user_id", id).first();

    const formattedUser = {
      id: updatedUser.user_id,
      userId: updatedUser.user_id,
      userType: updatedUser.user_type,
      firstName,
      lastName,
      fullName: updatedUser.user_full_name,
      email: updatedUser.email_id,
      mobile: updatedUser.mobile_number,
      alternateMobile: updatedUser.alternate_mobile,
      whatsapp: updatedUser.whatsapp_number,
      fromDate: formatDateForResponse(updatedUser.from_date),
      toDate: formatDateForResponse(updatedUser.to_date),
      active: updatedUser.is_active,
      status: updatedUser.status,
      updatedAt: updatedUser.updated_at,
    };

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: formattedUser,
    });
  } catch (error) {
    await trx.rollback();
    console.error("❌ Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

/**
 * Deactivate a user (soft delete)
 * PATCH /api/users/:id/deactivate
 */
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await knex("user_master")
      .where("user_id", id)
      .first();

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user status
    await knex("user_master").where("user_id", id).update({
      is_active: false,
      status: "INACTIVE",
      updated_by: req.user?.userId || "SYSTEM",
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
    });

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("❌ Error deactivating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate user",
      error: error.message,
    });
  }
};

/**
 * Add role to a user
 * POST /api/users/:id/roles
 */
exports.addUserRole = async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { id } = req.params;
    const { role, applicationId, accessControl } = req.body;

    // Validation - only role is mandatory (applicationId & accessControl are optional)
    if (!role) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        errors: {
          role: !role ? "Role is required" : undefined,
        },
      });
    }

    // Check if user exists
    const user = await trx("user_master").where("user_id", id).first();

    if (!user) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate IDs
    const userRoleHdrId = await generateUserRoleHdrId();
    const appAccessId = await generateAppAccessId();

    // Insert user role header
    await trx("user_role_hdr").insert({
      user_role_hdr_id: userRoleHdrId,
      user_id: id,
      role: role,
      status: "ACTIVE",
      created_by: req.user?.userId || "SYSTEM",
      created_at: knex.fn.now(),
      created_on: knex.fn.now(),
      updated_by: req.user?.userId || "SYSTEM",
      updated_at: knex.fn.now(),
      updated_on: knex.fn.now(),
    });
    // Optionally insert application access if provided
    if (applicationId && accessControl) {
      const userRoleCol = await getUserApplicationRoleColumn();
      const insertObj = {
        application_access_id: appAccessId,
        application_id: applicationId,
        access_control: accessControl,
        is_active: true,
        status: "ACTIVE",
        created_by: req.user?.userId || "SYSTEM",
        created_at: knex.fn.now(),
        created_on: knex.fn.now(),
        updated_by: req.user?.userId || "SYSTEM",
        updated_at: knex.fn.now(),
        updated_on: knex.fn.now(),
      };
      insertObj[userRoleCol] = userRoleHdrId;
      await trx("user_application_access").insert(insertObj);
    }

    await trx.commit();

    res.status(201).json({
      success: true,
      message: "Role added successfully",
      data: {
        userRoleHdrId,
        userId: id,
        role,
        applicationId,
        accessControl,
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error("❌ Error adding user role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add user role",
      error: error.message,
    });
  }
};

/**
 * Get user roles and permissions
 * GET /api/users/:id/roles
 */
exports.getUserRoles = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await knex("user_master").where("user_id", id).first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user roles with application access
    const userRoleCol = await getUserApplicationRoleColumn();
    const roles = await knex("user_role_hdr as urh")
      .leftJoinRaw(`user_application_access as uaa on urh.user_role_hdr_id = ??`, [
        `uaa.${userRoleCol}`,
      ])
      .where("urh.user_id", id)
      .select(
        "urh.user_role_hdr_id",
        "urh.role",
        "urh.warehouse_id",
        "urh.status as roleStatus",
        "uaa.application_id",
        "uaa.access_control",
        "uaa.is_active"
      );

    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("❌ Error fetching user roles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user roles",
      error: error.message,
    });
  }
};

/**
 * Get all applications (for dropdown in role assignment)
 * GET /api/users/applications/list
 */
exports.getApplications = async (req, res) => {
  try {
    const applications = await knex("application_master")
      .where("is_active", true)
      .where("status", "ACTIVE")
      .select(
        "application_id as id",
        "application_name as name",
        "application_description as description",
        "application_category as category"
      )
      .orderBy(["application_category", "display_order"]);

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("❌ Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

/**
 * Get user's application access
 * GET /api/users/:userId/application-access
 */
exports.getUserApplicationAccess = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user role header first
    const userRole = await knex('user_role_hdr')
      .where('user_id', userId)
      .first();

    if (!userRole) {
      return res.status(404).json({
        success: false,
        message: 'User role not found',
      });
    }

    // Determine which user_role column exists in the table
    const userRoleCol = await getUserApplicationRoleColumn();

    // Get application access with joined application details
    const applicationAccess = await knex('user_application_access as uaa')
      .leftJoin('application_master as am', 'uaa.application_id', 'am.application_id')
      .whereRaw('?? = ?', [`uaa.${userRoleCol}`, userRole.user_role_id])
      .select(
        'uaa.application_access_id as applicationAccessId',
        knex.raw('?? as userRoleId', [`uaa.${userRoleCol}`]),
        'uaa.application_id as applicationId',
        'uaa.access_control_id as accessControlId',
        'uaa.valid_from as validFrom',
        'uaa.valid_to as validTo',
        'uaa.is_active as isActive',
        'uaa.status',
        'am.application_name as applicationName',
        'am.application_description as applicationDescription',
        'am.application_category as applicationCategory'
      );

    // Format dates
    const formattedAccess = applicationAccess.map(access => ({
      ...access,
      validFrom: formatDateForResponse(access.validFrom),
      validTo: formatDateForResponse(access.validTo),
      isActive: Boolean(access.isActive)
    }));

    res.status(200).json({
      success: true,
      data: formattedAccess,
    });
  } catch (error) {
    console.error(' Error fetching user application access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user application access',
      error: error.message,
    });
  }
};

/**
 * Get master roles from user_role_master
 * GET /api/users/roles/master
 */
exports.getUserRoleMaster = async (req, res) => {
  try {
    const roles = await knex('user_role_master')
      .where('status', 'ACTIVE')
      .select('role_id', 'role')
      .orderBy('role');

    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error('❌ Error fetching master roles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch master roles',
      error: error.message,
    });
  }
};

/**
 * Get all available applications
 * GET /api/users/applications
 */
exports.getAvailableApplications = async (req, res) => {
  try {
    const applications = await knex('application_master')
      .where('is_active', true)
      .where('status', 'ACTIVE')
      .select(
        'application_id',
        'application_name',
        'application_description',
        'application_category',
        'application_icon',
        'display_order'
      )
      .orderBy(['display_order', 'application_name']);

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error(' Error fetching available applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available applications',
      error: error.message,
    });
  }
};

/**
 * Grant application access to user
 * POST /api/users/:userId/application-access
 */
exports.grantApplicationAccess = async (req, res) => {
  try {
    const { userId } = req.params;
    const { applicationId, accessControlId, validFrom, validTo } = req.body;

    // Validation
    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Application ID is required',
      });
    }

    // Get user role header
    const userRole = await knex('user_role_hdr')
      .where('user_id', userId)
      .first();

    if (!userRole) {
      return res.status(404).json({
        success: false,
        message: 'User role not found. Please assign a role first.',
      });
    }

    // Get user row and verify user status
    const userRow = await knex('user_master').where('user_id', userId).first();
    if (!userRow) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If user is not active or status is not ACTIVE, prevent granting
    if (!userRow.is_active || String(userRow.status || '').toUpperCase() !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Cannot grant application access: user is not active',
      });
    }

    // Determine default validity dates
    const defaultValidFrom = validFrom || new Date().toISOString().split('T')[0];
    const defaultValidTo = validTo || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Determine column name to reference user role in `user_application_access`
    const userRoleCol = await getUserApplicationRoleColumn();

    // Check if access already exists (match by user_role_hdr_id stored in user_application_access[userRoleCol])
    const existingAccess = await knex('user_application_access')
      .where(userRoleCol, userRole.user_role_id)
      .where('application_id', applicationId)
      .first();

    if (existingAccess) {
      // If an active access already exists, conflict
      if (existingAccess.is_active) {
        return res.status(409).json({
          success: false,
          message: 'User already has access to this application',
        });
      }
      // If access exists but is inactive (revoked), update it and reactivate
      await knex('user_application_access')
        .where('application_access_id', existingAccess.application_access_id)
        .update({
          access_control: accessControlId || 'AC_DEFAULT',
          valid_from: defaultValidFrom,
          valid_to: defaultValidTo,
          is_active: true,
          updated_at: knex.fn.now(),
          updated_on: knex.raw('CURRENT_TIME'),
          updated_by: req.user?.userId || 'SYSTEM',
          status: 'ACTIVE',
        });

      return res.status(200).json({
        success: true,
        message: 'Application access re-enabled for user',
        data: { applicationAccessId: existingAccess.application_access_id },
      });
    }

    // Generate application access ID
    const applicationAccessId = await generateAppAccessId();

    // Default validity dates (already computed earlier in function)

    // Insert application access
    const insertObj = {
      application_access_id: applicationAccessId,
      application_id: applicationId,
      access_control_id: accessControlId || 'AC_DEFAULT',
      valid_from: defaultValidFrom,
      valid_to: defaultValidTo,
      is_active: true,
      created_at: knex.fn.now(),
      created_on: knex.raw('CURRENT_TIME'),
      created_by: req.user?.userId || 'SYSTEM',
      updated_at: knex.fn.now(),
      updated_on: knex.raw('CURRENT_TIME'),
      updated_by: req.user?.userId || 'SYSTEM',
      status: 'ACTIVE',
    };
    insertObj[userRoleCol] = userRole.user_role_id;

    await knex('user_application_access').insert(insertObj);

    res.status(201).json({
      success: true,
      message: 'Application access granted successfully',
      data: { applicationAccessId },
    });
  } catch (error) {
    console.error(' Error granting application access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to grant application access',
      error: error.message,
    });
  }
};

/**
 * Revoke application access from user
 * DELETE /api/users/application-access/:accessId
 */
exports.revokeApplicationAccess = async (req, res) => {
  try {
    const { accessId } = req.params;

    // Check if access exists
    const existingAccess = await knex('user_application_access')
      .where('application_access_id', accessId)
      .first();

    if (!existingAccess) {
      return res.status(404).json({
        success: false,
        message: 'Application access not found',
      });
    }

    // Permanent delete - remove the access record entirely
    await knex('user_application_access')
      .where('application_access_id', accessId)
      .del();

    res.status(200).json({
      success: true,
      message: 'Application access revoked successfully',
    });
  } catch (error) {
    console.error(' Error revoking application access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke application access',
      error: error.message,
    });
  }
};
