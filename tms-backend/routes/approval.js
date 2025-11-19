const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Get approval list with filters
 * GET /api/approvals
 * Query params: requestType, dateFrom, dateTo, status, page, limit
 */
router.get('/', authenticateToken, approvalController.getApprovals);

/**
 * Get master data for approval types
 * GET /api/approvals/master-data
 */
router.get('/master-data', authenticateToken, approvalController.getMasterData);

/**
 * Approve a request
 * POST /api/approvals/:id/approve
 */
router.post('/:id/approve', authenticateToken, approvalController.approveRequest);

/**
 * Reject a request (REMARKS MANDATORY)
 * POST /api/approvals/:id/reject
 * Body: { remarks: string (required) }
 */
router.post('/:id/reject', authenticateToken, approvalController.rejectRequest);

/**
 * Send back a request (REMARKS MANDATORY)
 * POST /api/approvals/:id/sendBack
 * Body: { remarks: string (required) }
 */
router.post('/:id/sendBack', authenticateToken, approvalController.sendBackRequest);

module.exports = router;
