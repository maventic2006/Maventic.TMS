const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const vehicleController = require("../controllers/vehicleController");

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
router.get("/master-data", authenticateToken, vehicleController.getMasterData);

/**
 * @route   GET /api/vehicle/rc-lookup/:registrationNumber
 * @desc    Lookup vehicle details from RC database
 * @access  Private
 * @param   {string} registrationNumber - Vehicle registration number
 */
router.get('/rc-lookup/:registrationNumber', authenticateToken, vehicleController.lookupVehicleByRC);

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
router.get("/", authenticateToken, vehicleController.getAllVehicles);

/**
 * @route   GET /api/vehicle/:id
 * @desc    Get vehicle by ID with all related information
 * @access  Private
 * @param   {string} id - Vehicle ID
 */
router.get("/:id", authenticateToken, vehicleController.getVehicleById);

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
router.post("/", authenticateToken, vehicleController.createVehicle);

// ============================================================================
// DRAFT WORKFLOW ROUTES
// ============================================================================

/**
 * @route   POST /api/vehicle/save-draft
 * @desc    Save vehicle as draft (minimal validation)
 * @access  Private
 * @body    {object} basicInformation - Vehicle basic info (partial)
 * @body    {object} specifications - Vehicle specifications (partial)
 * @body    {object} capacityDetails - Capacity and dimensions (partial)
 * @body    {object} ownershipDetails - Ownership information (partial)
 * @body    {object} maintenanceHistory - Maintenance records (partial)
 * @body    {array} documents - Vehicle documents (partial)
 */
router.post(
  "/save-draft",
  authenticateToken,
  vehicleController.saveVehicleAsDraft
);

/**
 * @route   PUT /api/vehicle/:id/update-draft
 * @desc    Update vehicle draft (no validation, creator only)
 * @access  Private
 * @param   {string} id - Vehicle ID
 * @body    {object} basicInformation - Vehicle basic info
 * @body    {object} specifications - Vehicle specifications
 * @body    {object} capacityDetails - Capacity and dimensions
 * @body    {object} ownershipDetails - Ownership information
 * @body    {object} maintenanceHistory - Maintenance records
 * @body    {array} documents - Vehicle documents
 */
router.put(
  "/:id/update-draft",
  authenticateToken,
  vehicleController.updateVehicleDraft
);

/**
 * @route   PUT /api/vehicle/:id/submit-draft
 * @desc    Submit vehicle draft for approval (full validation, DRAFT -> PENDING)
 * @access  Private
 * @param   {string} id - Vehicle ID
 * @body    {object} basicInformation - Vehicle basic info (required)
 * @body    {object} specifications - Vehicle specifications (required)
 * @body    {object} capacityDetails - Capacity and dimensions
 * @body    {object} ownershipDetails - Ownership information
 * @body    {object} maintenanceHistory - Maintenance records
 * @body    {object} serviceFrequency - Service frequency settings
 * @body    {array} documents - Vehicle documents
 */
router.put(
  "/:id/submit-draft",
  authenticateToken,
  vehicleController.submitVehicleFromDraft
);

/**
 * @route   DELETE /api/vehicle/:id/delete-draft
 * @desc    Delete vehicle draft (hard delete, creator only)
 * @access  Private
 * @param   {string} id - Vehicle ID
 */
router.delete(
  "/:id/delete-draft",
  authenticateToken,
  vehicleController.deleteVehicleDraft
);

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
router.put("/:id", authenticateToken, vehicleController.updateVehicle);

/**
 * @route   DELETE /api/vehicle/:id
 * @desc    Soft delete vehicle (set status to INACTIVE)
 * @access  Private
 * @param   {string} id - Vehicle ID
 */
router.delete("/:id", authenticateToken, vehicleController.deleteVehicle);

module.exports = router;
