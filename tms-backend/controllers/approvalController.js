const knex = require('../config/database');

/**
 * Get approval list with filters
 * GET /api/approvals
 * Query params: requestType, dateFrom, dateTo, status, page, limit
 */
exports.getApprovals = async (req, res) => {
  try {
    const {
      requestType,
      dateFrom,
      dateTo,
      status = 'Pending for Approval', // Default to pending
      page = 1,
      limit = 25
    } = req.query;

    const userId = req.user?.user_id; // From auth middleware - correct property name
    const userRole = req.user?.role;

    console.log('🔍 Fetching approvals for user:', userId, 'Role:', userRole);
    console.log('🔍 Full user object:', JSON.stringify(req.user, null, 2));

    // Validate userId is present
    if (!userId) {
      console.log('❌ No user ID found in token');
      return res.status(401).json({
        success: false,
        message: 'Authentication failed - no user ID in token',
        error: 'Missing user identification'
      });
    }

    // Debug: Check what approval records exist in database
    try {
      const allApprovals = await knex('approval_flow_trans').count('* as count').first();
      console.log('🔍 Total approval records in database:', allApprovals.count);
      
      const userPendingApprovals = await knex('approval_flow_trans')
        .where('pending_with_user_id', userId)
        .count('* as count')
        .first();
      console.log('🔍 Approvals pending for current user:', userPendingApprovals.count);
    } catch (debugError) {
      console.error('🚨 Debug query failed:', debugError.message);
    }

    // Build query
    let query = knex('approval_flow_trans as aft')
      .select(
        'aft.approval_flow_trans_id as approvalId',
        'aft.approval_type_id as approvalTypeId',
        'atm.approval_name as requestType',
        'aft.user_id_reference_id as requestId',
        'aft.created_at as requestCreatedOn',
        'aft.created_by_user_id as requestorId',
        'aft.created_by_name as requestorName',
        'aft.s_status as status',
        'aft.remarks',
        'aft.approval_cycle as approvalCycle',
        'aft.approver_level as approverLevel',
        'aft.pending_with_user_id as pendingWithUserId',
        'aft.pending_with_name as pendingWithName'
      )
      .leftJoin('approval_type_master as atm', 'aft.approval_type_id', 'atm.approval_type_id')
      .where('aft.pending_with_user_id', userId); // Only approvals pending with logged-in user

    // Filter by request type
    if (requestType) {
      query = query.where('aft.approval_type_id', requestType);
    }

    // Filter by date range
    if (dateFrom) {
      query = query.where('aft.created_at', '>=', dateFrom);
    }
    if (dateTo) {
      query = query.where('aft.created_at', '<=', dateTo);
    }

    // Filter by status
    // Default to 'Pending for Approval' if not specified
    // Allow empty string or 'All' to show all statuses
    if (status && status !== 'All' && status !== '') {
      // Handle status variations - if "Approve" is selected, include both "Approve" and "APPROVED"
      if (status === 'Approve') {
        query = query.whereIn('aft.s_status', ['Approve', 'APPROVED']);
      } else {
        query = query.where('aft.s_status', status);
      }
    }

    // Count total records (for pagination) - Build separate count query without limit
    let countQuery = knex('approval_flow_trans as aft')
      .leftJoin('approval_type_master as atm', 'aft.approval_type_id', 'atm.approval_type_id')
      .where('aft.pending_with_user_id', userId);

    // Apply same filters to count query (but no limit!)
    if (requestType) {
      countQuery = countQuery.where('aft.approval_type_id', requestType);
    }
    if (dateFrom) {
      countQuery = countQuery.where('aft.created_at', '>=', dateFrom);
    }
    if (dateTo) {
      countQuery = countQuery.where('aft.created_at', '<=', dateTo);
    }
    if (status && status !== 'All' && status !== '') {
      // Handle status variations - if "Approve" is selected, include both "Approve" and "APPROVED"
      if (status === 'Approve') {
        countQuery = countQuery.whereIn('aft.s_status', ['Approve', 'APPROVED']);
      } else {
        countQuery = countQuery.where('aft.s_status', status);
      }
    }

    const totalCount = await countQuery.count('aft.approval_flow_trans_id as count').first();
    const total = totalCount?.count || 0;

    // Pagination
    const offset = (page - 1) * limit;
    query = query.orderBy('aft.created_at', 'desc').limit(limit).offset(offset);

    const approvals = await query;

    console.log(`✅ Found ${approvals.length} approvals (Total: ${total})`);

    // If no approvals found, provide helpful debugging info
    if (approvals.length === 0) {
      console.log('🔍 No approvals found. Debugging...');
      
      // Check if there are any approval records in the system
      const systemTotal = await knex('approval_flow_trans').count('* as count').first();
      console.log(`📊 Total approval records in system: ${systemTotal.count}`);
      
      if (parseInt(systemTotal.count) === 0) {
        console.log('💡 Reason: No approval records exist in the database yet');
        console.log('💡 Solution: Create some transporter/driver/consignor users to generate approval workflows');
      } else {
        // Check what users have pending approvals
        const pendingUsers = await knex('approval_flow_trans')
          .select('pending_with_user_id')
          .where('s_status', 'PENDING')
          .groupBy('pending_with_user_id')
          .count('* as count');
        
        console.log('📊 Users with pending approvals:');
        pendingUsers.forEach(user => {
          console.log(`  - User ID: ${user.pending_with_user_id}, Count: ${user.count}`);
        });
        
        console.log(`💡 Reason: Current user (${userId}) has no pending approvals assigned`);
        console.log('💡 Solution: Assign approval permissions to this user or use a different user account');
      }
    }

    res.status(200).json({
      success: true,
      data: approvals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approvals',
      error: error.message
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

    console.log('✅ Approving request:', approvalFlowTransId, 'by', userName);

    // Get approval flow record
    const approvalFlow = await trx('approval_flow_trans')
      .where('approval_flow_trans_id', approvalFlowTransId)
      .first();

    if (!approvalFlow) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    // Verify user is the assigned approver
    if (approvalFlow.pending_with_user_id !== userId) {
      await trx.rollback();
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to approve this request'
      });
    }

    // Update approval flow status
    await trx('approval_flow_trans')
      .where('approval_flow_trans_id', approvalFlowTransId)
      .update({
        s_status: 'Approve',
        actioned_by_id: userId,
        actioned_by_name: userName,
        approved_on: knex.fn.now(),
        updated_at: knex.fn.now()
      });

    // Update related user status based on approval type
    await updateRelatedEntityStatus(trx, approvalFlow, 'Active');

    await trx.commit();

    console.log('✅ Request approved successfully:', approvalFlowTransId);

    res.status(200).json({
      success: true,
      message: 'Request approved successfully',
      data: {
        approvalId: approvalFlowTransId,
        status: 'Approve',
        actionedBy: userName,
        approvedOn: new Date()
      }
    });

  } catch (error) {
    await trx.rollback();
    console.error('❌ Error approving request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve request',
      error: error.message
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
        message: 'Remarks are required to reject this request',
        field: 'remarks'
      });
    }

    console.log('❌ Rejecting request:', approvalFlowTransId, 'by', userName);
    console.log('📝 Reject remarks:', remarks);

    // Get approval flow record
    const approvalFlow = await trx('approval_flow_trans')
      .where('approval_flow_trans_id', approvalFlowTransId)
      .first();

    if (!approvalFlow) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    // Verify user is the assigned approver
    if (approvalFlow.pending_with_user_id !== userId) {
      await trx.rollback();
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject this request'
      });
    }

    // Update approval flow status with remarks
    await trx('approval_flow_trans')
      .where('approval_flow_trans_id', approvalFlowTransId)
      .update({
        s_status: 'Sent Back',
        actioned_by_id: userId,
        actioned_by_name: userName,
        remarks: remarks.trim(), // Store remarks
        approved_on: knex.fn.now(),
        updated_at: knex.fn.now()
      });

    // Update related user status to rejected/inactive
    await updateRelatedEntityStatus(trx, approvalFlow, 'Sent Back');

    await trx.commit();

    console.log('✅ Request rejected successfully:', approvalFlowTransId);

    res.status(200).json({
      success: true,
      message: 'Request rejected successfully',
      data: {
        approvalId: approvalFlowTransId,
        status: 'Sent Back',
        actionedBy: userName,
        remarks: remarks.trim(),
        rejectedOn: new Date()
      }
    });

  } catch (error) {
    await trx.rollback();
    console.error('❌ Error rejecting request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject request',
      error: error.message
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
        message: 'Remarks are required to send back this request',
        field: 'remarks'
      });
    }

    console.log('↩️ Sending back request:', approvalFlowTransId, 'by', userName);
    console.log('📝 Send back remarks:', remarks);

    // Get approval flow record
    const approvalFlow = await trx('approval_flow_trans')
      .where('approval_flow_trans_id', approvalFlowTransId)
      .first();

    if (!approvalFlow) {
      await trx.rollback();
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    // Verify user is the assigned approver
    if (approvalFlow.pending_with_user_id !== userId) {
      await trx.rollback();
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send back this request'
      });
    }

    // Update approval flow - send back to creator
    await trx('approval_flow_trans')
      .where('approval_flow_trans_id', approvalFlowTransId)
      .update({
        s_status: 'Sent Back',
        pending_with_user_id: approvalFlow.created_by_user_id, // Send to creator
        pending_with_name: approvalFlow.created_by_name,
        actioned_by_id: userId,
        actioned_by_name: userName,
        remarks: remarks.trim(),
        updated_at: knex.fn.now()
      });

    // Update related entity status
    await updateRelatedEntityStatus(trx, approvalFlow, 'Sent Back');

    await trx.commit();

    console.log('✅ Request sent back successfully:', approvalFlowTransId);

    res.status(200).json({
      success: true,
      message: 'Request sent back successfully',
      data: {
        approvalId: approvalFlowTransId,
        status: 'Sent Back',
        actionedBy: userName,
        sentBackTo: approvalFlow.created_by_name,
        remarks: remarks.trim(),
        sentBackOn: new Date()
      }
    });

  } catch (error) {
    await trx.rollback();
    console.error('❌ Error sending back request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send back request',
      error: error.message
    });
  }
};

/**
 * Helper: Update related entity status based on approval type
 */
async function updateRelatedEntityStatus(trx, approvalFlow, newStatus) {
  const { approval_type_id, user_id_reference_id } = approvalFlow;

  console.log(`📝 Updating entity status for ${approval_type_id}:`, user_id_reference_id, '→', newStatus);

  // Map status to user_master compatible status
  const userStatus = newStatus === 'Active' ? 'Active' : 'Sent Back';
  const isActive = newStatus === 'Active' ? 1 : 0;

  try {
    // Consignor Admin User Creation (AT002)
    if (approval_type_id === 'AT002') {
      await trx('user_master')
        .where('user_id', user_id_reference_id)
        .update({
          status: userStatus,
          is_active: isActive,
          updated_at: knex.fn.now()
        });
    }
    
    // Transporter Admin User Creation (AT003)
    else if (approval_type_id === 'AT003') {
      await trx('user_master')
        .where('user_id', user_id_reference_id)
        .update({
          status: userStatus,
          is_active: isActive,
          updated_at: knex.fn.now()
        });
    }
    
    // Vehicle Owner User Creation (AT004)
    else if (approval_type_id === 'AT004') {
      await trx('user_master')
        .where('user_id', user_id_reference_id)
        .update({
          status: userStatus,
          is_active: isActive,
          updated_at: knex.fn.now()
        });
    }

    // Add more approval types as needed
    console.log('✅ Entity status updated successfully');

  } catch (error) {
    console.error('❌ Error updating entity status:', error);
    throw error;
  }
}

/**
 * Get master data for approval types
 * GET /api/approvals/master-data
 */
exports.getMasterData = async (req, res) => {
  try {
    console.log('📋 Fetching approval master data...');

    // Get approval types
    const approvalTypes = await knex('approval_type_master')
      .select('approval_type_id as value', 'approval_name as label')
      .where('status', 'ACTIVE')
      .orderBy('approval_name');

    res.status(200).json({
      success: true,
      data: {
        approvalTypes
      }
    });

  } catch (error) {
    console.error('❌ Error fetching master data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch master data',
      error: error.message
    });
  }
};
