const ExcelJS = require('exceljs');

/**
 * Generate Excel template for vehicle bulk upload
 * @returns {Promise<Buffer>} Excel file buffer
 */
async function generateVehicleBulkUploadTemplate() {
  try {
    console.log('📄 Generating vehicle bulk upload template...');
    
    const workbook = new ExcelJS.Workbook();
    
    // Sheet 1: Basic Information
    const basicInfoSheet = workbook.addWorksheet('Basic Information');
    basicInfoSheet.columns = [
      { header: 'Vehicle_Ref_ID', key: 'ref_id', width: 18 },
      { header: 'Make_Brand', key: 'make', width: 20 },
      { header: 'Model', key: 'model', width: 20 },
      { header: 'VIN_Chassis_Number', key: 'vin', width: 20 },
      { header: 'Vehicle_Type_ID', key: 'type_id', width: 15 },
      { header: 'Vehicle_Category', key: 'category', width: 15 },
      { header: 'Manufacturing_Month_Year', key: 'mfg_date', width: 20 },
      { header: 'GPS_IMEI_Number', key: 'gps_imei', width: 18 },
      { header: 'GPS_Active_Flag', key: 'gps_active', width: 15 },
      { header: 'Leasing_Flag', key: 'leasing', width: 15 },
      { header: 'Usage_Type_ID', key: 'usage_type', width: 15 },
      { header: 'Registration_Number', key: 'reg_number', width: 20 },
      { header: 'Vehicle_Color', key: 'color', width: 15 },
      { header: 'Body_Type_Description', key: 'body_type', width: 20 },
      { header: 'Safety_Inspection_Date', key: 'inspection', width: 20 },
      { header: 'Taxes_And_Fees', key: 'taxes', width: 15 },
      { header: 'Road_Tax', key: 'road_tax', width: 15 },
      { header: 'Avg_Running_Speed', key: 'avg_speed', width: 18 },
      { header: 'Max_Running_Speed', key: 'max_speed', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
    ];
    
    // Style header row
    basicInfoSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    basicInfoSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    basicInfoSheet.getRow(1).height = 20;
    
    // Add sample data rows
    basicInfoSheet.addRow({
      ref_id: 'VR001',
      make: 'Tata',
      model: 'LPT 1918',
      vin: 'MAT123456789ABCDE',
      type_id: 'VT001',
      category: 'HCV',
      mfg_date: '2023-06-15',
      gps_imei: '123456789012345',
      gps_active: 'Y',
      leasing: 'N',
      usage_type: 'UT001',
      reg_number: 'MH12AB1234',
      color: 'White',
      body_type: 'Container',
      inspection: '2024-01-15',
      taxes: 50000.00,
      road_tax: 25000.00,
      avg_speed: 45.5,
      max_speed: 80.0,
      status: 'ACTIVE'
    });
    
    basicInfoSheet.addRow({
      ref_id: 'VR002',
      make: 'Ashok Leyland',
      model: 'Partner',
      vin: 'AL9876543210WXYZ',
      type_id: 'VT002',
      category: 'MCV',
      mfg_date: '2021-03-20',
      gps_imei: '987654321098765',
      gps_active: 'Y',
      leasing: 'N',
      usage_type: 'UT001',
      reg_number: 'DL01CD5678',
      color: 'Blue',
      body_type: 'Flatbed',
      inspection: '2024-02-10',
      taxes: 35000.00,
      road_tax: 18000.00,
      avg_speed: 50.0,
      max_speed: 85.0,
      status: 'ACTIVE'
    });
    
    // Sheet 2: Specifications
    const specificationsSheet = workbook.addWorksheet('Specifications');
    specificationsSheet.columns = [
      { header: 'Vehicle_Ref_ID', key: 'ref_id', width: 18 },
      { header: 'Engine_Type_ID', key: 'engine_type', width: 18 },
      { header: 'Engine_Number', key: 'engine_number', width: 20 },
      { header: 'Fuel_Type_ID', key: 'fuel_type', width: 15 },
      { header: 'Transmission_Type', key: 'transmission', width: 18 },
      { header: 'Emission_Standard', key: 'emission', width: 18 },
      { header: 'Financer', key: 'financer', width: 20 },
      { header: 'Suspension_Type', key: 'suspension', width: 18 },
      { header: 'Weight_Dimensions', key: 'weight_dim', width: 25 },
    ];
    
    specificationsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    specificationsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }
    };
    specificationsSheet.getRow(1).height = 20;
    
    // Add sample data
    specificationsSheet.addRow({
      ref_id: 'VR001',
      engine_type: 'ET001',
      engine_number: 'ENG123456789',
      fuel_type: 'FT001',
      transmission: 'MANUAL',
      emission: 'BS6',
      financer: 'HDFC Bank',
      suspension: 'LEAF_SPRING',
      weight_dim: '18000 kg / 8m x 2.5m x 3m'
    });
    
    specificationsSheet.addRow({
      ref_id: 'VR002',
      engine_type: 'ET002',
      engine_number: 'ENG987654321',
      fuel_type: 'FT001',
      transmission: 'MANUAL',
      emission: 'BS4',
      financer: 'SBI',
      suspension: 'LEAF_SPRING',
      weight_dim: '12000 kg / 6m x 2.3m x 2.8m'
    });
    
    // Sheet 3: Capacity Details
    const capacitySheet = workbook.addWorksheet('Capacity Details');
    capacitySheet.columns = [
      { header: 'Vehicle_Ref_ID', key: 'ref_id', width: 18 },
      { header: 'Unloading_Weight_KG', key: 'unloading_weight', width: 20 },
      { header: 'Gross_Vehicle_Weight_KG', key: 'gvw', width: 25 },
      { header: 'Payload_Capacity_KG', key: 'payload', width: 20 },
      { header: 'Volume_Capacity_CBM', key: 'volume', width: 20 },
      { header: 'Cargo_Width_M', key: 'width', width: 15 },
      { header: 'Cargo_Height_M', key: 'height', width: 15 },
      { header: 'Cargo_Length_M', key: 'length', width: 15 },
      { header: 'Towing_Capacity_KG', key: 'towing', width: 20 },
      { header: 'Tire_Load_Rating', key: 'tire_rating', width: 18 },
      { header: 'Vehicle_Condition', key: 'condition', width: 18 },
      { header: 'Fuel_Tank_Capacity_L', key: 'fuel_tank', width: 20 },
      { header: 'Seating_Capacity', key: 'seating', width: 18 },
      { header: 'Load_Capacity_TON', key: 'load_ton', width: 18 },
    ];
    
    capacitySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    capacitySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFC000' }
    };
    capacitySheet.getRow(1).height = 20;
    
    // Add sample data
    capacitySheet.addRow({
      ref_id: 'VR001',
      unloading_weight: 7500.00,
      gvw: 18000.00,
      payload: 10500.00,
      volume: 45.5,
      width: 2.5,
      height: 3.0,
      length: 8.0,
      towing: 5000.00,
      tire_rating: '3750 kg',
      condition: 'GOOD',
      fuel_tank: 400.0,
      seating: 2,
      load_ton: 18.0
    });
    
    capacitySheet.addRow({
      ref_id: 'VR002',
      unloading_weight: 5000.00,
      gvw: 12000.00,
      payload: 7000.00,
      volume: 32.0,
      width: 2.3,
      height: 2.8,
      length: 6.0,
      towing: 3000.00,
      tire_rating: '2500 kg',
      condition: 'EXCELLENT',
      fuel_tank: 300.0,
      seating: 2,
      load_ton: 12.0
    });
    
    // Sheet 4: Ownership Details
    const ownershipSheet = workbook.addWorksheet('Ownership Details');
    ownershipSheet.columns = [
      { header: 'Vehicle_Ref_ID', key: 'ref_id', width: 18 },
      { header: 'Ownership_Name', key: 'owner_name', width: 30 },
      { header: 'Valid_From', key: 'valid_from', width: 15 },
      { header: 'Valid_To', key: 'valid_to', width: 15 },
      { header: 'Registration_Number', key: 'reg_number', width: 20 },
      { header: 'Registration_Date', key: 'reg_date', width: 18 },
      { header: 'Registration_Upto', key: 'reg_upto', width: 18 },
      { header: 'Purchase_Date', key: 'purchase_date', width: 18 },
      { header: 'Owner_Sr_Number (Integer)', key: 'owner_sr', width: 22 },
      { header: 'State_Code', key: 'state_code', width: 12 },
      { header: 'RTO_Code', key: 'rto_code', width: 12 },
      { header: 'Sale_Amount', key: 'sale_amount', width: 15 },
    ];
    
    ownershipSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ownershipSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF5B9BD5' }
    };
    ownershipSheet.getRow(1).height = 20;
    
    // Add sample data (Owner_Sr_Number must be numeric: 1, 2, 3, etc.)
    ownershipSheet.addRow({
      ref_id: 'VR001',
      owner_name: 'ABC Transport Pvt Ltd',
      valid_from: '2023-06-01',
      valid_to: '2025-05-31',
      reg_number: 'MH12AB1234',
      reg_date: '2023-06-15',
      reg_upto: '2038-06-14',
      purchase_date: '2023-06-10',
      owner_sr: 1,
      state_code: 'MH',
      rto_code: 'MH12',
      sale_amount: 2500000.00
    });
    
    ownershipSheet.addRow({
      ref_id: 'VR002',
      owner_name: 'XYZ Logistics Ltd',
      valid_from: '2021-03-01',
      valid_to: '2026-02-28',
      reg_number: 'DL01CD5678',
      reg_date: '2021-03-20',
      reg_upto: '2036-03-19',
      purchase_date: '2021-03-15',
      owner_sr: 2,
      state_code: 'DL',
      rto_code: 'DL01',
      sale_amount: 1800000.00
    });
    
    // Sheet 5: Documents
    const documentsSheet = workbook.addWorksheet('Documents');
    documentsSheet.columns = [
      { header: 'Vehicle_Ref_ID', key: 'ref_id', width: 18 },
      { header: 'Document_Type_ID', key: 'doc_type_id', width: 18 },
      { header: 'Document_Type_Name', key: 'doc_type_name', width: 30 },
      { header: 'Reference_Number', key: 'ref_number', width: 20 },
      { header: 'Document_Provider', key: 'provider', width: 25 },
      { header: 'Coverage_Type_ID', key: 'coverage_id', width: 18 },
      { header: 'Premium_Amount', key: 'premium', width: 15 },
      { header: 'Valid_From', key: 'valid_from', width: 15 },
      { header: 'Valid_To', key: 'valid_to', width: 15 },
      { header: 'Remarks', key: 'remarks', width: 30 },
    ];
    
    documentsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    documentsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF843C0C' }
    };
    documentsSheet.getRow(1).height = 20;
    
    // Add sample data
    documentsSheet.addRow({
      ref_id: 'VR001',
      doc_type_id: 'DN001',
      doc_type_name: 'Vehicle Registration Certificate',
      ref_number: 'RC123456789',
      provider: 'RTO Maharashtra',
      coverage_id: '',
      premium: '',
      valid_from: '2023-06-15',
      valid_to: '2038-06-14',
      remarks: 'Original RC'
    });
    
    documentsSheet.addRow({
      ref_id: 'VR001',
      doc_type_id: 'DN009',
      doc_type_name: 'Vehicle Insurance',
      ref_number: 'INS987654321',
      provider: 'HDFC ERGO Insurance',
      coverage_id: 'CT001',
      premium: 25000.00,
      valid_from: '2023-06-15',
      valid_to: '2024-06-14',
      remarks: 'Comprehensive insurance'
    });
    
    documentsSheet.addRow({
      ref_id: 'VR002',
      doc_type_id: 'DN001',
      doc_type_name: 'Vehicle Registration Certificate',
      ref_number: 'RC987654321',
      provider: 'RTO Delhi',
      coverage_id: '',
      premium: '',
      valid_from: '2021-03-20',
      valid_to: '2036-03-19',
      remarks: 'Original RC'
    });
    
    // Instructions Sheet
    const instructionsSheet = workbook.addWorksheet('Instructions');
    instructionsSheet.columns = [
      { header: 'Field', key: 'field', width: 30 },
      { header: 'Description', key: 'desc', width: 60 },
      { header: 'Format/Values', key: 'format', width: 35 },
    ];
    
    instructionsSheet.getRow(1).font = { bold: true, size: 12 };
    instructionsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };
    instructionsSheet.getRow(1).height = 25;
    
    const instructions = [
      { field: '⚠️ IMPORTANT', desc: 'Read all instructions before filling the template', format: '' },
      { field: '', desc: '', format: '' },
      { field: '📄 DOCUMENTS NOTE', desc: '⚠️ CRITICAL: Document metadata can be recorded in the Documents sheet for reference, but actual document files MUST be uploaded separately through the vehicle details page after bulk upload completion. The bulk upload process will NOT upload document files.', format: '❌ FILES NOT UPLOADED' },
      { field: '', desc: '', format: '' },
      { field: 'Vehicle_Ref_ID', desc: 'Unique identifier for each vehicle (used to link all sheets). MUST be unique per batch.', format: 'VR001, VR002, VR003, etc.' },
      { field: 'Make_Brand', desc: 'Vehicle manufacturer/brand name', format: 'Tata, Ashok Leyland, Mahindra, etc. (Min 2 chars)' },
      { field: 'Model', desc: 'Vehicle model name', format: 'LPT 1918, Partner, Bolero, etc. (Min 2 chars)' },
      { field: 'VIN_Chassis_Number', desc: 'Vehicle Identification Number (must be globally unique)', format: '17-character alphanumeric code' },
      { field: 'GPS_IMEI_Number', desc: 'GPS device IMEI number (must be globally unique)', format: '15-digit number (123456789012345)' },
      { field: 'Manufacturing_Month_Year', desc: 'Date when vehicle was manufactured', format: 'YYYY-MM-DD (e.g., 2023-06-15)' },
      { field: 'GPS_Active_Flag', desc: 'Is GPS currently active?', format: 'Y or N (default: Y)' },
      { field: 'Leasing_Flag', desc: 'Is vehicle on lease?', format: 'Y or N (default: N)' },
      { field: 'Registration_Number', desc: 'Vehicle registration plate number (unique if provided)', format: 'MH12AB1234, DL01CD5678, etc.' },
      { field: 'Status', desc: 'Current status of vehicle', format: 'ACTIVE, INACTIVE, MAINTENANCE, etc. (default: ACTIVE)' },
      { field: '', desc: '', format: '' },
      { field: '📋 SPECIFICATIONS SHEET', desc: '', format: '' },
      { field: 'Engine_Number', desc: 'Unique engine identification number', format: 'Min 5 characters' },
      { field: 'Transmission_Type', desc: 'Type of transmission system', format: 'MANUAL, AUTOMATIC, AMT, CVT, DCT' },
      { field: 'Financer', desc: 'Bank/institution financing the vehicle or "Self"', format: 'HDFC Bank, SBI, Self, etc. (Min 2 chars)' },
      { field: 'Suspension_Type', desc: 'Vehicle suspension system type', format: 'LEAF_SPRING, AIR_SUSPENSION, COIL_SPRING, TORSION_BAR' },
      { field: '', desc: '', format: '' },
      { field: '📦 CAPACITY DETAILS SHEET', desc: '', format: '' },
      { field: 'Unloading_Weight_KG', desc: 'Empty weight of vehicle in kilograms', format: 'Numeric >= 0 (e.g., 7500.00)' },
      { field: 'Gross_Vehicle_Weight_KG', desc: 'Maximum loaded weight in kilograms', format: 'Numeric >= 0 (e.g., 18000.00)' },
      { field: 'Payload_Capacity_KG', desc: 'Load carrying capacity (auto-calculated: GVW - Unloading Weight)', format: 'Numeric >= 0' },
      { field: 'Vehicle_Condition', desc: 'Current physical condition of vehicle', format: 'EXCELLENT, GOOD, FAIR, POOR' },
      { field: '', desc: '', format: '' },
      { field: '👤 OWNERSHIP DETAILS SHEET', desc: '', format: '' },
      { field: 'Valid_From / Valid_To', desc: 'Ownership validity period', format: 'YYYY-MM-DD (Valid_To must be after Valid_From)' },
      { field: 'Registration_Date / Registration_Upto', desc: 'Registration validity period', format: 'YYYY-MM-DD (Registration_Upto must be after Registration_Date)' },
      { field: 'State_Code', desc: 'State ISO code where vehicle is registered', format: 'MH, DL, GJ, KA, TN, etc.' },
      { field: 'RTO_Code', desc: 'Regional Transport Office code', format: 'MH12, DL01, GJ06, etc.' },
      { field: '', desc: '', format: '' },
      { field: '📄 DOCUMENTS SHEET', desc: '', format: '' },
      { field: 'Document_Type_ID/Name', desc: 'Type of document (must exist in master data)', format: 'DN001 / Vehicle Registration Certificate' },
      { field: 'Reference_Number', desc: 'Unique document number', format: 'RC123456789, INS987654321, etc.' },
      { field: 'Valid_From / Valid_To', desc: 'Document validity period', format: 'YYYY-MM-DD (Valid_To must be after Valid_From)' },
      { field: 'Premium_Amount', desc: 'Insurance premium or document cost', format: 'Numeric >= 0 (e.g., 25000.00)' },
      { field: 'Remarks', desc: 'Additional notes about document', format: 'Max 500 characters' },
      { field: '', desc: '', format: '' },
      { field: '⚠️ CRITICAL RULES', desc: '', format: '' },
      { field: '1. Vehicle_Ref_ID', desc: 'MUST be present in ALL sheets for the same vehicle', format: 'Use same ID across all 5 sheets' },
      { field: '2. VIN Uniqueness', desc: 'VIN_Chassis_Number must be unique across ALL vehicles in database', format: 'Will fail if VIN already exists' },
      { field: '3. GPS IMEI Uniqueness', desc: 'GPS_IMEI_Number must be unique across ALL vehicles in database', format: 'Will fail if IMEI already exists' },
      { field: '4. Registration Number', desc: 'If provided, must be unique', format: 'Optional but unique if given' },
      { field: '5. Date Formats', desc: 'ALL dates must be in YYYY-MM-DD format', format: '2023-06-15 (NOT 15/06/2023)' },
      { field: '6. Numeric Fields', desc: 'All numeric values must be >= 0', format: 'No negative values allowed' },
      { field: '7. Master Data IDs', desc: 'Vehicle_Type_ID, Engine_Type_ID, Fuel_Type_ID, Usage_Type_ID, Document_Type_ID must exist in database', format: 'Check master data before filling' },
      { field: '8. Documents', desc: 'Only metadata is uploaded in bulk. Actual file upload happens later through UI.', format: 'No file attachments in bulk upload' },
      { field: '', desc: '', format: '' },
      { field: '📊 UPLOAD PROCESS', desc: '', format: '' },
      { field: '1. Fill Template', desc: 'Fill all sheets with your vehicle data', format: '' },
      { field: '2. Validate Data', desc: 'System will validate all 65+ rules', format: '' },
      { field: '3. Review Errors', desc: 'If errors found, download error report with highlighted issues', format: '' },
      { field: '4. Fix & Re-upload', desc: 'Correct errors in original file and re-upload', format: '' },
      { field: '5. Background Processing', desc: 'Valid vehicles will be created asynchronously', format: '' },
      { field: '6. Upload Documents', desc: 'After creation, upload document files via edit page', format: '' },
    ];
    
    instructions.forEach((instruction, index) => {
      const row = instructionsSheet.addRow(instruction);
      
      // Style rows
      if (instruction.field.startsWith('⚠️') || instruction.field.startsWith('📋') || 
          instruction.field.startsWith('📦') || instruction.field.startsWith('👤') || 
          instruction.field.startsWith('📄') || instruction.field.startsWith('📊')) {
        row.font = { bold: true, size: 11, color: { argb: 'FF0066CC' } };
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0F4FF' }
        };
      }
      
      // Add borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
        };
        cell.alignment = { vertical: 'top', wrapText: true };
      });
    });
    
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    console.log('✓ Vehicle bulk upload template generated successfully');
    
    return buffer;
    
  } catch (error) {
    console.error('Error generating vehicle bulk upload template:', error);
    throw error;
  }
}

module.exports = {
  generateVehicleBulkUploadTemplate
};
