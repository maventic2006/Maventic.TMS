const bcrypt = require("bcrypt");
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

      // console.log("User fetched for login:", user);

    //    let isPasswordValid = false;
    // try {
    //   isPasswordValid = await bcrypt.compare(password, user.password);
    // } catch (error) {
    //   console.error("Password comparison error:", error);
    //   isPasswordValid = false;
      
    // }
    // console.log("Password validation result:", isPasswordValid);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID or password",
      });
    }

    console.log("Stored password in DB:", user.password);
console.log("Length:", user.password?.length);

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
    let userRole = "admin"; // Default to admin for development/testing
    if (
      user.user_id === "admin" ||
      user.user_id.toLowerCase().includes("admin")
    ) {
      userRole = "admin";
    } else if (user.user_type_id === "UT002") {
      userRole = "manager";
    } else if (user.user_id.toLowerCase().includes("test")) {
      userRole = "admin"; // Give test users admin access for development
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

    // Check if password reset is required (initial password)
    const requirePasswordReset =
      user.password_type === "initial" || !user.password_type;

    // Only generate and send token if using actual password (not initial)
    if (!requirePasswordReset) {
      // Set JWT token in HTTP-only cookie (expires when browser closes)
      const isProduction = process.env.NODE_ENV === "production";

      // Get the origin from the request to set cookie domain properly
      const origin = req.get("origin") || "";
      const isDifferentOrigin =
        origin &&
        !origin.includes("localhost") &&
        !origin.includes("127.0.0.1");

      const cookieOptions = {
        httpOnly: true,
        secure: false, // Set to false for now - can be enabled when HTTPS is available
        sameSite: "lax", // "lax" allows cookies in cross-origin GET requests (better compatibility)
        path: "/", // Ensure cookie is available for all paths
        // No maxAge - cookie expires when browser closes (session cookie)
      };

      // If production AND using HTTPS, enable secure flag
      if (isProduction && origin.startsWith("https://")) {
        cookieOptions.secure = true;
      }

      console.log("🍪 Setting authentication cookie with options:", {
        ...cookieOptions,
        token: token.substring(0, 20) + "...", // Log only first 20 chars for security
        isProduction,
        NODE_ENV: process.env.NODE_ENV,
        origin,
        isDifferentOrigin,
      });

      res.cookie("authToken", token, cookieOptions);

      console.log("✅ Authentication cookie set successfully");
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
      token: requirePasswordReset ? null : token, // Only return token if not requiring reset
      requirePasswordReset: requirePasswordReset,
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
      email_id: user.email_id || "",
      mobile_number: user.mobile_number || "",
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
 * Get User Types from Database
 */
const getUserTypes = async (req, res) => {
  try {
    const userTypes = await knex("user_type_master")
      .select("user_type_id", "user_type_name", "user_type_description")
      .where({ status: "ACTIVE" });

    res.json({
      success: true,
      userTypes: userTypes,
    });
  } catch (error) {
    console.error("Get user types error:", error);
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
  console.log("🚪 Logout request received");

  // Clear the auth token cookie with same options as when set
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: false, // Match login cookie settings
    sameSite: "lax", // Changed from "strict" to "lax" to match login cookie
    path: "/", // Ensure cookie is cleared from all paths
  });

  console.log("✅ Authentication cookie cleared successfully");

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * Refresh Token Controller
 * Generates a new JWT token for authenticated users to extend their session
 */
const refreshToken = async (req, res) => {
  try {
    // User is already authenticated via authenticateToken middleware
    const { user_id, user_type_id, user_full_name, role } = req.user;

    // Verify user still exists and is active
    const user = await knex("user_master")
      .where({ user_id: user_id })
      .andWhere({ status: "ACTIVE" })
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    // Generate new JWT token with extended expiry
    const newToken = jwt.sign(
      {
        user_id: user.user_id,
        user_type_id: user.user_type_id,
        user_full_name: user.user_full_name,
        role: role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Update cookie with new token
    const isProduction = process.env.NODE_ENV === "production";
    const origin = req.get("origin") || "";

    const cookieOptions = {
      httpOnly: true,
      secure: false, // Match login cookie settings
      sameSite: "lax", // Changed from "strict" to "lax" for better compatibility
      path: "/",
    };

    // If production AND using HTTPS, enable secure flag
    if (isProduction && origin.startsWith("https://")) {
      cookieOptions.secure = true;
    }

    console.log("🔄 Refreshing authentication cookie");
    res.cookie("authToken", newToken, cookieOptions);
    console.log("✅ Authentication cookie refreshed successfully");

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh token",
    });
  }
};

module.exports = {
  login,
  resetPassword,
  verifyToken,
  getUserTypes,
  getUserApplications,
  logout,
  refreshToken,
};
