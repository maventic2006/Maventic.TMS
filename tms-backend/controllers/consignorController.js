/**
 * Consignor Controller
 * Handles HTTP requests and responses for consignor endpoints
 * Delegates business logic to consignorService
 */

const consignorService = require('../services/consignorService');
const {
  successResponse,
  validationErrorResponse,
  databaseErrorResponse,
  notFoundResponse,
  internalServerErrorResponse,
  getPaginationMeta
} = require('../utils/responseHelper');

/**
 * GET /api/consignors
 * Get list of consignors with filters, search, and pagination
 */
const getConsignors = async (req, res) => {
  try {
    console.log('\n📋 ===== GET CONSIGNORS LIST =====');
    console.log('Query params:', req.query);

    const result = await consignorService.getConsignorList(req.query);

    console.log(`✅ Retrieved ${result.data.length} consignors`);
    return successResponse(res, result.data, result.meta, 200);
  } catch (error) {
    console.error('❌ Get consignors error:', error);

    if (error.type === 'VALIDATION_ERROR') {
      return validationErrorResponse(res, { details: error.details });
    }

    return internalServerErrorResponse(res, error);
  }
};

/**
 * GET /api/consignors/:id
 * Get consignor details by customer ID
 */
const getConsignorById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n📄 ===== GET CONSIGNOR BY ID: ${id} =====`);

    const consignor = await consignorService.getConsignorById(id);

    console.log('✅ Consignor retrieved successfully');
    return successResponse(res, consignor, null, 200);
  } catch (error) {
    console.error('❌ Get consignor by ID error:', error);

    if (error.type === 'NOT_FOUND') {
      return notFoundResponse(res, 'Consignor', req.params.id);
    }

    return internalServerErrorResponse(res, error);
  }
};

/**
 * POST /api/consignors
 * Create new consignor with contacts, organization, and documents
 */
const createConsignor = async (req, res) => {
  try {
    console.log('\n➕ ===== CREATE CONSIGNOR =====');
    console.log('User ID:', req.user.user_id);

    // Parse JSON payload from body field (for multipart/form-data)
    let payload = req.body;
    if (req.body.payload && typeof req.body.payload === 'string') {
      try {
        payload = JSON.parse(req.body.payload);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return validationErrorResponse(res, {
          details: [
            {
              field: 'payload',
              message: 'Invalid JSON format in payload field'
            }
          ]
        });
      }
    }

    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');

    const consignor = await consignorService.createConsignor(
      payload,
      req.files || {},
      req.user.user_id
    );

    console.log('✅ Consignor created successfully');
    return successResponse(res, consignor, null, 201);
  } catch (error) {
    console.error('❌ Create consignor error:', error);

    if (error.type === 'VALIDATION_ERROR') {
      return validationErrorResponse(res, { details: error.details });
    }

    if (error.errno || error.code) {
      return databaseErrorResponse(res, error);
    }

    return internalServerErrorResponse(res, error);
  }
};

/**
 * PUT /api/consignors/:id
 * Update existing consignor (full or partial update)
 */
const updateConsignor = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n✏️  ===== UPDATE CONSIGNOR: ${id} =====`);
    console.log('User ID:', req.user.user_id);

    // Parse JSON payload from body field (for multipart/form-data)
    let payload = req.body;
    if (req.body.payload && typeof req.body.payload === 'string') {
      try {
        payload = JSON.parse(req.body.payload);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return validationErrorResponse(res, {
          details: [
            {
              field: 'payload',
              message: 'Invalid JSON format in payload field'
            }
          ]
        });
      }
    }

    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');

    const consignor = await consignorService.updateConsignor(
      id,
      payload,
      req.files || {},
      req.user.user_id
    );

    console.log('✅ Consignor updated successfully');
    return successResponse(res, consignor, null, 200);
  } catch (error) {
    console.error('❌ Update consignor error:', error);

    if (error.type === 'NOT_FOUND') {
      return notFoundResponse(res, 'Consignor', req.params.id);
    }

    if (error.type === 'VALIDATION_ERROR') {
      return validationErrorResponse(res, { details: error.details });
    }

    if (error.errno || error.code) {
      return databaseErrorResponse(res, error);
    }

    return internalServerErrorResponse(res, error);
  }
};

/**
 * DELETE /api/consignors/:id
 * Soft delete consignor (sets status to INACTIVE)
 */
const deleteConsignor = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`\n🗑️  ===== DELETE CONSIGNOR: ${id} =====`);
    console.log('User ID:', req.user.user_id);

    const result = await consignorService.deleteConsignor(id, req.user.user_id);

    console.log('✅ Consignor deleted successfully');
    return successResponse(res, result, null, 200);
  } catch (error) {
    console.error('❌ Delete consignor error:', error);

    if (error.type === 'NOT_FOUND') {
      return notFoundResponse(res, 'Consignor', req.params.id);
    }

    return internalServerErrorResponse(res, error);
  }
};

/**
 * GET /api/consignors/master-data
 * Get master data for dropdowns (industries, currencies, document types)
 */
const getMasterData = async (req, res) => {
  try {
    console.log('\n📊 ===== GET MASTER DATA =====');

    const masterData = await consignorService.getMasterData();

    console.log('✅ Master data retrieved successfully');
    return successResponse(res, masterData, null, 200);
  } catch (error) {
    console.error('❌ Get master data error:', error);
    return internalServerErrorResponse(res, error);
  }
};

module.exports = {
  getConsignors,
  getConsignorById,
  createConsignor,
  updateConsignor,
  deleteConsignor,
  getMasterData
};
