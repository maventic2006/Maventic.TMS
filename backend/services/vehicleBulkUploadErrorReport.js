const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Generate vehicle bulk upload error report Excel file
 * @param {Array} invalidRecords - Array of invalid vehicle records with errors
 * @param {string} batchId - Batch ID for file naming
 * @returns {Promise<string>} Path to generated error report file
 */
async function generateVehicleErrorReport(invalidRecords, batchId) {
  try {
    console.log(`📄 Generating vehicle error report for batch ${batchId}...`);
    
    const workbook = new ExcelJS.Workbook();
    
    // Sheet 1: Error Summary
    createErrorSummarySheet(workbook, invalidRecords, batchId);
    
    // Sheet 2: Basic Information Errors
    const basicInfoErrors = invalidRecords.filter(r => 
      r.errors.some(e => e.sheet === 'Basic Information')
    );
    if (basicInfoErrors.length > 0) {
      createBasicInformationErrorSheet(workbook, basicInfoErrors);
    }
    
    // Sheet 3: Specifications Errors
    const specErrors = invalidRecords.filter(r =>
      r.errors.some(e => e.sheet === 'Specifications')
    );
    if (specErrors.length > 0) {
      createSpecificationsErrorSheet(workbook, specErrors);
    }
    
    // Sheet 4: Capacity Details Errors
    const capacityErrors = invalidRecords.filter(r =>
      r.errors.some(e => e.sheet === 'Capacity Details')
    );
    if (capacityErrors.length > 0) {
      createCapacityDetailsErrorSheet(workbook, capacityErrors);
    }
    
    // Sheet 5: Ownership Details Errors
    const ownershipErrors = invalidRecords.filter(r =>
      r.errors.some(e => e.sheet === 'Ownership Details')
    );
    if (ownershipErrors.length > 0) {
      createOwnershipDetailsErrorSheet(workbook, ownershipErrors);
    }
    
    // Sheet 6: Documents Errors
    const docErrors = invalidRecords.filter(r =>
      r.errors.some(e => e.sheet === 'Documents')
    );
    if (docErrors.length > 0) {
      createDocumentsErrorSheet(workbook, docErrors);
    }
    
    // Save to file
    const errorReportsDir = path.join(__dirname, '../uploads/error-reports');
    if (!fs.existsSync(errorReportsDir)) {
      fs.mkdirSync(errorReportsDir, { recursive: true });
    }
    
    const filename = `vehicle-error-report-${batchId}-${Date.now()}.xlsx`;
    const filePath = path.join(errorReportsDir, filename);
    
    await workbook.xlsx.writeFile(filePath);
    
    console.log(`✓ Vehicle error report generated: ${filename}`);
    
    return filePath;
    
  } catch (error) {
    console.error('Error generating vehicle error report:', error);
    throw error;
  }
}

/**
 * Create error summary sheet
 */
function createErrorSummarySheet(workbook, invalidRecords, batchId) {
  const sheet = workbook.addWorksheet('Error Summary');
  
  // Title
  sheet.mergeCells('A1:E1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = `Vehicle Bulk Upload Error Report - Batch ${batchId}`;
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD32F2F' }
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;
  
  // Stats section
  sheet.getCell('A3').value = 'Total Invalid Vehicles:';
  sheet.getCell('B3').value = invalidRecords.length;
  sheet.getCell('B3').font = { bold: true, color: { argb: 'FFD32F2F' } };
  
  sheet.getCell('A4').value = 'Generated On:';
  sheet.getCell('B4').value = new Date().toLocaleString();
  
  // Error breakdown by type
  sheet.getCell('A6').value = 'Error Breakdown by Type:';
  sheet.getCell('A6').font = { bold: true, size: 12 };
  
  const errorCounts = {};
  invalidRecords.forEach(record => {
    record.errors.forEach(error => {
      const type = error.type || 'UNKNOWN';
      errorCounts[type] = (errorCounts[type] || 0) + 1;
    });
  });
  
  let row = 7;
  sheet.getCell(`A${row}`).value = 'Error Type';
  sheet.getCell(`B${row}`).value = 'Count';
  sheet.getRow(row).font = { bold: true };
  sheet.getRow(row).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  row++;
  
  Object.entries(errorCounts).forEach(([type, count]) => {
    sheet.getCell(`A${row}`).value = type;
    sheet.getCell(`B${row}`).value = count;
    row++;
  });
  
  // Error breakdown by sheet
  row += 2;
  sheet.getCell(`A${row}`).value = 'Error Breakdown by Sheet:';
  sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
  row++;
  
  const sheetCounts = {};
  invalidRecords.forEach(record => {
    record.errors.forEach(error => {
      const sheetName = error.sheet || 'Unknown';
      sheetCounts[sheetName] = (sheetCounts[sheetName] || 0) + 1;
    });
  });
  
  sheet.getCell(`A${row}`).value = 'Sheet Name';
  sheet.getCell(`B${row}`).value = 'Error Count';
  sheet.getRow(row).font = { bold: true };
  sheet.getRow(row).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  row++;
  
  Object.entries(sheetCounts).forEach(([sheetName, count]) => {
    sheet.getCell(`A${row}`).value = sheetName;
    sheet.getCell(`B${row}`).value = count;
    row++;
  });
  
  // Instructions
  row += 2;
  sheet.getCell(`A${row}`).value = 'Instructions:';
  sheet.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: 'FF0066CC' } };
  row++;
  
  const instructions = [
    '1. Review errors in subsequent sheets (each sheet shows errors for that data type)',
    '2. Cells with errors are highlighted in RED',
    '3. Error messages are provided in the last column of each sheet',
    '4. Fix the errors in your original Excel file',
    '5. Re-upload the corrected file to process the vehicles',
    '6. Note: Duplicate VIN and GPS IMEI errors must be resolved before upload'
  ];
  
  instructions.forEach(instruction => {
    sheet.getCell(`A${row}`).value = instruction;
    sheet.getCell(`A${row}`).alignment = { wrapText: true };
    row++;
  });
  
  // Column widths
  sheet.getColumn(1).width = 50;
  sheet.getColumn(2).width = 20;
  
  return sheet;
}

/**
 * Create Basic Information error sheet
 */
function createBasicInformationErrorSheet(workbook, errorRecords) {
  const sheet = workbook.addWorksheet('Basic Information Errors');
  
  // Headers
  const headers = [
    'Row #',
    'Vehicle_Ref_ID',
    'Make_Brand',
    'Model',
    'VIN_Chassis_Number',
    'GPS_IMEI_Number',
    'Manufacturing_Month_Year',
    'Registration_Number',
    'Status',
    'ERROR MESSAGES'
  ];
  
  sheet.addRow(headers);
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1976D2' }
  };
  headerRow.height = 20;
  
  // Data rows
  errorRecords.forEach(record => {
    const basicInfo = record.data.basicInformation;
    const errors = record.errors.filter(e => e.sheet === 'Basic Information');
    
    const errorMessages = errors.map(e => 
      `[${e.field || 'General'}] ${e.message}`
    ).join('\n');
    
    const errorFields = new Set(errors.map(e => e.field));
    
    const dataRow = sheet.addRow([
      basicInfo.excelRowNumber,
      basicInfo.Vehicle_Ref_ID,
      basicInfo.Make_Brand,
      basicInfo.Model,
      basicInfo.VIN_Chassis_Number,
      basicInfo.GPS_IMEI_Number,
      basicInfo.Manufacturing_Month_Year,
      basicInfo.Registration_Number,
      basicInfo.Status || 'ACTIVE',
      errorMessages
    ]);
    
    // Highlight error cells in red
    headers.forEach((header, colIndex) => {
      const cell = dataRow.getCell(colIndex + 1);
      
      // Check if this column has an error
      const fieldName = header.replace(/ /g, '_');
      if (errorFields.has(fieldName)) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFCCCC' }
        };
        cell.font = { color: { argb: 'FFD32F2F' }, bold: true };
      }
    });
    
    // Error messages column
    const errorCell = dataRow.getCell(headers.length);
    errorCell.font = { color: { argb: 'FFD32F2F' }, bold: true };
    errorCell.alignment = { wrapText: true, vertical: 'top' };
  });
  
  // Auto-fit columns
  sheet.columns.forEach((column, index) => {
    if (index === headers.length - 1) {
      column.width = 50; // Error messages column
    } else {
      column.width = 20;
    }
  });
  
  return sheet;
}

/**
 * Create Specifications error sheet
 */
function createSpecificationsErrorSheet(workbook, errorRecords) {
  const sheet = workbook.addWorksheet('Specifications Errors');
  
  // Headers
  const headers = [
    'Row #',
    'Vehicle_Ref_ID',
    'Engine_Type_ID',
    'Engine_Number',
    'Fuel_Type_ID',
    'Transmission_Type',
    'Financer',
    'Suspension_Type',
    'ERROR MESSAGES'
  ];
  
  sheet.addRow(headers);
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1976D2' }
  };
  headerRow.height = 20;
  
  // Data rows
  errorRecords.forEach(record => {
    const spec = record.data.specifications;
    if (!spec) return;
    
    const errors = record.errors.filter(e => e.sheet === 'Specifications');
    const errorMessages = errors.map(e => 
      `[${e.field || 'General'}] ${e.message}`
    ).join('\n');
    
    const errorFields = new Set(errors.map(e => e.field));
    
    const dataRow = sheet.addRow([
      spec.excelRowNumber,
      spec.Vehicle_Ref_ID,
      spec.Engine_Type_ID,
      spec.Engine_Number,
      spec.Fuel_Type_ID,
      spec.Transmission_Type,
      spec.Financer,
      spec.Suspension_Type,
      errorMessages
    ]);
    
    // Highlight error cells
    headers.forEach((header, colIndex) => {
      const cell = dataRow.getCell(colIndex + 1);
      const fieldName = header.replace(/ /g, '_');
      if (errorFields.has(fieldName)) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFCCCC' }
        };
        cell.font = { color: { argb: 'FFD32F2F' }, bold: true };
      }
    });
    
    // Error messages column
    const errorCell = dataRow.getCell(headers.length);
    errorCell.font = { color: { argb: 'FFD32F2F' }, bold: true };
    errorCell.alignment = { wrapText: true, vertical: 'top' };
  });
  
  // Auto-fit columns
  sheet.columns.forEach((column, index) => {
    if (index === headers.length - 1) {
      column.width = 50;
    } else {
      column.width = 20;
    }
  });
  
  return sheet;
}

/**
 * Create Capacity Details error sheet
 */
function createCapacityDetailsErrorSheet(workbook, errorRecords) {
  const sheet = workbook.addWorksheet('Capacity Details Errors');
  
  // Headers
  const headers = [
    'Row #',
    'Vehicle_Ref_ID',
    'Unloading_Weight_KG',
    'Gross_Vehicle_Weight_KG',
    'Payload_Capacity_KG',
    'Volume_Capacity_CBM',
    'Load_Capacity_TON',
    'Vehicle_Condition',
    'ERROR MESSAGES'
  ];
  
  sheet.addRow(headers);
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1976D2' }
  };
  headerRow.height = 20;
  
  // Data rows
  errorRecords.forEach(record => {
    const capacity = record.data.capacityDetails;
    if (!capacity) return;
    
    const errors = record.errors.filter(e => e.sheet === 'Capacity Details');
    const errorMessages = errors.map(e => 
      `[${e.field || 'General'}] ${e.message}`
    ).join('\n');
    
    const errorFields = new Set(errors.map(e => e.field));
    
    const dataRow = sheet.addRow([
      capacity.excelRowNumber,
      capacity.Vehicle_Ref_ID,
      capacity.Unloading_Weight_KG,
      capacity.Gross_Vehicle_Weight_KG,
      capacity.Payload_Capacity_KG,
      capacity.Volume_Capacity_CBM,
      capacity.Load_Capacity_TON,
      capacity.Vehicle_Condition,
      errorMessages
    ]);
    
    // Highlight error cells
    headers.forEach((header, colIndex) => {
      const cell = dataRow.getCell(colIndex + 1);
      const fieldName = header.replace(/ /g, '_');
      if (errorFields.has(fieldName)) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFCCCC' }
        };
        cell.font = { color: { argb: 'FFD32F2F' }, bold: true };
      }
    });
    
    const errorCell = dataRow.getCell(headers.length);
    errorCell.font = { color: { argb: 'FFD32F2F' }, bold: true };
    errorCell.alignment = { wrapText: true, vertical: 'top' };
  });
  
  sheet.columns.forEach((column, index) => {
    if (index === headers.length - 1) {
      column.width = 50;
    } else {
      column.width = 20;
    }
  });
  
  return sheet;
}

/**
 * Create Ownership Details error sheet
 */
function createOwnershipDetailsErrorSheet(workbook, errorRecords) {
  const sheet = workbook.addWorksheet('Ownership Details Errors');
  
  // Headers
  const headers = [
    'Row #',
    'Vehicle_Ref_ID',
    'Ownership_Name',
    'Registration_Number',
    'Registration_Date',
    'Valid_From',
    'Valid_To',
    'Purchase_Date',
    'ERROR MESSAGES'
  ];
  
  sheet.addRow(headers);
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1976D2' }
  };
  headerRow.height = 20;
  
  // Data rows
  errorRecords.forEach(record => {
    const ownership = record.data.ownershipDetails;
    if (!ownership) return;
    
    const errors = record.errors.filter(e => e.sheet === 'Ownership Details');
    const errorMessages = errors.map(e => 
      `[${e.field || 'General'}] ${e.message}`
    ).join('\n');
    
    const errorFields = new Set(errors.map(e => e.field));
    
    const dataRow = sheet.addRow([
      ownership.excelRowNumber,
      ownership.Vehicle_Ref_ID,
      ownership.Ownership_Name,
      ownership.Registration_Number,
      ownership.Registration_Date,
      ownership.Valid_From,
      ownership.Valid_To,
      ownership.Purchase_Date,
      errorMessages
    ]);
    
    // Highlight error cells
    headers.forEach((header, colIndex) => {
      const cell = dataRow.getCell(colIndex + 1);
      const fieldName = header.replace(/ /g, '_');
      if (errorFields.has(fieldName)) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFCCCC' }
        };
        cell.font = { color: { argb: 'FFD32F2F' }, bold: true };
      }
    });
    
    const errorCell = dataRow.getCell(headers.length);
    errorCell.font = { color: { argb: 'FFD32F2F' }, bold: true };
    errorCell.alignment = { wrapText: true, vertical: 'top' };
  });
  
  sheet.columns.forEach((column, index) => {
    if (index === headers.length - 1) {
      column.width = 50;
    } else {
      column.width = 20;
    }
  });
  
  return sheet;
}

/**
 * Create Documents error sheet
 */
function createDocumentsErrorSheet(workbook, errorRecords) {
  const sheet = workbook.addWorksheet('Documents Errors');
  
  // Headers
  const headers = [
    'Row #',
    'Vehicle_Ref_ID',
    'Document_Type_ID',
    'Document_Type_Name',
    'Reference_Number',
    'Valid_From',
    'Valid_To',
    'Premium_Amount',
    'ERROR MESSAGES'
  ];
  
  sheet.addRow(headers);
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1976D2' }
  };
  headerRow.height = 20;
  
  // Data rows
  errorRecords.forEach(record => {
    const documents = record.data.documents || [];
    const docErrors = record.errors.filter(e => e.sheet === 'Documents');
    
    documents.forEach(doc => {
      const errors = docErrors.filter(e => e.row === doc.excelRowNumber);
      if (errors.length === 0) return;
      
      const errorMessages = errors.map(e => 
        `[${e.field || 'General'}] ${e.message}`
      ).join('\n');
      
      const errorFields = new Set(errors.map(e => e.field));
      
      const dataRow = sheet.addRow([
        doc.excelRowNumber,
        doc.Vehicle_Ref_ID,
        doc.Document_Type_ID,
        doc.Document_Type_Name,
        doc.Reference_Number,
        doc.Valid_From,
        doc.Valid_To,
        doc.Premium_Amount,
        errorMessages
      ]);
      
      // Highlight error cells
      headers.forEach((header, colIndex) => {
        const cell = dataRow.getCell(colIndex + 1);
        const fieldName = header.replace(/ /g, '_');
        if (errorFields.has(fieldName)) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFCCCC' }
          };
          cell.font = { color: { argb: 'FFD32F2F' }, bold: true };
        }
      });
      
      const errorCell = dataRow.getCell(headers.length);
      errorCell.font = { color: { argb: 'FFD32F2F' }, bold: true };
      errorCell.alignment = { wrapText: true, vertical: 'top' };
    });
  });
  
  sheet.columns.forEach((column, index) => {
    if (index === headers.length - 1) {
      column.width = 50;
    } else {
      column.width = 20;
    }
  });
  
  return sheet;
}

module.exports = {
  generateVehicleErrorReport
};
