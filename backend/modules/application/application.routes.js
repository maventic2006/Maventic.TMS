const express = require('express');
const router = express.Router();
const applicationController = require('./application.controller');
const { authenticateToken } = require('../../middleware/auth'); // /* ADAPT: Use your auth middleware */

/**
 * @route GET /api/applications
 * @desc Get list of applications
 * @access Protected
 */
router.get(
  '/',
  authenticateToken,
  applicationController.listApplications
);

/**
 * @route GET /api/applications/:id
 * @desc Get application by ID
 * @access Protected
 */
router.get(
  '/:id',
  authenticateToken,
  applicationController.getApplicationById
);

module.exports = router;
