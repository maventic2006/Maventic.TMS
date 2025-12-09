const db = require("./config/database");

// Test function to fetch schema
async function testSchemaFetch() {
  try {
    console.log("Ì¥ç Testing database schema fetch for consignor_general_config_master");
    
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
    
    console.log(`‚úÖ Found ${columns.length} columns:`);
    
    columns.forEach(col => {
      console.log(`- ${col.columnName}: ${col.dataType} ${col.fullType} ${col.nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.extra || ''}`);
    });
    
    // Test data type mapping
    console.log("\nÌæØ Testing data type mapping:");
    columns.forEach(col => {
      const isAutoIncrement = col.extra && col.extra.includes('auto_increment');
      const isPrimaryKey = col.columnKey === 'PRI';
      
      let suggestedType = 'text'; // default
      
      if (isAutoIncrement || isPrimaryKey) {
        suggestedType = 'hidden';
      } else if (col.dataType === 'datetime' || col.dataType === 'timestamp') {
        suggestedType = 'datetime-local';
      } else if (col.dataType === 'date') {
        suggestedType = 'date';
      } else if (col.dataType === 'int' && col.columnName.toLowerCase().includes('active')) {
        suggestedType = 'checkbox';
      } else if (col.dataType === 'text') {
        suggestedType = 'textarea';
      } else if (col.columnName.toLowerCase().includes('id') && col.columnName !== 'id') {
        suggestedType = 'select';
      }
      
      console.log(`  ${col.columnName} -> ${suggestedType} (from ${col.dataType})`);
    });
    
    await db.destroy();
    console.log("\n‚úÖ Schema fetch test completed successfully!");
    
  } catch (error) {
    console.error("‚ùå Error testing schema fetch:", error);
    process.exit(1);
  }
}

testSchemaFetch();
