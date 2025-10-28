const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, validateTransporterAccess } = require('../middleware/auth');
const { getTransporters, getTransporterById, createComprehensiveSampleData } = require('../controllers/transporterController');

/**
 * @route   GET /api/transporters
 * @desc    Get all transporters with filtering, searching and pagination
 * @access  Protected - Admin, Manager, User
 * @query   page, limit, search, transporterId, status, transportMode, sortBy, sortOrder
 */
router.get('/', 
  authenticateToken, 
  authorizeRoles(['admin', 'manager', 'user']),
  getTransporters
);

/**
 * @route   GET /api/transporters/:id
 * @desc    Get single transporter by ID
 * @access  Protected - Admin, Manager, User
 * @param   id - Transporter ID
 */
router.get('/:id', 
  authenticateToken, 
  authorizeRoles(['admin', 'manager', 'user']),
  validateTransporterAccess,
  getTransporterById
);

/**
 * @route   POST /api/transporters/create-sample-data
 * @desc    Create comprehensive sample data for all transporter related tables
 * @access  Protected - Admin only
 */
router.post('/create-sample-data', 
  authenticateToken, 
  authorizeRoles(['admin']),
  async (req, res) => {
    try {
      await createComprehensiveSampleData();
      res.json({
        success: true,
        message: 'Comprehensive sample data created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating sample data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create sample data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;