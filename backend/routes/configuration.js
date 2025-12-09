const express = require("express");
const router = express.Router();
const {
  getConfigurations,
  getConfigurationMetadata,
  getConfigurationData,
  getConfigurationRecord,
  createConfigurationRecord,
  updateConfigurationRecord,
  deleteConfigurationRecord,
  getDropdownOptions
} = require("../controllers/configurationController");
const { authenticateToken } = require("../middleware/auth");

/**
 * @route GET /api/configuration
 * @desc Get list of all available master configurations
 * @access Protected
 */
router.get("/", authenticateToken, getConfigurations);

/**
 * @route GET /api/configuration/dropdown-options/:type
 * @desc Get dropdown options for a specific type (e.g., status, document-type)
 * @access Protected
 */
router.get("/dropdown-options/:type", authenticateToken, getDropdownOptions);

/**
 * @route GET /api/configuration/:configName/metadata
 * @desc Get metadata for a specific configuration
 * @access Protected
 */
router.get("/:configName/metadata", authenticateToken, getConfigurationMetadata);

/**
 * @route GET /api/configuration/:configName/data
 * @desc Get paginated data for a specific configuration
 * @query page, limit, search, sortBy, sortOrder, status
 * @access Protected
 */
router.get("/:configName/data", authenticateToken, getConfigurationData);

/**
 * @route GET /api/configuration/:configName/:id
 * @desc Get a specific record by ID
 * @access Protected
 */
router.get("/:configName/:id", authenticateToken, getConfigurationRecord);

/**
 * @route POST /api/configuration/:configName
 * @desc Create a new record in the specified configuration
 * @access Protected
 */
router.post("/:configName", authenticateToken, createConfigurationRecord);

/**
 * @route PUT /api/configuration/:configName/:id
 * @desc Update an existing record
 * @access Protected
 */
router.put("/:configName/:id", authenticateToken, updateConfigurationRecord);

/**
 * @route DELETE /api/configuration/:configName/:id
 * @desc Delete (soft delete) a record
 * @access Protected
 */
router.delete("/:configName/:id", authenticateToken, deleteConfigurationRecord);

module.exports = router;