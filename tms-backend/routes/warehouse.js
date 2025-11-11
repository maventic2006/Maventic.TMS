const express = require("express");
const router = express.Router();
const {
  getWarehouseList,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  getMasterData,
} = require("../controllers/warehouseController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// All routes require authentication
router.use(authenticateToken);

// Routes accessible by Consignor, Admin, and Super Admin
const allowedRoles = ["consignor", "admin", "product_owner"]; // Using product_owner as super admin equivalent

// GET /api/warehouse/list - Get paginated warehouse list with filters
router.get("/list", authorizeRoles(allowedRoles), getWarehouseList);

// GET /api/warehouse/master-data - Get master data (warehouse types, etc.)
router.get("/master-data", authorizeRoles(allowedRoles), getMasterData);

// GET /api/warehouse/:id - Get warehouse by ID
router.get("/:id", authorizeRoles(allowedRoles), getWarehouseById);

// POST /api/warehouse - Create new warehouse
router.post("/", authorizeRoles(allowedRoles), createWarehouse);

// PUT /api/warehouse/:id - Update warehouse
router.put("/:id", authorizeRoles(allowedRoles), updateWarehouse);

module.exports = router;
