const db = require("./config/database");

// Import the mapping function
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
    // Check if it's likely a dropdown field based on common patterns
    if (fieldName.toLowerCase().includes('id') && fieldName !== 'id') {
      return 'select'; // Foreign key reference
    }
    if (fieldName.toLowerCase().includes('status') || fieldName.toLowerCase().includes('type') || fieldName.toLowerCase().includes('category')) {
      return 'select'; // Status or type dropdown
    }
    if (dbColumn.maxLength && dbColumn.maxLength > 255) {
      return 'textarea';
    }
    return 'text';
  }
  
  return 'text';
};

async function testEnhancedSchemaDetection() {
  try {
    console.log("Ì¥ç Testing Enhanced Schema Detection");
    
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
    
    const schema = await db.raw(schemaQuery, ['consignor_general_config_master']);
    const columns = schema[0];
    
    console.log(`\nÌ≥ä Enhanced Schema Analysis for consignor_general_config_master:`);
    console.log(`Found ${columns.length} columns:\n`);
    
    columns.forEach(col => {
      const dbColumn = {
        dataType: col.dataType,
        fullType: col.fullType,
        nullable: col.nullable === 'YES',
        defaultValue: col.defaultValue,
        maxLength: col.maxLength,
        numericPrecision: col.numericPrecision,
        numericScale: col.numericScale,
        isAutoIncrement: col.extra && col.extra.includes('auto_increment'),
        isPrimaryKey: col.columnKey === 'PRI',
        isUnique: col.columnKey === 'UNI'
      };
      
      const suggestedInputType = mapDataTypeToInputType(dbColumn, col.columnName);
      const nullable = col.nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const extra = col.extra || '';
      
      console.log(`${col.columnName.padEnd(20)} | ${col.dataType.padEnd(10)} | ${col.fullType.padEnd(15)} | ${nullable.padEnd(8)} | ${extra.padEnd(15)} | ${suggestedInputType}`);
    });
    
    console.log(`\nÌæØ Key Detections:`);
    columns.forEach(col => {
      const dbColumn = {
        dataType: col.dataType,
        fullType: col.fullType,
        isAutoIncrement: col.extra && col.extra.includes('auto_increment'),
        isPrimaryKey: col.columnKey === 'PRI'
      };
      const suggestedInputType = mapDataTypeToInputType(dbColumn, col.columnName);
      
      if (suggestedInputType === 'checkbox') {
        console.log(`  ‚úÖ ${col.columnName}: Detected as checkbox (${col.fullType})`);
      } else if (suggestedInputType === 'datetime-local') {
        console.log(`  Ì≥Ö ${col.columnName}: Detected as datetime picker (${col.dataType})`);
      } else if (suggestedInputType === 'select') {
        console.log(`  ÌæõÔ∏è  ${col.columnName}: Detected as dropdown (likely foreign key)`);
      } else if (suggestedInputType === 'textarea') {
        console.log(`  Ì≥ù ${col.columnName}: Detected as textarea (${col.dataType})`);
      } else if (suggestedInputType === 'hidden') {
        console.log(`  Ì∫´ ${col.columnName}: Hidden field (auto-increment/primary key)`);
      }
    });
    
    await db.destroy();
    console.log(`\n‚úÖ Enhanced schema detection test completed!`);
    
  } catch (error) {
    console.error("‚ùå Error in enhanced schema detection:", error);
    process.exit(1);
  }
}

testEnhancedSchemaDetection();
