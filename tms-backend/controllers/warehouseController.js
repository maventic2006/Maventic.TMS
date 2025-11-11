const knex = require('../config/database');
const {
  validateWarehouseListQuery,
  validateWarehouseCreate,
  validateWarehouseUpdate,
} = require('../validation/warehouseValidation');

// @desc    Get warehouse list with filters and pagination
// @route   GET /api/warehouse/list
// @access  Private (Consignor, Admin, Super Admin)
const getWarehouseList = async (req, res) => {
  try {
    console.log('📦 Warehouse List API called');
    console.log('Query params:', req.query);
    console.log('User:', req.user);

    // Validate query parameters
    const validation = validateWarehouseListQuery(req.query);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Extract query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;
    const consignorId = req.user.consignor_id; // Filter by logged-in consignor

    // Build query
    let query = knex('warehouse_basic_information as w')
      .leftJoin('warehouse_type_master as wt', 'w.warehouse_type_id', 'wt.warehouse_type_id')
      .select(
        'w.warehouse_id',
        'w.consignor_id',
        'w.warehouse_type_id',
        'wt.warehouse_type as warehouse_type_name',
        'w.warehouse_name_1',
        'w.weigh_bridge',
        'w.virtual_yard_in',
        'w.geo_fencing',
        'w.gate_pass',
        'w.fuel_filling',
        'w.city',
        'w.state',
        'w.country',
        'w.created_by',
        'w.created_at',
        'w.status',
        'w.approver',
        'w.approved_on'
      );

    // Filter by consignor ID (user's own warehouses)
    if (consignorId) {
      query = query.where('w.consignor_id', consignorId);
    }

    // Apply filters
    if (req.query.warehouseId) {
      query = query.where('w.warehouse_id', 'like', `%${req.query.warehouseId}%`);
    }
    if (req.query.warehouseName) {
      query = query.where('w.warehouse_name_1', 'like', `%${req.query.warehouseName}%`);
    }
    if (req.query.status) {
      query = query.where('w.status', req.query.status);
    }
    if (req.query.weighBridge !== undefined) {
      query = query.where('w.weigh_bridge', req.query.weighBridge === 'true');
    }
    if (req.query.virtualYardIn !== undefined) {
      query = query.where('w.virtual_yard_in', req.query.virtualYardIn === 'true');
    }
    if (req.query.geoFencing !== undefined) {
      query = query.where('w.geo_fencing', req.query.geoFencing === 'true');
    }

    // Get total count
    const countQuery = query.clone();
    const [{ count }] = await countQuery.count('* as count');
    const total = parseInt(count);

    // Get paginated results
    const warehouses = await query
      .orderBy('w.created_at', 'desc')
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
    console.error('❌ Error fetching warehouses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch warehouses',
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

    const warehouse = await knex('warehouse_basic_information as w')
      .leftJoin('warehouse_type_master as wt', 'w.warehouse_type_id', 'wt.warehouse_type_id')
      .select('w.*', 'wt.warehouse_type as warehouse_type_name')
      .where('w.warehouse_id', id)
      .first();

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: 'Warehouse not found',
      });
    }

    console.log(`✅ Warehouse found: ${warehouse.warehouse_name_1}`);

    res.json({
      success: true,
      warehouse,
    });
  } catch (error) {
    console.error('❌ Error fetching warehouse:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch warehouse',
      error: error.message,
    });
  }
};

// @desc    Create new warehouse
// @route   POST /api/warehouse
// @access  Private (Consignor, Admin, Super Admin)
const createWarehouse = async (req, res) => {
  try {
    console.log('📦 Creating new warehouse');
    console.log('Request body:', req.body);

    // Validate request body
    const validation = validateWarehouseCreate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // TODO: Implement warehouse creation logic
    // For now, return a placeholder response
    res.status(501).json({
      success: false,
      message: 'Warehouse creation not yet implemented',
    });
  } catch (error) {
    console.error('❌ Error creating warehouse:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create warehouse',
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
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // TODO: Implement warehouse update logic
    res.status(501).json({
      success: false,
      message: 'Warehouse update not yet implemented',
    });
  } catch (error) {
    console.error('❌ Error updating warehouse:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update warehouse',
      error: error.message,
    });
  }
};

// @desc    Get master data (warehouse types, etc.)
// @route   GET /api/warehouse/master-data
// @access  Private (Consignor, Admin, Super Admin)
const getMasterData = async (req, res) => {
  try {
    console.log('📦 Fetching warehouse master data');

    const warehouseTypes = await knex('warehouse_type_master')
      .select('warehouse_type_id', 'warehouse_type')
      .where('status', 'ACTIVE')
      .orderBy('warehouse_type');

    console.log(`✅ Found ${warehouseTypes.length} warehouse types`);

    res.json({
      success: true,
      warehouseTypes,
      subLocationTypes: [], // TODO: Add when needed
    });
  } catch (error) {
    console.error('❌ Error fetching master data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch master data',
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
