/**
 * GST-PAN Validation Utility
 * Validates GST number format and ensures PAN card match
 */

import { getGSTStateCode } from './gstStateCodeMapping';

/**
 * Validate GST number format
 * Format: [2-digit state code][10-char PAN][1-digit entity][Z][1-char checksum]
 * Total: 15 characters
 * Example: 27ABCDE1234F1Z5
 * 
 * @param {string} gstNumber - The GST number to validate
 * @returns {object} - Validation result with isValid flag and error message
 */
export const validateGSTFormat = (gstNumber) => {
  if (!gstNumber) {
    return {
      isValid: false,
      error: 'GST number is required'
    };
  }

  // Remove whitespace and convert to uppercase
  const cleanGST = gstNumber.trim().toUpperCase();

  // Check length
  if (cleanGST.length !== 15) {
    return {
      isValid: false,
      error: 'GST number must be exactly 15 characters'
    };
  }

  // GST Format Regex:
  // ^[0-9]{2}         - 2 digits for state code
  // [A-Z]{5}          - 5 letters (first 5 chars of PAN)
  // [0-9]{4}          - 4 digits (next 4 chars of PAN)
  // [A-Z]{1}          - 1 letter (last char of PAN)
  // [1-9A-Z]{1}       - 1 character for entity code (1-9 or A-Z)
  // Z                 - Fixed character 'Z'
  // [0-9A-Z]{1}$      - 1 character for check digit
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
 * 
 * @param {string} gstNumber - The GST number (VAT number in address)
 * @param {string} panNumber - The PAN number from documents
 * @param {string} stateName - The state name from address
 * @returns {object} - Validation result with isValid flag and detailed error
 */
export const validateGSTPAN = (gstNumber, panNumber, stateName) => {
  // Validate GST format first
  const formatValidation = validateGSTFormat(gstNumber);
  if (!formatValidation.isValid) {
    return formatValidation;
  }

  const cleanGST = gstNumber.trim().toUpperCase();
  const cleanPAN = panNumber ? panNumber.trim().toUpperCase() : '';

  // Extract PAN from GST (positions 3-12, 0-indexed: 2-11)
  const panFromGST = cleanGST.substring(2, 12);

  // Validate PAN number exists
  if (!cleanPAN) {
    return {
      isValid: false,
      error: 'PAN card document is mandatory for GST validation',
      field: 'documents',
      code: 'PAN_REQUIRED'
    };
  }

  // Validate PAN format (10 characters: 5 letters + 4 digits + 1 letter)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(cleanPAN)) {
    return {
      isValid: false,
      error: 'Invalid PAN card format. Expected format: ABCDE1234F',
      field: 'documents',
      code: 'INVALID_PAN_FORMAT'
    };
  }

  // Check if PAN from GST matches actual PAN
  if (panFromGST !== cleanPAN) {
    return {
      isValid: false,
      error: `GST number PAN (${panFromGST}) does not match PAN card number (${cleanPAN})`,
      field: 'vatNumber',
      code: 'PAN_MISMATCH'
    };
  }

  // Validate state code matches
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

    if (!expectedStateCode) {
      console.warn(`⚠️ GST state code not found for state: ${stateName}`);
      // Don't fail validation, just warn
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
export const extractPANFromGST = (gstNumber) => {
  if (!gstNumber || gstNumber.length < 12) return null;
  return gstNumber.substring(2, 12).toUpperCase();
};
