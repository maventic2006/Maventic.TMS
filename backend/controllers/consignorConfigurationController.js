const db = require("../config/database");
const consignorConfigurations = require("../config/consignor-configurations.json");
const {
  errorMessages,
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/responseUtils");

/**
 * Get database table schema for a specific table
 */
const getTableSchema = async (tableName) => {
  try {
    console.log(`🔍 Fetching schema for table: ${tableName}`);
    
    // Query to get column information from MySQL INFORMATION_SCHEMA
    const schemaQuery = `
      SELECT 
        COLUMN_NAME as columnName,
        DATA_TYPE as dataType,
        IS_NULLABLE as nullable,
        COLUMN_DEFAULT as defaultValue,
        CHARACTER_MAXIMUM_LENGTH as maxLength,
        NUMERIC_PRECISION as numericPrecision,
        NUMERIC_SCALE as numericScale,
        COLUMN_TYPE as fullType,
        EXTRA as extra,
        COLUMN_KEY as columnKey
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `;
    
    const schema = await db.raw(schemaQuery, [tableName]);
    const columns = schema[0]; // MySQL returns results in first element
    
    console.log(`✅ Found ${columns.length} columns for table ${tableName}`);
    
    // Transform to more usable format
    const schemaMap = {};
    columns.forEach(col => {
      schemaMap[col.columnName] = {
        dataType: col.dataType,
        fullType: col.fullType,
        nullable: col.nullable === 'YES',
        defaultValue: col.defaultValue,
        maxLength: col.maxLength,
        numericPrecision: col.numericPrecision,
        numericScale: col.numericScale,
        isAutoIncrement: col.extra.includes('auto_increment'),
        isPrimaryKey: col.columnKey === 'PRI',
        isUnique: col.columnKey === 'UNI'
      };
    });
    
    return schemaMap;
  } catch (error) {
    console.error(`❌ Error fetching schema for table ${tableName}:`, error);
    throw error;
  }
};

/**
 * Map database data type to appropriate input type
 */
const mapDataTypeToInputType = (dbColumn, fieldName) => {
  const { dataType, fullType, isAutoIncrement, isPrimaryKey } = dbColumn;
  
  // Auto-increment or primary key fields
  if (isAutoIncrement || isPrimaryKey) {
    return 'hidden'; // Don't show in form
  }
  
  // Date and time types
  if (dataType === 'datetime' || dataType === 'timestamp') {
    return 'datetime-local';
  }
  if (dataType === 'date') {
    return 'date';
  }
  if (dataType === 'time') {
    return 'time';
  }
  
  // Numeric types - check for boolean patterns first
  if (dataType === 'tinyint' && fullType.includes('tinyint(1)')) {
    return 'checkbox'; // Boolean checkbox for tinyint(1)
  }
  
  if (dataType === 'int' || dataType === 'bigint' || dataType === 'smallint' || dataType === 'tinyint') {
    // Special case for boolean-like fields that aren't tinyint(1)
    if (fieldName.toLowerCase().includes('active') || fieldName.toLowerCase().includes('enabled') || fieldName.toLowerCase().includes('flag')) {
      return 'checkbox'; // Boolean checkbox
    }
    return 'number';
  }
  
  if (dataType === 'decimal' || dataType === 'float' || dataType === 'double') {
    return 'number';
  }
  
  // Text types
  if (dataType === 'text' || dataType === 'longtext' || dataType === 'mediumtext') {
    return 'textarea';
  }
  
  // String types with length considerations
  if (dataType === 'varchar' || dataType === 'char') {
    // Don't suggest select for ID fields - they should be auto-generated in backend
    if (fieldName.toLowerCase().includes('id') && fieldName !== 'id') {
      return 'hidden'; // ID fields should be hidden from forms
    }
    if (fieldName.toLowerCase().includes('status') || fieldName.toLowerCase().includes('type') || fieldName.toLowerCase().includes('category')) {
      return 'select'; // Status or type dropdown
    }
    if (dbColumn.maxLength && dbColumn.maxLength > 255) {
      return 'textarea';
    }
    return 'text';
  }
  
  // Email detection
  if (fieldName.toLowerCase().includes('email')) {
    return 'email';
  }
  
  // Phone detection
  if (fieldName.toLowerCase().includes('phone') || fieldName.toLowerCase().includes('mobile') || fieldName.toLowerCase().includes('tel')) {
    return 'tel';
  }
  
  // URL detection
  if (fieldName.toLowerCase().includes('url') || fieldName.toLowerCase().includes('website') || fieldName.toLowerCase().includes('link')) {
    return 'url';
  }
  
  // Default to text
  return 'text';
};

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
 * Get configuration metadata for a specific consignor config with database schema integration
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

    // Fetch actual database schema
    console.log('🔍 Fetching database schema for table:', config.table);
    const dbSchema = await getTableSchema(config.table);
    
    // Create enhanced configuration with database schema information
    const enhancedConfig = {
      ...config,
      fields: {}
    };
    
    // Process each field in the configuration
    Object.keys(config.fields).forEach(fieldName => {
      const configField = config.fields[fieldName];
      const dbColumn = dbSchema[fieldName];
      
      if (dbColumn) {
        // Use database schema to enhance field configuration
        const suggestedInputType = mapDataTypeToInputType(dbColumn, fieldName);
        
        enhancedConfig.fields[fieldName] = {
          ...configField,
          // Database schema information
          dbSchema: {
            dataType: dbColumn.dataType,
            fullType: dbColumn.fullType,
            nullable: dbColumn.nullable,
            defaultValue: dbColumn.defaultValue,
            maxLength: dbColumn.maxLength,
            numericPrecision: dbColumn.numericPrecision,
            numericScale: dbColumn.numericScale,
            isAutoIncrement: dbColumn.isAutoIncrement,
            isPrimaryKey: dbColumn.isPrimaryKey,
            isUnique: dbColumn.isUnique
          },
          // Suggested input type based on database schema
          suggestedInputType: suggestedInputType,
          // Override input type if not manually configured or if auto-detected
          inputType: configField.inputType === 'text' ? suggestedInputType : configField.inputType,
          // Update type information from database
          type: dbColumn.dataType,
          maxLength: dbColumn.maxLength,
          // Auto-detect if field should be hidden
          autoGenerate: dbColumn.isAutoIncrement || dbColumn.isPrimaryKey || configField.autoGenerate,
          // Set editable based on database constraints
          editable: !dbColumn.isAutoIncrement && !dbColumn.isPrimaryKey && configField.editable !== false,
          // Set required based on database nullable constraint
          required: !dbColumn.nullable && !dbColumn.isAutoIncrement && !dbColumn.isPrimaryKey && configField.required !== false
        };
        
        console.log(`📋 Field ${fieldName}: DB type=${dbColumn.dataType}, suggested input=${suggestedInputType}, final input=${enhancedConfig.fields[fieldName].inputType}`);
      } else {
        console.log(`⚠️ Field ${fieldName} not found in database schema`);
        enhancedConfig.fields[fieldName] = configField;
      }
    });
    
    // Add any database columns not in configuration
    Object.keys(dbSchema).forEach(columnName => {
      if (!enhancedConfig.fields[columnName]) {
        const dbColumn = dbSchema[columnName];
        const suggestedInputType = mapDataTypeToInputType(dbColumn, columnName);
        
        console.log(`➕ Adding missing field from DB: ${columnName}`);
        enhancedConfig.fields[columnName] = {
          type: dbColumn.dataType,
          maxLength: dbColumn.maxLength,
          required: !dbColumn.nullable && !dbColumn.isAutoIncrement && !dbColumn.isPrimaryKey,
          label: columnName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          inputType: suggestedInputType,
          editable: !dbColumn.isAutoIncrement && !dbColumn.isPrimaryKey,
          filterable: true,
          validation: !dbColumn.nullable && !dbColumn.isAutoIncrement && !dbColumn.isPrimaryKey ? 'required' : '',
          autoGenerate: dbColumn.isAutoIncrement || dbColumn.isPrimaryKey,
          dbSchema: {
            dataType: dbColumn.dataType,
            fullType: dbColumn.fullType,
            nullable: dbColumn.nullable,
            defaultValue: dbColumn.defaultValue,
            maxLength: dbColumn.maxLength,
            numericPrecision: dbColumn.numericPrecision,
            numericScale: dbColumn.numericScale,
            isAutoIncrement: dbColumn.isAutoIncrement,
            isPrimaryKey: dbColumn.isPrimaryKey,
            isUnique: dbColumn.isUnique
          },
          suggestedInputType: suggestedInputType
        };
      }
    });

    console.log('✅ Enhanced configuration with database schema:', { 
      name: enhancedConfig.name, 
      table: enhancedConfig.table,
      fieldCount: Object.keys(enhancedConfig.fields).length
    });
    
    return sendSuccessResponse(res, enhancedConfig, "Consignor configuration metadata retrieved successfully with database schema");
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

    console.log(`📋 Received data for ${configName}:`, data);

    // Clean up empty string values that might cause issues with AUTO-INCREMENT or other constraints
    // Also convert any 'CURRENT_TIMESTAMP' strings to actual Date objects
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === null || data[key] === undefined) {
        console.log(`🧹 Removing empty field: ${key}`);
        delete data[key];
      } else if (data[key] === 'CURRENT_TIMESTAMP') {
        console.log(`🔧 Converting CURRENT_TIMESTAMP string to Date object for field: ${key}`);
        data[key] = new Date();
      }
    });

    console.log(`📋 Cleaned data for ${configName}:`, data);

    const config = consignorConfigurations[configName];
    if (!config) {
      return sendErrorResponse(res, 404, "Configuration not found");
    }

    // Remove update-related audit fields from data during create operation
    console.log('🚫 Removing update fields from create operation...');
    const updateFields = ['updated_at', 'updated_on', 'updated_by'];
    updateFields.forEach(field => {
      if (data[field] !== undefined) {
        console.log(`🚫 Removing update field from data: ${field}`);
        delete data[field];
      }
    });

    // Apply default values from configuration, converting CURRENT_TIMESTAMP to actual dates
    const currentTimestamp = new Date();
    Object.keys(config.fields).forEach(fieldName => {
      const fieldConfig = config.fields[fieldName];
      
      // Skip update-related audit fields during create operation
      if (fieldName === 'updated_at' || fieldName === 'updated_on' || fieldName === 'updated_by') {
        console.log(`⏭️ Skipping default value application for update field: ${fieldName}`);
        return;
      }
      
      // If field is not provided and has a default value
      if (data[fieldName] === undefined && fieldConfig.defaultValue !== undefined) {
        if (fieldConfig.defaultValue === 'CURRENT_TIMESTAMP') {
          console.log(`🔧 Applying CURRENT_TIMESTAMP default for field: ${fieldName}`);
          data[fieldName] = currentTimestamp;
        } else {
          console.log(`🔧 Applying default value for field: ${fieldName} = ${fieldConfig.defaultValue}`);
          data[fieldName] = fieldConfig.defaultValue;
        }
      }
    });

    console.log(`📋 Data after applying defaults for ${configName}:`, data);

    // Auto-generate ID if needed - check database column type first
    if (config.fields[config.primaryKey]?.autoGenerate) {
      // Query database to determine actual primary key column type
      const [tableSchema] = await db.raw(`DESCRIBE ${config.table}`);
      const pkColumn = tableSchema.find(col => col.Field === config.primaryKey);
      
      if (pkColumn) {
        // Check if it's an auto-increment integer column
        if (pkColumn.Extra && pkColumn.Extra.includes('auto_increment')) {
          // For auto-increment columns, completely remove the primary key field from data
          // This prevents inserting empty strings or null values into auto-increment columns
          console.log(`🔧 Removing auto-increment column from insert data: ${config.primaryKey}`);
          delete data[config.primaryKey];
        } else {
          // For non-auto-increment columns (VARCHAR), generate string ID
          const prefix = config.primaryKey.replace('_id', '').toUpperCase().substring(0, 3);
          data[config.primaryKey] = await generateNextId(config.table, config.primaryKey, prefix);
          console.log(`🔧 Generated string ID for VARCHAR column: ${data[config.primaryKey]}`);
        }
      } else {
        console.warn(`⚠️ Primary key column ${config.primaryKey} not found in ${config.table}`);
      }
    }

    // Auto-generate ALL ID fields that are marked as autoGenerate: true
    console.log('🔧 Auto-generating ID fields...');
    for (const fieldName of Object.keys(config.fields)) {
      const fieldConfig = config.fields[fieldName];
      
      // Skip if field is not marked for auto-generation or already has a value
      if (!fieldConfig.autoGenerate || data[fieldName] !== undefined) continue;
      
      // Skip primary key as it's handled above
      if (fieldName === config.primaryKey) continue;
      
      console.log(`🔧 Auto-generating ID for field: ${fieldName}`);
      
      // Generate ID based on field name
      if (fieldName.toLowerCase().includes('consignor')) {
        // Generate consignor ID - could use existing consignors or generate new one
        data[fieldName] = await generateConsignorId();
        console.log(`🔧 Generated consignor ID: ${data[fieldName]}`);
      } else if (fieldName.toLowerCase().includes('warehouse')) {
        // Generate warehouse ID - could use existing warehouses or generate new one  
        data[fieldName] = await generateWarehouseId();
        console.log(`🔧 Generated warehouse ID: ${data[fieldName]}`);
      } else if (fieldName.toLowerCase().includes('ebidding_auction')) {
        // Generate e-bidding auction ID
        data[fieldName] = await generateEbiddingAuctionId();
        console.log(`🔧 Generated e-bidding auction ID: ${data[fieldName]}`);
      } else if (fieldName.toLowerCase().includes('id')) {
        // Generic ID generation for other ID fields
        const prefix = fieldName.replace('_id', '').toUpperCase().substring(0, 3);
        data[fieldName] = await generateGenericId(prefix);
        console.log(`🔧 Generated generic ID for ${fieldName}: ${data[fieldName]}`);
      }
    }

    // Set audit fields
    const userId = req.user?.user_id || 'SYSTEM';
    const now = new Date();
    data.created_by = userId;
    data.created_at = now;
    
    // Handle created_on field - check actual database column type
    if (config.fields.created_on) {
      // Query database to determine actual column type
      const [tableSchema] = await db.raw(`DESCRIBE ${config.table}`);
      const createdOnCol = tableSchema.find(col => col.Field === 'created_on');
      
      if (createdOnCol) {
        if (createdOnCol.Type === 'datetime') {
          // DATETIME column - use full datetime
          data.created_on = now;
        } else if (createdOnCol.Type === 'time') {
          // TIME column - use time only in HH:MM:SS format
          data.created_on = now.toTimeString().split(' ')[0];
        } else if (createdOnCol.Type === 'date') {
          // DATE column - use date only in YYYY-MM-DD format
          data.created_on = now.toISOString().split('T')[0];
        } else {
          // Default to datetime for safety
          data.created_on = now;
        }
      }
    }

    // Set updated_at and updated_on for tables that require them even during creation
    // Check if table has updated_at column and it's required (not nullable)
    const [tableSchema] = await db.raw(`DESCRIBE ${config.table}`);
    const updatedAtCol = tableSchema.find(col => col.Field === 'updated_at');
    const updatedOnCol = tableSchema.find(col => col.Field === 'updated_on');
    
    if (updatedAtCol && updatedAtCol.Null === 'NO') {
      // updated_at is required (NOT NULL) - set it during creation
      if (updatedAtCol.Type === 'datetime') {
        data.updated_at = now;
      } else if (updatedAtCol.Type === 'date') {
        data.updated_at = now.toISOString().split('T')[0];
      } else {
        data.updated_at = now;
      }
      console.log(`🔧 Setting required updated_at field: ${data.updated_at}`);
    }
    
    if (updatedOnCol && updatedOnCol.Null === 'NO') {
      // updated_on is required (NOT NULL) - set it during creation
      if (updatedOnCol.Type === 'time') {
        data.updated_on = now.toTimeString().split(' ')[0];
      } else if (updatedOnCol.Type === 'date') {
        data.updated_on = now.toISOString().split('T')[0];
      } else if (updatedOnCol.Type === 'datetime') {
        data.updated_on = now;
      } else {
        data.updated_on = now;
      }
      console.log(`🔧 Setting required updated_on field: ${data.updated_on}`);
    }

    // Set updated_by if it exists and is required
    const updatedByCol = tableSchema.find(col => col.Field === 'updated_by');
    if (updatedByCol && updatedByCol.Null === 'NO') {
      data.updated_by = userId;
      console.log(`🔧 Setting required updated_by field: ${data.updated_by}`);
    }

    // Handle status_audit field for tables that have it and if it's required
    const statusAuditCol = tableSchema.find(col => col.Field === 'status_audit');
    if (statusAuditCol && statusAuditCol.Null === 'NO' && !data.status_audit) {
      data.status_audit = data.status || config.softDelete?.activeValue || 'ACTIVE';
      console.log(`🔧 Setting required status_audit field: ${data.status_audit}`);
    }

    // Set default status
    if (config.softDelete && config.softDelete.fieldName && !data[config.softDelete.fieldName]) {
      data[config.softDelete.fieldName] = config.softDelete.activeValue;
    }

    const [insertId] = await db(config.table).insert(data);
    
    // For auto-increment columns, use insertId. For VARCHAR columns, use the generated ID from data
    const recordId = data[config.primaryKey] || insertId;
    
    const newRecord = await db(config.table)
      .where(config.primaryKey, recordId)
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
    const now = new Date();
    data.updated_by = userId;
    data.updated_at = now;
    
    // Handle updated_on field - check actual database column type
    if (config.fields.updated_on) {
      // Query database to determine actual column type
      const [tableSchema] = await db.raw(`DESCRIBE ${config.table}`);
      const updatedOnCol = tableSchema.find(col => col.Field === 'updated_on');
      
      if (updatedOnCol) {
        if (updatedOnCol.Type === 'datetime') {
          // DATETIME column - use full datetime
          data.updated_on = now;
        } else if (updatedOnCol.Type === 'time') {
          // TIME column - use time only in HH:MM:SS format
          data.updated_on = now.toTimeString().split(' ')[0];
        } else {
          // Default to datetime for safety
          data.updated_on = now;
        }
      }
    }

    await db(config.table).where(config.primaryKey, id).update(data);
    
    const updatedRecord = await db(config.table).where(config.primaryKey, id).first();

    return sendSuccessResponse(res, updatedRecord, "Record updated successfully");
  } catch (error) {
    console.error("Error updating record:", error);
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get dropdown options for select fields in a specific consignor configuration
 */
const getConsignorConfigurationDropdownOptions = async (req, res) => {
  try {
    const { configName } = req.params;
    console.log('🔍 getConsignorConfigurationDropdownOptions called for:', configName);
    
    const config = consignorConfigurations[configName];
    if (!config) {
      return sendErrorResponse(res, 404, "Configuration not found");
    }

    const dropdownOptions = {};

    // Get dropdown options for each select field
    for (const fieldName in config.fields) {
      const fieldConfig = config.fields[fieldName];
      
      // Skip if not a select field (check both inputType and suggestedInputType)
      const isSelectField = fieldConfig.inputType === 'select' || fieldConfig.suggestedInputType === 'select';
      if (!isSelectField) continue;

      // Skip all ID fields - they are auto-generated in backend and should not appear in forms
      if (fieldName.toLowerCase().includes('id') && fieldName !== 'id') {
        console.log(`⏭️ Skipping ID field: ${fieldName} (auto-generated)`);
        continue;
      }

      // Skip primary key fields that are auto-generated
      if (fieldName === config.primaryKey && fieldConfig.autoGenerate) {
        console.log(`⏭️ Skipping auto-generated primary key: ${fieldName}`);
        continue;
      }

      console.log(`📋 Processing select field: ${fieldName}`);

      if (fieldName === 'status' || fieldName.toLowerCase().includes('status')) {
        // Standard status options for all status fields
        dropdownOptions[fieldName] = [
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' }
        ];
      } else if (fieldName === 'vehicle_type') {
        // Get vehicle types from master data with error handling
        try {
          const vehicleTypes = await db('vehicle_type_master')
            .select('vehicle_type_code', 'vehicle_type_name')
            .where('status', 'ACTIVE');
          dropdownOptions[fieldName] = vehicleTypes.map(vt => ({
            value: vt.vehicle_type_code,
            label: `${vt.vehicle_type_code} - ${vt.vehicle_type_name}`
          }));
        } catch (dbError) {
          console.log(`⚠️ Table vehicle_type_master not found, using default options for ${fieldName}`);
          dropdownOptions[fieldName] = [
            { value: 'TRUCK', label: 'Truck' },
            { value: 'TRAILER', label: 'Trailer' },
            { value: 'CONTAINER', label: 'Container' }
          ];
        }
      } else if (fieldName === 'freight_unit') {
        // Get freight units from master data with error handling
        try {
          const freightUnits = await db('freight_unit_master')
            .select('freight_unit_code', 'freight_unit_name')
            .where('status', 'ACTIVE');
          dropdownOptions[fieldName] = freightUnits.map(fu => ({
            value: fu.freight_unit_code,
            label: `${fu.freight_unit_code} - ${fu.freight_unit_name}`
          }));
        } catch (dbError) {
          console.log(`⚠️ Table freight_unit_master not found, using default options for ${fieldName}`);
          dropdownOptions[fieldName] = [
            { value: 'KG', label: 'Kilogram' },
            { value: 'TON', label: 'Ton' },
            { value: 'MT', label: 'Metric Ton' }
          ];
        }
      } else if (fieldName === 'active' || fieldName.toLowerCase().includes('active')) {
        // Boolean active field
        dropdownOptions[fieldName] = [
          { value: '1', label: 'Yes' },
          { value: '0', label: 'No' }
        ];
      } else if (fieldConfig.options && Array.isArray(fieldConfig.options)) {
        // Use options from config if available
        dropdownOptions[fieldName] = fieldConfig.options;
      } else {
        // Default empty options for unknown select fields
        dropdownOptions[fieldName] = [];
        console.log(`⚠️ No dropdown options defined for select field: ${fieldName}`);
      }
    }

    console.log(`✅ Generated dropdown options for ${Object.keys(dropdownOptions).length} select fields`);
    return sendSuccessResponse(res, dropdownOptions, "Dropdown options retrieved successfully");
  } catch (error) {
    console.error("❌ Error getting dropdown options:", error);
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};
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
 * Generate next auto-increment ID with prefix (for VARCHAR primary keys)
 */
const generateNextId = async (table, primaryKeyField, prefix) => {
  try {
    // This function is only used for VARCHAR primary keys, not auto-increment integers
    const lastRecord = await db(table)
      .select(primaryKeyField)
      .where(primaryKeyField, 'like', `${prefix}%`)
      .orderBy(primaryKeyField, 'desc')
      .first();

    let nextNumber = 1;
    if (lastRecord) {
      const lastId = lastRecord[primaryKeyField];
      // Extract numeric part from string ID like 'CHK0001' -> '0001' -> 1
      const numericPart = lastId.replace(/^\D+/g, '');
      if (numericPart) {
        nextNumber = parseInt(numericPart) + 1;
      }
    }

    const newId = prefix + String(nextNumber).padStart(4, '0');
    console.log(`🔧 Generated next VARCHAR ID: ${newId} (last: ${lastRecord?.[primaryKeyField] || 'none'})`);
    return newId;
  } catch (error) {
    console.error('Error generating next VARCHAR ID:', error);
    return prefix + '0001';
  }
};

/**
 * Get table schema information for a specific consignor configuration
 */
const getTableSchemaInfo = async (req, res) => {
  try {
    const { configName } = req.params;
    console.log('🔍 getTableSchemaInfo called for:', configName);
    
    const config = consignorConfigurations[configName];
    if (!config) {
      console.log('❌ Configuration not found:', configName);
      return sendErrorResponse(res, 404, "Configuration not found");
    }

    // Fetch database schema
    const dbSchema = await getTableSchema(config.table);
    
    // Create a detailed schema response with suggestions
    const schemaInfo = {
      tableName: config.table,
      configName: configName,
      columns: {}
    };
    
    Object.keys(dbSchema).forEach(columnName => {
      const dbColumn = dbSchema[columnName];
      const suggestedInputType = mapDataTypeToInputType(dbColumn, columnName);
      
      schemaInfo.columns[columnName] = {
        ...dbColumn,
        suggestedInputType,
        suggestedLabel: columnName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        suggestedRequired: !dbColumn.nullable && !dbColumn.isAutoIncrement && !dbColumn.isPrimaryKey,
        suggestedEditable: !dbColumn.isAutoIncrement && !dbColumn.isPrimaryKey
      };
    });
    
    console.log(`✅ Schema info retrieved for ${config.table}: ${Object.keys(dbSchema).length} columns`);
    return sendSuccessResponse(res, schemaInfo, "Table schema information retrieved successfully");
  } catch (error) {
    console.error("❌ Error getting table schema info:", error);
    return sendErrorResponse(res, 500, errorMessages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Generate a consignor ID by getting the first available consignor from database
 */
const generateConsignorId = async () => {
  try {
    // Try to get an existing consignor from consignor_master table
    const existingConsignor = await db('consignor_master')
      .select('customer_id')
      .where('status', 'ACTIVE')
      .first();
    
    if (existingConsignor) {
      console.log(`🔧 Using existing consignor ID: ${existingConsignor.customer_id}`);
      return existingConsignor.customer_id;
    }
    
    // If no existing consignor, generate a default one
    const defaultId = 'CSG001';
    console.log(`🔧 No existing consignors found, using default: ${defaultId}`);
    return defaultId;
  } catch (error) {
    console.error('❌ Error generating consignor ID:', error);
    // Return a fallback default
    return 'CSG001';
  }
};

/**
 * Generate a warehouse ID by getting the first available warehouse from database  
 */
const generateWarehouseId = async () => {
  try {
    // Try to get an existing warehouse from warehouse_master table
    const existingWarehouse = await db('warehouse_master')
      .select('warehouse_id')
      .where('status', 'ACTIVE') 
      .first();
    
    if (existingWarehouse) {
      console.log(`🔧 Using existing warehouse ID: ${existingWarehouse.warehouse_id}`);
      return existingWarehouse.warehouse_id;
    }
    
    // If no existing warehouse, return null to make it optional
    console.log('🔧 No existing warehouses found, leaving warehouse_id as null');
    return null;
  } catch (error) {
    console.error('❌ Error generating warehouse ID:', error);
    // Return null for optional warehouse
    return null;
  }
};

/**
 * Generate a generic ID with prefix
 */
const generateGenericId = async (prefix) => {
  try {
    // Generate a simple incremental ID with prefix
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const generatedId = `${prefix}${timestamp}`;
    console.log(`🔧 Generated generic ID with prefix ${prefix}: ${generatedId}`);
    return generatedId;
  } catch (error) {
    console.error('❌ Error generating generic ID:', error);
    return `${prefix}001`;
  }
};

/**
 * Generate an e-bidding auction ID
 */
const generateEbiddingAuctionId = async () => {
  try {
    // Generate a unique e-bidding auction ID with EBA prefix
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const generatedId = `EBA${timestamp}${randomNum}`;
    console.log(`🔧 Generated e-bidding auction ID: ${generatedId}`);
    return generatedId;
  } catch (error) {
    console.error('❌ Error generating e-bidding auction ID:', error);
    return `EBA${Date.now().toString().slice(-6)}01`;
  }
};

module.exports = {
  getConsignorConfigurations,
  getConsignorConfigurationMetadata,
  getConsignorConfigurationData,
  getConsignorConfigurationDropdownOptions,
  getTableSchemaInfo,
  createConsignorConfigurationRecord,
  updateConsignorConfigurationRecord,
  deleteConsignorConfigurationRecord
};