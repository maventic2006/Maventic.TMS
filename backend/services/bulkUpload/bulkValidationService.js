const validator = require('validator');
const { isValid, parse, parseISO } = require('date-fns');
const knex = require('knex')(require('../../knexfile').development);
const { Country, State, City } = require('country-state-city');

/**
 * Validate all parsed data from Excel
 * @param {Object} parsedData - Parsed data from all sheets
 * @returns {Promise<Object>} Validation results with valid and invalid records
 */
async function validateAllData(parsedData) {
  console.log('🔍 Starting comprehensive validation...\n');
  
  const validationResults = {
    valid: [],
    invalid: [],
    summary: {
      totalTransporters: parsedData.generalDetails.length,
      validCount: 0,
      invalidCount: 0,
      errorBreakdown: {}
    }
  };
  
  // Step 1: Validate relational integrity
  console.log('1️⃣ Validating relational integrity...');
  const relationalErrors = await validateRelationalIntegrity(parsedData);
  
  // Step 2: Validate each transporter
  console.log('2️⃣ Validating individual transporters...');
  
  for (const generalDetail of parsedData.generalDetails) {
    const transporterRefId = generalDetail.Transporter_Ref_ID;
    
    // Get related records
    const transporterData = {
      generalDetails: generalDetail,
      addresses: parsedData.addresses.filter(a => a.Transporter_Ref_ID === transporterRefId),
      contacts: parsedData.contacts.filter(c => c.Transporter_Ref_ID === transporterRefId),
      serviceableAreas: parsedData.serviceableAreas.filter(s => s.Transporter_Ref_ID === transporterRefId),
      documents: parsedData.documents.filter(d => d.Transporter_Ref_ID === transporterRefId)
    };
    
    // Validate this transporter
    const errors = await validateTransporter(transporterData, relationalErrors[transporterRefId] || []);
    
    if (errors.length === 0) {
      // Valid transporter
      validationResults.valid.push({
        transporterRefId,
        data: transporterData
      });
      validationResults.summary.validCount++;
    } else {
      // Invalid transporter
      validationResults.invalid.push({
        transporterRefId,
        data: transporterData,
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
 * @returns {Promise<Object>} Map of transporter ref IDs to relational errors
 */
async function validateRelationalIntegrity(parsedData) {
  const errors = {};
  
  // Get all transporter ref IDs from general details
  const transporterRefIds = new Set(
    parsedData.generalDetails.map(g => g.Transporter_Ref_ID).filter(Boolean)
  );
  
  // Check addresses reference valid transporters
  parsedData.addresses.forEach(address => {
    const refId = address.Transporter_Ref_ID;
    if (refId && !transporterRefIds.has(refId)) {
      if (!errors[refId]) errors[refId] = [];
      errors[refId].push({
        type: 'RELATIONAL_INTEGRITY',
        sheet: 'Addresses',
        row: address._excelRowNumber,
        field: 'Transporter_Ref_ID',
        message: `Address references non-existent transporter "${refId}"`
      });
    }
  });
  
  // Check contacts reference valid transporters
  parsedData.contacts.forEach(contact => {
    const refId = contact.Transporter_Ref_ID;
    if (refId && !transporterRefIds.has(refId)) {
      if (!errors[refId]) errors[refId] = [];
      errors[refId].push({
        type: 'RELATIONAL_INTEGRITY',
        sheet: 'Contacts',
        row: contact._excelRowNumber,
        field: 'Transporter_Ref_ID',
        message: `Contact references non-existent transporter "${refId}"`
      });
    }
    
    // Check contact references valid address type for this transporter
    const transporterAddresses = parsedData.addresses.filter(a => a.Transporter_Ref_ID === refId);
    const addressTypes = new Set(transporterAddresses.map(a => a.Address_Type));
    
    if (contact.Address_Type && !addressTypes.has(contact.Address_Type)) {
      if (!errors[refId]) errors[refId] = [];
      errors[refId].push({
        type: 'RELATIONAL_INTEGRITY',
        sheet: 'Contacts',
        row: contact._excelRowNumber,
        field: 'Address_Type',
        message: `Contact references non-existent address type "${contact.Address_Type}"`
      });
    }
  });
  
  // Check serviceable areas reference valid transporters
  parsedData.serviceableAreas.forEach(area => {
    const refId = area.Transporter_Ref_ID;
    if (refId && !transporterRefIds.has(refId)) {
      if (!errors[refId]) errors[refId] = [];
      errors[refId].push({
        type: 'RELATIONAL_INTEGRITY',
        sheet: 'Serviceable Areas',
        row: area._excelRowNumber,
        field: 'Transporter_Ref_ID',
        message: `Serviceable area references non-existent transporter "${refId}"`
      });
    }
  });
  
  // Check documents reference valid transporters
  parsedData.documents.forEach(doc => {
    const refId = doc.Transporter_Ref_ID;
    if (refId && !transporterRefIds.has(refId)) {
      if (!errors[refId]) errors[refId] = [];
      errors[refId].push({
        type: 'RELATIONAL_INTEGRITY',
        sheet: 'Documents',
        row: doc._excelRowNumber,
        field: 'Transporter_Ref_ID',
        message: `Document references non-existent transporter "${refId}"`
      });
    }
  });
  
  return errors;
}

/**
 * Validate a single transporter with all related data
 * @param {Object} transporterData - All data for one transporter
 * @param {Array} relationalErrors - Pre-identified relational errors
 * @returns {Promise<Array>} Array of validation errors
 */
async function validateTransporter(transporterData, relationalErrors = []) {
  const errors = [...relationalErrors];
  
  // Validate general details
  const generalErrors = validateGeneralDetails(transporterData.generalDetails);
  errors.push(...generalErrors);
  
  // Validate addresses
  const addressErrors = await validateAddresses(transporterData.addresses);
  errors.push(...addressErrors);
  
  // Validate contacts
  const contactErrors = validateContacts(transporterData.contacts);
  errors.push(...contactErrors);
  
  // Validate serviceable areas
  const areaErrors = validateServiceableAreas(transporterData.serviceableAreas);
  errors.push(...areaErrors);
  
  // Validate documents
  const docErrors = validateDocuments(transporterData.documents);
  errors.push(...docErrors);
  
  // Check business rules
  const businessErrors = await validateBusinessRules(transporterData);
  errors.push(...businessErrors);
  
  return errors;
}

/**
 * Validate general details fields
 * @param {Object} generalDetails - General details row
 * @returns {Array} Array of validation errors
 */
function validateGeneralDetails(generalDetails) {
  const errors = [];
  const row = generalDetails._excelRowNumber;
  
  // Required field: Transporter_Ref_ID
  if (!generalDetails.Transporter_Ref_ID || generalDetails.Transporter_Ref_ID.trim() === '') {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'General Details',
      row,
      field: 'Transporter_Ref_ID',
      message: 'Transporter_Ref_ID is required'
    });
  }
  
  // Required field: Business_Name
  if (!generalDetails.Business_Name || generalDetails.Business_Name.trim().length < 2) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'General Details',
      row,
      field: 'Business_Name',
      message: 'Business_Name is required and must be at least 2 characters'
    });
  }
  
  // At least one transport mode must be Y
  const modes = [
    generalDetails.Transport_Mode_Road,
    generalDetails.Transport_Mode_Rail,
    generalDetails.Transport_Mode_Air,
    generalDetails.Transport_Mode_Sea
  ];
  
  const hasAtLeastOneMode = modes.some(mode => 
    mode && (mode.toUpperCase() === 'Y' || mode.toUpperCase() === 'YES')
  );
  
  if (!hasAtLeastOneMode) {
    errors.push({
      type: 'BUSINESS_RULE',
      sheet: 'General Details',
      row,
      field: 'Transport_Mode',
      message: 'At least one transport mode must be Y (Road, Rail, Air, or Sea)'
    });
  }
  
  // Validate From_Date
  if (!generalDetails.From_Date) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'General Details',
      row,
      field: 'From_Date',
      message: 'From_Date is required'
    });
  } else if (!isValidDate(generalDetails.From_Date)) {
    errors.push({
      type: 'INVALID_FORMAT',
      sheet: 'General Details',
      row,
      field: 'From_Date',
      message: 'From_Date must be in YYYY-MM-DD format'
    });
  }
  
  // Validate To_Date (optional, but if present must be valid and after From_Date)
  if (generalDetails.To_Date) {
    if (!isValidDate(generalDetails.To_Date)) {
      errors.push({
        type: 'INVALID_FORMAT',
        sheet: 'General Details',
        row,
        field: 'To_Date',
        message: 'To_Date must be in YYYY-MM-DD format'
      });
    } else if (generalDetails.From_Date && isValidDate(generalDetails.From_Date)) {
      const fromDate = new Date(generalDetails.From_Date);
      const toDate = new Date(generalDetails.To_Date);
      
      if (toDate <= fromDate) {
        errors.push({
          type: 'BUSINESS_RULE',
          sheet: 'General Details',
          row,
          field: 'To_Date',
          message: 'To_Date must be after From_Date'
        });
      }
    }
  }
  
  return errors;
}

/**
 * Validate addresses
 * @param {Array} addresses - Array of address rows
 * @returns {Promise<Array>} Array of validation errors
 */
async function validateAddresses(addresses) {
  const errors = [];
  
  if (addresses.length === 0) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'Addresses',
      message: 'At least one address is required for each transporter'
    });
    return errors;
  }
  
  // Check for at least one primary address
  const primaryAddresses = addresses.filter(a => 
    a.Is_Primary && (a.Is_Primary.toUpperCase() === 'Y' || a.Is_Primary.toUpperCase() === 'YES')
  );
  
  if (primaryAddresses.length === 0) {
    errors.push({
      type: 'BUSINESS_RULE',
      sheet: 'Addresses',
      message: 'At least one address must be marked as primary (Is_Primary = Y)'
    });
  } else if (primaryAddresses.length > 1) {
    errors.push({
      type: 'BUSINESS_RULE',
      sheet: 'Addresses',
      message: 'Only one address can be marked as primary'
    });
  }
  
  // Validate each address
  for (const address of addresses) {
    const row = address._excelRowNumber;
    
    // Required fields
    const requiredFields = ['Address_Type', 'Street_1', 'City', 'State', 'Country', 'Postal_Code'];
    requiredFields.forEach(field => {
      if (!address[field] || address[field].trim() === '') {
        errors.push({
          type: 'REQUIRED_FIELD',
          sheet: 'Addresses',
          row,
          field,
          message: `${field} is required`
        });
      }
    });
    
    // Validate country code
    if (address.Country) {
      const countryExists = Country.getAllCountries().some(c => c.isoCode === address.Country.toUpperCase());
      if (!countryExists) {
        errors.push({
          type: 'INVALID_FORMAT',
          sheet: 'Addresses',
          row,
          field: 'Country',
          message: `Invalid country code: ${address.Country}`
        });
      }
    }
    
    // Validate state against country
    if (address.Country && address.State) {
      const states = State.getStatesOfCountry(address.Country.toUpperCase());
      const stateExists = states.some(s => 
        s.name.toLowerCase() === address.State.toLowerCase() ||
        s.isoCode.toLowerCase() === address.State.toLowerCase()
      );
      
      if (!stateExists) {
        errors.push({
          type: 'MASTER_DATA_MISMATCH',
          sheet: 'Addresses',
          row,
          field: 'State',
          message: `State "${address.State}" not found for country "${address.Country}"`
        });
      }
    }
  }
  
  return errors;
}

/**
 * Validate contacts
 * @param {Array} contacts - Array of contact rows
 * @returns {Array} Array of validation errors
 */
function validateContacts(contacts) {
  const errors = [];
  
  if (contacts.length === 0) {
    errors.push({
      type: 'REQUIRED_FIELD',
      sheet: 'Contacts',
      message: 'At least one contact is required for each transporter'
    });
    return errors;
  }
  
  // Validate each contact
  for (const contact of contacts) {
    const row = contact._excelRowNumber;
    
    // Required fields
    if (!contact.Contact_Person_Name || contact.Contact_Person_Name.trim() === '') {
      errors.push({
        type: 'REQUIRED_FIELD',
        sheet: 'Contacts',
        row,
        field: 'Contact_Person_Name',
        message: 'Contact_Person_Name is required'
      });
    }
    
    // Phone number (required)
    if (!contact.Phone_Number || contact.Phone_Number.trim() === '') {
      errors.push({
        type: 'REQUIRED_FIELD',
        sheet: 'Contacts',
        row,
        field: 'Phone_Number',
        message: 'Phone_Number is required'
      });
    } else if (!isValidPhoneNumber(contact.Phone_Number)) {
      errors.push({
        type: 'INVALID_FORMAT',
        sheet: 'Contacts',
        row,
        field: 'Phone_Number',
        message: 'Phone_Number must be in format +[country code][number] (e.g., +919876543210)'
      });
    }
    
    // Email (required)
    if (!contact.Email_ID || contact.Email_ID.trim() === '') {
      errors.push({
        type: 'REQUIRED_FIELD',
        sheet: 'Contacts',
        row,
        field: 'Email_ID',
        message: 'Email_ID is required'
      });
    } else if (!validator.isEmail(contact.Email_ID)) {
      errors.push({
        type: 'INVALID_FORMAT',
        sheet: 'Contacts',
        row,
        field: 'Email_ID',
        message: 'Email_ID must be a valid email address'
      });
    }
    
    // Alt email (optional, but if present must be valid)
    if (contact.Alt_Email_ID && !validator.isEmail(contact.Alt_Email_ID)) {
      errors.push({
        type: 'INVALID_FORMAT',
        sheet: 'Contacts',
        row,
        field: 'Alt_Email_ID',
        message: 'Alt_Email_ID must be a valid email address'
      });
    }
  }
  
  return errors;
}

/**
 * Validate serviceable areas
 * @param {Array} areas - Array of serviceable area rows
 * @returns {Array} Array of validation errors
 */
function validateServiceableAreas(areas) {
  const errors = [];
  
  // Serviceable areas are optional, but if present must be valid
  if (areas.length === 0) {
    return errors;
  }
  
  const countrySet = new Set();
  
  for (const area of areas) {
    const row = area._excelRowNumber;
    
    // Required fields
    if (!area.Service_Country || area.Service_Country.trim() === '') {
      errors.push({
        type: 'REQUIRED_FIELD',
        sheet: 'Serviceable Areas',
        row,
        field: 'Service_Country',
        message: 'Service_Country is required'
      });
    } else {
      // Check for duplicate countries
      if (countrySet.has(area.Service_Country)) {
        errors.push({
          type: 'DUPLICATE_DATA',
          sheet: 'Serviceable Areas',
          row,
          field: 'Service_Country',
          message: `Duplicate country: ${area.Service_Country}`
        });
      }
      countrySet.add(area.Service_Country);
      
      // Validate country code
      const countryExists = Country.getAllCountries().some(c => c.isoCode === area.Service_Country.toUpperCase());
      if (!countryExists) {
        errors.push({
          type: 'INVALID_FORMAT',
          sheet: 'Serviceable Areas',
          row,
          field: 'Service_Country',
          message: `Invalid country code: ${area.Service_Country}`
        });
      }
    }
    
    // Service_States required
    if (!area.Service_States || area.Service_States.trim() === '') {
      errors.push({
        type: 'REQUIRED_FIELD',
        sheet: 'Serviceable Areas',
        row,
        field: 'Service_States',
        message: 'Service_States is required (comma-separated list)'
      });
    }
  }
  
  return errors;
}

/**
 * Validate documents
 * @param {Array} documents - Array of document rows
 * @returns {Array} Array of validation errors
 */
function validateDocuments(documents) {
  const errors = [];
  
  // Documents are optional for bulk upload
  if (documents.length === 0) {
    return errors;
  }
  
  for (const doc of documents) {
    const row = doc._excelRowNumber;
    
    // Required fields
    const requiredFields = ['Document_Type', 'Document_Name', 'Document_Number', 'Issue_Date', 'Issuing_Country'];
    requiredFields.forEach(field => {
      if (!doc[field] || doc[field].trim() === '') {
        errors.push({
          type: 'REQUIRED_FIELD',
          sheet: 'Documents',
          row,
          field,
          message: `${field} is required`
        });
      }
    });
    
    // Validate dates
    if (doc.Issue_Date && !isValidDate(doc.Issue_Date)) {
      errors.push({
        type: 'INVALID_FORMAT',
        sheet: 'Documents',
        row,
        field: 'Issue_Date',
        message: 'Issue_Date must be in YYYY-MM-DD format'
      });
    }
    
    if (doc.Expiry_Date && !isValidDate(doc.Expiry_Date)) {
      errors.push({
        type: 'INVALID_FORMAT',
        sheet: 'Documents',
        row,
        field: 'Expiry_Date',
        message: 'Expiry_Date must be in YYYY-MM-DD format'
      });
    }
  }
  
  return errors;
}

/**
 * Validate business rules
 * @param {Object} transporterData - All data for one transporter
 * @returns {Promise<Array>} Array of validation errors
 */
async function validateBusinessRules(transporterData) {
  const errors = [];
  
  // Check for duplicate business name in database
  const businessName = transporterData.generalDetails.Business_Name;
  if (businessName) {
    const existing = await knex('transporter_general_info')
      .where({ business_name: businessName })
      .first();
    
    if (existing) {
      errors.push({
        type: 'DUPLICATE_DATA',
        sheet: 'General Details',
        row: transporterData.generalDetails._excelRowNumber,
        field: 'Business_Name',
        message: `Business name "${businessName}" already exists in the system`
      });
    }
  }
  
  // Check for duplicate primary email
  const primaryContact = transporterData.contacts[0];
  if (primaryContact && primaryContact.Email_ID) {
    const existing = await knex('transporter_contact')
      .where({ email_id: primaryContact.Email_ID })
      .first();
    
    if (existing) {
      errors.push({
        type: 'DUPLICATE_DATA',
        sheet: 'Contacts',
        row: primaryContact._excelRowNumber,
        field: 'Email_ID',
        message: `Email "${primaryContact.Email_ID}" already exists in the system`
      });
    }
  }
  
  return errors;
}

/**
 * Validate date string
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid date
 */
function isValidDate(dateStr) {
  if (!dateStr) return false;
  
  // Try parsing as ISO date (YYYY-MM-DD)
  const date = parseISO(String(dateStr));
  return isValid(date);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
function isValidPhoneNumber(phone) {
  if (!phone) return false;
  
  // Must start with + followed by country code and number
  const phoneRegex = /^\+\d{10,15}$/;
  return phoneRegex.test(phone.trim());
}

module.exports = {
  validateAllData,
  validateRelationalIntegrity,
  validateTransporter,
  validateGeneralDetails,
  validateAddresses,
  validateContacts,
  validateServiceableAreas,
  validateDocuments,
  validateBusinessRules
};