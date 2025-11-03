const ExcelJS = require('exceljs');
const path = require('path');

/**
 * Expected sheet names in the Excel file
 */
const REQUIRED_SHEETS = {
  GENERAL_DETAILS: 'General Details',
  ADDRESSES: 'Addresses',
  CONTACTS: 'Contacts',
  SERVICEABLE_AREAS: 'Serviceable Areas',
  DOCUMENTS: 'Documents'
};

/**
 * Expected columns for each sheet
 */
const SHEET_COLUMNS = {
  [REQUIRED_SHEETS.GENERAL_DETAILS]: [
    'Transporter_Ref_ID',
    'Business_Name',
    'Transport_Mode_Road',
    'Transport_Mode_Rail',
    'Transport_Mode_Air',
    'Transport_Mode_Sea',
    'From_Date',
    'To_Date',
    'Active_Flag'
  ],
  [REQUIRED_SHEETS.ADDRESSES]: [
    'Transporter_Ref_ID',
    'Address_Type',
    'Street_1',
    'Street_2',
    'City',
    'District',
    'State',
    'Country',
    'Postal_Code',
    'VAT_GST_Number',
    'TIN_PAN',
    'TAN',
    'Is_Primary'
  ],
  [REQUIRED_SHEETS.CONTACTS]: [
    'Transporter_Ref_ID',
    'Address_Type',
    'Contact_Person_Name',
    'Designation',
    'Phone_Number',
    'Alt_Phone_Number',
    'Email_ID',
    'Alt_Email_ID',
    'WhatsApp_Number'
  ],
  [REQUIRED_SHEETS.SERVICEABLE_AREAS]: [
    'Transporter_Ref_ID',
    'Service_Country',
    'Service_States',
    'Service_Frequency'
  ],
  [REQUIRED_SHEETS.DOCUMENTS]: [
    'Transporter_Ref_ID',
    'Document_Type',
    'Document_Name',
    'Document_Number',
    'Issue_Date',
    'Expiry_Date',
    'Issuing_Country',
    'Is_Verified'
  ]
};

/**
 * Parse Excel file and extract all sheet data
 * @param {string} filePath - Path to Excel file
 * @returns {Promise<Object>} Parsed data from all sheets
 */
async function parseExcelFile(filePath) {
  try {
    console.log('📖 Parsing Excel file:', path.basename(filePath));
    
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
      generalDetails: parseSheet(workbook, REQUIRED_SHEETS.GENERAL_DETAILS),
      addresses: parseSheet(workbook, REQUIRED_SHEETS.ADDRESSES),
      contacts: parseSheet(workbook, REQUIRED_SHEETS.CONTACTS),
      serviceableAreas: parseSheet(workbook, REQUIRED_SHEETS.SERVICEABLE_AREAS),
      documents: parseSheet(workbook, REQUIRED_SHEETS.DOCUMENTS)
    };
    
    console.log('✓ Excel parsing completed successfully');
    console.log(`  General Details: ${parsedData.generalDetails.length} rows`);
    console.log(`  Addresses: ${parsedData.addresses.length} rows`);
    console.log(`  Contacts: ${parsedData.contacts.length} rows`);
    console.log(`  Serviceable Areas: ${parsedData.serviceableAreas.length} rows`);
    console.log(`  Documents: ${parsedData.documents.length} rows`);
    
    return {
      success: true,
      error: null,
      errors: [],
      data: parsedData
    };
    
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return {
      success: false,
      error: 'PARSE_ERROR',
      errors: [{ message: error.message }],
      data: null
    };
  }
}

/**
 * Validate Excel file structure
 * @param {ExcelJS.Workbook} workbook - Excel workbook
 * @returns {Array} Array of structure errors
 */
function validateStructure(workbook) {
  const errors = [];
  
  // Check if all required sheets exist
  const sheetNames = workbook.worksheets.map(ws => ws.name);
  const requiredSheetNames = Object.values(REQUIRED_SHEETS);
  
  requiredSheetNames.forEach(requiredSheet => {
    if (!sheetNames.includes(requiredSheet)) {
      errors.push({
        type: 'MISSING_SHEET',
        message: `Required sheet "${requiredSheet}" is missing`,
        sheet: requiredSheet
      });
    }
  });
  
  if (errors.length > 0) {
    return errors;
  }
  
  // Check if all sheets have required columns
  Object.entries(REQUIRED_SHEETS).forEach(([key, sheetName]) => {
    const worksheet = workbook.getWorksheet(sheetName);
    if (worksheet) {
      const columnErrors = validateSheetColumns(worksheet, sheetName);
      errors.push(...columnErrors);
    }
  });
  
  return errors;
}

/**
 * Validate sheet columns
 * @param {ExcelJS.Worksheet} worksheet - Excel worksheet
 * @param {string} sheetName - Name of the sheet
 * @returns {Array} Array of column errors
 */
function validateSheetColumns(worksheet, sheetName) {
  const errors = [];
  const expectedColumns = SHEET_COLUMNS[sheetName];
  
  if (!expectedColumns) {
    return errors;
  }
  
  // Get actual headers from first row
  const headerRow = worksheet.getRow(1);
  const actualHeaders = [];
  
  headerRow.eachCell({ includeEmpty: false }, (cell) => {
    actualHeaders.push(cell.value ? cell.value.toString().trim() : '');
  });
  
  // Check for missing required columns
  expectedColumns.forEach(expectedCol => {
    if (!actualHeaders.includes(expectedCol)) {
      errors.push({
        type: 'MISSING_COLUMN',
        message: `Required column "${expectedCol}" is missing in sheet "${sheetName}"`,
        sheet: sheetName,
        column: expectedCol
      });
    }
  });
  
  return errors;
}

/**
 * Parse a single sheet into array of objects
 * @param {ExcelJS.Workbook} workbook - Excel workbook
 * @param {string} sheetName - Name of sheet to parse
 * @returns {Array} Array of row objects
 */
function parseSheet(workbook, sheetName) {
  const worksheet = workbook.getWorksheet(sheetName);
  if (!worksheet) {
    return [];
  }
  
  const data = [];
  const headers = [];
  
  // Get headers from first row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers[colNumber] = cell.value ? cell.value.toString().trim() : '';
  });
  
  // Parse data rows (starting from row 2)
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    // Skip header row
    if (rowNumber === 1) {
      return;
    }
    
    const rowData = {
      _excelRowNumber: rowNumber,
      _sheetName: sheetName
    };
    
    let hasData = false;
    
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber];
      if (header) {
        const cellValue = getCellValue(cell);
        rowData[header] = cellValue;
        
        // Check if row has any non-empty data
        if (cellValue !== null && cellValue !== '') {
          hasData = true;
        }
      }
    });
    
    // Only add row if it has data
    if (hasData) {
      data.push(rowData);
    }
  });
  
  return data;
}

/**
 * Get cell value with proper type handling
 * @param {ExcelJS.Cell} cell - Excel cell
 * @returns {*} Cell value
 */
function getCellValue(cell) {
  if (!cell || cell.value === null || cell.value === undefined) {
    return null;
  }
  
  // Handle different cell value types
  const value = cell.value;
  
  // Handle date cells
  if (value instanceof Date) {
    return value.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }
  
  // Handle formula cells
  if (value.result !== undefined) {
    return value.result;
  }
  
  // Handle rich text
  if (value.richText) {
    return value.richText.map(t => t.text).join('');
  }
  
  // Handle hyperlinks
  if (value.text !== undefined) {
    return value.text;
  }
  
  // Convert to string and trim
  const stringValue = String(value).trim();
  
  // Return null for empty strings
  return stringValue === '' ? null : stringValue;
}

/**
 * Parse Excel file with streaming for large files
 * @param {string} filePath - Path to Excel file
 * @returns {Promise<Object>} Parsed data from all sheets
 */
async function parseExcelFileStreaming(filePath) {
  try {
    console.log('📖 Parsing Excel file (streaming):', path.basename(filePath));
    
    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filePath);
    
    const parsedData = {
      generalDetails: [],
      addresses: [],
      contacts: [],
      serviceableAreas: [],
      documents: []
    };
    
    for await (const worksheetReader of workbookReader) {
      const sheetName = worksheetReader.name;
      
      // Only process required sheets
      if (!Object.values(REQUIRED_SHEETS).includes(sheetName)) {
        continue;
      }
      
      const sheetData = [];
      const headers = [];
      let rowNumber = 0;
      
      for await (const row of worksheetReader) {
        rowNumber++;
        
        // First row is headers
        if (rowNumber === 1) {
          row.values.forEach((value, index) => {
            if (value) {
              headers[index] = value.toString().trim();
            }
          });
          continue;
        }
        
        // Parse data row
        const rowData = {
          _excelRowNumber: rowNumber,
          _sheetName: sheetName
        };
        
        let hasData = false;
        row.values.forEach((value, index) => {
          const header = headers[index];
          if (header) {
            const cellValue = value !== null && value !== undefined ? String(value).trim() : null;
            rowData[header] = cellValue === '' ? null : cellValue;
            
            if (cellValue !== null && cellValue !== '') {
              hasData = true;
            }
          }
        });
        
        if (hasData) {
          sheetData.push(rowData);
        }
      }
      
      // Store sheet data
      switch (sheetName) {
        case REQUIRED_SHEETS.GENERAL_DETAILS:
          parsedData.generalDetails = sheetData;
          break;
        case REQUIRED_SHEETS.ADDRESSES:
          parsedData.addresses = sheetData;
          break;
        case REQUIRED_SHEETS.CONTACTS:
          parsedData.contacts = sheetData;
          break;
        case REQUIRED_SHEETS.SERVICEABLE_AREAS:
          parsedData.serviceableAreas = sheetData;
          break;
        case REQUIRED_SHEETS.DOCUMENTS:
          parsedData.documents = sheetData;
          break;
      }
    }
    
    console.log('✓ Excel parsing (streaming) completed successfully');
    
    return {
      success: true,
      error: null,
      errors: [],
      data: parsedData
    };
    
  } catch (error) {
    console.error('Error parsing Excel file (streaming):', error);
    return {
      success: false,
      error: 'PARSE_ERROR',
      errors: [{ message: error.message }],
      data: null
    };
  }
}

module.exports = {
  parseExcelFile,
  parseExcelFileStreaming,
  validateStructure,
  REQUIRED_SHEETS,
  SHEET_COLUMNS
};