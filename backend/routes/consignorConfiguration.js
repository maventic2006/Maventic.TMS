const express = require("express");
const router = express.Router();
const {
  getConsignorConfigurations,
  getConsignorConfigurationMetadata,
  getConsignorConfigurationData,
  getConsignorConfigurationDropdownOptions,
  getTableSchemaInfo,
  createConsignorConfigurationRecord,
  updateConsignorConfigurationRecord,
  deleteConsignorConfigurationRecord
} = require("../controllers/consignorConfigurationController");
const { authenticateToken } = require("../middleware/auth");

/**
 * @route GET /api/consignor-configuration
 * @desc Get list of all available consignor configurations
 * @access Protected
 */
router.get("/", authenticateToken, getConsignorConfigurations);

/**
 * @route GET /api/consignor-configuration/:configName/metadata
 * @desc Get metadata for a specific consignor configuration
 * @access Protected
 */
router.get("/:configName/metadata", authenticateToken, getConsignorConfigurationMetadata);

/**
 * @route GET /api/consignor-configuration/:configName/data
 * @desc Get paginated data for a specific consignor configuration
 * @query page, limit, search, sortBy, sortOrder, status
 * @access Protected
 */
router.get("/:configName/data", authenticateToken, getConsignorConfigurationData);

/**
 * @route GET /api/consignor-configuration/:configName/dropdown-options
 * @desc Get dropdown options for select fields in a specific consignor configuration
 * @access Protected
 */
router.get("/:configName/dropdown-options", authenticateToken, getConsignorConfigurationDropdownOptions);

/**
 * @route GET /api/consignor-configuration/:configName/schema
 * @desc Get database table schema information for a specific consignor configuration
 * @access Protected
 */
router.get("/:configName/schema", authenticateToken, getTableSchemaInfo);

/**
 * @route POST /api/consignor-configuration/:configName
 * @desc Create a new record in the specified consignor configuration
 * @access Protected
 */
router.post("/:configName", authenticateToken, createConsignorConfigurationRecord);

/**
 * @route PUT /api/consignor-configuration/:configName/:id
 * @desc Update an existing consignor configuration record
 * @access Protected
 */
router.put("/:configName/:id", authenticateToken, updateConsignorConfigurationRecord);

/**
 * @route DELETE /api/consignor-configuration/:configName/:id
 * @desc Delete (soft delete) a consignor configuration record
 * @access Protected
 */
router.delete("/:configName/:id", authenticateToken, deleteConsignorConfigurationRecord);

module.exports = router;