const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
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
} = require("../controllers/transporterVehicleConfigController");

// HDR routes
router.get("/hdr", authenticateToken, getHdrList);
router.get("/hdr/:pk", authenticateToken, getHdrById);
router.post("/hdr", authenticateToken, createHdr);
router.put("/hdr/:pk", authenticateToken, updateHdr);
router.patch("/hdr/:pk/status", authenticateToken, updateHdrStatus);

// ITM (Alerts) routes  
router.get("/hdr/:pk/alerts", authenticateToken, getAlertsByHdrId);
router.post("/hdr/:pk/alerts", authenticateToken, createAlert);
router.put("/hdr/:pk/alerts/:itmPk", authenticateToken, updateAlert);
router.patch("/hdr/:pk/alerts/:itmPk/status", authenticateToken, updateAlertStatus);

// Master data routes
router.get("/masters/vehicle-types", authenticateToken, getVehicleTypes);
router.get("/masters/parameters", authenticateToken, getParameters);
router.get("/masters/alert-types", authenticateToken, getAlertTypes);
router.get("/masters/vehicles", authenticateToken, getVehicles);
router.get("/masters/transporters", authenticateToken, getTransporters);
router.get("/masters/consignors", authenticateToken, getConsignors);
router.get("/masters/users", authenticateToken, getUsers);

module.exports = router;
