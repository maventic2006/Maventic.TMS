const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const knex = require("knex")(require("../knexfile").development);

// JWT Secret
const JWT_SECRET =
  process.env.JWT_SECRET || "tms-secret-key-change-in-production";

/**
 * User Login Controller
 */
const login = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    // Validate input
    if (!user_id || !password) {
      return res.status(400).json({
        success: false,
        message: "User ID and password are required",
      });
    }

    // Find user in database
    const user = await knex("user_master")
      .where({ user_id: user_id })
      .andWhere({ status: "ACTIVE" })
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID or password",
      });
    }

    // Validate password using bcrypt
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error("Password comparison error:", error);
      isPasswordValid = false;
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID or password",
      });
    }

    // Determine user role based on user_id or user_type
    let userRole = 'admin'; // Default to admin for development/testing
    if (user.user_id === 'admin' || user.user_id.toLowerCase().includes('admin')) {
      userRole = 'admin';
    } else if (user.user_type_id === 'UT002') {
      userRole = 'manager';
    } else if (user.user_id.toLowerCase().includes('test')) {
      userRole = 'admin'; // Give test users admin access for development
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_type_id: user.user_type_id,
        user_full_name: user.user_full_name,
        role: userRole,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword,
      requirePasswordReset:
        user.password_type === "initial" || !user.password_type,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Reset Password Controller
 */
const resetPassword = async (req, res) => {
  try {
    const { user_id, newPassword } = req.body;

    // Validate input
    if (!user_id || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "User ID and new password are required",
      });
    }

    // Validate password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)",
      });
    }

    // Find user
    const user = await knex("user_master")
      .where({ user_id: user_id })
      .andWhere({ status: "ACTIVE" })
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and password_type
    await knex("user_master").where({ user_id: user_id }).update({
      password: hashedPassword,
      password_type: "actual",
      updated_at: new Date(),
      updated_by: user_id,
    });

    // Log the password change
    await knex("user_master_log").insert({
      user_id: user.user_id,
      user_type_id: user.user_type_id,
      user_full_name: user.user_full_name,
      email_id: user.email_id || '',
      mobile_number: user.mobile_number || '',
      alternet_mobile: user.alternet_mobile || null,
      whats_app_number: user.whats_app_number || null,
      from_date: user.from_date || new Date(),
      to_date: user.to_date || null,
      is_active: user.is_active || 1,
      created_by_user_id: user.created_by_user_id || null,
      consignor_id: user.consignor_id || null,
      approval_cycle: user.approval_cycle || null,
      password: hashedPassword,
      password_type: "actual",
      created_at: new Date(),
      created_by: user_id,
      status: "ACTIVE",
    });

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Verify Token Controller
 */
const verifyToken = async (req, res) => {
  try {
    const { user_id } = req.user;

    // Fetch full user data from database
    const user = await knex("user_master")
      .where({ user_id: user_id })
      .andWhere({ status: "ACTIVE" })
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get User Applications Controller
 */
const getUserApplications = async (req, res) => {
  try {
    const { user_id } = req.user;

    // Get user applications based on their access
    const applications = await knex("user_application_access as uaa")
      .join(
        "application_master as am",
        "uaa.application_id",
        "am.application_id"
      )
      .where("uaa.user_role_id", user_id)
      .andWhere("uaa.is_active", true)
      .andWhere("uaa.status", "ACTIVE")
      .andWhere("am.is_active", true)
      .andWhere("am.status", "ACTIVE")
      .andWhere("uaa.valid_from", "<=", new Date())
      .andWhere("uaa.valid_to", ">=", new Date())
      .select(
        "am.application_id",
        "am.application_name",
        "am.application_description",
        "am.application_url",
        "am.application_icon",
        "am.application_category",
        "am.display_order",
        "uaa.access_control"
      )
      .orderBy(["am.application_category", "am.display_order"]);

    // Group applications by category
    const groupedApplications = applications.reduce((groups, app) => {
      const category = app.application_category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(app);
      return groups;
    }, {});

    res.json({
      success: true,
      applications: groupedApplications,
      totalApplications: applications.length,
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Logout Controller
 */
const logout = (req, res) => {
  // In a production app, you might want to blacklist the token
  // For now, we'll just send a success response
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = {
  login,
  resetPassword,
  verifyToken,
  getUserApplications,
  logout,
};
