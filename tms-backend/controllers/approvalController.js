const knex = require("../config/database");

/**
 * Get Approval Configuration by Approval Type ID
 * @route GET /api/approval/config/:approvalTypeId
 */
const getApprovalConfiguration = async (req, res) => {
  try {
    const { approvalTypeId } = req.params;

    const config = await knex("approval_configuration")
      .where("approval_type_id", approvalTypeId)
      .select("*");

    if (!config || config.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Approval configuration not found for this approval type",
      });
    }

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error fetching approval configuration:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching approval configuration",
      error: error.message,
    });
  }
};

/**
 * Get Pending Approvals for Current User
 * @route GET /api/approval/pending
 */
const getPendingApprovals = async (req, res) => {
  try {
    const userId = req.user.user_id; // From JWT token
    const roleId = req.user.role_id; // From JWT token (if available)

    console.log(
      `Fetching pending approvals for user: ${userId}, role: ${roleId}`
    );

    // Get pending approval flow items where current user is the approver
    const pendingApprovals = await knex("approval_flow_trans as aft")
      .leftJoin("user_master as um", "aft.user_id_reference_id", "um.user_id")
      .leftJoin(
        "approval_type_master as atm",
        "aft.approval_type_id",
        "atm.approval_type_id"
      )
      .leftJoin("transporter_general_info as tgi", function () {
        this.on(knex.raw("um.user_id LIKE 'TA%'")).andOn(
          knex.raw("LENGTH(um.user_id) = 6")
        );
      })
      .where("aft.pending_with_user_id", userId)
      .where("aft.s_status", "PENDING")
      .select(
        "aft.approval_flow_trans_id",
        "aft.user_id_reference_id as user_id",
        "aft.approval_type_id",
        "aft.s_status as approval_status",
        "aft.approver_level",
        "aft.pending_with_role_id",
        "aft.pending_with_user_id",
        "aft.pending_with_name",
        "aft.created_by_user_id",
        "aft.created_by_name",
        "aft.created_at",
        "um.email_id as user_email",
        "um.mobile_number as user_mobile",
        "um.user_type_id",
        "atm.approval_type as approval_category",
        "atm.approval_name",
        "tgi.business_name as transporter_business_name",
        "tgi.transporter_id"
      )
      .orderBy("aft.created_at", "desc");

    return res.status(200).json({
      success: true,
      count: pendingApprovals.length,
      data: pendingApprovals,
    });
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching pending approvals",
      error: error.message,
    });
  }
};

/**
 * Get Approval History for a Specific User
 * @route GET /api/approval/history/:userId
 */
const getApprovalHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const approvalHistory = await knex("approval_flow_trans as aft")
      .leftJoin(
        "approval_type_master as atm",
        "aft.approval_type_id",
        "atm.approval_type_id"
      )
      .where("aft.user_id_reference_id", userId)
      .select(
        "aft.*",
        "atm.approval_type as approval_category",
        "atm.approval_name"
      )
      .orderBy("aft.created_at", "desc");

    return res.status(200).json({
      success: true,
      count: approvalHistory.length,
      data: approvalHistory,
    });
  } catch (error) {
    console.error("Error fetching approval history:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching approval history",
      error: error.message,
    });
  }
};

/**
 * Approve User - Changes status to Active
 * @route POST /api/approval/approve/:userId
 */
const approveUser = async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { userId } = req.params;
    const { remarks } = req.body;
    const approverId = req.user.user_id; // From JWT token
    const approverName = req.user.name || req.user.user_id; // From JWT token

    console.log(`Approving user: ${userId} by approver: ${approverId}`);

    // 1. Check if user exists
    const user = await trx("user_master").where("user_id", userId).first();
    if (!user) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Get pending approval flow entry for this user
    const approvalFlow = await trx("approval_flow_trans")
      .where("user_id_reference_id", userId)
      .where("s_status", "PENDING")
      .where("pending_with_user_id", approverId)
      .first();

    if (!approvalFlow) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message:
          "No pending approval found for this user, or you are not the assigned approver",
      });
    }

    // 3. Prevent self-approval
    if (approvalFlow.created_by_user_id === approverId) {
      await trx.rollback();
      return res.status(403).json({
        success: false,
        message: "You cannot approve your own creation",
      });
    }

    // 4. Update approval_flow_trans - Mark as Approved
    await trx("approval_flow_trans")
      .where("approval_flow_trans_id", approvalFlow.approval_flow_trans_id)
      .update({
        s_status: "APPROVED",
        actioned_by_id: approverId,
        actioned_by_name: approverName,
        approved_on: knex.fn.now(),
        remarks: remarks || null,
        updated_at: knex.fn.now(),
      });

    // 5. Update user_master - Activate the user
    await trx("user_master").where("user_id", userId).update({
      status: "ACTIVE",
      is_active: true,
      updated_at: knex.fn.now(),
      updated_by: approverId,
    });

    await trx.commit();

    console.log(`✅ User ${userId} approved successfully by ${approverId}`);

    return res.status(200).json({
      success: true,
      message: "User approved successfully",
      data: {
        userId: userId,
        status: "ACTIVE",
        approvedBy: approverId,
        approvedAt: new Date(),
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error("Error approving user:", error);
    return res.status(500).json({
      success: false,
      message: "Error approving user",
      error: error.message,
    });
  }
};

/**
 * Reject User - Changes status to "REJECTED"
 * @route POST /api/approval/reject/:userId
 */
const rejectUser = async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { userId } = req.params;
    const { remarks } = req.body;
    const approverId = req.user.user_id; // From JWT token
    const approverName = req.user.name || req.user.user_id; // From JWT token

    console.log(`Rejecting user: ${userId} by approver: ${approverId}`);

    // Validate remarks - rejection requires a reason
    if (!remarks || remarks.trim().length === 0) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Remarks are required when rejecting a user",
      });
    }

    // 1. Check if user exists
    const user = await trx("user_master").where("user_id", userId).first();
    if (!user) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Get pending approval flow entry for this user
    const approvalFlow = await trx("approval_flow_trans")
      .where("user_id_reference_id", userId)
      .where("s_status", "PENDING")
      .where("pending_with_user_id", approverId)
      .first();

    if (!approvalFlow) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message:
          "No pending approval found for this user, or you are not the assigned approver",
      });
    }

    // 3. Prevent self-rejection
    if (approvalFlow.created_by_user_id === approverId) {
      await trx.rollback();
      return res.status(403).json({
        success: false,
        message: "You cannot reject your own creation",
      });
    }

    // 4. Update approval_flow_trans - Mark as REJECTED
    await trx("approval_flow_trans")
      .where("approval_flow_trans_id", approvalFlow.approval_flow_trans_id)
      .update({
        s_status: "REJECTED",
        actioned_by_id: approverId,
        actioned_by_name: approverName,
        approved_on: knex.fn.now(),
        remarks: remarks,
        updated_at: knex.fn.now(),
      });

    // 5. Update user_master - Mark as REJECTED to track rejection
    await trx("user_master").where("user_id", userId).update({
      status: "REJECTED",
      is_active: false,
      updated_at: knex.fn.now(),
      updated_by: approverId,
    });

    await trx.commit();

    console.log(`❌ User ${userId} rejected by ${approverId}`);

    return res.status(200).json({
      success: true,
      message: "User rejected successfully",
      data: {
        userId: userId,
        status: "REJECTED",
        rejectedBy: approverId,
        rejectedAt: new Date(),
        remarks: remarks,
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error("Error rejecting user:", error);
    return res.status(500).json({
      success: false,
      message: "Error rejecting user",
      error: error.message,
    });
  }
};

module.exports = {
  getApprovalConfiguration,
  getPendingApprovals,
  getApprovalHistory,
  approveUser,
  rejectUser,
};
