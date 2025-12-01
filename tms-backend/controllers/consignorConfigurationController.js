const db = require("../config/database");
const consignorConfigurations = require("../config/consignor-configurations.json");
const {
  errorMessages,
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/responseUtils");

/**
 * Get all available consignor configurations
 */
const getConsignorConfigurations = async (req, res) => {
  try {
    const configurations = Object.keys(consignorConfigurations).map(key => ({
      configName: key,
      name: consignorConfigurations[key].name,
      description: consignorConfigurations[key].description,
      table: consignorConfigurations[key].table
    }));

    return sendSuccessResponse(res, configurations, "Consignor configurations retrieved successfully");
  } catch (error) {
    console.error("Error getting consignor configurations:", error);
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get configuration metadata for a specific consignor config
 */
const getConsignorConfigurationMetadata = async (req, res) => {
  try {
    const { configName } = req.params;
    console.log('🔍 getConsignorConfigurationMetadata called for:', configName);
    
    const config = consignorConfigurations[configName];
    if (!config) {
      console.log('❌ Configuration not found:', configName);
      return sendErrorResponse(res, 404, "Configuration not found");
    }

    console.log('✅ Configuration found:', { name: config.name, table: config.table });
    return sendSuccessResponse(res, config, "Consignor configuration metadata retrieved successfully");
  } catch (error) {
    console.error("❌ Error getting consignor configuration metadata:", error);
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get all records for a specific consignor configuration
 */
const getConsignorConfigurationData = async (req, res) => {
  try {
    const { configName } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      sortBy = "", 
      sortOrder = "desc",
      status = ""
    } = req.query;

    console.log('🔍 getConsignorConfigurationData called:', { configName, page, limit, search });

    const config = consignorConfigurations[configName];
    if (!config) {
      return sendErrorResponse(res, 404, "Configuration not found");
    }

    const { table, primaryKey } = config;
    
    // Build query
    let query = db(table);
    
    // Apply search if provided
    if (search && search.trim() !== "") {
      const searchTerm = `%${search.trim()}%`;
      query = query.where(function() {
        Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
          if (fieldConfig.filterable && (fieldConfig.type === 'varchar' || fieldConfig.type === 'text')) {
            this.orWhere(fieldName, 'like', searchTerm);
          }
        });
      });
    }
    
    // Apply status filter
    if (status && status.trim() !== "") {
      if (config.softDelete && config.softDelete.fieldName) {
        query = query.where(config.softDelete.fieldName, status);
      }
    } else {
      // Default to active records only
      if (config.softDelete && config.softDelete.fieldName) {
        query = query.where(config.softDelete.fieldName, config.softDelete.activeValue);
      }
    }
    
    // Get total count
    const countQuery = query.clone();
    const [{ total }] = await countQuery.count('* as total');
    
    // Apply sorting - validate sortBy field exists in current config
    let sortField = primaryKey; // Default to primaryKey
    
    if (sortBy && config.fields && config.fields[sortBy]) {
      // Only use sortBy if it's a valid field in the current configuration
      sortField = sortBy;
    } else if (sortBy && !config.fields[sortBy]) {
      console.log('⚠️ Invalid sortBy field for this configuration, using primaryKey instead:', { 
        configName, 
        invalidSortBy: sortBy, 
        fallbackToPrimaryKey: primaryKey 
      });
    }
    
    console.log('🔧 Sort configuration:', { 
      configName, 
      requestedSortBy: sortBy, 
      configPrimaryKey: primaryKey, 
      finalSortField: sortField,
      isValidSort: !sortBy || !!config.fields[sortBy]
    });
    
    query = query.orderBy(sortField, sortOrder);
    
    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.limit(parseInt(limit)).offset(offset);
    
    const data = await query;
    const totalPages = Math.ceil(total / parseInt(limit));
    
    console.log(`📊 Query results: Found ${data.length} records out of ${total} total for ${configName}`);
    
    const response = {
      data,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecords: total,
        limit: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    };

    return sendSuccessResponse(res, response, "Consignor configuration data retrieved successfully");
  } catch (error) {
    console.error("❌ Error getting consignor configuration data:", error);
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Create a new record
 */
const createConsignorConfigurationRecord = async (req, res) => {
  try {
    const { configName } = req.params;
    const data = req.body;

    const config = consignorConfigurations[configName];
    if (!config) {
      return sendErrorResponse(res, 404, "Configuration not found");
    }

    // Auto-generate ID if needed
    if (config.fields[config.primaryKey]?.autoGenerate) {
      const prefix = config.primaryKey.replace('_id', '').toUpperCase().substring(0, 3);
      data[config.primaryKey] = await generateNextId(config.table, config.primaryKey, prefix);
    }

    // Set audit fields
    const userId = req.user?.user_id || 'SYSTEM';
    data.created_by = userId;
    data.created_at = new Date();
    if (config.fields.created_on) data.created_on = new Date().toTimeString().split(' ')[0];

    // Set default status
    if (config.softDelete && config.softDelete.fieldName && !data[config.softDelete.fieldName]) {
      data[config.softDelete.fieldName] = config.softDelete.activeValue;
    }

    const [insertId] = await db(config.table).insert(data);
    
    const newRecord = await db(config.table)
      .where(config.primaryKey, data[config.primaryKey] || insertId)
      .first();

    return sendSuccessResponse(res, newRecord, "Record created successfully", 201);
  } catch (error) {
    console.error("Error creating record:", error);
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Update an existing record
 */
const updateConsignorConfigurationRecord = async (req, res) => {
  try {
    const { configName, id } = req.params;
    const data = req.body;

    const config = consignorConfigurations[configName];
    if (!config) {
      return sendErrorResponse(res, 404, "Configuration not found");
    }

    delete data[config.primaryKey];

    const userId = req.user?.user_id || 'SYSTEM';
    data.updated_by = userId;
    data.updated_at = new Date();
    if (config.fields.updated_on) data.updated_on = new Date().toTimeString().split(' ')[0];

    await db(config.table).where(config.primaryKey, id).update(data);
    
    const updatedRecord = await db(config.table).where(config.primaryKey, id).first();

    return sendSuccessResponse(res, updatedRecord, "Record updated successfully");
  } catch (error) {
    console.error("Error updating record:", error);
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Delete a record (soft delete)
 */
const deleteConsignorConfigurationRecord = async (req, res) => {
  try {
    const { configName, id } = req.params;

    const config = consignorConfigurations[configName];
    if (!config) {
      return sendErrorResponse(res, 404, "Configuration not found");
    }

    if (config.softDelete && config.softDelete.fieldName) {
      const userId = req.user?.user_id || 'SYSTEM';
      await db(config.table)
        .where(config.primaryKey, id)
        .update({
          [config.softDelete.fieldName]: config.softDelete.inactiveValue,
          updated_by: userId,
          updated_at: new Date()
        });
    } else {
      await db(config.table).where(config.primaryKey, id).del();
    }

    return sendSuccessResponse(res, null, "Record deleted successfully");
  } catch (error) {
    console.error("Error deleting record:", error);
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Generate next auto-increment ID with prefix
 */
const generateNextId = async (table, primaryKeyField, prefix) => {
  try {
    const lastRecord = await db(table)
      .select(primaryKeyField)
      .orderBy(primaryKeyField, 'desc')
      .first();

    let nextNumber = 1;
    if (lastRecord) {
      const lastId = lastRecord[primaryKeyField];
      const numericPart = lastId.replace(/^\D+/g, '');
      nextNumber = parseInt(numericPart) + 1;
    }

    return prefix + String(nextNumber).padStart(4, '0');
  } catch (error) {
    console.error('Error generating next ID:', error);
    return prefix + '0001';
  }
};

module.exports = {
  getConsignorConfigurations,
  getConsignorConfigurationMetadata,
  getConsignorConfigurationData,
  createConsignorConfigurationRecord,
  updateConsignorConfigurationRecord,
  deleteConsignorConfigurationRecord
};