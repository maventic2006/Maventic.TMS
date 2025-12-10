const knex = require("../config/database");

// Helper function to update transporter dates based on status and active_flag changes
const updateTransporterDates = async (
  trx,
  transporterId,
  newStatus,
  newActiveFlag,
  oldStatus = null,
  oldActiveFlag = null
) => {
  const updates = {};

  // Set from_date when status changes to ACTIVE
  if (newStatus === "ACTIVE" && oldStatus !== "ACTIVE") {
    updates.from_date = trx.raw("CURDATE()");
  }

  // Set to_date when active_flag becomes 0 OR status becomes INACTIVE
  if (
    (newActiveFlag === 0 && oldActiveFlag !== 0) ||
    (newStatus === "INACTIVE" && oldStatus !== "INACTIVE")
  ) {
    updates.to_date = trx.raw("CURDATE()");
  }

  // Clear to_date when active_flag changes from 0 to 1 (reactivation)
  if (oldActiveFlag === 0 && newActiveFlag === 1) {
    updates.to_date = null;
  }

  // Apply updates if any
  if (Object.keys(updates).length > 0) {
    await trx("transporter_general_info")
      .where("transporter_id", transporterId)
      .update(updates);

    console.log(
      `📅 Auto-updated transporter dates for ${transporterId}:`,
      updates
    );
  }
};

/**
 * Get approvals list with filters
 * GET /api/approvals
 * Query params: requestType, dateFrom, dateTo, status, page, limit
 */
exports.getApprovals = async (req, res) => {
  try {
    const {
      requestType,
      dateFrom,
      dateTo,
      status = "Pending for Approval", // Default to pending
      page = 1,
      limit = 25,
    } = req.query;

    const userId = req.user?.user_id; // From auth middleware - correct property name
    const userRole = req.user?.role;

    console.log("🔍 Fetching approvals for user:", userId, "Role:", userRole);
    console.log("🔍 Full user object:", JSON.stringify(req.user, null, 2));

    // Validate userId is present
    if (!userId) {
      console.log("❌ No user ID found in token");
      return res.status(401).json({
        success: false,
        message: "Authentication failed - no user ID in token",
        error: "Missing user identification",
      });
    }

    // Debug: Check what approval records exist in database
    try {
      const allApprovals = await knex("approval_flow_trans")
        .count("* as count")
        .first();
      console.log("🔍 Total approval records in database:", allApprovals.count);

      const userPendingApprovals = await knex("approval_flow_trans")
        .where("pending_with_user_id", userId)
        .count("* as count")
        .first();
      console.log(
        "🔍 Approvals pending for current user:",
        userPendingApprovals.count
      );
    } catch (debugError) {
      console.error("🚨 Debug query failed:", debugError.message);
    }

    // Build query
    let query = knex("approval_flow_trans as aft")
      .select(
        "aft.approval_flow_trans_id as approvalId",
        "aft.approval_type_id as approvalTypeId",
        "atm.approval_name as requestType",
        "atm.approval_type as entityType", // Add entity type for navigation
        "aft.user_id_reference_id as requestId", // IMPORTANT: This contains ENTITY ID (T0002, CON0008, DRV0001, etc.) for navigation
        "aft.user_id_reference_id as entityId", // Clearer alias - this contains the entity ID, not user account ID
        "aft.created_at as requestCreatedOn",
        "aft.created_by_user_id as requestorId",
        "aft.created_by_name as requestorName",
        "aft.s_status as status",
        "aft.remarks",
        "aft.approval_cycle as approvalCycle",
        "aft.approver_level as approverLevel",
        "aft.pending_with_user_id as pendingWithUserId",
        "aft.pending_with_name as pendingWithName"
        // NOTE: user_id_reference_id contains entity IDs (T0002, CON0008, DRV0001, etc.)
        // These are used for navigation to entity details pages, NOT user account IDs (TA0002, CA0008, DA0001, etc.)
      )
      .leftJoin(
        "approval_type_master as atm",
        "aft.approval_type_id",
        "atm.approval_type_id"
      )
      .where(function () {
        // Show records where user is currently the pending approver OR user previously actioned
        this.where("aft.pending_with_user_id", userId) // Currently pending with user
          .orWhere("aft.actioned_by_id", userId); // Previously actioned by user
      });

    // Filter by request type
    if (requestType) {
      query = query.where("aft.approval_type_id", requestType);
    }

    // Filter by date range
    if (dateFrom) {
      query = query.where("aft.created_at", ">=", dateFrom);
    }
    if (dateTo) {
      query = query.where("aft.created_at", "<=", dateTo);
    }

    // Filter by status
    // Default to 'Pending for Approval' if not specified
    // Allow empty string or 'All' to show all statuses
    if (status && status !== "All" && status !== "") {
      // Handle status variations - if "Approve" is selected, include both "Approve" and "APPROVED"
      if (status === "Approve") {
        query = query.whereIn("aft.s_status", ["Approve", "APPROVED"]);
      } else {
        query = query.where("aft.s_status", status);
      }
    }

    // Count total records (for pagination) - Build separate count query without limit
    let countQuery = knex("approval_flow_trans as aft")
      .leftJoin(
        "approval_type_master as atm",
        "aft.approval_type_id",
        "atm.approval_type_id"
      )
      .where(function () {
        // Same logic: currently pending with user OR previously actioned by user
        this.where("aft.pending_with_user_id", userId).orWhere(
          "aft.actioned_by_id",
          userId
        );
      });

    // Apply same filters to count query (but no limit!)
    if (requestType) {
      countQuery = countQuery.where("aft.approval_type_id", requestType);
    }
    if (dateFrom) {
      countQuery = countQuery.where("aft.created_at", ">=", dateFrom);
    }
    if (dateTo) {
      countQuery = countQuery.where("aft.created_at", "<=", dateTo);
    }
    if (status && status !== "All" && status !== "") {
      // Handle status variations - if "Approve" is selected, include both "Approve" and "APPROVED"
      if (status === "Approve") {
        countQuery = countQuery.whereIn("aft.s_status", [
          "Approve",
          "APPROVED",
        ]);
      } else {
        countQuery = countQuery.where("aft.s_status", status);
      }
    }

    const totalCount = await countQuery
      .count("aft.approval_flow_trans_id as count")
      .first();
    const total = totalCount?.count || 0;

    // Pagination
    const offset = (page - 1) * limit;
    query = query.orderBy("aft.created_at", "desc").limit(limit).offset(offset);

    const approvals = await query;

    console.log(`✅ Found ${approvals.length} approvals (Total: ${total})`);

    // If no approvals found, provide helpful debugging info
    if (approvals.length === 0) {
      console.log("🔍 No approvals found. Debugging...");

      // Check if there are any approval records in the system
      const systemTotal = await knex("approval_flow_trans")
        .count("* as count")
        .first();
      console.log(`📊 Total approval records in system: ${systemTotal.count}`);

      if (parseInt(systemTotal.count) === 0) {
        console.log("💡 Reason: No approval records exist in the database yet");
        console.log(
          "💡 Solution: Create some transporter/driver/consignor users to generate approval workflows"
        );
      } else {
        // Check what users have pending approvals
        const pendingUsers = await knex("approval_flow_trans")
          .select("pending_with_user_id")
          .where("s_status", "PENDING")
          .groupBy("pending_with_user_id")
          .count("* as count");

        console.log("📊 Users with pending approvals:");
        pendingUsers.forEach((user) => {
          console.log(
            `  - User ID: ${user.pending_with_user_id}, Count: ${user.count}`
          );
        });

        console.log(
          `💡 Reason: Current user (${userId}) has no pending approvals assigned`
        );
        console.log(
          "💡 Solution: Assign approval permissions to this user or use a different user account"
        );
      }
    }

    res.status(200).json({
      success: true,
      data: approvals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching approvals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch approvals",
      error: error.message,
    });
  }
};
/**
 * Approve a request
 * POST /api/approvals/:id/approve
 */
exports.approveRequest = async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { id: approvalFlowTransId } = req.params;
    const userId = req.user?.user_id; // From auth middleware - correct property name
    const userName = req.user?.name;

    console.log("✅ Approving request:", approvalFlowTransId, "by", userName);

    // Get approval flow record
    const approvalFlow = await trx("approval_flow_trans")
      .where("approval_flow_trans_id", approvalFlowTransId)
      .first();

    if (!approvalFlow) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: "Approval request not found",
      });
    }

    // Verify user is the assigned approver
    if (approvalFlow.pending_with_user_id !== userId) {
      await trx.rollback();
      return res.status(403).json({
        success: false,
        message: "You are not authorized to approve this request",
      });
    }

    // Update approval flow status
    await trx("approval_flow_trans")
      .where("approval_flow_trans_id", approvalFlowTransId)
      .update({
        s_status: "Approve",
        actioned_by_id: userId,
        actioned_by_name: userName,
        approved_on: knex.fn.now(),
        updated_at: knex.fn.now(),
      });

    // Update related user status based on approval type
    await updateRelatedEntityStatus(trx, approvalFlow, "Active", userId);

    await trx.commit();

    console.log("✅ Request approved successfully:", approvalFlowTransId);

    res.status(200).json({
      success: true,
      message: "Request approved successfully",
      data: {
        approvalId: approvalFlowTransId,
        status: "Approve",
        actionedBy: userName,
        approvedOn: new Date(),
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error("❌ Error approving request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve request",
      error: error.message,
    });
  }
};

/**
 * Reject a request (REMARKS MANDATORY)
 * POST /api/approvals/:id/reject
 * Body: { remarks: string (required) }
 */
exports.rejectRequest = async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { id: approvalFlowTransId } = req.params;
    const { remarks } = req.body;
    const userId = req.user?.user_id; // From auth middleware - correct property name
    const userName = req.user?.name;

    // 🚨 VALIDATE REMARKS (MANDATORY)
    if (!remarks || remarks.trim().length === 0) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Remarks are required to reject this request",
        field: "remarks",
      });
    }

    console.log("❌ Rejecting request:", approvalFlowTransId, "by", userName);
    console.log("📝 Reject remarks:", remarks);

    // Get approval flow record
    const approvalFlow = await trx("approval_flow_trans")
      .where("approval_flow_trans_id", approvalFlowTransId)
      .first();

    if (!approvalFlow) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: "Approval request not found",
      });
    }

    // Verify user is the assigned approver
    if (approvalFlow.pending_with_user_id !== userId) {
      await trx.rollback();
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reject this request",
      });
    }

    // Update approval flow status with remarks
    await trx("approval_flow_trans")
      .where("approval_flow_trans_id", approvalFlowTransId)
      .update({
        s_status: "Sent Back",
        actioned_by_id: userId,
        actioned_by_name: userName,
        remarks: remarks.trim(), // Store remarks
        approved_on: knex.fn.now(),
        updated_at: knex.fn.now(),
      });

    // Update related user status to rejected/inactive
    await updateRelatedEntityStatus(trx, approvalFlow, "Sent Back", userId);

    await trx.commit();

    console.log("✅ Request rejected successfully:", approvalFlowTransId);

    res.status(200).json({
      success: true,
      message: "Request rejected successfully",
      data: {
        approvalId: approvalFlowTransId,
        status: "Sent Back",
        actionedBy: userName,
        remarks: remarks.trim(),
        rejectedOn: new Date(),
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error("❌ Error rejecting request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject request",
      error: error.message,
    });
  }
};

/**
 * Send back a request (REMARKS MANDATORY)
 * POST /api/approvals/:id/sendBack
 * Body: { remarks: string (required) }
 */
exports.sendBackRequest = async (req, res) => {
  const trx = await knex.transaction();

  try {
    const { id: approvalFlowTransId } = req.params;
    const { remarks } = req.body;
    const userId = req.user?.user_id; // From auth middleware - correct property name
    const userName = req.user?.name;

    // 🚨 VALIDATE REMARKS (MANDATORY)
    if (!remarks || remarks.trim().length === 0) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: "Remarks are required to send back this request",
        field: "remarks",
      });
    }

    console.log(
      "↩️ Sending back request:",
      approvalFlowTransId,
      "by",
      userName
    );
    console.log("📝 Send back remarks:", remarks);

    // Get approval flow record
    const approvalFlow = await trx("approval_flow_trans")
      .where("approval_flow_trans_id", approvalFlowTransId)
      .first();

    if (!approvalFlow) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: "Approval request not found",
      });
    }

    // Verify user is the assigned approver
    if (approvalFlow.pending_with_user_id !== userId) {
      await trx.rollback();
      return res.status(403).json({
        success: false,
        message: "You are not authorized to send back this request",
      });
    }

    // Update approval flow - send back to creator
    await trx("approval_flow_trans")
      .where("approval_flow_trans_id", approvalFlowTransId)
      .update({
        s_status: "Sent Back",
        pending_with_user_id: approvalFlow.created_by_user_id, // Send to creator
        pending_with_name: approvalFlow.created_by_name,
        actioned_by_id: userId,
        actioned_by_name: userName,
        remarks: remarks.trim(),
        updated_at: knex.fn.now(),
      });

    // Update related entity status
    await updateRelatedEntityStatus(trx, approvalFlow, "Sent Back", userId);

    await trx.commit();

    console.log("✅ Request sent back successfully:", approvalFlowTransId);

    res.status(200).json({
      success: true,
      message: "Request sent back successfully",
      data: {
        approvalId: approvalFlowTransId,
        status: "Sent Back",
        actionedBy: userName,
        sentBackTo: approvalFlow.created_by_name,
        remarks: remarks.trim(),
        sentBackOn: new Date(),
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error("❌ Error sending back request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send back request",
      error: error.message,
    });
  }
};

/**
 * Helper: Update related entity status based on approval type
 */
async function updateRelatedEntityStatus(
  trx,
  approvalFlow,
  newStatus,
  actionedByUserId
) {
  const { approval_type_id, user_id_reference_id } = approvalFlow;

  console.log(
    `📝 Updating entity status for ${approval_type_id}:`,
    user_id_reference_id,
    "→",
    newStatus
  );

  // Map status to entity compatible status
  // Database uses UPPERCASE for entity statuses (ACTIVE, PENDING, INACTIVE)
  // user_master uses "Active" or "Sent Back"
  const userStatus = newStatus === "Active" ? "Active" : "Sent Back";
  const entityStatus = newStatus === "Active" ? "ACTIVE" : "INACTIVE"; // ✅ FIXED: Rejected entities set to INACTIVE
  const isActive = newStatus === "Active" ? 1 : 0;

  try {
    // Transporter Admin User Creation (AT001)
    if (approval_type_id === "AT001") {
      // ✅ FIX: user_id_reference_id stores transporter entity ID (T001) not admin user ID
      // Derive TA user ID from transporter ID (T001 → TA0001, T109 → TA0109)
      const transporterId = user_id_reference_id; // T001, T002, etc.
      const transporterNumber = transporterId.substring(1); // Remove 'T' prefix → "001"
      const transporterAdminUserId = `TA${transporterNumber.padStart(4, "0")}`; // TA0001, TA0109, etc.

      // Update TA user status
      await trx("user_master").where("user_id", transporterAdminUserId).update({
        status: userStatus,
        is_active: isActive,
        updated_at: knex.fn.now(),
      });
      console.log(
        `✅ Updated Transporter Admin user status: ${transporterAdminUserId} → ${userStatus}`
      );

      // CRITICAL: Also update the transporter status in transporter_general_info
      // Get old values before update for date automation
      const oldTransporter = await trx("transporter_general_info")
        .where("transporter_id", transporterId)
        .first();

      await trx("transporter_general_info")
        .where("transporter_id", transporterId)
        .update({
          status: entityStatus, // Use UPPERCASE status for entity table
          updated_at: knex.fn.now(),
        });
      console.log(
        `✅ Updated Transporter status: ${transporterId} → ${entityStatus}`
      );

      // ✅ AUTO-UPDATE DATES based on status change
      await updateTransporterDates(
        trx,
        transporterId,
        entityStatus,
        oldTransporter?.active_flag,
        oldTransporter?.status,
        oldTransporter?.active_flag
      );
    }

    // Consignor Admin User Creation (AT002)
    else if (approval_type_id === "AT002") {
      // First, get the consignor_id from user_master table
      const consignorUser = await trx("user_master")
        .where("user_id", user_id_reference_id)
        .select("consignor_id")
        .first();

      if (!consignorUser || !consignorUser.consignor_id) {
        throw new Error(
          `Consignor ID not found for user ${user_id_reference_id}`
        );
      }

      const consignorId = consignorUser.consignor_id; // Get actual consignor ID (e.g., CON0026)

      console.log(
        `📋 Found consignor ID: ${consignorId} for user: ${user_id_reference_id}`
      );

      // Update Consignor Admin user status
      await trx("user_master").where("user_id", user_id_reference_id).update({
        status: userStatus,
        is_active: isActive,
        updated_at: knex.fn.now(),
      });
      console.log(
        `✅ Updated Consignor Admin user status: ${user_id_reference_id} → ${userStatus}`
      );

      // CRITICAL: Update the consignor status in consignor_basic_information
      // Use the actual consignor_id from user_master, not derived from user ID
      console.log(
        `🔍 Updating consignor ${consignorId} status to ${entityStatus}...`
      );

      const updateCount = await trx("consignor_basic_information")
        .where("customer_id", consignorId)
        .update({
          status: entityStatus, // Use UPPERCASE status for entity table
          updated_at: knex.fn.now(),
        });

      console.log(
        `✅ Updated Consignor status: ${consignorId} → ${entityStatus} (${updateCount} row(s) affected)`
      );

      // Verify the update was successful
      const updatedConsignor = await trx("consignor_basic_information")
        .where("customer_id", consignorId)
        .select("customer_id", "status")
        .first();

      console.log(
        `🔍 Verification - Consignor ${consignorId} current status in DB: ${updatedConsignor?.status}`
      );
    }

    // Driver User Creation (AT003)
    else if (approval_type_id === "AT003") {
      // Update Driver user status
      await trx("user_master").where("user_id", user_id_reference_id).update({
        status: userStatus,
        is_active: isActive,
        updated_at: knex.fn.now(),
      });
      console.log(
        `✅ Updated Driver user status: ${user_id_reference_id} → ${userStatus}`
      );

      // CRITICAL: Also update the driver status in driver_basic_information
      // Derive driver ID from DA user ID (DA0001 → DRV0001, DA0109 → DRV0109)
      const driverNumber = user_id_reference_id.substring(2); // Remove 'DA' prefix
      const driverId = `DRV${driverNumber}`; // DRV0001, DRV0109, etc. (keep 4 digits)

      await trx("driver_basic_information")
        .where("driver_id", driverId)
        .update({
          status: entityStatus, // Use UPPERCASE status for entity table
          updated_at: knex.fn.now(),
        });
      console.log(`✅ Updated Driver status: ${driverId} → ${entityStatus}`);
    }

    // Vehicle Owner User Creation (AT004) - Updates both user and vehicle status
    else if (approval_type_id === "AT004") {
      // First, get the vehicle owner user details
      const vehicleOwnerUser = await trx("user_master")
        .where("user_id", user_id_reference_id)
        .select("user_id", "user_full_name", "created_at", "created_by_user_id")
        .first();

      if (!vehicleOwnerUser) {
        throw new Error(
          `Vehicle Owner user not found: ${user_id_reference_id}`
        );
      }

      console.log(
        `📋 Found Vehicle Owner user: ${user_id_reference_id}, Name: ${vehicleOwnerUser.user_full_name}`
      );

      // Update Vehicle Owner user status
      await trx("user_master").where("user_id", user_id_reference_id).update({
        status: userStatus,
        is_active: isActive,
        updated_at: knex.fn.now(),
      });
      console.log(
        `✅ Updated Vehicle Owner user status: ${user_id_reference_id} → ${userStatus}`
      );

      // CRITICAL: Find and update the vehicle associated with this user
      // Strategy 1: Extract vehicle ID from user full name (most reliable)
      // Format: "Vehicle Owner - VEH0001"
      let vehicleId = null;
      const vehicleIdMatch = vehicleOwnerUser.user_full_name.match(/VEH\d+/);
      if (vehicleIdMatch) {
        vehicleId = vehicleIdMatch[0];
        console.log(
          `🔍 Extracted vehicle ID from user name: ${vehicleOwnerUser.user_full_name} → ${vehicleId}`
        );
      } else {
        // Strategy 2: Try pattern-based derivation (VO0001 → VEH0001)
        if (user_id_reference_id.startsWith("VO")) {
          const vehicleNumber = user_id_reference_id.substring(2); // Remove 'VO' prefix
          vehicleId = `VEH${vehicleNumber}`;
          console.log(
            `🔍 Derived vehicle ID from user ID: ${user_id_reference_id} → ${vehicleId}`
          );
        }
      }

      // Strategy 3: If still not found, search by created_by and creation time
      if (!vehicleId) {
        console.log(
          `🔍 Trying to find vehicle by creator and time: ${vehicleOwnerUser.created_by_user_id}`
        );
        const vehicle = await trx("vehicle_basic_information_hdr")
          .where("created_by", vehicleOwnerUser.created_by_user_id)
          .where(
            "created_at",
            ">=",
            new Date(new Date(vehicleOwnerUser.created_at).getTime() - 5000)
          ) // Within 5 seconds before
          .where(
            "created_at",
            "<=",
            new Date(new Date(vehicleOwnerUser.created_at).getTime() + 5000)
          ) // Within 5 seconds after
          .orderBy("created_at", "desc")
          .first();

        if (vehicle) {
          vehicleId = vehicle.vehicle_id_code_hdr;
          console.log(`🔍 Found vehicle by time matching: ${vehicleId}`);
        }
      }

      if (vehicleId) {
        console.log(
          `🔍 Updating vehicle ${vehicleId} status to ${entityStatus}...`
        );

        // Update vehicle status in vehicle_basic_information_hdr
        const vehicleUpdateResult = await trx("vehicle_basic_information_hdr")
          .where("vehicle_id_code_hdr", vehicleId)
          .update({
            status: entityStatus,
            updated_at: knex.fn.now(),
            updated_by: actionedByUserId,
          });

        if (vehicleUpdateResult > 0) {
          console.log(
            `✅ Updated vehicle ${vehicleId} status in vehicle_basic_information_hdr to ${entityStatus}`
          );

          // Verify the update
          const updatedVehicle = await trx("vehicle_basic_information_hdr")
            .where("vehicle_id_code_hdr", vehicleId)
            .select("vehicle_id_code_hdr", "status")
            .first();

          console.log(
            `✅ Verified vehicle ${updatedVehicle?.vehicle_id_code_hdr} status: ${updatedVehicle?.status}`
          );
        } else {
          console.warn(`⚠️ No vehicle found with ID ${vehicleId} to update`);
        }
      } else {
        console.error(
          `❌ CRITICAL: Could not determine vehicle ID for user ${user_id_reference_id}`
        );
        console.error(`   User full name: ${vehicleOwnerUser.user_full_name}`);
        console.error(`   Created by: ${vehicleOwnerUser.created_by_user_id}`);
        console.error(`   Created at: ${vehicleOwnerUser.created_at}`);
      }
    }

    // Warehouse User Creation (AT005) - Now properly handles warehouse status updates
    else if (approval_type_id === "AT005") {
      // First, get the warehouse manager user details
      const warehouseUser = await trx("user_master")
        .where("user_id", user_id_reference_id)
        .select("consignor_id", "created_at", "created_by_user_id")
        .first();

      if (!warehouseUser) {
        throw new Error(
          `Warehouse manager user not found: ${user_id_reference_id}`
        );
      }

      console.log(
        `📋 Found warehouse manager user: ${user_id_reference_id}, Consignor: ${warehouseUser.consignor_id}`
      );

      // Update Warehouse Manager user status
      await trx("user_master").where("user_id", user_id_reference_id).update({
        status: userStatus,
        is_active: isActive,
        updated_at: knex.fn.now(),
      });
      console.log(
        `✅ Updated Warehouse Manager user status: ${user_id_reference_id} → ${userStatus}`
      );

      // CRITICAL: Find and update the warehouse that was created by this user
      // Strategy 1: Try time-based matching with wider window (within 10 seconds)
      let warehouse = await trx("warehouse_basic_information")
        .where("consignor_id", warehouseUser.consignor_id)
        .where(
          "created_at",
          ">=",
          new Date(new Date(warehouseUser.created_at).getTime() - 2000)
        ) // Within 2 seconds before user creation
        .where(
          "created_at",
          "<=",
          new Date(new Date(warehouseUser.created_at).getTime() + 10000)
        ) // Within 10 seconds after user creation
        .orderBy("created_at", "desc")
        .first();

      // Strategy 2: If time-based fails, find most recent PENDING warehouse for this consignor
      if (!warehouse) {
        console.log(
          `⚠️ Time-based search failed. Searching for most recent PENDING warehouse...`
        );
        warehouse = await trx("warehouse_basic_information")
          .where("consignor_id", warehouseUser.consignor_id)
          .where("status", "PENDING")
          .where("created_by", warehouseUser.created_by_user_id) // Match creator
          .orderBy("created_at", "desc")
          .first();
      }

      // Strategy 3: Last resort - find ANY recent PENDING warehouse for this consignor
      if (!warehouse) {
        console.log(
          `⚠️ Creator-based search failed. Searching for any recent PENDING warehouse...`
        );
        warehouse = await trx("warehouse_basic_information")
          .where("consignor_id", warehouseUser.consignor_id)
          .where("status", "PENDING")
          .orderBy("created_at", "desc")
          .first();
      }

      if (!warehouse) {
        console.warn(
          `⚠️ No warehouse found for user ${user_id_reference_id} with consignor ${warehouseUser.consignor_id}`
        );
      } else {
        const warehouseId = warehouse.warehouse_id;

        console.log(
          `🔍 Updating warehouse ${warehouseId} status to ${entityStatus}...`
        );

        const updateCount = await trx("warehouse_basic_information")
          .where("warehouse_id", warehouseId)
          .update({
            status: entityStatus, // Use UPPERCASE status for entity table
            updated_at: knex.fn.now(),
            updated_by: actionedByUserId, // Track who approved/rejected
          });

        console.log(
          `✅ Updated Warehouse status: ${warehouseId} → ${entityStatus} (${updateCount} row(s) affected)`
        );

        // Verify the update was successful
        const updatedWarehouse = await trx("warehouse_basic_information")
          .where("warehouse_id", warehouseId)
          .select("warehouse_id", "status")
          .first();

        console.log(
          `🔍 Verification - Warehouse ${warehouseId} current status in DB: ${updatedWarehouse?.status}`
        );
      }
    }

    // Add more approval types as needed
    else {
      console.warn(
        `⚠️ Unknown approval type: ${approval_type_id} - No entity status update performed`
      );
    }
  } catch (error) {
    console.error("❌ Error updating entity status:", error);
    throw error;
  }
}

/**
 * Get master data for approval types
 * GET /api/approvals/master-data
 */
exports.getMasterData = async (req, res) => {
  try {
    console.log("📋 Fetching approval master data...");

    // Get approval types
    const approvalTypes = await knex("approval_type_master")
      .select("approval_type_id as value", "approval_name as label")
      .where("status", "ACTIVE")
      .orderBy("approval_name");

    res.status(200).json({
      success: true,
      data: {
        approvalTypes,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching master data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch master data",
      error: error.message,
    });
  }
};

/**
 * Approve user (user-based approval workflow)
 * POST /api/approvals/user/:userId/approve
 */
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { remarks } = req.body;
    const approverUserId = req.user?.user_id;
    const approverName = req.user?.name;

    console.log(
      `🟢 Approving user ${userId} by ${approverUserId} (${approverName})`
    );

    // Check if user exists
    const user = await knex("user_master").where("user_id", userId).first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user status to Active
    await knex("user_master").where("user_id", userId).update({
      status: "Active",
      is_active: 1,
      updated_at: new Date(),
      updated_by: approverUserId,
    });

    // Update approval flow with correct status and approver information
    await knex("approval_flow_trans")
      .where("user_id_reference_id", userId)
      .update({
        s_status: "Approve", // Fixed: Use 'Approve' not 'APPROVED'
        actioned_by_id: approverUserId, // Added: Who approved
        actioned_by_name: approverName, // Added: Approver name
        approved_on: knex.fn.now(), // Added: Approval timestamp
        pending_with_user_id: null, // Clear: No longer pending
        pending_with_name: null, // Clear: No longer pending
        updated_at: new Date(),
        remarks: remarks || "Approved by Product Owner",
      });

    console.log(`✅ User ${userId} approved successfully`);

    res.json({
      success: true,
      message: "User approved successfully",
      data: {
        userId,
        status: "Active",
        approvedBy: approverName,
        approvedOn: new Date(),
      },
    });
  } catch (error) {
    console.error("❌ Error approving user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve user",
      error: error.message,
    });
  }
};

/**
 * Reject user (user-based approval workflow)
 * POST /api/approvals/user/:userId/reject
 */
exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { remarks } = req.body;
    const approverUserId = req.user?.user_id;
    const approverName = req.user?.name;

    if (!remarks || remarks.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Remarks are required to reject a user",
      });
    }

    console.log(
      `🔴 Rejecting user ${userId} by ${approverUserId} (${approverName})`
    );

    // Check if user exists
    const user = await knex("user_master").where("user_id", userId).first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user status to Rejected
    await knex("user_master").where("user_id", userId).update({
      status: "Sent Back", // Fixed: Use 'Sent Back' not 'REJECTED'
      is_active: 0,
      updated_at: new Date(),
      updated_by: approverUserId,
    });

    // Update approval flow with correct status and approver information
    await knex("approval_flow_trans")
      .where("user_id_reference_id", userId)
      .update({
        s_status: "Sent Back", // Fixed: Use 'Sent Back' not 'REJECTED'
        actioned_by_id: approverUserId, // Added: Who rejected
        actioned_by_name: approverName, // Added: Rejector name
        approved_on: knex.fn.now(), // Added: Action timestamp (rejection time)
        pending_with_user_id: null, // Clear: No longer pending
        pending_with_name: null, // Clear: No longer pending
        updated_at: new Date(),
        remarks: remarks.trim(),
      });

    console.log(`✅ User ${userId} rejected successfully`);

    res.json({
      success: true,
      message: "User rejected successfully",
      data: {
        userId,
        status: "Sent Back",
        rejectedBy: approverName,
        rejectedOn: new Date(),
        remarks: remarks.trim(),
      },
    });
  } catch (error) {
    console.error("❌ Error rejecting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject user",
      error: error.message,
    });
  }
};
