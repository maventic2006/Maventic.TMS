const ExcelJS = require('exceljs');

/**
 * Generate Excel template for bulk transporter upload
 * @returns {Promise<Buffer>} Excel file buffer
 */
async function generateBulkUploadTemplate() {
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: General Details
  const generalSheet = workbook.addWorksheet('General Details');
  generalSheet.columns = [
    { header: 'Transporter_Ref_ID', key: 'ref_id', width: 20 },
    { header: 'Business_Name', key: 'business_name', width: 30 },
    { header: 'Transport_Mode_Road', key: 'mode_road', width: 20 },
    { header: 'Transport_Mode_Rail', key: 'mode_rail', width: 20 },
    { header: 'Transport_Mode_Air', key: 'mode_air', width: 20 },
    { header: 'Transport_Mode_Sea', key: 'mode_sea', width: 20 },
    { header: 'From_Date', key: 'from_date', width: 15 },
    { header: 'To_Date', key: 'to_date', width: 15 },
    { header: 'Active_Flag', key: 'active', width: 12 },
  ];
  
  // Style header row
  generalSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  generalSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  
  // Add sample data
  generalSheet.addRow({
    ref_id: 'TR001',
    business_name: 'ABC Transport Pvt Ltd',
    mode_road: 'Y',
    mode_rail: 'N',
    mode_air: 'N',
    mode_sea: 'N',
    from_date: '2025-01-01',
    to_date: '2026-12-31',
    active: 'Y'
  });
  
  // Sheet 2: Addresses
  const addressSheet = workbook.addWorksheet('Addresses');
  addressSheet.columns = [
    { header: 'Transporter_Ref_ID', key: 'ref_id', width: 20 },
    { header: 'Address_Type', key: 'address_type', width: 20 },
    { header: 'Street_1', key: 'street1', width: 30 },
    { header: 'Street_2', key: 'street2', width: 30 },
    { header: 'City', key: 'city', width: 20 },
    { header: 'District', key: 'district', width: 20 },
    { header: 'State', key: 'state', width: 20 },
    { header: 'Country', key: 'country', width: 15 },
    { header: 'Postal_Code', key: 'postal', width: 15 },
    { header: 'VAT_GST_Number', key: 'vat_gst', width: 25 },
    { header: 'TIN_PAN', key: 'tin_pan', width: 20 },
    { header: 'TAN', key: 'tan', width: 15 },
    { header: 'Is_Primary', key: 'is_primary', width: 12 },
  ];
  
  addressSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  addressSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF70AD47' }
  };
  
  // Add sample data
  addressSheet.addRow({
    ref_id: 'TR001',
    address_type: 'Head Office',
    street1: '123 Main Street',
    street2: 'Near Central Park',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    country: 'IN',
    postal: '400001',
    vat_gst: '27AABCU9603R1ZX',
    tin_pan: 'AABCU9603R',
    tan: 'MUMA12345D',
    is_primary: 'Y'
  });
  
  // Sheet 3: Contacts
  const contactSheet = workbook.addWorksheet('Contacts');
  contactSheet.columns = [
    { header: 'Transporter_Ref_ID', key: 'ref_id', width: 20 },
    { header: 'Address_Type', key: 'address_type', width: 20 },
    { header: 'Contact_Person_Name', key: 'name', width: 30 },
    { header: 'Designation', key: 'designation', width: 20 },
    { header: 'Phone_Number', key: 'phone', width: 20 },
    { header: 'Alt_Phone_Number', key: 'alt_phone', width: 20 },
    { header: 'Email_ID', key: 'email', width: 30 },
    { header: 'Alt_Email_ID', key: 'alt_email', width: 30 },
    { header: 'WhatsApp_Number', key: 'whatsapp', width: 20 },
  ];
  
  contactSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  contactSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC000' }
  };
  
  // Add sample data
  contactSheet.addRow({
    ref_id: 'TR001',
    address_type: 'Head Office',
    name: 'John Doe',
    designation: 'Manager',
    phone: '+919876543210',
    alt_phone: '+919876543211',
    email: 'john@abctransport.com',
    alt_email: 'john.doe@abctransport.com',
    whatsapp: '+919876543210'
  });
  
  // Sheet 4: Serviceable Areas
  const serviceSheet = workbook.addWorksheet('Serviceable Areas');
  serviceSheet.columns = [
    { header: 'Transporter_Ref_ID', key: 'ref_id', width: 20 },
    { header: 'Service_Country', key: 'country', width: 20 },
    { header: 'Service_States', key: 'states', width: 50 },
    { header: 'Service_Frequency', key: 'frequency', width: 20 },
  ];
  
  serviceSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  serviceSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF5B9BD5' }
  };
  
  // Add sample data
  serviceSheet.addRow({
    ref_id: 'TR001',
    country: 'IN',
    states: 'Maharashtra,Karnataka,Tamil Nadu',
    frequency: 'Daily'
  });
  
  // Sheet 5: Documents
  const docSheet = workbook.addWorksheet('Documents');
  docSheet.columns = [
    { header: 'Transporter_Ref_ID', key: 'ref_id', width: 20 },
    { header: 'Document_Type', key: 'doc_type', width: 20 },
    { header: 'Document_Name', key: 'doc_name', width: 30 },
    { header: 'Document_Number', key: 'doc_number', width: 25 },
    { header: 'Issue_Date', key: 'issue_date', width: 15 },
    { header: 'Expiry_Date', key: 'expiry_date', width: 15 },
    { header: 'Issuing_Country', key: 'country', width: 15 },
    { header: 'Is_Verified', key: 'verified', width: 12 },
  ];
  
  docSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  docSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF843C0C' }
  };
  
  // Add sample data
  docSheet.addRow({
    ref_id: 'TR001',
    doc_type: 'PAN',
    doc_name: 'PAN Card',
    doc_number: 'AABCU9603R',
    issue_date: '2020-01-01',
    expiry_date: '',
    country: 'IN',
    verified: 'N'
  });
  
  // Instructions Sheet
  const instructionsSheet = workbook.addWorksheet('Instructions');
  instructionsSheet.columns = [
    { header: 'Field', key: 'field', width: 30 },
    { header: 'Description', key: 'desc', width: 60 },
    { header: 'Format/Values', key: 'format', width: 30 },
  ];
  
  instructionsSheet.getRow(1).font = { bold: true };
  
  const instructions = [
    { field: 'Transporter_Ref_ID', desc: 'Unique identifier for each transporter (used to link all sheets)', format: 'TR001, TR002, etc.' },
    { field: 'Business_Name', desc: 'Legal business name of the transporter', format: 'Min 2 characters' },
    { field: 'Transport_Mode_*', desc: 'Indicate available transport modes (Y/N)', format: 'Y or N' },
    { field: 'From_Date', desc: 'Contract start date', format: 'YYYY-MM-DD' },
    { field: 'To_Date', desc: 'Contract end date (optional)', format: 'YYYY-MM-DD or leave blank' },
    { field: 'Active_Flag', desc: 'Is transporter active?', format: 'Y or N' },
    { field: 'Address_Type', desc: 'Type of address (must exist in master data)', format: 'Head Office, Branch, etc.' },
    { field: 'Is_Primary', desc: 'One address must be marked as primary', format: 'Y or N' },
    { field: 'Phone_Number', desc: 'Contact phone with country code', format: '+91xxxxxxxxxx' },
    { field: 'Email_ID', desc: 'Valid email address', format: 'example@domain.com' },
    { field: 'Service_States', desc: 'Comma-separated list of states', format: 'State1,State2,State3' },
    { field: 'Document_Number', desc: 'Official document number', format: 'Alphanumeric' },
  ];
  
  instructions.forEach(inst => instructionsSheet.addRow(inst));
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateBulkUploadTemplate };