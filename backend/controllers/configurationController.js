const db = require("../config/database");
const masterConfigurations = require("../config/master-configurations.json");
const {
  errorMessages,
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/responseUtils");

/**
 * Get all available master configurations
 */
const getConfigurations = async (req, res) => {
  try {
    const configurations = Object.keys(masterConfigurations).map(key => ({
      configName: key,
      name: masterConfigurations[key].name,
      description: masterConfigurations[key].description,
      table: masterConfigurations[key].table
    }));

    return sendSuccessResponse(res, configurations, "Master configurations retrieved successfully");
  } catch (error) {
    console.error("Error getting configurations:", error);
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get configuration metadata for a specific config
 */
const getConfigurationMetadata = async (req, res) => {
  try {
    const { configName } = req.params;
    console.log('🔍 getConfigurationMetadata called for:', configName);
    
    const config = masterConfigurations[configName];
    if (!config) {
      console.error(`❌ Configuration '${configName}' not found in master-configurations.json`);
      console.log('Available configurations:', Object.keys(masterConfigurations));
      return sendErrorResponse(res, 404, `Configuration '${configName}' not found`);
    }

    console.log('✅ Configuration found:', { name: config.name, table: config.table });

    //
    // Enhance config with dynamic dropdown options
    const enhancedConfig = { ...config };
    
    // For each field with inputType 'select', fetch options from database if possible
    if (enhancedConfig.fields) {
      for (const [fieldName, fieldConfig] of Object.entries(enhancedConfig.fields)) {
        // For status fields, use hardcoded ACTIVE/INACTIVE options from configuration
        // Don't fetch from status_master table to maintain consistency
        if (fieldName === 'status' && fieldConfig.options) {
          // Use the hardcoded options from master-configurations.json
          console.log(`✅ Using hardcoded status options: ${fieldConfig.options.join(', ')}`);
          // No need to override - options are already in the config
        }
        // Note: Removed dynamic loading from status_master table for status field
        // This ensures all configurations show only ACTIVE/INACTIVE options
      }
    }

    return sendSuccessResponse(res, enhancedConfig, "Configuration metadata retrieved successfully");
  } catch (error) {
    console.error("❌ Error getting configuration metadata:", error);
    console.error("❌ Error stack:", error.stack);
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get all records for a specific master configuration
 */
const getConfigurationData = async (req, res) => {
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

    console.log('🔍 getConfigurationData called:', { configName, page, limit, search, sortBy, sortOrder, status });

    const config = masterConfigurations[configName];
    if (!config) {
      console.error(`❌ Configuration '${configName}' not found in master-configurations.json`);
      return sendErrorResponse(res, 404, `Configuration '${configName}' not found`);
    }

    const { table, displayField, primaryKey, fields } = config;
    console.log('📋 Configuration details:', { table, displayField, primaryKey });

    // Determine the default sort field - prefer created_on, fallback to created_at, then primaryKey
    let defaultSortField = primaryKey;
    if (fields) {
      if (fields['created_on']) {
        defaultSortField = 'created_on';
      } else if (fields['created_at']) {
        defaultSortField = 'created_at';
      }
    }
    
    const actualSortBy = sortBy || defaultSortField;
    console.log('🔀 Sort field determined:', actualSortBy);

    const offset = (page - 1) * limit;

    // Build query
    let query = db(table);
    console.log('🗄️ Querying table:', table);

    // Apply search filter
    if (search) {
      query = query.where(displayField, 'like', `%${search}%`);
      console.log('🔎 Search filter applied:', { displayField, search });
    }

    // Apply status filter (only if status field exists in configuration)
    const hasStatusField = fields && fields.status;
    
    if (status && status !== 'all' && hasStatusField) {
      query = query.where('status', status);
      console.log('📊 Status filter applied:', status);
    } else if ((!status || status === '') && hasStatusField) {
      // Default to ACTIVE records only (don't show soft-deleted records)
      query = query.where('status', 'ACTIVE');
      console.log('📊 Default status filter applied: ACTIVE (hiding soft-deleted records)');
    } else if (!hasStatusField) {
      console.log('📊 No status field in table - skipping status filter');
    }

    // Get total count for pagination
    const totalQuery = query.clone();
    console.log('📊 Counting total records...');
    const [{ total }] = await totalQuery.count(`${primaryKey} as total`);
    console.log('✅ Total records found:', total);

    // Apply pagination and sorting
    console.log('📄 Fetching records with pagination:', { actualSortBy, sortOrder, limit, offset });
    const records = await query
      .orderBy(actualSortBy, sortOrder)
      .limit(limit)
      .offset(offset);

    console.log('✅ Records fetched:', records.length);
    console.log('📝 Sample record:', records[0] || 'No records');

    const response = {
      data: records,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit: parseInt(limit)
      }
    };

    return sendSuccessResponse(res, response, "Configuration data retrieved successfully");
  } catch (error) {
    console.error("❌ Error getting configuration data:", error);
    console.error("❌ Error stack:", error.stack);
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get a single record by ID
 */
const getConfigurationRecord = async (req, res) => {
  try {
    const { configName, id } = req.params;
    
    const config = masterConfigurations[configName];
    if (!config) {
      return sendErrorResponse(res, 404, `Configuration '${configName}' not found`);
    }

    const { table, primaryKey } = config;
    
    const record = await db(table).where(primaryKey, id).first();
    
    if (!record) {
      return sendErrorResponse(res, 404, "Record not found");
    }

    return sendSuccessResponse(res, record, "Record retrieved successfully");
  } catch (error) {
    console.error("Error getting configuration record:", error);
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Create a new record
 */
const createConfigurationRecord = async (req, res) => {
  try {
    const { configName } = req.params;
    // Fix: Properly extract created_by with fallback to 'SYSTEM'
    const created_by = req.user?.created_by || req.user?.user_id || 'SYSTEM';
    
    const config = masterConfigurations[configName];
    if (!config) {
      return sendErrorResponse(res, 404, `Configuration '${configName}' not found`);
    }

    const { table, fields, primaryKey } = config;
    const data = { ...req.body };

    // Validate required fields
    const validationErrors = validateFields(data, fields);
    if (validationErrors.length > 0) {
      return sendErrorResponse(res, 400, "Validation failed", validationErrors);
    }

    // Auto-generate ID if needed
    if (fields[primaryKey]?.autoGenerate) {
      const prefix = fields[primaryKey].prefix || 'ID';
      data[primaryKey] = await generateNextId(table, primaryKey, prefix);
    }

    // Add audit fields - only set if they exist in the table schema
    const now = new Date();
    // 🔧 FIX: Convert to MySQL datetime format for all date fields
    if (fields.created_at) data.created_at = now.toISOString().slice(0, 19).replace('T', ' ');
    if (fields.created_on) data.created_on = now.toISOString().slice(0, 19).replace('T', ' ');
    if (fields.created_by) data.created_by = created_by;
    if (fields.updated_at) data.updated_at = now.toISOString().slice(0, 19).replace('T', ' ');
    if (fields.updated_on) data.updated_on = now.toISOString().slice(0, 19).replace('T', ' ');
    if (fields.updated_by) data.updated_by = created_by;
    
    // Set default status if not provided
    if (!data.status && fields.status) {
      data.status = fields.status.default || 'ACTIVE';
    }

    // Insert record
    const [insertId] = await db(table).insert(data);
    
    // Get the created record
    const newRecord = await db(table).where(primaryKey, data[primaryKey] || insertId).first();

    return sendSuccessResponse(res, newRecord, "Record created successfully");
  } catch (error) {
    console.error("Error creating configuration record:", error);
    
    // Handle duplicate entry errors
    if (error.code === 'ER_DUP_ENTRY') {
      return sendErrorResponse(res, 400, "Duplicate entry. Record already exists.");
    }
    
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Update an existing record
 */
const updateConfigurationRecord = async (req, res) => {
  try {
    const { configName, id } = req.params;
    console.log('\n🔄 ===== UPDATE REQUEST RECEIVED =====');
    console.log('📋 Config Name:', configName);
    console.log('🆔 Record ID:', id);
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User:', req.user?.user_id || 'NO USER');
    
    // Fix: Properly extract updated_by with fallback to 'SYSTEM'
    const updated_by = req.user?.updated_by || req.user?.user_id || 'SYSTEM';
    console.log('✍️ Updated By:', updated_by);
    
    const config = masterConfigurations[configName];
    if (!config) {
      console.log('❌ Configuration not found:', configName);
      return sendErrorResponse(res, 404, `Configuration '${configName}' not found`);
    }

    const { table, fields, primaryKey } = config;
    console.log('🗄️ Table:', table);
    console.log('🔑 Primary Key:', primaryKey);

    // Check if record exists
    const existingRecord = await db(table).where(primaryKey, id).first();
    if (!existingRecord) {
      console.log('❌ Record not found:', id);
      return sendErrorResponse(res, 404, "Record not found");
    }
    console.log('✅ Existing record found:', JSON.stringify(existingRecord, null, 2));

    // 🔧 FIX: Only include user-editable fields, exclude read-only fields
    const readOnlyFields = [
      primaryKey, // Primary key should not be updated
      'created_by', 'created_at', 'created_on', // Creation audit fields
      'updated_by', 'updated_at', 'updated_on'  // Update audit fields (we set these ourselves)
    ];
    
    // Filter out read-only fields from request body
    const data = {};
    Object.keys(req.body).forEach(key => {
      if (!readOnlyFields.includes(key)) {
        data[key] = req.body[key];
      }
    });
    console.log('📝 Filtered user data (read-only fields excluded):', JSON.stringify(data, null, 2));

    // Validate fields (excluding primary key and read-only fields)
    const fieldsToValidate = { ...fields };
    readOnlyFields.forEach(field => delete fieldsToValidate[field]);
    
    const validationErrors = validateFields(data, fieldsToValidate);
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return sendErrorResponse(res, 400, "Validation failed", validationErrors);
    }
    console.log('✅ Validation passed');

    // Add audit fields - only set if they exist in the table schema
    const now = new Date();
    if (fields.updated_at) data.updated_at = now.toISOString().slice(0, 19).replace('T', ' '); // Convert to MySQL format
    if (fields.updated_on) data.updated_on = now.toISOString().slice(0, 19).replace('T', ' '); // Convert to MySQL format
    if (fields.updated_by) data.updated_by = updated_by;
    console.log('📝 Final data to update:', JSON.stringify(data, null, 2));

    // Update record
    console.log('🚀 Executing UPDATE query...');
    await db(table).where(primaryKey, id).update(data);
    console.log('✅ UPDATE query executed successfully');
    
    // Get the updated record
    const updatedRecord = await db(table).where(primaryKey, id).first();
    console.log('📋 Updated record:', JSON.stringify(updatedRecord, null, 2));
    console.log('🎉 ===== UPDATE COMPLETED SUCCESSFULLY =====\n');

    return sendSuccessResponse(res, updatedRecord, "Record updated successfully");
  } catch (error) {
    console.error('\n❌ ===== UPDATE ERROR =====');
    console.error('❌ Error updating configuration record:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ ========================\n');
    
    // Handle duplicate entry errors
    if (error.code === 'ER_DUP_ENTRY') {
      return sendErrorResponse(res, 400, "Duplicate entry. Record already exists.");
    }
    
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Delete a record (soft delete by setting status to INACTIVE)
 */
const deleteConfigurationRecord = async (req, res) => {
  try {
    const { configName, id } = req.params;
    console.log('\n🗑️ ===== DELETE REQUEST RECEIVED =====');
    console.log('📋 Config Name:', configName);
    console.log('🆔 Record ID:', id);
    console.log('👤 User:', req.user?.user_id || 'NO USER');
    
    // Fix: Properly extract updated_by with fallback to 'SYSTEM'
    const updated_by = req.user?.updated_by || req.user?.user_id || 'SYSTEM';
    console.log('✍️ Updated By:', updated_by);
    
    const config = masterConfigurations[configName];
    if (!config) {
      console.log('❌ Configuration not found:', configName);
      return sendErrorResponse(res, 404, `Configuration '${configName}' not found`);
    }

    const { table, primaryKey, fields } = config;
    console.log('🗄️ Table:', table);
    console.log('🔑 Primary Key:', primaryKey);

    // Check if record exists
    const existingRecord = await db(table).where(primaryKey, id).first();
    if (!existingRecord) {
      console.log('❌ Record not found:', id);
      return sendErrorResponse(res, 404, "Record not found");
    }
    console.log('✅ Existing record found:', JSON.stringify(existingRecord, null, 2));

    // Soft delete by setting status to INACTIVE
    const now = new Date();
    const updateData = { status: 'INACTIVE' };
    
    // Only set audit fields if they exist in the table schema
    // 🔧 FIX: Convert to MySQL datetime format
    if (fields.updated_at) updateData.updated_at = now.toISOString().slice(0, 19).replace('T', ' ');
    if (fields.updated_on) updateData.updated_on = now.toISOString().slice(0, 19).replace('T', ' ');
    if (fields.updated_by) updateData.updated_by = updated_by;
    
    console.log('📝 Update data for soft delete:', JSON.stringify(updateData, null, 2));
    console.log('🚀 Executing SOFT DELETE query...');
    const deleteResult = await db(table).where(primaryKey, id).update(updateData);
    console.log('✅ Soft delete result - rows affected:', deleteResult);
    console.log('✅ SOFT DELETE query executed successfully');
    console.log('🎉 ===== DELETE COMPLETED SUCCESSFULLY =====\n');

    return sendSuccessResponse(res, null, "Record deleted successfully");
  } catch (error) {
    console.error('\n❌ ===== DELETE ERROR =====');
    console.error('❌ Error deleting configuration record:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ ========================\n');
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Validate fields based on configuration
 */
const validateFields = (data, fields) => {
  const errors = [];

  // List of fields that are auto-generated by the system (should not be validated as required)
  const autoGeneratedFields = [
    'created_by', 'created_at', 'created_on',
    'updated_by', 'updated_at', 'updated_on'
  ];

  for (const [fieldName, fieldConfig] of Object.entries(fields)) {
    const value = data[fieldName];

    // Skip validation for auto-generated fields (audit fields and auto-generated IDs)
    if (autoGeneratedFields.includes(fieldName) || fieldConfig.autoGenerate) {
      continue;
    }

    // Check required fields
    if (fieldConfig.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: fieldName,
        message: `${fieldConfig.label} is required`
      });
      continue;
    }

    // Skip validation if field is empty and not required
    if (!value) continue;

    // Validate max length for string fields
    if (fieldConfig.type === 'varchar' && fieldConfig.maxLength) {
      if (value.length > fieldConfig.maxLength) {
        errors.push({
          field: fieldName,
          message: `${fieldConfig.label} cannot exceed ${fieldConfig.maxLength} characters`
        });
      }
    }

    // Validate email format
    if (fieldConfig.validation && fieldConfig.validation.includes('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push({
          field: fieldName,
          message: `${fieldConfig.label} must be a valid email address`
        });
      }
    }

    // Validate URL format
    if (fieldConfig.validation && fieldConfig.validation.includes('url')) {
      try {
        new URL(value);
      } catch {
        errors.push({
          field: fieldName,
          message: `${fieldConfig.label} must be a valid URL`
        });
      }
    }

    // Validate integer values
    if (fieldConfig.type === 'int' && isNaN(parseInt(value))) {
      errors.push({
        field: fieldName,
        message: `${fieldConfig.label} must be a valid number`
      });
    }

    // Validate select options
    if (fieldConfig.options && !fieldConfig.options.includes(value)) {
      errors.push({
        field: fieldName,
        message: `${fieldConfig.label} must be one of: ${fieldConfig.options.join(', ')}`
      });
    }
  }

  return errors;
};

/**
 * Generate next auto-increment ID with prefix
 */
const generateNextId = async (table, primaryKeyField, prefix) => {
  try {
    // Get the last record with the prefix
    const lastRecord = await db(table)
      .where(primaryKeyField, 'like', `${prefix}%`)
      .orderBy(primaryKeyField, 'desc')
      .first();

    if (!lastRecord) {
      return `${prefix}0001`;
    }

    // Extract the numeric part
    const lastId = lastRecord[primaryKeyField];
    const numericPart = lastId.replace(prefix, '');
    const nextNumber = parseInt(numericPart) + 1;

    // Pad with zeros to maintain 4-digit format
    const paddedNumber = nextNumber.toString().padStart(4, '0');
    
    return `${prefix}${paddedNumber}`;
  } catch (error) {
    console.error("Error generating next ID:", error);
    throw error;
  }
};

/**
 * Get dropdown options for filters and forms
 */
const getDropdownOptions = async (req, res) => {
  try {
    const { type } = req.params; // e.g., 'status', 'approval-type', 'document-type'
    
    let options = [];
    
    switch (type) {
      case 'status':
        // Return hardcoded ACTIVE/INACTIVE options for all configurations
        // This ensures consistency across all configuration forms
        options = [
          { value: 'ACTIVE', label: 'ACTIVE' },
          { value: 'INACTIVE', label: 'INACTIVE' }
        ];
        console.log('✅ Using hardcoded status options: ACTIVE, INACTIVE');
        break;
        
      case 'address-type':
        const addressTypes = await db('address_type_master')
          .select('address_type_id as value', 'address as label')
          .where('status', 'ACTIVE')
          .orderBy('address', 'asc');
        options = addressTypes;
        break;
        
      case 'approval-type':
        const approvalTypes = await db('approval_type_master')
          .select('approval_type_id as value', 'approval_type as label')
          .where('status', 'ACTIVE')
          .orderBy('approval_type', 'asc');
        options = approvalTypes;
        break;
        
      case 'document-type':
        const documentTypes = await db('document_type_master')
          .select('document_type_id as value', 'document_type as label')
          .where('status', 'ACTIVE')
          .orderBy('document_type', 'asc');
        options = documentTypes;
        break;
        
      case 'material-type':
        const materialTypes = await db('material_types_master')
          .select('material_type_id as value', 'material_type_name as label')
          .where('status', 'ACTIVE')
          .orderBy('material_type_name', 'asc');
        options = materialTypes;
        break;
        
      case 'vehicle-type':
        const vehicleTypes = await db('vehicle_type_master')
          .select('vehicle_type_id as value', 'vehicle_type as label')
          .where('status', 'ACTIVE')
          .orderBy('vehicle_type', 'asc');
        options = vehicleTypes;
        break;
        
      default:
        // Try to fetch from the corresponding master table
        const tableName = `${type.replace(/-/g, '_')}_master`;
        try {
          // Get table info to determine primary key and display field
          const tableExists = await db.schema.hasTable(tableName);
          if (tableExists) {
            const columns = await db(tableName).columnInfo();
            const primaryKey = Object.keys(columns).find(col => col.endsWith('_id'));
            const displayField = Object.keys(columns).find(col => 
              col.includes('name') || col.includes('type') || col === primaryKey
            );
            
            if (primaryKey && displayField) {
              const records = await db(tableName)
                .select(`${primaryKey} as value`, `${displayField} as label`)
                .where('status', 'ACTIVE')
                .orderBy(displayField, 'asc');
              options = records;
            }
          }
        } catch (err) {
          console.log(`Table ${tableName} not found or error fetching:`, err.message);
        }
    }
    
    return sendSuccessResponse(res, options, "Dropdown options retrieved successfully");
  } catch (error) {
    console.error("Error getting dropdown options:", error);
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getConfigurations,
  getConfigurationMetadata,
  getConfigurationData,
  getConfigurationRecord,
  createConfigurationRecord,
  updateConfigurationRecord,
  deleteConfigurationRecord,
  getDropdownOptions
};