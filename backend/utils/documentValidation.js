// Document Number Validation Patterns and Helpers

const documentValidationPatterns = {
  "PAN Card": {
    regex: /^[A-Z]{5}\d{4}[A-Z]$/,
    format: "ABCDE1234F",
    description: "5 letters + 4 digits + 1 letter",
  },
  "Aadhar Card": {
    regex: /^\d{12}$/,
    format: "123456789012",
    description: "12 digits",
  },
  TAN: {
    regex: /^[A-Z]{4}\d{5}[A-Z]$/,
    format: "ASDF12345N",
    description: "4 letters + 5 digits + 1 letter",
  },
  "GSTIN Document": {
    regex: /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]\d$/,
    format: "07ABCDE1234F1Z5",
    description:
      "2 digits + 5 letters + 4 digits + 1 letter + 1 digit + 1 letter/digit + 1 checksum digit (15 characters total)",
  },
  "GST Certificate": {
    regex: /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]\d$/,
    format: "07ABCDE1234F1Z5",
    description:
      "2 digits + 5 letters + 4 digits + 1 letter + 1 digit + 1 letter/digit + 1 checksum digit (15 characters total)",
  },
  "VAT Certificate": {
    regex: /^[A-Z0-9]{8,15}$/,
    format: "VAT12345678",
    description: "8-15 alphanumeric characters",
  },
  "PUC certificate": {
    regex: /^[A-Z0-9\/-]{6,20}$/,
    format: "PUC123456",
    description: "6-20 alphanumeric characters with hyphens/slashes allowed",
  },
  "Permit certificate": {
    regex: /^[A-Z0-9\/-]{6,20}$/,
    format: "PERMIT123456",
    description: "6-20 alphanumeric characters with hyphens/slashes allowed",
  },
  "Vehicle Insurance": {
    regex: /^[A-Z0-9\/-]{6,25}$/,
    format: "INS123456789",
    description: "6-25 alphanumeric characters with hyphens/slashes allowed",
  },
  "Contact Person ID Proof": {
    regex: /^[A-Z0-9\/-]{6,20}$/,
    format: "ID123456",
    description: "6-20 alphanumeric characters with hyphens/slashes allowed",
  },
  "Driving License": {
    regex: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,}$/,
    format: "DL0120230012345 or MP13T20134564563",
    description:
      "State Code (2 letters) + RTO Code (2 digits) + Alphanumeric sequence (11+ characters)",
  },
  "Driver License": {
    regex: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,}$/,
    format: "DL0120230012345 or MP13T20134564563",
    description:
      "State Code (2 letters) + RTO Code (2 digits) + Alphanumeric sequence (11+ characters)",
  },
};

/**
 * Validates a document number based on its document type
 * @param {string} documentNumber - The document number to validate
 * @param {string} documentType - The type of document (e.g., 'PAN Card', 'TAN')
 * @returns {object} - { isValid: boolean, message: string }
 */
const validateDocumentNumber = (documentNumber, documentType) => {
  if (!documentNumber || !documentType) {
    return {
      isValid: false,
      message: "Document number and type are required",
    };
  }

  // Trim whitespace and convert to uppercase for validation
  const cleanedNumber = documentNumber.trim().toUpperCase();

  // Get validation pattern for this document type
  const pattern = documentValidationPatterns[documentType];

  // If no specific pattern exists (for 'Any License', 'Any Agreement Document', etc.)
  // just check basic alphanumeric with common special characters
  if (!pattern) {
    const basicRegex = /^[A-Z0-9\/-]+$/;
    if (!basicRegex.test(cleanedNumber)) {
      return {
        isValid: false,
        message: `${documentType} number should contain only uppercase letters, numbers, hyphens, and forward slashes`,
      };
    }
    return { isValid: true, message: "" };
  }

  // Validate against specific pattern
  if (!pattern.regex.test(cleanedNumber)) {
    return {
      isValid: false,
      message: `${documentType} number is invalid. Expected format: ${pattern.format}`,
      format: pattern.format,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Get expected format for a document type
 * @param {string} documentType - The type of document
 * @returns {string} - Expected format description
 */
const getDocumentFormat = (documentType) => {
  const pattern = documentValidationPatterns[documentType];
  return pattern ? pattern.format : "Alphanumeric with hyphens and slashes";
};

module.exports = {
  validateDocumentNumber,
  getDocumentFormat,
  documentValidationPatterns,
};
