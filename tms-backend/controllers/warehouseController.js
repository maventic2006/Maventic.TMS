const knex = require("../config/database");
const {
  validateWarehouseListQuery,
  validateWarehouseCreate,
  validateWarehouseUpdate,
} = require("../validation/warehouseValidation");

// @desc    Get warehouse list with filters and pagination
// @route   GET /api/warehouse
// @access  Private (Consignor, Admin, Super Admin)
const getWarehouseList = async (req, res) => {
  try {
    console.log("📦 Warehouse List API called");
    console.log("Query params:", req.query);
    console.log("User:", req.user);

    // Validate query parameters
    const validation = validateWarehouseListQuery(req.query);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Extract query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    // Filter by consignor ID only if user has consignor_id (not for product_owner/admin)
    const consignorId = req.user.consignor_id || null;

    // Build query with address join for city/state/country
    let query = knex("warehouse_basic_information as w")
      .leftJoin("tms_address as addr", function () {
        this.on("w.warehouse_id", "=", "addr.user_reference_id").andOn(
          "addr.user_type",
          "=",
          knex.raw("'WH'")
        );
      })
      .select(
        "w.warehouse_id",
        "w.consignor_id",
        "w.warehouse_type",
        "w.warehouse_name1",
        knex.raw("0 as geo_fencing"), // Field doesn't exist in table, default to 0
        "w.weigh_bridge_availability",
        "w.virtual_yard_in",
        "w.gatepass_system_available",
        "w.fuel_availability",
        knex.raw("COALESCE(addr.city, 'N/A') as city"),
        knex.raw("COALESCE(addr.state, 'N/A') as state"),
        knex.raw("COALESCE(addr.country, 'N/A') as country"),
        "w.region",
        "w.zone",
        "w.created_by",
        "w.created_at",
        knex.raw("'N/A' as approver"), // Field doesn't exist in table, default to N/A
        knex.raw("NULL as approved_on"), // Field doesn't exist in table, default to NULL
        "w.status"
      );

    // Filter by consignor ID (user's own warehouses)
    if (consignorId) {
      query = query.where("w.consignor_id", consignorId);
    }

    // Apply filters
    if (req.query.warehouseId) {
      query = query.where(
        "w.warehouse_id",
        "like",
        `%${req.query.warehouseId}%`
      );
    }
    if (req.query.warehouseName) {
      query = query.where(
        "w.warehouse_name1",
        "like",
        `%${req.query.warehouseName}%`
      );
    }
    if (req.query.status) {
      query = query.where("w.status", req.query.status);
    }
    if (req.query.weighBridge !== undefined) {
      query = query.where(
        "w.weigh_bridge_availability",
        req.query.weighBridge === "true"
      );
    }
    if (req.query.virtualYardIn !== undefined) {
      query = query.where(
        "w.virtual_yard_in",
        req.query.virtualYardIn === "true"
      );
    }
    if (req.query.fuelAvailability !== undefined) {
      query = query.where(
        "w.fuel_availability",
        req.query.fuelAvailability === "true"
      );
    }

    // Get total count (create separate query for counting)
    const countResult = await knex("warehouse_basic_information as w")
      .count("* as count")
      .where((builder) => {
        // Apply same filters as main query
        if (consignorId) {
          builder.where("w.consignor_id", consignorId);
        }
        if (req.query.warehouseId) {
          builder.where("w.warehouse_id", "like", `%${req.query.warehouseId}%`);
        }
        if (req.query.warehouseName) {
          builder.where(
            "w.warehouse_name1",
            "like",
            `%${req.query.warehouseName}%`
          );
        }
        if (req.query.status) {
          builder.where("w.status", req.query.status);
        }
        if (req.query.weighBridge !== undefined) {
          builder.where(
            "w.weigh_bridge_availability",
            req.query.weighBridge === "true"
          );
        }
        if (req.query.virtualYardIn !== undefined) {
          builder.where(
            "w.virtual_yard_in",
            req.query.virtualYardIn === "true"
          );
        }
        if (req.query.fuelAvailability !== undefined) {
          builder.where(
            "w.fuel_availability",
            req.query.fuelAvailability === "true"
          );
        }
      })
      .first();

    const total = parseInt(countResult.count);

    // Get paginated results
    const warehouses = await query
      .orderBy("w.created_at", "desc")
      .limit(limit)
      .offset(offset);

    console.log(`✅ Found ${warehouses.length} warehouses`);

    res.json({
      success: true,
      warehouses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching warehouses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch warehouses",
      error: error.message,
    });
  }
};

// @desc    Get warehouse by ID
// @route   GET /api/warehouse/:id
// @access  Private (Consignor, Admin, Super Admin)
const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📦 Fetching warehouse: ${id}`);

    const warehouse = await knex("warehouse_basic_information as w")
      .select("w.*")
      .where("w.warehouse_id", id)
      .first();

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    console.log(`✅ Warehouse found: ${warehouse.warehouse_name1}`);

    res.json({
      success: true,
      warehouse,
    });
  } catch (error) {
    console.error("❌ Error fetching warehouse:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch warehouse",
      error: error.message,
    });
  }
};

// @desc    Create new warehouse
// @route   POST /api/warehouse
// @access  Private (Consignor, Admin, Super Admin)
const createWarehouse = async (req, res) => {
  try {
    console.log("📦 Creating new warehouse");
    console.log("Request body:", req.body);

    // Validate request body
    const validation = validateWarehouseCreate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // TODO: Implement warehouse creation logic
    // For now, return a placeholder response
    res.status(501).json({
      success: false,
      message: "Warehouse creation not yet implemented",
    });
  } catch (error) {
    console.error("❌ Error creating warehouse:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create warehouse",
      error: error.message,
    });
  }
};

// @desc    Update warehouse
// @route   PUT /api/warehouse/:id
// @access  Private (Consignor, Admin, Super Admin)
const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📦 Updating warehouse: ${id}`);

    // Validate request body
    const validation = validateWarehouseUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // TODO: Implement warehouse update logic
    res.status(501).json({
      success: false,
      message: "Warehouse update not yet implemented",
    });
  } catch (error) {
    console.error("❌ Error updating warehouse:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update warehouse",
      error: error.message,
    });
  }
};

// @desc    Get master data (warehouse types, material types, address types, sub-location types)
// @route   GET /api/warehouse/master-data
// @access  Private (Consignor, Admin, Super Admin)
const getMasterData = async (req, res) => {
  try {
    console.log("📦 Fetching warehouse master data");

    // Fetch warehouse types
    const warehouseTypes = await knex("warehouse_type_master")
      .select("warehouse_type_id", "warehouse_type")
      .where("status", "ACTIVE")
      .orderBy("warehouse_type");

    // Fetch material types
    const materialTypes = await knex("material_types_master")
      .select("material_types_id", "material_types")
      .where("status", "ACTIVE")
      .orderBy("material_types");

    // Fetch address types
    const addressTypes = await knex("address_type_master")
      .select("address_type_id", "address")
      .where("status", "ACTIVE")
      .orderBy("address");

    // Fetch sub-location types
    const subLocationTypes = await knex("warehouse_sub_location_master")
      .select("sub_location_id", "warehouse_sub_location_description")
      .where("status", "ACTIVE")
      .orderBy("warehouse_sub_location_description");

    console.log(
      `✅ Found ${warehouseTypes.length} warehouse types, ${materialTypes.length} material types, ${addressTypes.length} address types, ${subLocationTypes.length} sub-location types`
    );

    res.json({
      success: true,
      warehouseTypes,
      materialTypes,
      addressTypes,
      subLocationTypes,
    });
  } catch (error) {
    console.error("❌ Error fetching master data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch master data",
      error: error.message,
    });
  }
};

module.exports = {
  getWarehouseList,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  getMasterData,
};
