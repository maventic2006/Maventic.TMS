const knex = require('knex')(require('../../../knexfile').development);

/**
 * Validate all driver data
 */
async function validateAllDriverData(parsedData) {
  console.log(' Starting driver validation...\n');
  
  const validationResults = {
    valid: [],
    invalid: [],
    summary: {
      totalDrivers: parsedData.basicInfo.length,
      validCount: 0,
      invalidCount: 0,
      errorBreakdown: {}
    }
  };
  
  console.log('1 Validating relational integrity...');
  const relationalErrors = validateRelationalIntegrity(parsedData);
  
  console.log('2 Validating individual drivers...');
  
  for (const basicInfo of parsedData.basicInfo) {
    const driverRefId = basicInfo.Driver_Ref_ID;
    
    const driverData = {
      basicInfo,
      addresses: parsedData.addresses.filter(a => a.Driver_Ref_ID === driverRefId),
      documents: parsedData.documents.filter(d => d.Driver_Ref_ID === driverRefId),
      history: parsedData.history.filter(h => h.Driver_Ref_ID === driverRefId),
      accidents: parsedData.accidents.filter(ac => ac.Driver_Ref_ID === driverRefId)
    };
    
    const errors = await validateDriver(driverData, relationalErrors[driverRefId] || []);
    
    if (errors.length === 0) {
      validationResults.valid.push({
        driverRefId,
        data: driverData
      });
      validationResults.summary.validCount++;
    } else {
      validationResults.invalid.push({
        driverRefId,
        data: driverData,
        errors
      });
      validationResults.summary.invalidCount++;
      
      errors.forEach(error => {
        const errorType = error.type || 'UNKNOWN';
        validationResults.summary.errorBreakdown[errorType] = 
          (validationResults.summary.errorBreakdown[errorType] || 0) + 1;
      });
    }
  }
  
  console.log(' Validation completed');
  console.log(`  Valid: ${validationResults.summary.validCount}`);
  console.log(`  Invalid: ${validationResults.summary.invalidCount}\n');
  
  return validationResults;
}

function validateRelationalIntegrity(parsedData) {
  const errors = {};
  
  const driverRefIds = new Set(
    parsedData.basicInfo.map(b => b.Driver_Ref_ID).filter(Boolean)
  );
  
  parsedData.addresses.forEach(address => {
    const refId = address.Driver_Ref_ID;
    if (refId && !driverRefIds.has(refId)) {
      if (!errors[refId]) errors[refId] = [];
      errors[refId].push({
        type: 'RELATIONAL_INTEGRITY',
        sheet: 'Addresses',
        row: address._excelRowNumber,
        field: 'Driver_Ref_ID',
        message: `Address references non-existent driver "${refId}"`
      });
    }
  });
  
  parsedData.documents.forEach(doc => {
    const refId = doc.Driver_Ref_ID;
    if (refId && !driverRefIds.has(refId)) {
      if (!errors[refId]) errors[refId] = [];
      errors[refId].push({
        type: 'RELATIONAL_INTEGRITY',
        sheet: 'Documents',
        row: doc._excelRowNumber,
        field: 'Driver_Ref_ID',
        message: `Document references non-existent driver "${refId}"`
      });
    }
  });
  
  return errors;
}

async function validateDriver(driverData, relationalErrors = []) {
  const errors = [...relationalErrors];
  
  const basicErrors = await validateBasicInfo(driverData.basicInfo);
  errors.push(...basicErrors);
  
  const addressErrors = await validateAddresses(driverData.addresses, driverData.basicInfo.Driver_Ref_ID);
  errors.push(...addressErrors);
  
  const docErrors = await validateDocuments(driverData.documents, driverData.basicInfo.Driver_Ref_ID);
  errors.push(...docErrors);
  
  return errors;
}

async function validateBasicInfo(basicInfo) {
  const errors = [];
  const row = basicInfo._excelRowNumber;
  
  // Full Name validation
  if (!basicInfo.Full_Name || basicInfo.Full_Name.trim().length < 2) {
    errors.push({
      type: 'VALIDATION_ERROR',
      sheet: 'Basic Information',
      row,
      field: 'Full_Name',
      message: 'Full name must be at least 2 characters'
    });
  } else if (basicInfo.Full_Name.length > 100) {
    errors.push({
      type: 'VALIDATION_ERROR',
      sheet: 'Basic Information',
      row,
      field: 'Full_Name',
      message: 'Full name cannot exceed 100 characters'
    });
  }
  
  // Date of Birth validation
  if (!basicInfo.Date_Of_Birth) {
    errors.push({
      type: 'VALIDATION_ERROR',
      sheet: 'Basic Information',
      row,
      field: 'Date_Of_Birth',
      message: 'Date of birth is required'
    });
  } else {
    const dob = new Date(basicInfo.Date_Of_Birth);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dob >= today) {
      errors.push({
        type: 'VALIDATION_ERROR',
        sheet: 'Basic Information',
        row,
        field: 'Date_Of_Birth',
        message: 'Date of birth must be in the past'
      });
    } else {
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      if (age < 18 || age > 65) {
        errors.push({
          type: 'VALIDATION_ERROR',
          sheet: 'Basic Information',
          row,
          field: 'Date_Of_Birth',
          message: 'Driver must be between 18 and 65 years old'
        });
      }
    }
  }
  
  // Phone Number validation
  if (!basicInfo.Phone_Number) {
    errors.push({
      type: 'VALIDATION_ERROR',
      sheet: 'Basic Information',
      row,
      field: 'Phone_Number',
      message: 'Phone number is required'
    });
  } else {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(basicInfo.Phone_Number)) {
      errors.push({
        type: 'VALIDATION_ERROR',
        sheet: 'Basic Information',
        row,
        field: 'Phone_Number',
        message: 'Phone number must be 10 digits starting with 6-9'
      });
    } else {
      // Check duplicate
      const existing = await knex('driver_basic_information')
        .where('phone_number', basicInfo.Phone_Number)
        .first();
      
      if (existing) {
        errors.push({
          type: 'DUPLICATE_ERROR',
          sheet: 'Basic Information',
          row,
          field: 'Phone_Number',
          message: `Phone number ${basicInfo.Phone_Number} already exists`
        });
      }
    }
  }
  
  // Email validation
  if (basicInfo.Email_ID && basicInfo.Email_ID.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(basicInfo.Email_ID)) {
      errors.push({
        type: 'VALIDATION_ERROR',
        sheet: 'Basic Information',
        row,
        field: 'Email_ID',
        message: 'Invalid email format'
      });
    } else {
      const existing = await knex('driver_basic_information')
        .where('email_id', basicInfo.Email_ID)
        .first();
      
      if (existing) {
        errors.push({
          type: 'DUPLICATE_ERROR',
          sheet: 'Basic Information',
          row,
          field: 'Email_ID',
          message: `Email ${basicInfo.Email_ID} already exists`
        });
      }
    }
  }
  
  // Emergency Contact validation
  if (!basicInfo.Emergency_Contact) {
    errors.push({
      type: 'VALIDATION_ERROR',
      sheet: 'Basic Information',
      row,
      field: 'Emergency_Contact',
      message: 'Emergency contact is required'
    });
  } else {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(basicInfo.Emergency_Contact)) {
      errors.push({
        type: 'VALIDATION_ERROR',
        sheet: 'Basic Information',
        row,
        field: 'Emergency_Contact',
        message: 'Emergency contact must be 10 digits starting with 6-9'
      });
    }
  }
  
  return errors;
}

async function validateAddresses(addresses, driverRefId) {
  const errors = [];
  
  if (addresses.length === 0) {
    errors.push({
      type: 'VALIDATION_ERROR',
      sheet: 'Addresses',
      row: 'N/A',
      field: 'General',
      message: `Driver ${driverRefId} must have at least one address`
    });
    return errors;
  }
  
  const primaryCount = addresses.filter(a => 
    a.Is_Primary && (a.Is_Primary === 'Y' || a.Is_Primary === 'Yes' || a.Is_Primary === '1' || a.Is_Primary === 1 || a.Is_Primary === true)
  ).length;
  
  if (primaryCount === 0) {
    errors.push({
      type: 'VALIDATION_ERROR',
      sheet: 'Addresses',
      row: 'N/A',
      field: 'Is_Primary',
      message: `Driver ${driverRefId} must have one primary address`
    });
  } else if (primaryCount > 1) {
    errors.push({
      type: 'VALIDATION_ERROR',
      sheet: 'Addresses',
      row: 'N/A',
      field: 'Is_Primary',
      message: `Driver ${driverRefId} can only have one primary address`
    });
  }
  
  for (const address of addresses) {
    const row = address._excelRowNumber;
    
    if (!address.Country || !address.Country.trim()) {
      errors.push({
        type: 'VALIDATION_ERROR',
        sheet: 'Addresses',
        row,
        field: 'Country',
        message: 'Country is required'
      });
    }
    
    if (!address.State || !address.State.trim()) {
      errors.push({
        type: 'VALIDATION_ERROR',
        sheet: 'Addresses',
        row,
        field: 'State',
        message: 'State is required'
      });
    }
    
    if (!address.City || !address.City.trim()) {
      errors.push({
        type: 'VALIDATION_ERROR',
        sheet: 'Addresses',
        row,
        field: 'City',
        message: 'City is required'
      });
    }
    
    if (!address.Postal_Code || !address.Postal_Code.trim()) {
      errors.push({
        type: 'VALIDATION_ERROR',
        sheet: 'Addresses',
        row,
        field: 'Postal_Code',
        message: 'Postal code is required'
      });
    } else if (!/^\d{6}$/.test(address.Postal_Code)) {
      errors.push({
        type: 'VALIDATION_ERROR',
        sheet: 'Addresses',
        row,
        field: 'Postal_Code',
        message: 'Postal code must be 6 digits'
      });
    }
  }
  
  return errors;
}

async function validateDocuments(documents, driverRefId) {
  const errors = [];
  
  // Documents are optional
  if (documents.length === 0) {
    return errors;
  }
  
  const docMap = new Map();
  
  for (const doc of documents) {
    const row = doc._excelRowNumber;
    
    if (!doc.Document_Type || !doc.Document_Type.trim()) {
      errors.push({
        type: 'VALIDATION_ERROR',
        sheet: 'Documents',
        row,
        field: 'Document_Type',
        message: 'Document type is required'
      });
      continue;
    }
    
    if (!doc.Document_Number || !doc.Document_Number.trim()) {
      errors.push({
        type: 'VALIDATION_ERROR',
        sheet: 'Documents',
        row,
        field: 'Document_Number',
        message: 'Document number is required'
      });
      continue;
    }
    
    const key = `${doc.Document_Type}_${doc.Document_Number}`;
    if (docMap.has(key)) {
      errors.push({
        type: 'VALIDATION_ERROR',
        sheet: 'Documents',
        row,
        field: 'Document_Number',
        message: `Duplicate document number ${doc.Document_Number}`
      });
    } else {
      docMap.set(key, true);
    }
  }
  
  return errors;
}

module.exports = {
  validateAllDriverData
};
