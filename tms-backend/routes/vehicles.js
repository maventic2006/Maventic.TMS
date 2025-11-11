const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const vehicleController = require('../controllers/vehicleController');

/**
 * Vehicle Routes
 * All routes are protected with JWT authentication
 * @module vehicleRoutes
 */

// ============================================================================
// PUBLIC ROUTES (with authentication)
// ============================================================================

/**
 * @route   GET /api/vehicle/master-data
 * @desc    Get master data for dropdowns
 * @access  Private
 */
router.get('/master-data', authenticateToken, vehicleController.getMasterData);

/**
 * @route   GET /api/vehicle
 * @desc    Get all vehicles with pagination and filtering
 * @access  Private
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 25)
 * @query   {string} search - Search term
 * @query   {string} vehicleType - Filter by vehicle type
 * @query   {string} status - Filter by status
 * @query   {string} fuelType - Filter by fuel type
 * @query   {string} sortBy - Sort field (default: created_at)
 * @query   {string} sortOrder - Sort order (default: desc)
 */
router.get('/', authenticateToken, vehicleController.getAllVehicles);

/**
 * @route   GET /api/vehicle/:id
 * @desc    Get vehicle by ID with all related information
 * @access  Private
 * @param   {string} id - Vehicle ID
 */
router.get('/:id', authenticateToken, vehicleController.getVehicleById);

/**
 * @route   POST /api/vehicle
 * @desc    Create new vehicle
 * @access  Private
 * @body    {object} basicInformation - Vehicle basic info
 * @body    {object} specifications - Vehicle specifications
 * @body    {object} capacityDetails - Capacity and dimensions
 * @body    {object} ownershipDetails - Ownership information
 * @body    {object} maintenanceHistory - Maintenance records
 * @body    {object} serviceFrequency - Service frequency settings
 * @body    {array} documents - Vehicle documents
 */
router.post('/', authenticateToken, vehicleController.createVehicle);

/**
 * @route   PUT /api/vehicle/:id
 * @desc    Update vehicle information
 * @access  Private
 * @param   {string} id - Vehicle ID
 * @body    {object} basicInformation - Vehicle basic info
 * @body    {object} specifications - Vehicle specifications
 * @body    {object} capacityDetails - Capacity and dimensions
 * @body    {object} ownershipDetails - Ownership information
 * @body    {object} maintenanceHistory - Maintenance records
 * @body    {object} serviceFrequency - Service frequency settings
 * @body    {array} documents - Vehicle documents
 */
router.put('/:id', authenticateToken, vehicleController.updateVehicle);

/**
 * @route   DELETE /api/vehicle/:id
 * @desc    Soft delete vehicle (set status to INACTIVE)
 * @access  Private
 * @param   {string} id - Vehicle ID
 */
router.delete('/:id', authenticateToken, vehicleController.deleteVehicle);

module.exports = router;
