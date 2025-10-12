const express = require("express");
const router = express.Router();
const knex = require("knex")(require("../knexfile").development);

// Get all users with their roles and addresses
router.get("/", async (req, res) => {
  try {
    const users = await knex("user_master as u")
      .leftJoin("user_role_hdr as ur", "u.user_id", "ur.user_id")
      .leftJoin("tms_address as a", "u.user_id", "a.user_reference_id")
      .select([
        "u.user_unique_id",
        "u.user_id",
        "u.user_type",
        "u.user_full_name",
        "u.email_id",
        "u.mobile_number",
        "u.is_active",
        "ur.role",
        "ur.warehouse_id",
        "a.city",
        "a.state",
        "a.country"
      ])
      .where("u.status", "ACTIVE");

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message
    });
  }
});

// Get user by ID with complete details
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user basic information
    const user = await knex("user_master")
      .where("user_id", userId)
      .andWhere("status", "ACTIVE")
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get user roles
    const roles = await knex("user_role_hdr")
      .where("user_id", userId)
      .andWhere("status", "ACTIVE");

    // Get user addresses
    const addresses = await knex("tms_address")
      .where("user_reference_id", userId)
      .andWhere("status", "ACTIVE");

    // Get user application access
    const appAccess = await knex("user_application_access as uaa")
      .join("user_role_hdr as ur", "uaa.user_role_id", "ur.user_role_hdr_id")
      .select("uaa.*")
      .where("ur.user_id", userId)
      .andWhere("uaa.status", "ACTIVE");

    res.json({
      success: true,
      data: {
        user,
        roles,
        addresses,
        appAccess
      }
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: error.message
    });
  }
});

// Get approval workflow status
router.get("/:userId/approvals", async (req, res) => {
  try {
    const { userId } = req.params;

    const approvals = await knex("approval_flow_trans as aft")
      .join("approval_configuration as ac", "aft.approval_config_id", "ac.approval_config_id")
      .select([
        "aft.*",
        "ac.approval_type",
        "ac.role as approver_role"
      ])
      .where("aft.user_id_reference_id", userId)
      .orWhere("aft.pending_with_id", userId)
      .orWhere("aft.actioned_by_id", userId)
      .andWhere("aft.status", "ACTIVE")
      .orderBy("aft.created_at", "desc");

    res.json({
      success: true,
      data: approvals,
      count: approvals.length
    });
  } catch (error) {
    console.error("Error fetching approval details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching approval details",
      error: error.message
    });
  }
});

module.exports = router;