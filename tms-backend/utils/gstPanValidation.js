/**
 * GST-PAN Validation Utility (Backend)
 * Validates GST number format and ensures PAN card match
 */

// GST State Code Mapping
const GST_STATE_CODES = {
  "Andaman and Nicobar Islands": "35",
  "Chandigarh": "04",
  "Dadra and Nagar Haveli and Daman and Diu": "26",
  "Delhi": "07",
  "Jammu and Kashmir": "01",
  "Ladakh": "38",
  "Lakshadweep": "31",
  "Puducherry": "34",
  "Andhra Pradesh": "37",
  "Arunachal Pradesh": "12",
  "Assam": "18",
  "Bihar": "10",
  "Chhattisgarh": "22",
  "Goa": "30",
  "Gujarat": "24",
  "Haryana": "06",
  "Himachal Pradesh": "02",
  "Jharkhand": "20",
  "Karnataka": "29",
  "Kerala": "32",
  "Madhya Pradesh": "23",
  "Maharashtra": "27",
  "Manipur": "14",
  "Meghalaya": "17",
  "Mizoram": "15",
  "Nagaland": "13",
  "Odisha": "21",
  "Punjab": "03",
  "Rajasthan": "08",
  "Sikkim": "11",
  "Tamil Nadu": "33",
  "Telangana": "36",
  "Tripura": "16",
  "Uttar Pradesh": "09",
  "Uttarakhand": "05",
  "West Bengal": "19",
  "NCT of Delhi": "07",
  "Dadra & Nagar Haveli and Daman & Diu": "26",
  "Andaman & Nicobar Islands": "35",
};

const getGSTStateCode = (stateName) => {
  if (!stateName) return null;
  if (GST_STATE_CODES[stateName]) return GST_STATE_CODES[stateName];
  
  const normalizedStateName = stateName.trim();
  const matchedState = Object.keys(GST_STATE_CODES).find(
    (key) => key.toLowerCase() === normalizedStateName.toLowerCase()
  );
  
  return matchedState ? GST_STATE_CODES[matchedState] : null;
};

/**
 * Validate GST number format
 * @param {string} gstNumber - The GST number to validate
 * @returns {object} - Validation result
 */
const validateGSTFormat = (gstNumber) => {
  if (!gstNumber) {
    return {
      isValid: false,
      error: 'GST number is required'
    };
  }

  const cleanGST = gstNumber.trim().toUpperCase();

  if (cleanGST.length !== 15) {
    return {
      isValid: false,
      error: 'GST number must be exactly 15 characters'
    };
  }

  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  if (!gstRegex.test(cleanGST)) {
    return {
      isValid: false,
      error: 'Invalid GST number format. Expected format: 27ABCDE1234F1Z5'
    };
  }

  return {
    isValid: true,
    stateCode: cleanGST.substring(0, 2),
    panNumber: cleanGST.substring(2, 12),
    entityCode: cleanGST.substring(12, 13),
    defaultChar: cleanGST.substring(13, 14),
    checkDigit: cleanGST.substring(14, 15)
  };
};

/**
 * Validate GST number against PAN card and state
 * @param {string} gstNumber - The GST number (VAT number in address)
 * @param {string} panNumber - The PAN number from documents
 * @param {string} stateName - The state name from address
 * @returns {object} - Validation result
 */
const validateGSTPAN = (gstNumber, panNumber, stateName) => {
  const formatValidation = validateGSTFormat(gstNumber);
  if (!formatValidation.isValid) {
    return formatValidation;
  }

  const cleanGST = gstNumber.trim().toUpperCase();
  const cleanPAN = panNumber ? panNumber.trim().toUpperCase() : '';
  const panFromGST = cleanGST.substring(2, 12);

  if (!cleanPAN) {
    return {
      isValid: false,
      error: 'PAN card document is mandatory for GST validation',
      field: 'documents',
      code: 'PAN_REQUIRED'
    };
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(cleanPAN)) {
    return {
      isValid: false,
      error: 'Invalid PAN card format. Expected format: ABCDE1234F',
      field: 'documents',
      code: 'INVALID_PAN_FORMAT'
    };
  }

  if (panFromGST !== cleanPAN) {
    return {
      isValid: false,
      error: `GST number PAN (${panFromGST}) does not match PAN card number (${cleanPAN})`,
      field: 'vatNumber',
      code: 'PAN_MISMATCH'
    };
  }

  if (stateName) {
    const expectedStateCode = getGSTStateCode(stateName);
    const actualStateCode = cleanGST.substring(0, 2);

    if (expectedStateCode && actualStateCode !== expectedStateCode) {
      return {
        isValid: false,
        error: `GST state code (${actualStateCode}) does not match selected state ${stateName} (expected: ${expectedStateCode})`,
        field: 'vatNumber',
        code: 'STATE_CODE_MISMATCH'
      };
    }
  }

  return {
    isValid: true,
    message: 'GST-PAN validation successful'
  };
};

/**
 * Extract PAN number from GST number
 * @param {string} gstNumber - The GST number
 * @returns {string|null} - The extracted PAN number or null
 */
const extractPANFromGST = (gstNumber) => {
  if (!gstNumber || gstNumber.length < 12) return null;
  return gstNumber.substring(2, 12).toUpperCase();
};

module.exports = {
  validateGSTFormat,
  validateGSTPAN,
  extractPANFromGST,
  getGSTStateCode,
};
