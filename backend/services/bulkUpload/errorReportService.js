const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Generate error report Excel file
 * @param {Array} invalidRecords - Array of invalid transporter records with errors
 * @param {string} batchId - Batch ID for file naming
 * @returns {Promise<string>} Path to generated error report file
 */
async function generateErrorReport(invalidRecords, batchId) {
  try {
    console.log(`📄 Generating error report for batch ${batchId}...`);
    
    const workbook = new ExcelJS.Workbook();
    
    // Sheet 1: Error Summary
    const summarySheet = createSummarySheet(workbook, invalidRecords, batchId);
    
    // Sheet 2: General Details Errors
    const generalErrors = invalidRecords.filter(r => 
      r.errors.some(e => e.sheet === 'General Details')
    );
    if (generalErrors.length > 0) {
      createGeneralDetailsErrorSheet(workbook, generalErrors);
    }
    
    // Sheet 3: Address Errors
    const addressErrors = invalidRecords.filter(r =>
      r.errors.some(e => e.sheet === 'Addresses')
    );
    if (addressErrors.length > 0) {
      createAddressErrorSheet(workbook, addressErrors);
    }
    
    // Sheet 4: Contact Errors
    const contactErrors = invalidRecords.filter(r =>
      r.errors.some(e => e.sheet === 'Contacts')
    );
    if (contactErrors.length > 0) {
      createContactErrorSheet(workbook, contactErrors);
    }
    
    // Sheet 5: Serviceable Area Errors
    const areaErrors = invalidRecords.filter(r =>
      r.errors.some(e => e.sheet === 'Serviceable Areas')
    );
    if (areaErrors.length > 0) {
      createServiceableAreaErrorSheet(workbook, areaErrors);
    }
    
    // Sheet 6: Document Errors
    const docErrors = invalidRecords.filter(r =>
      r.errors.some(e => e.sheet === 'Documents')
    );
    if (docErrors.length > 0) {
      createDocumentErrorSheet(workbook, docErrors);
    }
    
    // Save to file
    const errorReportsDir = path.join(__dirname, '../../uploads/error-reports');
    if (!fs.existsSync(errorReportsDir)) {
      fs.mkdirSync(errorReportsDir, { recursive: true });
    }
    
    const filename = `error-report-${batchId}-${Date.now()}.xlsx`;
    const filePath = path.join(errorReportsDir, filename);
    
    await workbook.xlsx.writeFile(filePath);
    
    console.log(`✓ Error report generated: ${filename}`);
    
    return filePath;
    
  } catch (error) {
    console.error('Error generating error report:', error);
    throw error;
  }
}

/**
 * Create summary sheet
 */
function createSummarySheet(workbook, invalidRecords, batchId) {
  const sheet = workbook.addWorksheet('Error Summary');
  
  // Title
  sheet.mergeCells('A1:D1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = `Bulk Upload Error Report - Batch ${batchId}`;
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD32F2F' }
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;
  
  // Stats section
  sheet.getCell('A3').value = 'Total Invalid Records:';
  sheet.getCell('B3').value = invalidRecords.length;
  sheet.getCell('B3').font = { bold: true, color: { argb: 'FFD32F2F' } };
  
  sheet.getCell('A4').value = 'Generated On:';
  sheet.getCell('B4').value = new Date().toLocaleString();
  
  // Error breakdown
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
  row++;
  
  Object.entries(errorCounts).forEach(([type, count]) => {
    sheet.getCell(`A${row}`).value = type;
    sheet.getCell(`B${row}`).value = count;
    row++;
  });
  
  // Instructions
  sheet.getCell(`A${row + 2}`).value = 'Instructions:';
  sheet.getCell(`A${row + 2}`).font = { bold: true, size: 12 };
  
  sheet.getCell(`A${row + 3}`).value = '1. Review errors in subsequent sheets';
  sheet.getCell(`A${row + 4}`).value = '2. Fix errors in your original Excel file';
  sheet.getCell(`A${row + 5}`).value = '3. Re-upload the corrected file';
  sheet.getCell(`A${row + 6}`).value = '4. Cells with errors are highlighted in red';
  
  // Column widths
  sheet.getColumn(1).width = 30;
  sheet.getColumn(2).width = 20;
  
  return sheet;
}

/**
 * Create General Details error sheet
 */
function createGeneralDetailsErrorSheet(workbook, errorRecords) {
  const sheet = workbook.addWorksheet('General Details Errors');
  
  // Headers
  const headers = [
    'Row #',
    'Transporter_Ref_ID',
    'Business_Name',
    'Transport_Mode_Road',
    'Transport_Mode_Rail',
    'Transport_Mode_Air',
    'Transport_Mode_Sea',
    'From_Date',
    'To_Date',
    'Active_Flag',
    'Errors'
  ];
  
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  
  // Add error rows
  errorRecords.forEach(record => {
    const gd = record.data.generalDetails;
    const sheetErrors = record.errors.filter(e => e.sheet === 'General Details');
    const errorMessages = sheetErrors.map(e => `${e.field || 'General'}: ${e.message}`).join('\n');
    
    const rowData = [
      gd._excelRowNumber,
      gd.Transporter_Ref_ID,
      gd.Business_Name,
      gd.Transport_Mode_Road,
      gd.Transport_Mode_Rail,
      gd.Transport_Mode_Air,
      gd.Transport_Mode_Sea,
      gd.From_Date,
      gd.To_Date,
      gd.Active_Flag,
      errorMessages
    ];
    
    const row = sheet.addRow(rowData);
    
    // Highlight error cells
    sheetErrors.forEach(error => {
      const fieldIndex = headers.indexOf(error.field);
      if (fieldIndex > 0) {
        row.getCell(fieldIndex + 1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFCCCC' }
        };
      }
    });
    
    // Make error column red text
    row.getCell(headers.length).font = { color: { argb: 'FFD32F2F' } };
  });
  
  // Auto-fit columns
  sheet.columns.forEach(column => {
    column.width = 15;
  });
  sheet.getColumn(headers.length).width = 50; // Error column wider
  
  return sheet;
}

/**
 * Create Address error sheet
 */
function createAddressErrorSheet(workbook, errorRecords) {
  const sheet = workbook.addWorksheet('Address Errors');
  
  const headers = [
    'Row #',
    'Transporter_Ref_ID',
    'Address_Type',
    'Street_1',
    'City',
    'State',
    'Country',
    'Postal_Code',
    'Is_Primary',
    'Errors'
  ];
  
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' }
  };
  
  errorRecords.forEach(record => {
    const sheetErrors = record.errors.filter(e => e.sheet === 'Addresses');
    
    record.data.addresses.forEach(addr => {
      const addrErrors = sheetErrors.filter(e => e.row === addr._excelRowNumber);
      if (addrErrors.length > 0) {
        const errorMessages = addrErrors.map(e => `${e.field || 'General'}: ${e.message}`).join('\n');
        
        const rowData = [
          addr._excelRowNumber,
          addr.Transporter_Ref_ID,
          addr.Address_Type,
          addr.Street_1,
          addr.City,
          addr.State,
          addr.Country,
          addr.Postal_Code,
          addr.Is_Primary,
          errorMessages
        ];
        
        const row = sheet.addRow(rowData);
        
        // Highlight error cells
        addrErrors.forEach(error => {
          const fieldIndex = headers.indexOf(error.field);
          if (fieldIndex > 0) {
            row.getCell(fieldIndex + 1).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFCCCC' }
            };
          }
        });
        
        row.getCell(headers.length).font = { color: { argb: 'FFD32F2F' } };
      }
    });
  });
  
  sheet.columns.forEach(column => {
    column.width = 15;
  });
  sheet.getColumn(headers.length).width = 50;
  
  return sheet;
}

/**
 * Create Contact error sheet
 */
function createContactErrorSheet(workbook, errorRecords) {
  const sheet = workbook.addWorksheet('Contact Errors');
  
  const headers = [
    'Row #',
    'Transporter_Ref_ID',
    'Address_Type',
    'Contact_Person_Name',
    'Phone_Number',
    'Email_ID',
    'Errors'
  ];
  
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC000' }
  };
  
  errorRecords.forEach(record => {
    const sheetErrors = record.errors.filter(e => e.sheet === 'Contacts');
    
    record.data.contacts.forEach(contact => {
      const contactErrors = sheetErrors.filter(e => e.row === contact._excelRowNumber);
      if (contactErrors.length > 0) {
        const errorMessages = contactErrors.map(e => `${e.field || 'General'}: ${e.message}`).join('\n');
        
        const rowData = [
          contact._excelRowNumber,
          contact.Transporter_Ref_ID,
          contact.Address_Type,
          contact.Contact_Person_Name,
          contact.Phone_Number,
          contact.Email_ID,
          errorMessages
        ];
        
        const row = sheet.addRow(rowData);
        
        contactErrors.forEach(error => {
          const fieldIndex = headers.indexOf(error.field);
          if (fieldIndex > 0) {
            row.getCell(fieldIndex + 1).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFCCCC' }
            };
          }
        });
        
        row.getCell(headers.length).font = { color: { argb: 'FFD32F2F' } };
      }
    });
  });
  
  sheet.columns.forEach(column => {
    column.width = 20;
  });
  sheet.getColumn(headers.length).width = 50;
  
  return sheet;
}

/**
 * Create Serviceable Area error sheet
 */
function createServiceableAreaErrorSheet(workbook, errorRecords) {
  const sheet = workbook.addWorksheet('Serviceable Area Errors');
  
  const headers = [
    'Row #',
    'Transporter_Ref_ID',
    'Service_Country',
    'Service_States',
    'Service_Frequency',
    'Errors'
  ];
  
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF5B9BD5' }
  };
  
  errorRecords.forEach(record => {
    const sheetErrors = record.errors.filter(e => e.sheet === 'Serviceable Areas');
    
    record.data.serviceableAreas.forEach(area => {
      const areaErrors = sheetErrors.filter(e => e.row === area._excelRowNumber);
      if (areaErrors.length > 0) {
        const errorMessages = areaErrors.map(e => `${e.field || 'General'}: ${e.message}`).join('\n');
        
        const rowData = [
          area._excelRowNumber,
          area.Transporter_Ref_ID,
          area.Service_Country,
          area.Service_States,
          area.Service_Frequency,
          errorMessages
        ];
        
        const row = sheet.addRow(rowData);
        
        areaErrors.forEach(error => {
          const fieldIndex = headers.indexOf(error.field);
          if (fieldIndex > 0) {
            row.getCell(fieldIndex + 1).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFCCCC' }
            };
          }
        });
        
        row.getCell(headers.length).font = { color: { argb: 'FFD32F2F' } };
      }
    });
  });
  
  sheet.columns.forEach(column => {
    column.width = 20;
  });
  sheet.getColumn(headers.length).width = 50;
  
  return sheet;
}

/**
 * Create Document error sheet
 */
function createDocumentErrorSheet(workbook, errorRecords) {
  const sheet = workbook.addWorksheet('Document Errors');
  
  const headers = [
    'Row #',
    'Transporter_Ref_ID',
    'Document_Type',
    'Document_Name',
    'Document_Number',
    'Issue_Date',
    'Errors'
  ];
  
  sheet.addRow(headers);
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF843C0C' }
  };
  
  errorRecords.forEach(record => {
    const sheetErrors = record.errors.filter(e => e.sheet === 'Documents');
    
    record.data.documents.forEach(doc => {
      const docErrors = sheetErrors.filter(e => e.row === doc._excelRowNumber);
      if (docErrors.length > 0) {
        const errorMessages = docErrors.map(e => `${e.field || 'General'}: ${e.message}`).join('\n');
        
        const rowData = [
          doc._excelRowNumber,
          doc.Transporter_Ref_ID,
          doc.Document_Type,
          doc.Document_Name,
          doc.Document_Number,
          doc.Issue_Date,
          errorMessages
        ];
        
        const row = sheet.addRow(rowData);
        
        docErrors.forEach(error => {
          const fieldIndex = headers.indexOf(error.field);
          if (fieldIndex > 0) {
            row.getCell(fieldIndex + 1).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFCCCC' }
            };
          }
        });
        
        row.getCell(headers.length).font = { color: { argb: 'FFD32F2F' } };
      }
    });
  });
  
  sheet.columns.forEach(column => {
    column.width = 20;
  });
  sheet.getColumn(headers.length).width = 50;
  
  return sheet;
}

module.exports = {
  generateErrorReport
};