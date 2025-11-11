const ExcelJS = require('exceljs');
const path = require('path');

/**
 * Vehicle Bulk Upload Test Data Generator
 * Creates test Excel files with different scenarios for testing
 */

// Helper function to generate unique VIN
function generateVIN(index) {
  return `TEST${String(index).padStart(13, '0')}`;
}

// Helper function to generate unique GPS IMEI
function generateIMEI(index) {
  return `35${String(1000000000000 + index).substring(0, 13)}`;
}

// Helper function to generate registration number
function generateRegNumber(index, state = 'MH') {
  const district = String(12 + (index % 10)).padStart(2, '0');
  const series = String.fromCharCode(65 + (index % 26)) + String.fromCharCode(65 + ((index + 1) % 26));
  const number = String(1000 + index).padStart(4, '0');
  return `${state}${district}${series}${number}`;
}

// Sample master data IDs (these should exist in your database)
const VEHICLE_TYPES = ['VT001', 'VT002', 'VT003', 'VT004', 'VT005'];
const ENGINE_TYPES = ['ET001', 'ET002', 'ET003'];
const FUEL_TYPES = ['FT001', 'FT002', 'FT003', 'FT004'];
const USAGE_TYPES = ['UT001', 'UT002', 'UT003'];
const DOCUMENT_TYPES = [
  { id: 'DN001', name: 'Vehicle Registration Certificate' },
  { id: 'DN009', name: 'Vehicle Insurance' },
  { id: 'DN010', name: 'Fitness Certificate' }
];

const MAKES = ['Tata', 'Ashok Leyland', 'Mahindra', 'Eicher', 'BharatBenz', 'Volvo'];
const MODELS = {
  'Tata': ['LPT 1918', 'Signa 4825', 'Ultra T.7', 'Prima 4038'],
  'Ashok Leyland': ['Dost+', 'Partner', 'Boss', 'Captain'],
  'Mahindra': ['Bolero Pickup', 'Supro Maxitruck', 'Furio 7', 'Blazo X'],
  'Eicher': ['Pro 2049', 'Pro 3015', 'Pro 6025', 'Pro 8049'],
  'BharatBenz': ['914R', '1215R', '1617R', '2523R'],
  'Volvo': ['FH16', 'FM', 'FMX', 'FL']
};

const TRANSMISSION_TYPES = ['MANUAL', 'AUTOMATIC', 'AMT'];
const SUSPENSION_TYPES = ['LEAF_SPRING', 'AIR_SUSPENSION', 'COIL_SPRING'];
const EMISSION_STANDARDS = ['BS6', 'BS4', 'EURO6'];
const VEHICLE_CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];

// Create workbook with styling
function createWorkbook() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TMS Test Data Generator';
  workbook.created = new Date();
  return workbook;
}

// Apply header styling
function styleHeaders(worksheet) {
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 20;
}

// Generate valid vehicle data
function generateValidVehicle(index) {
  const refId = `VR${String(index).padStart(3, '0')}`;
  const make = MAKES[index % MAKES.length];
  const models = MODELS[make];
  const model = models[index % models.length];
  
  return {
    basicInfo: {
      vehicle_ref_id: refId,
      make_brand: make,
      model: model,
      vin_chassis_number: generateVIN(index),
      vehicle_type_id: VEHICLE_TYPES[index % VEHICLE_TYPES.length],
      vehicle_category: 'HCV',
      manufacturing_month_year: new Date(2020 + (index % 5), (index % 12), 1),
      gps_imei_number: generateIMEI(index),
      gps_active_flag: 'Y',
      leasing_flag: index % 3 === 0 ? 'Y' : 'N',
      usage_type_id: USAGE_TYPES[index % USAGE_TYPES.length],
      registration_number: generateRegNumber(index),
      vehicle_color: ['White', 'Blue', 'Red', 'Silver', 'Black'][index % 5],
      body_type_description: 'Container',
      safety_inspection_date: new Date(2024, 0, 1),
      taxes_and_fees: 50000 + (index * 1000),
      road_tax: 25000 + (index * 500),
      avg_running_speed: 45 + (index % 10),
      max_running_speed: 80 + (index % 20),
      status: 'ACTIVE'
    },
    specifications: {
      vehicle_ref_id: refId,
      engine_type_id: ENGINE_TYPES[index % ENGINE_TYPES.length],
      engine_number: `ENG${String(100000 + index).substring(0, 9)}`,
      fuel_type_id: FUEL_TYPES[index % FUEL_TYPES.length],
      transmission_type: TRANSMISSION_TYPES[index % TRANSMISSION_TYPES.length],
      emission_standard: EMISSION_STANDARDS[index % EMISSION_STANDARDS.length],
      financer: index % 2 === 0 ? 'HDFC Bank' : 'Self',
      suspension_type: SUSPENSION_TYPES[index % SUSPENSION_TYPES.length],
      weight_dimensions: '18T GVW, 7.5T Payload'
    },
    capacityDetails: {
      vehicle_ref_id: refId,
      unloading_weight_kg: 7500 + (index * 100),
      gross_vehicle_weight_kg: 18000 + (index * 200),
      payload_capacity_kg: 10500,
      volume_capacity_cbm: 40 + (index % 10),
      cargo_width_m: 2.4,
      cargo_height_m: 2.8,
      cargo_length_m: 7.5 + (index % 3),
      towing_capacity_kg: 5000,
      tire_load_rating: '3750 kg',
      vehicle_condition: VEHICLE_CONDITIONS[index % VEHICLE_CONDITIONS.length],
      fuel_tank_capacity_l: 400,
      seating_capacity: 2,
      load_capacity_ton: 18
    },
    ownershipDetails: {
      vehicle_ref_id: refId,
      ownership_name: `${make} Fleet Pvt Ltd`,
      valid_from: new Date(2023, 0, 1),
      valid_to: new Date(2025, 11, 31),
      registration_number: generateRegNumber(index),
      registration_date: new Date(2023, 0, 15),
      registration_upto: new Date(2038, 0, 15),
      purchase_date: new Date(2023, 0, 10),
      owner_sr_number: `OWN${String(index).padStart(5, '0')}`,
      state_code: 'MH',
      rto_code: 'MH12',
      sale_amount: 2500000 + (index * 50000)
    },
    documents: [
      {
        vehicle_ref_id: refId,
        document_type_id: 'DN001',
        document_type_name: 'Vehicle Registration Certificate',
        reference_number: `RC${String(100000 + index).substring(0, 9)}`,
        document_provider: 'RTO Maharashtra',
        coverage_type_id: null,
        premium_amount: null,
        valid_from: new Date(2023, 0, 15),
        valid_to: new Date(2038, 0, 15),
        remarks: 'Original RC'
      },
      {
        vehicle_ref_id: refId,
        document_type_id: 'DN009',
        document_type_name: 'Vehicle Insurance',
        reference_number: `INS${String(100000 + index).substring(0, 9)}`,
        document_provider: 'HDFC ERGO Insurance',
        coverage_type_id: 'CT001',
        premium_amount: 25000,
        valid_from: new Date(2024, 0, 1),
        valid_to: new Date(2025, 0, 1),
        remarks: 'Comprehensive Insurance'
      }
    ]
  };
}

// Generate invalid vehicle data (for testing validation)
function generateInvalidVehicle(index, errorType) {
  const vehicle = generateValidVehicle(index);
  
  switch (errorType) {
    case 'missing_required_basic':
      // Missing required fields in basic info
      vehicle.basicInfo.make_brand = '';
      vehicle.basicInfo.model = '';
      break;
      
    case 'invalid_vin':
      // Invalid VIN (not 17 characters)
      vehicle.basicInfo.vin_chassis_number = 'SHORT';
      break;
      
    case 'invalid_gps_imei':
      // Invalid GPS IMEI (not 15 digits)
      vehicle.basicInfo.gps_imei_number = '12345';
      break;
      
    case 'invalid_master_data':
      // Non-existent master data IDs
      vehicle.basicInfo.vehicle_type_id = 'INVALID_VT';
      vehicle.specifications.engine_type_id = 'INVALID_ET';
      break;
      
    case 'invalid_dates':
      // Invalid date logic
      vehicle.ownershipDetails.valid_to = new Date(2020, 0, 1); // Before valid_from
      vehicle.ownershipDetails.registration_upto = new Date(2020, 0, 1); // Before registration_date
      break;
      
    case 'negative_numbers':
      // Negative values for numeric fields
      vehicle.capacityDetails.unloading_weight_kg = -1000;
      vehicle.capacityDetails.gross_vehicle_weight_kg = -5000;
      vehicle.basicInfo.taxes_and_fees = -10000;
      break;
      
    case 'missing_child_records':
      // Missing specifications (warning, not error)
      vehicle.specifications = null;
      break;
      
    case 'invalid_enum_values':
      // Invalid enum values
      vehicle.specifications.transmission_type = 'INVALID_TYPE';
      vehicle.specifications.suspension_type = 'INVALID_SUSPENSION';
      vehicle.basicInfo.gps_active_flag = 'INVALID';
      break;
  }
  
  return vehicle;
}

// Add data to sheets
function addVehicleToSheets(workbook, vehicle, rowNumber) {
  const sheets = {
    basic: workbook.getWorksheet('Basic Information'),
    specs: workbook.getWorksheet('Specifications'),
    capacity: workbook.getWorksheet('Capacity Details'),
    ownership: workbook.getWorksheet('Ownership Details'),
    documents: workbook.getWorksheet('Documents')
  };
  
  // Basic Information
  if (vehicle.basicInfo) {
    sheets.basic.addRow([
      vehicle.basicInfo.vehicle_ref_id,
      vehicle.basicInfo.make_brand,
      vehicle.basicInfo.model,
      vehicle.basicInfo.vin_chassis_number,
      vehicle.basicInfo.vehicle_type_id,
      vehicle.basicInfo.vehicle_category,
      vehicle.basicInfo.manufacturing_month_year,
      vehicle.basicInfo.gps_imei_number,
      vehicle.basicInfo.gps_active_flag,
      vehicle.basicInfo.leasing_flag,
      vehicle.basicInfo.usage_type_id,
      vehicle.basicInfo.registration_number,
      vehicle.basicInfo.vehicle_color,
      vehicle.basicInfo.body_type_description,
      vehicle.basicInfo.safety_inspection_date,
      vehicle.basicInfo.taxes_and_fees,
      vehicle.basicInfo.road_tax,
      vehicle.basicInfo.avg_running_speed,
      vehicle.basicInfo.max_running_speed,
      vehicle.basicInfo.status
    ]);
  }
  
  // Specifications
  if (vehicle.specifications) {
    sheets.specs.addRow([
      vehicle.specifications.vehicle_ref_id,
      vehicle.specifications.engine_type_id,
      vehicle.specifications.engine_number,
      vehicle.specifications.fuel_type_id,
      vehicle.specifications.transmission_type,
      vehicle.specifications.emission_standard,
      vehicle.specifications.financer,
      vehicle.specifications.suspension_type,
      vehicle.specifications.weight_dimensions
    ]);
  }
  
  // Capacity Details
  if (vehicle.capacityDetails) {
    sheets.capacity.addRow([
      vehicle.capacityDetails.vehicle_ref_id,
      vehicle.capacityDetails.unloading_weight_kg,
      vehicle.capacityDetails.gross_vehicle_weight_kg,
      vehicle.capacityDetails.payload_capacity_kg,
      vehicle.capacityDetails.volume_capacity_cbm,
      vehicle.capacityDetails.cargo_width_m,
      vehicle.capacityDetails.cargo_height_m,
      vehicle.capacityDetails.cargo_length_m,
      vehicle.capacityDetails.towing_capacity_kg,
      vehicle.capacityDetails.tire_load_rating,
      vehicle.capacityDetails.vehicle_condition,
      vehicle.capacityDetails.fuel_tank_capacity_l,
      vehicle.capacityDetails.seating_capacity,
      vehicle.capacityDetails.load_capacity_ton
    ]);
  }
  
  // Ownership Details
  if (vehicle.ownershipDetails) {
    sheets.ownership.addRow([
      vehicle.ownershipDetails.vehicle_ref_id,
      vehicle.ownershipDetails.ownership_name,
      vehicle.ownershipDetails.valid_from,
      vehicle.ownershipDetails.valid_to,
      vehicle.ownershipDetails.registration_number,
      vehicle.ownershipDetails.registration_date,
      vehicle.ownershipDetails.registration_upto,
      vehicle.ownershipDetails.purchase_date,
      vehicle.ownershipDetails.owner_sr_number,
      vehicle.ownershipDetails.state_code,
      vehicle.ownershipDetails.rto_code,
      vehicle.ownershipDetails.sale_amount
    ]);
  }
  
  // Documents
  if (vehicle.documents) {
    vehicle.documents.forEach(doc => {
      sheets.documents.addRow([
        doc.vehicle_ref_id,
        doc.document_type_id,
        doc.document_type_name,
        doc.reference_number,
        doc.document_provider,
        doc.coverage_type_id,
        doc.premium_amount,
        doc.valid_from,
        doc.valid_to,
        doc.remarks
      ]);
    });
  }
}

// Create sheets with headers
function setupWorksheets(workbook) {
  // Sheet 1: Basic Information
  const basicSheet = workbook.addWorksheet('Basic Information');
  basicSheet.columns = [
    { header: 'Vehicle_Ref_ID', key: 'vehicle_ref_id', width: 15 },
    { header: 'Make_Brand', key: 'make_brand', width: 20 },
    { header: 'Model', key: 'model', width: 20 },
    { header: 'VIN_Chassis_Number', key: 'vin_chassis_number', width: 20 },
    { header: 'Vehicle_Type_ID', key: 'vehicle_type_id', width: 15 },
    { header: 'Vehicle_Category', key: 'vehicle_category', width: 15 },
    { header: 'Manufacturing_Month_Year', key: 'manufacturing_month_year', width: 20 },
    { header: 'GPS_IMEI_Number', key: 'gps_imei_number', width: 18 },
    { header: 'GPS_Active_Flag', key: 'gps_active_flag', width: 15 },
    { header: 'Leasing_Flag', key: 'leasing_flag', width: 15 },
    { header: 'Usage_Type_ID', key: 'usage_type_id', width: 15 },
    { header: 'Registration_Number', key: 'registration_number', width: 20 },
    { header: 'Vehicle_Color', key: 'vehicle_color', width: 15 },
    { header: 'Body_Type_Description', key: 'body_type_description', width: 20 },
    { header: 'Safety_Inspection_Date', key: 'safety_inspection_date', width: 20 },
    { header: 'Taxes_And_Fees', key: 'taxes_and_fees', width: 15 },
    { header: 'Road_Tax', key: 'road_tax', width: 15 },
    { header: 'Avg_Running_Speed', key: 'avg_running_speed', width: 18 },
    { header: 'Max_Running_Speed', key: 'max_running_speed', width: 18 },
    { header: 'Status', key: 'status', width: 15 }
  ];
  styleHeaders(basicSheet);
  
  // Sheet 2: Specifications
  const specsSheet = workbook.addWorksheet('Specifications');
  specsSheet.columns = [
    { header: 'Vehicle_Ref_ID', key: 'vehicle_ref_id', width: 15 },
    { header: 'Engine_Type_ID', key: 'engine_type_id', width: 15 },
    { header: 'Engine_Number', key: 'engine_number', width: 18 },
    { header: 'Fuel_Type_ID', key: 'fuel_type_id', width: 15 },
    { header: 'Transmission_Type', key: 'transmission_type', width: 18 },
    { header: 'Emission_Standard', key: 'emission_standard', width: 18 },
    { header: 'Financer', key: 'financer', width: 20 },
    { header: 'Suspension_Type', key: 'suspension_type', width: 18 },
    { header: 'Weight_Dimensions', key: 'weight_dimensions', width: 25 }
  ];
  styleHeaders(specsSheet);
  
  // Sheet 3: Capacity Details
  const capacitySheet = workbook.addWorksheet('Capacity Details');
  capacitySheet.columns = [
    { header: 'Vehicle_Ref_ID', key: 'vehicle_ref_id', width: 15 },
    { header: 'Unloading_Weight_KG', key: 'unloading_weight_kg', width: 20 },
    { header: 'Gross_Vehicle_Weight_KG', key: 'gross_vehicle_weight_kg', width: 22 },
    { header: 'Payload_Capacity_KG', key: 'payload_capacity_kg', width: 20 },
    { header: 'Volume_Capacity_CBM', key: 'volume_capacity_cbm', width: 20 },
    { header: 'Cargo_Width_M', key: 'cargo_width_m', width: 15 },
    { header: 'Cargo_Height_M', key: 'cargo_height_m', width: 15 },
    { header: 'Cargo_Length_M', key: 'cargo_length_m', width: 15 },
    { header: 'Towing_Capacity_KG', key: 'towing_capacity_kg', width: 18 },
    { header: 'Tire_Load_Rating', key: 'tire_load_rating', width: 18 },
    { header: 'Vehicle_Condition', key: 'vehicle_condition', width: 18 },
    { header: 'Fuel_Tank_Capacity_L', key: 'fuel_tank_capacity_l', width: 20 },
    { header: 'Seating_Capacity', key: 'seating_capacity', width: 18 },
    { header: 'Load_Capacity_TON', key: 'load_capacity_ton', width: 18 }
  ];
  styleHeaders(capacitySheet);
  
  // Sheet 4: Ownership Details
  const ownershipSheet = workbook.addWorksheet('Ownership Details');
  ownershipSheet.columns = [
    { header: 'Vehicle_Ref_ID', key: 'vehicle_ref_id', width: 15 },
    { header: 'Ownership_Name', key: 'ownership_name', width: 25 },
    { header: 'Valid_From', key: 'valid_from', width: 15 },
    { header: 'Valid_To', key: 'valid_to', width: 15 },
    { header: 'Registration_Number', key: 'registration_number', width: 20 },
    { header: 'Registration_Date', key: 'registration_date', width: 18 },
    { header: 'Registration_Upto', key: 'registration_upto', width: 18 },
    { header: 'Purchase_Date', key: 'purchase_date', width: 15 },
    { header: 'Owner_Sr_Number', key: 'owner_sr_number', width: 18 },
    { header: 'State_Code', key: 'state_code', width: 12 },
    { header: 'RTO_Code', key: 'rto_code', width: 12 },
    { header: 'Sale_Amount', key: 'sale_amount', width: 15 }
  ];
  styleHeaders(ownershipSheet);
  
  // Sheet 5: Documents
  const documentsSheet = workbook.addWorksheet('Documents');
  documentsSheet.columns = [
    { header: 'Vehicle_Ref_ID', key: 'vehicle_ref_id', width: 15 },
    { header: 'Document_Type_ID', key: 'document_type_id', width: 18 },
    { header: 'Document_Type_Name', key: 'document_type_name', width: 30 },
    { header: 'Reference_Number', key: 'reference_number', width: 20 },
    { header: 'Document_Provider', key: 'document_provider', width: 25 },
    { header: 'Coverage_Type_ID', key: 'coverage_type_id', width: 18 },
    { header: 'Premium_Amount', key: 'premium_amount', width: 15 },
    { header: 'Valid_From', key: 'valid_from', width: 15 },
    { header: 'Valid_To', key: 'valid_to', width: 15 },
    { header: 'Remarks', key: 'remarks', width: 30 }
  ];
  styleHeaders(documentsSheet);
}

// Main generation functions
async function generateAllValidVehicles(count) {
  console.log(`\n📝 Generating ${count} valid vehicles...`);
  const workbook = createWorkbook();
  setupWorksheets(workbook);
  
  for (let i = 1; i <= count; i++) {
    const vehicle = generateValidVehicle(i);
    addVehicleToSheets(workbook, vehicle, i);
  }
  
  const filename = `test-vehicle-all-valid-${count}.xlsx`;
  await workbook.xlsx.writeFile(path.join(__dirname, filename));
  console.log(`✅ Created: ${filename}`);
  return filename;
}

async function generateAllInvalidVehicles(count) {
  console.log(`\n📝 Generating ${count} invalid vehicles...`);
  const workbook = createWorkbook();
  setupWorksheets(workbook);
  
  const errorTypes = [
    'missing_required_basic',
    'invalid_vin',
    'invalid_gps_imei',
    'invalid_master_data',
    'invalid_dates',
    'negative_numbers',
    'invalid_enum_values'
  ];
  
  for (let i = 1; i <= count; i++) {
    const errorType = errorTypes[(i - 1) % errorTypes.length];
    const vehicle = generateInvalidVehicle(i, errorType);
    addVehicleToSheets(workbook, vehicle, i);
  }
  
  const filename = `test-vehicle-all-invalid-${count}.xlsx`;
  await workbook.xlsx.writeFile(path.join(__dirname, filename));
  console.log(`✅ Created: ${filename}`);
  return filename;
}

async function generateMixedVehicles(validCount, invalidCount) {
  console.log(`\n📝 Generating ${validCount} valid + ${invalidCount} invalid vehicles...`);
  const workbook = createWorkbook();
  setupWorksheets(workbook);
  
  const errorTypes = [
    'missing_required_basic',
    'invalid_vin',
    'invalid_gps_imei',
    'invalid_master_data',
    'invalid_dates',
    'negative_numbers',
    'invalid_enum_values'
  ];
  
  let rowNumber = 1;
  
  // Add valid vehicles
  for (let i = 1; i <= validCount; i++) {
    const vehicle = generateValidVehicle(rowNumber++);
    addVehicleToSheets(workbook, vehicle, i);
  }
  
  // Add invalid vehicles
  for (let i = 1; i <= invalidCount; i++) {
    const errorType = errorTypes[(i - 1) % errorTypes.length];
    const vehicle = generateInvalidVehicle(rowNumber++, errorType);
    addVehicleToSheets(workbook, vehicle, validCount + i);
  }
  
  const filename = `test-vehicle-mixed-${validCount}valid-${invalidCount}invalid.xlsx`;
  await workbook.xlsx.writeFile(path.join(__dirname, filename));
  console.log(`✅ Created: ${filename}`);
  return filename;
}

async function generateLargeDataset(count) {
  console.log(`\n📝 Generating LARGE dataset with ${count} valid vehicles...`);
  const workbook = createWorkbook();
  setupWorksheets(workbook);
  
  for (let i = 1; i <= count; i++) {
    const vehicle = generateValidVehicle(i);
    addVehicleToSheets(workbook, vehicle, i);
    
    if (i % 50 === 0) {
      console.log(`   Progress: ${i}/${count} vehicles...`);
    }
  }
  
  const filename = `test-vehicle-large-${count}.xlsx`;
  await workbook.xlsx.writeFile(path.join(__dirname, filename));
  console.log(`✅ Created: ${filename}`);
  return filename;
}

// Main execution
async function main() {
  console.log('🚀 Vehicle Bulk Upload Test Data Generator');
  console.log('==========================================\n');
  
  try {
    // Check for command line arguments for custom generation
    const args = process.argv.slice(2);
    const mode = args[0]; // 'stress', 'basic', or empty for all
    
    if (mode === 'stress') {
      console.log('🔥 STRESS TESTING MODE - Generating large datasets\n');
      
      // Stress Test 1: 250 vehicles
      console.log('📝 Generating 250 valid vehicles for stress testing...');
      await generateLargeDataset(250);
      console.log('✅ Created: test-vehicle-stress-250.xlsx\n');
      
      // Stress Test 2: 500 vehicles
      console.log('📝 Generating 500 valid vehicles for stress testing...');
      await generateLargeDataset(500);
      console.log('✅ Created: test-vehicle-stress-500.xlsx\n');
      
      // Stress Test 3: 1000 vehicles (extreme)
      console.log('📝 Generating 1000 valid vehicles for extreme stress testing...');
      await generateLargeDataset(1000);
      console.log('✅ Created: test-vehicle-stress-1000.xlsx\n');
      
      // Stress Test 4: Mixed large batch (200 valid + 50 invalid)
      console.log('📝 Generating 200 valid + 50 invalid for mixed stress testing...');
      await generateMixedVehicles(200, 50);
      console.log('✅ Created: test-vehicle-mixed-200valid-50invalid.xlsx\n');
      
      console.log('\n🎉 Stress test files generated successfully!');
      console.log('\nGenerated stress test files:');
      console.log('  1. test-vehicle-stress-250.xlsx (250 vehicles, ~2-3 min processing)');
      console.log('  2. test-vehicle-stress-500.xlsx (500 vehicles, ~5-7 min processing)');
      console.log('  3. test-vehicle-stress-1000.xlsx (1000 vehicles, ~10-15 min processing)');
      console.log('  4. test-vehicle-mixed-200valid-50invalid.xlsx (250 vehicles mixed)');
      console.log('\n📁 Location: test-data folder');
      console.log('\n⚠️  WARNING: Upload these files only when Redis is running and stable!');
      
      return;
    }
    
    // Basic/Standard test generation (default)
    console.log('📋 STANDARD MODE - Generating basic test files\n');
    
    // Scenario 1: Small batch - All valid (10 vehicles)
    await generateAllValidVehicles(10);
    
    // Scenario 2: Small batch - All invalid (10 vehicles)
    await generateAllInvalidVehicles(10);
    
    // Scenario 3: Mixed - 5 valid + 5 invalid
    await generateMixedVehicles(5, 5);
    
    // Scenario 4: Mixed - 15 valid + 5 invalid
    await generateMixedVehicles(15, 5);
    
    // Scenario 5: Mixed - 8 valid + 2 invalid
    await generateMixedVehicles(8, 2);
    
    // Scenario 6: Medium batch - All valid (50 vehicles)
    await generateAllValidVehicles(50);
    
    // Scenario 7: Large batch - All valid (100 vehicles)
    await generateAllValidVehicles(100);
    
    console.log('\n🎉 All test files generated successfully!');
    console.log('\nGenerated files:');
    console.log('  1. test-vehicle-all-valid-10.xlsx (10 valid vehicles)');
    console.log('  2. test-vehicle-all-invalid-10.xlsx (10 invalid vehicles)');
    console.log('  3. test-vehicle-mixed-5valid-5invalid.xlsx (mixed)');
    console.log('  4. test-vehicle-mixed-15valid-5invalid.xlsx (mixed)');
    console.log('  5. test-vehicle-mixed-8valid-2invalid.xlsx (mixed)');
    console.log('  6. test-vehicle-all-valid-50.xlsx (50 valid vehicles)');
    console.log('  7. test-vehicle-all-valid-100.xlsx (100 valid vehicles)');
    console.log('\n📁 Location: test-data folder');
    console.log('\n💡 TIP: Run "node generate-vehicle-test-data.js stress" for stress test files (250-1000 vehicles)');
    
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  generateAllValidVehicles,
  generateAllInvalidVehicles,
  generateMixedVehicles,
  generateLargeDataset
};