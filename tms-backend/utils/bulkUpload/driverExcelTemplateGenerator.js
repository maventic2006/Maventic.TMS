const ExcelJS = require('exceljs');

/**
 * Generate Excel template for bulk driver upload
 * @returns {Promise<Buffer>} Excel file buffer
 */
async function generateDriverBulkUploadTemplate() {
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: Basic Information
  const basicInfoSheet = workbook.addWorksheet('Basic Information');
  basicInfoSheet.columns = [
    { header: 'Driver_Ref_ID', key: 'ref_id', width: 20 },
    { header: 'Full_Name', key: 'full_name', width: 30 },
    { header: 'Date_Of_Birth', key: 'dob', width: 15 },
    { header: 'Gender', key: 'gender', width: 12 },
    { header: 'Blood_Group', key: 'blood_group', width: 12 },
    { header: 'Phone_Number', key: 'phone', width: 20 },
    { header: 'Email_ID', key: 'email', width: 30 },
    { header: 'Emergency_Contact', key: 'emergency', width: 20 },
    { header: 'Alternate_Phone_Number', key: 'alt_phone', width: 20 },
  ];
  
  // Style header row
  basicInfoSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  basicInfoSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  
  // Add sample data
  basicInfoSheet.addRow({
    ref_id: 'DR001',
    full_name: 'Rajesh Kumar',
    dob: '1990-05-15',
    gender: 'Male',
    blood_group: 'B+',
    phone: '9876543210',
    email: 'rajesh.kumar@example.com',
    emergency: '9876543211',
    alt_phone: '9876543212'
  });
  
  // Sheet 2: Addresses
  const addressSheet = workbook.addWorksheet('Addresses');
  addressSheet.columns = [
    { header: 'Driver_Ref_ID', key: 'ref_id', width: 20 },
    { header: 'Address_Type_ID', key: 'address_type', width: 20 },
    { header: 'Street_1', key: 'street1', width: 30 },
    { header: 'Street_2', key: 'street2', width: 30 },
    { header: 'City', key: 'city', width: 20 },
    { header: 'District', key: 'district', width: 20 },
    { header: 'State', key: 'state', width: 20 },
    { header: 'Country', key: 'country', width: 15 },
    { header: 'Postal_Code', key: 'postal', width: 15 },
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
    ref_id: 'DR001',
    address_type: 'Permanent',
    street1: '123 Main Street',
    street2: 'Near Central Park',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'MH',
    country: 'IN',
    postal: '400001',
    is_primary: 'Y'
  });
  
  // Sheet 3: Documents (Metadata Only)
  const docSheet = workbook.addWorksheet('Documents');
  docSheet.columns = [
    { header: 'Driver_Ref_ID', key: 'ref_id', width: 20 },
    { header: 'Document_Type', key: 'doc_type', width: 25 },
    { header: 'Document_Number', key: 'doc_number', width: 25 },
    { header: 'Issuing_Country', key: 'country', width: 15 },
    { header: 'Issuing_State', key: 'state', width: 15 },
    { header: 'Valid_From', key: 'valid_from', width: 15 },
    { header: 'Valid_To', key: 'valid_to', width: 15 },
    { header: 'Remarks', key: 'remarks', width: 30 },
    { header: 'Active_Flag', key: 'active', width: 12 },
  ];
  
  docSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  docSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFC000' }
  };
  
  // Add sample data
  docSheet.addRow({
    ref_id: 'DR001',
    doc_type: 'Driving License',
    doc_number: 'MH0120200012345',
    country: 'IN',
    state: 'MH',
    valid_from: '2020-01-01',
    valid_to: '2040-01-01',
    remarks: 'Heavy Vehicle License',
    active: 'Y'
  });
  
  // Sheet 4: Employment History (Optional)
  const historySheet = workbook.addWorksheet('Employment History');
  historySheet.columns = [
    { header: 'Driver_Ref_ID', key: 'ref_id', width: 20 },
    { header: 'Employer', key: 'employer', width: 30 },
    { header: 'Employment_Status', key: 'status', width: 20 },
    { header: 'From_Date', key: 'from_date', width: 15 },
    { header: 'To_Date', key: 'to_date', width: 15 },
    { header: 'Job_Title', key: 'job_title', width: 25 },
  ];
  
  historySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  historySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF5B9BD5' }
  };
  
  // Add sample data
  historySheet.addRow({
    ref_id: 'DR001',
    employer: 'ABC Transport Ltd',
    status: 'Full-time',
    from_date: '2015-01-01',
    to_date: '2020-12-31',
    job_title: 'Heavy Vehicle Driver'
  });
  
  // Sheet 5: Accident & Violation Records (Optional)
  const accidentSheet = workbook.addWorksheet('Accident & Violation');
  accidentSheet.columns = [
    { header: 'Driver_Ref_ID', key: 'ref_id', width: 20 },
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Vehicle_Registration_Number', key: 'vehicle_reg', width: 25 },
  ];
  
  accidentSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  accidentSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFF0000' }
  };
  
  // Add sample data (leave empty as this is optional)
  accidentSheet.addRow({
    ref_id: 'DR001',
    type: '',
    description: '',
    date: '',
    vehicle_reg: ''
  });
  
  // Instructions Sheet
  const instructionsSheet = workbook.addWorksheet('Instructions');
  instructionsSheet.columns = [
    { header: 'Field', key: 'field', width: 30 },
    { header: 'Description', key: 'desc', width: 60 },
    { header: 'Format/Values', key: 'format', width: 30 },
    { header: 'Required', key: 'required', width: 12 },
  ];
  
  instructionsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  instructionsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF843C0C' }
  };
  
  const instructions = [
    { field: 'Driver_Ref_ID', desc: 'Unique identifier for each driver (used to link all sheets)', format: 'DR001, DR002, etc.', required: 'Yes' },
    { field: 'Full_Name', desc: 'Full legal name of the driver', format: 'Min 2 characters', required: 'Yes' },
    { field: 'Date_Of_Birth', desc: 'Driver date of birth (Age must be 18-65)', format: 'YYYY-MM-DD', required: 'Yes' },
    { field: 'Gender', desc: 'Driver gender', format: 'Male/Female/Other', required: 'No' },
    { field: 'Blood_Group', desc: 'Driver blood group', format: 'A+, A-, B+, B-, AB+, AB-, O+, O-', required: 'No' },
    { field: 'Phone_Number', desc: 'Driver primary phone (must be unique)', format: '10 digits starting with 6-9', required: 'Yes' },
    { field: 'Email_ID', desc: 'Driver email address (must be unique)', format: 'example@domain.com', required: 'No' },
    { field: 'Emergency_Contact', desc: 'Emergency contact phone number', format: '10 digits starting with 6-9', required: 'Yes' },
    { field: 'Alternate_Phone_Number', desc: 'Alternate contact number', format: '10 digits starting with 6-9', required: 'No' },
    { field: 'Address_Type_ID', desc: 'Type of address (must exist in master data)', format: 'Permanent, Temporary, etc.', required: 'Yes' },
    { field: 'Is_Primary', desc: 'One address must be marked as primary', format: 'Y or N', required: 'Yes' },
    { field: 'Postal_Code', desc: 'Postal/ZIP code', format: '6 digits for India', required: 'Yes' },
    { field: 'Document_Type', desc: 'Type of document (must exist in master data)', format: 'Driving License, Aadhar, PAN, etc.', required: 'Yes' },
    { field: 'Document_Number', desc: 'Official document number (must be unique)', format: 'Alphanumeric', required: 'Yes' },
    { field: 'Valid_From', desc: 'Document validity start date', format: 'YYYY-MM-DD', required: 'No' },
    { field: 'Valid_To', desc: 'Document validity end date', format: 'YYYY-MM-DD', required: 'No' },
    { field: 'Employer', desc: 'Previous employer name', format: 'Text', required: 'No' },
    { field: 'Employment_Status', desc: 'Employment status', format: 'Full-time/Part-time/Contract', required: 'No' },
    { field: 'Type (Accident)', desc: 'Accident or violation type', format: 'Must exist in violation_type_master', required: 'No' },
    { field: 'Description', desc: 'Details of accident/violation', format: 'Text', required: 'No' },
    { field: 'Vehicle_Registration_Number', desc: 'Vehicle registration number', format: 'XX00XX0000 (e.g., MH12AB1234)', required: 'No' },
    { field: '', desc: '', format: '', required: '' },
    { field: 'IMPORTANT NOTES', desc: '', format: '', required: '' },
    { field: '1. Driver_Ref_ID', desc: 'Must be same across all sheets for the same driver', format: '', required: '' },
    { field: '2. Phone Numbers', desc: 'Phone_Number must be unique across all drivers', format: '', required: '' },
    { field: '3. Email Addresses', desc: 'Email_ID must be unique if provided', format: '', required: '' },
    { field: '4. Addresses', desc: 'At least one address required, exactly one must be primary (Is_Primary=Y)', format: '', required: '' },
    { field: '5. Documents', desc: 'Only metadata is captured. Actual files must be uploaded later via UI', format: '', required: '' },
    { field: '6. Driver Status', desc: 'Bulk uploaded drivers will have Pending Approval status until documents are uploaded', format: '', required: '' },
    { field: '7. History & Accidents', desc: 'Employment History and Accident/Violation records are completely optional', format: '', required: '' },
    { field: '8. Date Format', desc: 'All dates must be in YYYY-MM-DD format', format: '', required: '' },
    { field: '9. Master Data', desc: 'Document_Type, Address_Type_ID, and Violation Type must exist in system master data', format: '', required: '' },
    { field: '10. Validation', desc: 'Same validation rules as manual driver creation apply', format: '', required: '' },
  ];
  
  instructions.forEach(inst => instructionsSheet.addRow(inst));
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateDriverBulkUploadTemplate };
