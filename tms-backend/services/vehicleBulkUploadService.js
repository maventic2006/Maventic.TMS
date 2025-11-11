const ExcelJS = require('exceljs');
const path = require('path');

/**
 * Expected sheet names in the Excel file for vehicle bulk upload
 */
const REQUIRED_SHEETS = {
  BASIC_INFORMATION: 'Basic Information',
  SPECIFICATIONS: 'Specifications',
  CAPACITY_DETAILS: 'Capacity Details',
  OWNERSHIP_DETAILS: 'Ownership Details',
  DOCUMENTS: 'Documents'
};

/**
 * Expected columns for each sheet
 */
const SHEET_COLUMNS = {
  [REQUIRED_SHEETS.BASIC_INFORMATION]: [
    'Vehicle_Ref_ID',
    'Make_Brand',
    'Model',
    'VIN_Chassis_Number',
    'Vehicle_Type_ID',
    'Vehicle_Category',
    'Manufacturing_Month_Year',
    'GPS_IMEI_Number',
    'GPS_Active_Flag',
    'Leasing_Flag',
    'Usage_Type_ID',
    'Registration_Number',
    'Vehicle_Color',
    'Body_Type_Description',
    'Safety_Inspection_Date',
    'Taxes_And_Fees',
    'Road_Tax',
    'Avg_Running_Speed',
    'Max_Running_Speed',
    'Status'
  ],
  [REQUIRED_SHEETS.SPECIFICATIONS]: [
    'Vehicle_Ref_ID',
    'Engine_Type_ID',
    'Engine_Number',
    'Fuel_Type_ID',
    'Transmission_Type',
    'Emission_Standard',
    'Financer',
    'Suspension_Type',
    'Weight_Dimensions'
  ],
  [REQUIRED_SHEETS.CAPACITY_DETAILS]: [
    'Vehicle_Ref_ID',
    'Unloading_Weight_KG',
    'Gross_Vehicle_Weight_KG',
    'Payload_Capacity_KG',
    'Volume_Capacity_CBM',
    'Cargo_Width_M',
    'Cargo_Height_M',
    'Cargo_Length_M',
    'Towing_Capacity_KG',
    'Tire_Load_Rating',
    'Vehicle_Condition',
    'Fuel_Tank_Capacity_L',
    'Seating_Capacity',
    'Load_Capacity_TON'
  ],
  [REQUIRED_SHEETS.OWNERSHIP_DETAILS]: [
    'Vehicle_Ref_ID',
    'Ownership_Name',
    'Valid_From',
    'Valid_To',
    'Registration_Number',
    'Registration_Date',
    'Registration_Upto',
    'Purchase_Date',
    'Owner_Sr_Number',
    'State_Code',
    'RTO_Code',
    'Sale_Amount'
  ],
  [REQUIRED_SHEETS.DOCUMENTS]: [
    'Vehicle_Ref_ID',
    'Document_Type_ID',
    'Document_Type_Name',
    'Reference_Number',
    'Document_Provider',
    'Coverage_Type_ID',
    'Premium_Amount',
    'Valid_From',
    'Valid_To',
    'Remarks'
  ]
};

/**
 * Parse Excel file and extract all sheet data
 * @param {string} filePath - Path to Excel file
 * @returns {Promise<Object>} Parsed data from all sheets
 */
async function parseVehicleExcelFile(filePath) {
  try {
    console.log('📖 Parsing vehicle bulk upload Excel file:', path.basename(filePath));
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    // Validate structure first
    const structureErrors = validateStructure(workbook);
    if (structureErrors.length > 0) {
      return {
        success: false,
        error: 'STRUCTURE_VALIDATION_FAILED',
        errors: structureErrors,
        data: null
      };
    }
    
    // Parse each sheet
    const parsedData = {
      basicInformation: parseSheet(workbook, REQUIRED_SHEETS.BASIC_INFORMATION),
      specifications: parseSheet(workbook, REQUIRED_SHEETS.SPECIFICATIONS),
      capacityDetails: parseSheet(workbook, REQUIRED_SHEETS.CAPACITY_DETAILS),
      ownershipDetails: parseSheet(workbook, REQUIRED_SHEETS.OWNERSHIP_DETAILS),
      documents: parseSheet(workbook, REQUIRED_SHEETS.DOCUMENTS)
    };
    
    console.log('✅ Excel parsed successfully');
    console.log(`   - Basic Information: ${parsedData.basicInformation.length} rows`);
    console.log(`   - Specifications: ${parsedData.specifications.length} rows`);
    console.log(`   - Capacity Details: ${parsedData.capacityDetails.length} rows`);
    console.log(`   - Ownership Details: ${parsedData.ownershipDetails.length} rows`);
    console.log(`   - Documents: ${parsedData.documents.length} rows`);
    
    return {
      success: true,
      error: null,
      errors: [],
      data: parsedData
    };
  } catch (error) {
    console.error('❌ Error parsing Excel file:', error);
    return {
      success: false,
      error: 'EXCEL_PARSE_ERROR',
      errors: [{ message: error.message }],
      data: null
    };
  }
}

/**
 * Validate Excel file structure (sheets and columns)
 * @param {ExcelJS.Workbook} workbook - Excel workbook
 * @returns {Array} Array of structure validation errors
 */
function validateStructure(workbook) {
  const errors = [];
  
  // Check if all required sheets exist
  Object.values(REQUIRED_SHEETS).forEach(sheetName => {
    const sheet = workbook.getWorksheet(sheetName);
    if (!sheet) {
      errors.push({
        type: 'MISSING_SHEET',
        sheet: sheetName,
        message: `Required sheet "${sheetName}" not found`
      });
    } else {
      // Check if required columns exist
      const headerRow = sheet.getRow(1);
      const actualColumns = [];
      headerRow.eachCell((cell) => {
        actualColumns.push(cell.value);
      });
      
      const expectedColumns = SHEET_COLUMNS[sheetName];
      const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
      
      if (missingColumns.length > 0) {
        errors.push({
          type: 'MISSING_COLUMNS',
          sheet: sheetName,
          columns: missingColumns,
          message: `Missing columns in "${sheetName}": ${missingColumns.join(', ')}`
        });
      }
    }
  });
  
  return errors;
}

/**
 * Parse a single sheet and extract row data
 * @param {ExcelJS.Workbook} workbook - Excel workbook
 * @param {string} sheetName - Name of the sheet to parse
 * @returns {Array} Array of row objects
 */
function parseSheet(workbook, sheetName) {
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) return [];
  
  const rows = [];
  const headerRow = sheet.getRow(1);
  const headers = [];
  
  // Extract headers
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = cell.value;
  });
  
  // Extract data rows (skip header row)
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    
    const rowData = {
      excelRowNumber: rowNumber,
      _raw: {}
    };
    
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber];
      if (header) {
        let value = cell.value;
        
        // Handle date cells
        if (value instanceof Date) {
          value = value.toISOString().split('T')[0]; // YYYY-MM-DD
        }
        
        // Handle formula cells
        if (cell.formula) {
          value = cell.result || cell.value;
        }
        
        // Convert to string and trim
        if (value !== null && value !== undefined) {
          value = String(value).trim();
        }
        
        rowData[header] = value;
        rowData._raw[header] = value;
      }
    });
    
    // Only add row if it has data (skip empty rows)
    if (Object.keys(rowData).length > 2) { // More than excelRowNumber and _raw
      rows.push(rowData);
    }
  });
  
  return rows;
}

/**
 * Group parsed data by Vehicle_Ref_ID for relational processing
 * @param {Object} parsedData - Parsed data from all sheets
 * @returns {Object} Grouped vehicles with their related data
 */
function groupVehiclesByRefId(parsedData) {
  const grouped = {};
  
  // Start with basic information (parent)
  parsedData.basicInformation.forEach(basicInfo => {
    const refId = basicInfo.Vehicle_Ref_ID;
    if (!refId) return;
    
    grouped[refId] = {
      basicInformation: basicInfo,
      specifications: null,
      capacityDetails: null,
      ownershipDetails: null,
      documents: []
    };
  });
  
  // Add specifications (child - one-to-one)
  parsedData.specifications.forEach(spec => {
    const refId = spec.Vehicle_Ref_ID;
    if (grouped[refId]) {
      grouped[refId].specifications = spec;
    }
  });
  
  // Add capacity details (child - one-to-one)
  parsedData.capacityDetails.forEach(capacity => {
    const refId = capacity.Vehicle_Ref_ID;
    if (grouped[refId]) {
      grouped[refId].capacityDetails = capacity;
    }
  });
  
  // Add ownership details (child - one-to-one)
  parsedData.ownershipDetails.forEach(ownership => {
    const refId = ownership.Vehicle_Ref_ID;
    if (grouped[refId]) {
      grouped[refId].ownershipDetails = ownership;
    }
  });
  
  // Add documents (child - one-to-many)
  parsedData.documents.forEach(doc => {
    const refId = doc.Vehicle_Ref_ID;
    if (grouped[refId]) {
      grouped[refId].documents.push(doc);
    }
  });
  
  return grouped;
}

/**
 * Get summary statistics of parsed data
 * @param {Object} parsedData - Parsed data from all sheets
 * @returns {Object} Summary statistics
 */
function getParseStatistics(parsedData) {
  const groupedVehicles = groupVehiclesByRefId(parsedData);
  const totalVehicles = Object.keys(groupedVehicles).length;
  
  let missingSpecifications = 0;
  let missingCapacity = 0;
  let missingOwnership = 0;
  let totalDocuments = 0;
  
  Object.values(groupedVehicles).forEach(vehicle => {
    if (!vehicle.specifications) missingSpecifications++;
    if (!vehicle.capacityDetails) missingCapacity++;
    if (!vehicle.ownershipDetails) missingOwnership++;
    totalDocuments += vehicle.documents.length;
  });
  
  return {
    totalVehicles,
    missingSpecifications,
    missingCapacity,
    missingOwnership,
    totalDocuments,
    avgDocumentsPerVehicle: totalVehicles > 0 ? (totalDocuments / totalVehicles).toFixed(2) : 0
  };
}

module.exports = {
  parseVehicleExcelFile,
  validateStructure,
  parseSheet,
  groupVehiclesByRefId,
  getParseStatistics,
  REQUIRED_SHEETS,
  SHEET_COLUMNS
};
