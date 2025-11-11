const validator = require('validator');
const { isValid, parse, parseISO } = require('date-fns');
const knex = require('knex')(require('../knexfile').development);

/**
 * Validate all parsed data from Excel
 * @param {Object} parsedData - Parsed data from all sheets
 * @returns {Promise<Object>} Validation results with valid and invalid records
 */
async function validateAllVehicleData(parsedData) {
  console.log('🔍 Starting comprehensive vehicle validation...\n');
  
  const validationResults = {
    valid: [],
    invalid: [],
    summary: {
      totalVehicles: parsedData.basicInformation.length,
      validCount: 0,
      invalidCount: 0,
      errorBreakdown: {}
    }
  };
  
  // Step 1: Validate relational integrity
  console.log('1️⃣ Validating relational integrity...');
  const relationalErrors = await validateRelationalIntegrity(parsedData);
  
  // Step 2: Check for duplicate VINs and GPS IMEIs in the batch
  console.log('2️⃣ Checking for duplicates within batch...');
  const batchDuplicates = findBatchDuplicates(parsedData.basicInformation);
  
  // Step 3: Check for existing VINs and GPS IMEIs in database
  console.log('3️⃣ Checking for existing VINs and GPS IMEIs...');
  const existingVehicles = await checkExistingVehicles(parsedData.basicInformation);
  
  // Step 4: Validate each vehicle
  console.log('4️⃣ Validating individual vehicles...');
  
  for (const basicInfo of parsedData.basicInformation) {
    const vehicleRefId = basicInfo.Vehicle_Ref_ID;
    
    // Get related records
    const vehicleData = {
      basicInformation: basicInfo,
      specifications: parsedData.specifications.find(s => s.Vehicle_Ref_ID === vehicleRefId),
      capacityDetails: parsedData.capacityDetails.find(c => c.Vehicle_Ref_ID === vehicleRefId),
      ownershipDetails: parsedData.ownershipDetails.find(o => o.Vehicle_Ref_ID === vehicleRefId),
      documents: parsedData.documents.filter(d => d.Vehicle_Ref_ID === vehicleRefId)
    };
    
    // Validate this vehicle
    const errors = await validateVehicle(
      vehicleData,
      relationalErrors[vehicleRefId] || [],
      batchDuplicates[vehicleRefId] || [],
      existingVehicles
    );
    
    if (errors.length === 0) {
      // Valid vehicle
      validationResults.valid.push({
        vehicleRefId,
        data: vehicleData
      });
      validationResults.summary.validCount++;
    } else {
      // Invalid vehicle
      validationResults.invalid.push({
        vehicleRefId,
        data: vehicleData,
        errors
      });
      validationResults.summary.invalidCount++;
      
      // Count error types
      errors.forEach(error => {
        const errorType = error.type || 'UNKNOWN';
        validationResults.summary.errorBreakdown[errorType] = 
          (validationResults.summary.errorBreakdown[errorType] || 0) + 1;
      });
    }
  }
  
  console.log('✓ Validation completed');
  console.log(`  Valid: ${validationResults.summary.validCount}`);
  console.log(`  Invalid: ${validationResults.summary.invalidCount}\n`);
  
  return validationResults;
}

/**
 * Validate relational integrity across sheets
 * @param {Object} parsedData - Parsed data from all sheets
 * @returns {Promise<Object>} Map of vehicle ref IDs to relational errors
 */
async function validateRelationalIntegrity(parsedData) {
  const errors = {};
  
  // Get all vehicle ref IDs from basic information
  const vehicleRefIds = new Set(
    parsedData.basicInformation.map(v => v.Vehicle_Ref_ID).filter(Boolean)
  );
  
  // Check specifications reference valid vehicles
  parsedData.specifications.forEach(spec => {
    const refId = spec.Vehicle_Ref_ID;
    if (refId && !vehicleRefIds.has(refId)) {
      if (!errors[refId]) errors[refId] = [];
      errors[refId].push({
        type: 'RELATIONAL_INTEGRITY',
        sheet: 'Specifications',
        row: spec.excelRowNumber,
        field: 'Vehicle_Ref_ID',
        message: `Specifications references non-existent vehicle "${refId}"`
      });
    }
  });
  
  // Check capacity details reference valid vehicles
  parsedData.capacityDetails.forEach(capacity => {
    const refId = capacity.Vehicle_Ref_ID;
    if (refId && !vehicleRefIds.has(refId)) {
      if (!errors[refId]) errors[refId] = [];
      errors[refId].push({
        type: 'RELATIONAL_INTEGRITY',
        sheet: 'Capacity Details',
        row: capacity.excelRowNumber,
        field: 'Vehicle_Ref_ID',
        message: `Capacity details references non-existent vehicle "${refId}"`
      });
    }
  });
  
  // Check ownership details reference valid vehicles
  parsedData.ownershipDetails.forEach(ownership => {
    const refId = ownership.Vehicle_Ref_ID;
    if (refId && !vehicleRefIds.has(refId)) {
      if (!errors[refId]) errors[refId] = [];
      errors[refId].push({
        type: 'RELATIONAL_INTEGRITY',
        sheet: 'Ownership Details',
        row: ownership.excelRowNumber,
        field: 'Vehicle_Ref_ID',
        message: `Ownership details references non-existent vehicle "${refId}"`
      });
    }
  });
  
  // Check documents reference valid vehicles
  parsedData.documents.forEach(doc => {
    const refId = doc.Vehicle_Ref_ID;
    if (refId && !vehicleRefIds.has(refId)) {
      if (!errors[refId]) errors[refId] = [];
      errors[refId].push({
        type: 'RELATIONAL_INTEGRITY',
        sheet: 'Documents',
        row: doc.excelRowNumber,
        field: 'Vehicle_Ref_ID',
        message: `Document references non-existent vehicle "${refId}"`
      });
    }
  });
  
  return errors;
}

/**
 * Find duplicate VINs and GPS IMEIs within the batch
 * @param {Array} basicInformationRows - Basic information rows
 * @returns {Object} Map of vehicle ref IDs to duplicate errors
 */
function findBatchDuplicates(basicInformationRows) {
  const errors = {};
  const vinMap = new Map();
  const imeiMap = new Map();
  const regNumberMap = new Map();
  
  basicInformationRows.forEach(row => {
    const refId = row.Vehicle_Ref_ID;
    const vin = row.VIN_Chassis_Number;
    const imei = row.GPS_IMEI_Number;
    const regNumber = row.Registration_Number;
    
    // Check VIN duplicates
    if (vin) {
      if (vinMap.has(vin)) {
        if (!errors[refId]) errors[refId] = [];
        errors[refId].push({
          type: 'DUPLICATE_IN_BATCH',
          sheet: 'Basic Information',
          row: row.excelRowNumber,
          field: 'VIN_Chassis_Number',
          message: `VIN "${vin}" already exists in row ${vinMap.get(vin)}`
        });
      } else {
        vinMap.set(vin, row.excelRowNumber);
      }
    }
    
    // Check GPS IMEI duplicates
    if (imei) {
      if (imeiMap.has(imei)) {
        if (!errors[refId]) errors[refId] = [];
        errors[refId].push({
          type: 'DUPLICATE_IN_BATCH',
          sheet: 'Basic Information',
          row: row.excelRowNumber,
          field: 'GPS_IMEI_Number',
          message: `GPS IMEI "${imei}" already exists in row ${imeiMap.get(imei)}`
        });
      } else {
        imeiMap.set(imei, row.excelRowNumber);
      }
    }
    
    // Check registration number duplicates
    if (regNumber) {
      if (regNumberMap.has(regNumber)) {
        if (!errors[refId]) errors[refId] = [];
        errors[refId].push({
          type: 'DUPLICATE_IN_BATCH',
          sheet: 'Basic Information',
          row: row.excelRowNumber,
          field: 'Registration_Number',
          message: `Registration number "${regNumber}" already exists in row ${regNumberMap.get(regNumber)}`
        });
      } else {
        regNumberMap.set(regNumber, row.excelRowNumber);
      }
    }
  });
  
  return errors;
}

/**
 * Check for existing VINs and GPS IMEIs in database
 * @param {Array} basicInformationRows - Basic information rows
 * @returns {Promise<Object>} Map of VINs and IMEIs to existing vehicle IDs
 */
async function checkExistingVehicles(basicInformationRows) {
  const vins = basicInformationRows
    .map(row => row.VIN_Chassis_Number)
    .filter(Boolean);
  
  const imeis = basicInformationRows
    .map(row => row.GPS_IMEI_Number)
    .filter(Boolean);
  
  const regNumbers = basicInformationRows
    .map(row => row.Registration_Number)
    .filter(Boolean);
  
  const existing = {
    vins: new Map(),
    imeis: new Map(),
    regNumbers: new Map()
  };
  
  // Check VINs
  if (vins.length > 0) {
    const existingVins = await knex('vehicle_basic_information_hdr')
      .whereIn('vin_chassis_number', vins)
      .select('vin_chassis_number', 'vehicle_id_code_hdr');
    
    existingVins.forEach(row => {
      existing.vins.set(row.vin_chassis_number, row.vehicle_id_code_hdr);
    });
  }
  
  // Check GPS IMEIs
  if (imeis.length > 0) {
    const existingImeis = await knex('vehicle_basic_information_hdr')
      .whereIn('gps_imei_number', imeis)
      .select('gps_imei_number', 'vehicle_id_code_hdr');
    
    existingImeis.forEach(row => {
      existing.imeis.set(row.gps_imei_number, row.vehicle_id_code_hdr);
    });
  }
  
  // Check registration numbers
  if (regNumbers.length > 0) {
    const existingRegNumbers = await knex('vehicle_basic_information_hdr')
      .whereIn('registration_number', regNumbers)
      .select('registration_number', 'vehicle_id_code_hdr');
    
    existingRegNumbers.forEach(row => {
      existing.regNumbers.set(row.registration_number, row.vehicle_id_code_hdr);
    });
  }
  
  return existing;
}

/**
 * Validate a single vehicle with all its related data
 * @param {Object} vehicleData - Vehicle data from all sheets
 * @param {Array} relationalErrors - Relational integrity errors
 * @param {Array} batchDuplicates - Batch duplicate errors
 * @param {Object} existingVehicles - Existing vehicles in database
 * @returns {Promise<Array>} Array of validation errors
 */
async function validateVehicle(vehicleData, relationalErrors, batchDuplicates, existingVehicles) {
  const errors = [
    ...relationalErrors,
    ...batchDuplicates
  ];
  
  // Validate basic information
  errors.push(...await validateBasicInformation(vehicleData.basicInformation, existingVehicles));
  
  // Validate specifications (if present)
  if (vehicleData.specifications) {
    errors.push(...await validateSpecifications(vehicleData.specifications));
  }
  
  // Validate capacity details (if present)
  if (vehicleData.capacityDetails) {
    errors.push(...validateCapacityDetails(vehicleData.capacityDetails));
  }
  
  // Validate ownership details (if present)
  if (vehicleData.ownershipDetails) {
    errors.push(...validateOwnershipDetails(vehicleData.ownershipDetails));
  }
  
  // Validate documents (if present)
  if (vehicleData.documents && vehicleData.documents.length > 0) {
    errors.push(...await validateDocuments(vehicleData.documents));
  }
  
  return errors;
}

/**
 * Validate basic information fields
 * @param {Object} basicInfo - Basic information object
 * @param {Object} existingVehicles - Existing vehicles in database
 * @returns {Promise<Array>} Array of validation errors
 */
async function validateBasicInformation(basicInfo, existingVehicles) {
  const errors = [];
  const row = basicInfo.excelRowNumber;
  
  // Required fields
  if (!basicInfo.Vehicle_Ref_ID || !basicInfo.Vehicle_Ref_ID.trim()) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'Basic Information',
      row,
      field: 'Vehicle_Ref_ID',
      message: 'Vehicle_Ref_ID is required'
    });
  }
  
  if (!basicInfo.Make_Brand || !basicInfo.Make_Brand.trim()) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'Basic Information',
      row,
      field: 'Make_Brand',
      message: 'Make_Brand is required'
    });
  } else if (basicInfo.Make_Brand.trim().length < 2) {
    errors.push({
      type: 'INVALID_VALUE',
      sheet: 'Basic Information',
      row,
      field: 'Make_Brand',
      message: 'Make_Brand must be at least 2 characters'
    });
  }
  
  if (!basicInfo.Model || !basicInfo.Model.trim()) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'Basic Information',
      row,
      field: 'Model',
      message: 'Model is required'
    });
  } else if (basicInfo.Model.trim().length < 2) {
    errors.push({
      type: 'INVALID_VALUE',
      sheet: 'Basic Information',
      row,
      field: 'Model',
      message: 'Model must be at least 2 characters'
    });
  }
  
  if (!basicInfo.VIN_Chassis_Number || !basicInfo.VIN_Chassis_Number.trim()) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'Basic Information',
      row,
      field: 'VIN_Chassis_Number',
      message: 'VIN_Chassis_Number is required'
    });
  } else {
    const vin = basicInfo.VIN_Chassis_Number.trim();
    
    // Check if VIN already exists in database
    if (existingVehicles.vins.has(vin)) {
      errors.push({
        type: 'DUPLICATE_IN_DATABASE',
        sheet: 'Basic Information',
        row,
        field: 'VIN_Chassis_Number',
        message: `VIN "${vin}" already exists (Vehicle ID: ${existingVehicles.vins.get(vin)})`
      });
    }
  }
  
  if (!basicInfo.GPS_IMEI_Number || !basicInfo.GPS_IMEI_Number.trim()) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'Basic Information',
      row,
      field: 'GPS_IMEI_Number',
      message: 'GPS_IMEI_Number is required'
    });
  } else {
    const imei = basicInfo.GPS_IMEI_Number.trim();
    
    // Check if IMEI already exists in database
    if (existingVehicles.imeis.has(imei)) {
      errors.push({
        type: 'DUPLICATE_IN_DATABASE',
        sheet: 'Basic Information',
        row,
        field: 'GPS_IMEI_Number',
        message: `GPS IMEI "${imei}" already exists (Vehicle ID: ${existingVehicles.imeis.get(imei)})`
      });
    }
    
    // Validate IMEI format (15 digits)
    if (!/^\d{15}$/.test(imei)) {
      errors.push({
        type: 'INVALID_FORMAT',
        sheet: 'Basic Information',
        row,
        field: 'GPS_IMEI_Number',
        message: 'GPS IMEI must be 15 digits'
      });
    }
  }
  
  // Check registration number if provided
  if (basicInfo.Registration_Number && basicInfo.Registration_Number.trim()) {
    const regNumber = basicInfo.Registration_Number.trim();
    if (existingVehicles.regNumbers.has(regNumber)) {
      errors.push({
        type: 'DUPLICATE_IN_DATABASE',
        sheet: 'Basic Information',
        row,
        field: 'Registration_Number',
        message: `Registration number "${regNumber}" already exists (Vehicle ID: ${existingVehicles.regNumbers.get(regNumber)})`
      });
    }
  }
  
  // Validate Manufacturing Date
  if (!basicInfo.Manufacturing_Month_Year) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'Basic Information',
      row,
      field: 'Manufacturing_Month_Year',
      message: 'Manufacturing_Month_Year is required'
    });
  } else {
    if (!isValidDate(basicInfo.Manufacturing_Month_Year)) {
      errors.push({
        type: 'INVALID_DATE',
        sheet: 'Basic Information',
        row,
        field: 'Manufacturing_Month_Year',
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
  }
  
  // Validate GPS Active Flag
  if (basicInfo.GPS_Active_Flag && !['Y', 'N', 'y', 'n'].includes(basicInfo.GPS_Active_Flag)) {
    errors.push({
      type: 'INVALID_VALUE',
      sheet: 'Basic Information',
      row,
      field: 'GPS_Active_Flag',
      message: 'GPS_Active_Flag must be Y or N'
    });
  }
  
  // Validate Leasing Flag
  if (basicInfo.Leasing_Flag && !['Y', 'N', 'y', 'n'].includes(basicInfo.Leasing_Flag)) {
    errors.push({
      type: 'INVALID_VALUE',
      sheet: 'Basic Information',
      row,
      field: 'Leasing_Flag',
      message: 'Leasing_Flag must be Y or N'
    });
  }
  
  // Validate numeric fields
  if (basicInfo.Taxes_And_Fees && !isValidNumber(basicInfo.Taxes_And_Fees)) {
    errors.push({
      type: 'INVALID_NUMBER',
      sheet: 'Basic Information',
      row,
      field: 'Taxes_And_Fees',
      message: 'Taxes_And_Fees must be a valid number >= 0'
    });
  }
  
  if (basicInfo.Road_Tax && !isValidNumber(basicInfo.Road_Tax)) {
    errors.push({
      type: 'INVALID_NUMBER',
      sheet: 'Basic Information',
      row,
      field: 'Road_Tax',
      message: 'Road_Tax must be a valid number >= 0'
    });
  }
  
  if (basicInfo.Avg_Running_Speed && !isValidNumber(basicInfo.Avg_Running_Speed)) {
    errors.push({
      type: 'INVALID_NUMBER',
      sheet: 'Basic Information',
      row,
      field: 'Avg_Running_Speed',
      message: 'Avg_Running_Speed must be a valid number >= 0'
    });
  }
  
  if (basicInfo.Max_Running_Speed && !isValidNumber(basicInfo.Max_Running_Speed)) {
    errors.push({
      type: 'INVALID_NUMBER',
      sheet: 'Basic Information',
      row,
      field: 'Max_Running_Speed',
      message: 'Max_Running_Speed must be a valid number >= 0'
    });
  }
  
  return errors;
}

/**
 * Validate specifications fields
 * @param {Object} specifications - Specifications object
 * @returns {Promise<Array>} Array of validation errors
 */
async function validateSpecifications(specifications) {
  const errors = [];
  const row = specifications.excelRowNumber;
  
  // Required fields
  if (!specifications.Engine_Type_ID || !specifications.Engine_Type_ID.trim()) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'Specifications',
      row,
      field: 'Engine_Type_ID',
      message: 'Engine_Type_ID is required'
    });
  }
  
  if (!specifications.Engine_Number || !specifications.Engine_Number.trim()) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'Specifications',
      row,
      field: 'Engine_Number',
      message: 'Engine_Number is required'
    });
  } else if (specifications.Engine_Number.trim().length < 5) {
    errors.push({
      type: 'INVALID_VALUE',
      sheet: 'Specifications',
      row,
      field: 'Engine_Number',
      message: 'Engine_Number must be at least 5 characters'
    });
  }
  
  if (!specifications.Fuel_Type_ID || !specifications.Fuel_Type_ID.trim()) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'Specifications',
      row,
      field: 'Fuel_Type_ID',
      message: 'Fuel_Type_ID is required'
    });
  }
  
  if (!specifications.Transmission_Type || !specifications.Transmission_Type.trim()) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'Specifications',
      row,
      field: 'Transmission_Type',
      message: 'Transmission_Type is required'
    });
  } else {
    const validTransmissionTypes = ['MANUAL', 'AUTOMATIC', 'AMT', 'CVT', 'DCT'];
    if (!validTransmissionTypes.includes(specifications.Transmission_Type.trim().toUpperCase())) {
      errors.push({
        type: 'INVALID_VALUE',
        sheet: 'Specifications',
        row,
        field: 'Transmission_Type',
        message: `Transmission_Type must be one of: ${validTransmissionTypes.join(', ')}`
      });
    }
  }
  
  if (!specifications.Financer || !specifications.Financer.trim()) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'Specifications',
      row,
      field: 'Financer',
      message: 'Financer is required'
    });
  } else if (specifications.Financer.trim().length < 2) {
    errors.push({
      type: 'INVALID_VALUE',
      sheet: 'Specifications',
      row,
      field: 'Financer',
      message: 'Financer must be at least 2 characters'
    });
  }
  
  if (!specifications.Suspension_Type || !specifications.Suspension_Type.trim()) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'Specifications',
      row,
      field: 'Suspension_Type',
      message: 'Suspension_Type is required'
    });
  } else {
    const validSuspensionTypes = ['LEAF_SPRING', 'AIR_SUSPENSION', 'COIL_SPRING', 'TORSION_BAR'];
    if (!validSuspensionTypes.includes(specifications.Suspension_Type.trim().toUpperCase())) {
      errors.push({
        type: 'INVALID_VALUE',
        sheet: 'Specifications',
        row,
        field: 'Suspension_Type',
        message: `Suspension_Type must be one of: ${validSuspensionTypes.join(', ')}`
      });
    }
  }
  
  return errors;
}

/**
 * Validate capacity details fields
 * @param {Object} capacityDetails - Capacity details object
 * @returns {Array} Array of validation errors
 */
function validateCapacityDetails(capacityDetails) {
  const errors = [];
  const row = capacityDetails.excelRowNumber;
  
  // Validate numeric fields
  const numericFields = [
    'Unloading_Weight_KG',
    'Gross_Vehicle_Weight_KG',
    'Payload_Capacity_KG',
    'Volume_Capacity_CBM',
    'Cargo_Width_M',
    'Cargo_Height_M',
    'Cargo_Length_M',
    'Towing_Capacity_KG',
    'Fuel_Tank_Capacity_L',
    'Seating_Capacity',
    'Load_Capacity_TON'
  ];
  
  numericFields.forEach(field => {
    if (capacityDetails[field] && !isValidNumber(capacityDetails[field])) {
      errors.push({
        type: 'INVALID_NUMBER',
        sheet: 'Capacity Details',
        row,
        field,
        message: `${field} must be a valid number >= 0`
      });
    }
  });
  
  // Validate vehicle condition
  if (capacityDetails.Vehicle_Condition) {
    const validConditions = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];
    if (!validConditions.includes(capacityDetails.Vehicle_Condition.trim().toUpperCase())) {
      errors.push({
        type: 'INVALID_VALUE',
        sheet: 'Capacity Details',
        row,
        field: 'Vehicle_Condition',
        message: `Vehicle_Condition must be one of: ${validConditions.join(', ')}`
      });
    }
  }
  
  // Validate payload capacity calculation
  if (capacityDetails.Gross_Vehicle_Weight_KG && capacityDetails.Unloading_Weight_KG) {
    const gvw = parseFloat(capacityDetails.Gross_Vehicle_Weight_KG);
    const unloadingWeight = parseFloat(capacityDetails.Unloading_Weight_KG);
    
    if (gvw < unloadingWeight) {
      errors.push({
        type: 'BUSINESS_RULE_VIOLATION',
        sheet: 'Capacity Details',
        row,
        field: 'Gross_Vehicle_Weight_KG',
        message: 'Gross Vehicle Weight cannot be less than Unloading Weight'
      });
    }
  }
  
  return errors;
}

/**
 * Validate ownership details fields
 * @param {Object} ownershipDetails - Ownership details object
 * @returns {Array} Array of validation errors
 */
function validateOwnershipDetails(ownershipDetails) {
  const errors = [];
  const row = ownershipDetails.excelRowNumber;
  
  // Validate dates
  if (ownershipDetails.Valid_From && !isValidDate(ownershipDetails.Valid_From)) {
    errors.push({
      type: 'INVALID_DATE',
      sheet: 'Ownership Details',
      row,
      field: 'Valid_From',
      message: 'Invalid date format. Use YYYY-MM-DD'
    });
  }
  
  if (ownershipDetails.Valid_To && !isValidDate(ownershipDetails.Valid_To)) {
    errors.push({
      type: 'INVALID_DATE',
      sheet: 'Ownership Details',
      row,
      field: 'Valid_To',
      message: 'Invalid date format. Use YYYY-MM-DD'
    });
  }
  
  if (ownershipDetails.Registration_Date && !isValidDate(ownershipDetails.Registration_Date)) {
    errors.push({
      type: 'INVALID_DATE',
      sheet: 'Ownership Details',
      row,
      field: 'Registration_Date',
      message: 'Invalid date format. Use YYYY-MM-DD'
    });
  }
  
  if (ownershipDetails.Registration_Upto && !isValidDate(ownershipDetails.Registration_Upto)) {
    errors.push({
      type: 'INVALID_DATE',
      sheet: 'Ownership Details',
      row,
      field: 'Registration_Upto',
      message: 'Invalid date format. Use YYYY-MM-DD'
    });
  }
  
  if (ownershipDetails.Purchase_Date && !isValidDate(ownershipDetails.Purchase_Date)) {
    errors.push({
      type: 'INVALID_DATE',
      sheet: 'Ownership Details',
      row,
      field: 'Purchase_Date',
      message: 'Invalid date format. Use YYYY-MM-DD'
    });
  }
  
  // Validate date logic
  if (ownershipDetails.Valid_From && ownershipDetails.Valid_To) {
    const validFrom = new Date(ownershipDetails.Valid_From);
    const validTo = new Date(ownershipDetails.Valid_To);
    
    if (validTo <= validFrom) {
      errors.push({
        type: 'BUSINESS_RULE_VIOLATION',
        sheet: 'Ownership Details',
        row,
        field: 'Valid_To',
        message: 'Valid_To must be after Valid_From'
      });
    }
  }
  
  if (ownershipDetails.Registration_Date && ownershipDetails.Registration_Upto) {
    const regDate = new Date(ownershipDetails.Registration_Date);
    const regUpto = new Date(ownershipDetails.Registration_Upto);
    
    if (regUpto <= regDate) {
      errors.push({
        type: 'BUSINESS_RULE_VIOLATION',
        sheet: 'Ownership Details',
        row,
        field: 'Registration_Upto',
        message: 'Registration_Upto must be after Registration_Date'
      });
    }
  }
  
  // Validate numeric fields
  if (ownershipDetails.Sale_Amount && !isValidNumber(ownershipDetails.Sale_Amount)) {
    errors.push({
      type: 'INVALID_NUMBER',
      sheet: 'Ownership Details',
      row,
      field: 'Sale_Amount',
      message: 'Sale_Amount must be a valid number >= 0'
    });
  }
  
  return errors;
}

/**
 * Validate documents fields
 * @param {Array} documents - Array of document objects
 * @returns {Promise<Array>} Array of validation errors
 */
async function validateDocuments(documents) {
  const errors = [];
  
  documents.forEach(doc => {
    const row = doc.excelRowNumber;
    
    // Required fields
    if (!doc.Document_Type_ID || !doc.Document_Type_ID.trim()) {
      errors.push({
        type: 'REQUIRED_FIELD',
        sheet: 'Documents',
        row,
        field: 'Document_Type_ID',
        message: 'Document_Type_ID is required'
      });
    }
    
    if (!doc.Document_Type_Name || !doc.Document_Type_Name.trim()) {
      errors.push({
        type: 'REQUIRED_FIELD',
        sheet: 'Documents',
        row,
        field: 'Document_Type_Name',
        message: 'Document_Type_Name is required'
      });
    }
    
    if (!doc.Reference_Number || !doc.Reference_Number.trim()) {
      errors.push({
        type: 'REQUIRED_FIELD',
        sheet: 'Documents',
        row,
        field: 'Reference_Number',
        message: 'Reference_Number is required'
      });
    }
    
    // Validate dates
    if (doc.Valid_From && !isValidDate(doc.Valid_From)) {
      errors.push({
        type: 'INVALID_DATE',
        sheet: 'Documents',
        row,
        field: 'Valid_From',
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    if (doc.Valid_To && !isValidDate(doc.Valid_To)) {
      errors.push({
        type: 'INVALID_DATE',
        sheet: 'Documents',
        row,
        field: 'Valid_To',
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    // Validate date logic
    if (doc.Valid_From && doc.Valid_To) {
      const validFrom = new Date(doc.Valid_From);
      const validTo = new Date(doc.Valid_To);
      
      if (validTo <= validFrom) {
        errors.push({
          type: 'BUSINESS_RULE_VIOLATION',
          sheet: 'Documents',
          row,
          field: 'Valid_To',
          message: 'Valid_To must be after Valid_From'
        });
      }
    }
    
    // Validate premium amount
    if (doc.Premium_Amount && !isValidNumber(doc.Premium_Amount)) {
      errors.push({
        type: 'INVALID_NUMBER',
        sheet: 'Documents',
        row,
        field: 'Premium_Amount',
        message: 'Premium_Amount must be a valid number >= 0'
      });
    }
    
    // Validate remarks length
    if (doc.Remarks && doc.Remarks.length > 500) {
      errors.push({
        type: 'INVALID_LENGTH',
        sheet: 'Documents',
        row,
        field: 'Remarks',
        message: 'Remarks cannot exceed 500 characters'
      });
    }
  });
  
  return errors;
}

/**
 * Helper function to validate dates
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
function isValidDate(dateString) {
  if (!dateString) return false;
  
  // Try parsing as ISO date (YYYY-MM-DD)
  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch {
    return false;
  }
}

/**
 * Helper function to validate numbers
 * @param {string|number} value - Value to validate
 * @returns {boolean} True if valid number >= 0
 */
function isValidNumber(value) {
  if (value === null || value === undefined || value === '') return true; // Optional fields
  
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num >= 0;
}

module.exports = {
  validateAllVehicleData,
  validateRelationalIntegrity,
  findBatchDuplicates,
  checkExistingVehicles,
  validateVehicle,
  validateBasicInformation,
  validateSpecifications,
  validateCapacityDetails,
  validateOwnershipDetails,
  validateDocuments,
  isValidDate,
  isValidNumber
};
