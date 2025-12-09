const ExcelJS = require('exceljs');

/**
 * Parse driver bulk upload Excel file
 * @param {string} filePath - Path to Excel file
 * @returns {Promise<Object>} Parsed driver data
 */
async function parseDriverExcel(filePath) {
  try {
    console.log(' Parsing driver Excel file:', filePath);
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const basicInfoSheet = workbook.getWorksheet('Basic Information');
    const addressSheet = workbook.getWorksheet('Addresses');
    const docSheet = workbook.getWorksheet('Documents');
    const historySheet = workbook.getWorksheet('Employment History');
    const accidentSheet = workbook.getWorksheet('Accident & Violation');
    
    if (!basicInfoSheet) {
      throw new Error('Required sheet "Basic Information" not found');
    }
    
    const parsedData = {
      basicInfo: [],
      addresses: [],
      documents: [],
      history: [],
      accidents: []
    };
    
    // Parse Basic Information
    console.log('  Parsing Basic Information...');
    let rowCount = 0;
    basicInfoSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      
      const refId = getCellValue(row, 1);
      if (!refId) return;
      
      rowCount++;
      parsedData.basicInfo.push({
        Driver_Ref_ID: refId,
        Full_Name: getCellValue(row, 2),
        Date_Of_Birth: getCellValue(row, 3, 'date'),
        Gender: getCellValue(row, 4),
        Blood_Group: getCellValue(row, 5),
        Phone_Number: getCellValue(row, 6),
        Email_ID: getCellValue(row, 7),
        Emergency_Contact: getCellValue(row, 8),
        Alternate_Phone_Number: getCellValue(row, 9),
        _excelRowNumber: rowNumber
      });
    });
    console.log(`     Found ${rowCount} driver(s)`);
    
    // Parse Addresses
    if (addressSheet) {
      console.log('  Parsing Addresses...');
      rowCount = 0;
      addressSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        
        const refId = getCellValue(row, 1);
        if (!refId) return;
        
        rowCount++;
        parsedData.addresses.push({
          Driver_Ref_ID: refId,
          Address_Type_ID: getCellValue(row, 2),
          Street_1: getCellValue(row, 3),
          Street_2: getCellValue(row, 4),
          City: getCellValue(row, 5),
          District: getCellValue(row, 6),
          State: getCellValue(row, 7),
          Country: getCellValue(row, 8),
          Postal_Code: getCellValue(row, 9),
          Is_Primary: getCellValue(row, 10),
          _excelRowNumber: rowNumber
        });
      });
      console.log(`     Found ${rowCount} address(es)`);
    }
    
    // Parse Documents
    if (docSheet) {
      console.log('  Parsing Documents...');
      rowCount = 0;
      docSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        
        const refId = getCellValue(row, 1);
        if (!refId) return;
        
        rowCount++;
        parsedData.documents.push({
          Driver_Ref_ID: refId,
          Document_Type: getCellValue(row, 2),
          Document_Number: getCellValue(row, 3),
          Issuing_Country: getCellValue(row, 4),
          Issuing_State: getCellValue(row, 5),
          Valid_From: getCellValue(row, 6, 'date'),
          Valid_To: getCellValue(row, 7, 'date'),
          Remarks: getCellValue(row, 8),
          Active_Flag: getCellValue(row, 9),
          _excelRowNumber: rowNumber
        });
      });
      console.log(`     Found ${rowCount} document(s)`);
    }
    
    // Parse Employment History
    if (historySheet) {
      console.log('  Parsing Employment History...');
      rowCount = 0;
      historySheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        
        const refId = getCellValue(row, 1);
        if (!refId) return;
        
        rowCount++;
        parsedData.history.push({
          Driver_Ref_ID: refId,
          Employer: getCellValue(row, 2),
          Employment_Status: getCellValue(row, 3),
          From_Date: getCellValue(row, 4, 'date'),
          To_Date: getCellValue(row, 5, 'date'),
          Job_Title: getCellValue(row, 6),
          _excelRowNumber: rowNumber
        });
      });
      console.log(`     Found ${rowCount} employment record(s)`);
    }
    
    // Parse Accident & Violation
    if (accidentSheet) {
      console.log('  Parsing Accident & Violation...');
      rowCount = 0;
      accidentSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        
        const refId = getCellValue(row, 1);
        if (!refId) return;
        
        rowCount++;
        parsedData.accidents.push({
          Driver_Ref_ID: refId,
          Type: getCellValue(row, 2),
          Description: getCellValue(row, 3),
          Date: getCellValue(row, 4, 'date'),
          Vehicle_Registration_Number: getCellValue(row, 5),
          _excelRowNumber: rowNumber
        });
      });
      console.log(`     Found ${rowCount} accident/violation record(s)`);
    }
    
    console.log(' Excel parsing complete\n');
    
    return {
      success: true,
      data: parsedData
    };
    
  } catch (error) {
    console.error(' Error parsing driver Excel:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get cell value with proper type handling
 */
function getCellValue(row, colNumber, type = 'string') {
  const cell = row.getCell(colNumber);
  
  if (!cell || cell.value === null || cell.value === undefined) {
    return null;
  }
  
  if (type === 'date') {
    if (cell.value instanceof Date) {
      return cell.value.toISOString().split('T')[0];
    }
    if (typeof cell.value === 'string') {
      const date = new Date(cell.value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    if (typeof cell.value === 'number') {
      // Excel stores dates as numbers (days since 1900-01-01)
      const date = new Date((cell.value - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    return null;
  }
  
  // Handle formulas
  if (cell.value && typeof cell.value === 'object' && cell.value.result !== undefined) {
    return String(cell.value.result).trim();
  }
  
  return String(cell.value).trim();
}

module.exports = {
  parseDriverExcel
};
