const db = require("../config/database");
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/responseUtils");
const transporterVehicleConfigService = require("../services/transporterVehicleConfigService");

/**
 * Get paginated list of HDR records
 */
const getHdrList = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", include_inactive = false } = req.query;
    
    const result = await transporterVehicleConfigService.getHdrList({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      include_inactive: include_inactive === "true"
    });
    
    return sendSuccessResponse(res, result, "HDR list retrieved successfully");
  } catch (error) {
    console.error("Error getting HDR list:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve HDR list");
  }
};

/**
 * Get single HDR by ID with ITM rows and resolved names
 */
const getHdrById = async (req, res) => {
  try {
    const { pk } = req.params;
    
    const result = await transporterVehicleConfigService.getHdrById(pk);
    
    if (!result) {
      return sendErrorResponse(res, 404, "HDR record not found");
    }
    
    return sendSuccessResponse(res, result, "HDR retrieved successfully");
  } catch (error) {
    console.error("Error getting HDR by ID:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve HDR");
  }
};

/**
 * Create new HDR record
 */
const createHdr = async (req, res) => {
  try {
    const userId = req.user?.user_id || "SYSTEM";
    const hdrData = { ...req.body, created_by: userId, updated_by: userId };
    
    const result = await transporterVehicleConfigService.createHdr(hdrData);
    
    return sendSuccessResponse(res, result, "HDR created successfully", 201);
  } catch (error) {
    console.error("Error creating HDR:", error);
    if (error.message.includes("validation")) {
      return sendErrorResponse(res, 400, error.message);
    }
    return sendErrorResponse(res, 500, "Failed to create HDR");
  }
};

/**
 * Update existing HDR record
 */
const updateHdr = async (req, res) => {
  try {
    const { pk } = req.params;
    const userId = req.user?.user_id || "SYSTEM";
    const hdrData = { ...req.body, updated_by: userId };
    
    const result = await transporterVehicleConfigService.updateHdr(pk, hdrData);
    
    if (!result) {
      return sendErrorResponse(res, 404, "HDR record not found");
    }
    
    return sendSuccessResponse(res, result, "HDR updated successfully");
  } catch (error) {
    console.error("Error updating HDR:", error);
    if (error.message.includes("validation")) {
      return sendErrorResponse(res, 400, error.message);
    }
    return sendErrorResponse(res, 500, "Failed to update HDR");
  }
};

/**
 * Update HDR status (soft delete/reactivate)
 */
const updateHdrStatus = async (req, res) => {
  try {
    const { pk } = req.params;
    const { status } = req.body;
    const userId = req.user?.user_id || "SYSTEM";
    
    if (!["active", "inactive"].includes(status)) {
      return sendErrorResponse(res, 400, "Invalid status value");
    }
    
    const result = await transporterVehicleConfigService.updateHdrStatus(pk, status, userId);
    
    return sendSuccessResponse(res, result, `HDR ${status === "active" ? "activated" : "deactivated"} successfully`);
  } catch (error) {
    console.error("Error updating HDR status:", error);
    return sendErrorResponse(res, 500, "Failed to update HDR status");
  }
};

/**
 * Get all alerts for an HDR
 */
const getAlertsByHdrId = async (req, res) => {
  try {
    const { pk } = req.params;
    
    const alerts = await transporterVehicleConfigService.getAlertsByHdrId(pk);
    
    return sendSuccessResponse(res, alerts, "Alerts retrieved successfully");
  } catch (error) {
    console.error("Error getting alerts:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve alerts");
  }
};

/**
 * Create new alert for HDR
 */
const createAlert = async (req, res) => {
  try {
    const { pk } = req.params;
    const userId = req.user?.user_id || "SYSTEM";
    const alertData = { ...req.body, vehicle_config_hdr_id: pk, created_by: userId, updated_by: userId };
    
    const result = await transporterVehicleConfigService.createAlert(alertData);
    
    return sendSuccessResponse(res, result, "Alert created successfully", 201);
  } catch (error) {
    console.error("Error creating alert:", error);
    if (error.message.includes("validation")) {
      return sendErrorResponse(res, 400, error.message);
    }
    return sendErrorResponse(res, 500, "Failed to create alert");
  }
};

/**
 * Update existing alert
 */
const updateAlert = async (req, res) => {
  try {
    const { itmPk } = req.params;
    const userId = req.user?.user_id || "SYSTEM";
    const alertData = { ...req.body, updated_by: userId };
    
    const result = await transporterVehicleConfigService.updateAlert(itmPk, alertData);
    
    if (!result) {
      return sendErrorResponse(res, 404, "Alert not found");
    }
    
    return sendSuccessResponse(res, result, "Alert updated successfully");
  } catch (error) {
    console.error("Error updating alert:", error);
    return sendErrorResponse(res, 500, "Failed to update alert");
  }
};

/**
 * Update alert status
 */
const updateAlertStatus = async (req, res) => {
  try {
    const { itmPk } = req.params;
    const { status } = req.body;
    const userId = req.user?.user_id || "SYSTEM";
    
    if (!["active", "inactive"].includes(status)) {
      return sendErrorResponse(res, 400, "Invalid status value");
    }
    
    const result = await transporterVehicleConfigService.updateAlertStatus(itmPk, status, userId);
    
    return sendSuccessResponse(res, result, `Alert ${status === "active" ? "activated" : "deactivated"} successfully`);
  } catch (error) {
    console.error("Error updating alert status:", error);
    return sendErrorResponse(res, 500, "Failed to update alert status");
  }
};

/**
 * Get vehicle types master data
 */
const getVehicleTypes = async (req, res) => {
  try {
    const vehicleTypes = await transporterVehicleConfigService.getVehicleTypes();
    return sendSuccessResponse(res, vehicleTypes, "Vehicle types retrieved successfully");
  } catch (error) {
    console.error("Error getting vehicle types:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve vehicle types");
  }
};

/**
 * Get parameters master data
 */
const getParameters = async (req, res) => {
  try {
    const parameters = await transporterVehicleConfigService.getParameters();
    return sendSuccessResponse(res, parameters, "Parameters retrieved successfully");
  } catch (error) {
    console.error("Error getting parameters:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve parameters");
  }
};

/**
 * Get alert types (from ITM table distinct values)
 */
const getAlertTypes = async (req, res) => {
  try {
    const alertTypes = await transporterVehicleConfigService.getAlertTypes();
    return sendSuccessResponse(res, alertTypes, "Alert types retrieved successfully");
  } catch (error) {
    console.error("Error getting alert types:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve alert types");
  }
};

/**
 * Get vehicles for dropdown
 */
const getVehicles = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const vehicles = await transporterVehicleConfigService.getVehicles(search);
    return sendSuccessResponse(res, vehicles, "Vehicles retrieved successfully");
  } catch (error) {
    console.error("Error getting vehicles:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve vehicles");
  }
};

/**
 * Get transporters for dropdown
 */
const getTransporters = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const transporters = await transporterVehicleConfigService.getTransporters(search);
    return sendSuccessResponse(res, transporters, "Transporters retrieved successfully");
  } catch (error) {
    console.error("Error getting transporters:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve transporters");
  }
};

/**
 * Get consignors for dropdown
 */
const getConsignors = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const consignors = await transporterVehicleConfigService.getConsignors(search);
    return sendSuccessResponse(res, consignors, "Consignors retrieved successfully");
  } catch (error) {
    console.error("Error getting consignors:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve consignors");
  }
};

/**
 * Get users for dropdown
 */
const getUsers = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const users = await transporterVehicleConfigService.getUsers(search);
    return sendSuccessResponse(res, users, "Users retrieved successfully");
  } catch (error) {
    console.error("Error getting users:", error);
    return sendErrorResponse(res, 500, "Failed to retrieve users");
  }
};

module.exports = {
  getHdrList,
  getHdrById,
  createHdr,
  updateHdr,
  updateHdrStatus,
  getAlertsByHdrId,
  createAlert,
  updateAlert,
  updateAlertStatus,
  getVehicleTypes,
  getParameters,
  getAlertTypes,
  getVehicles,
  getTransporters,
  getConsignors,
  getUsers
};
