// Document Number Validation Patterns for Frontend

export const documentValidationPatterns = {
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
  "GST Certificate": {
    regex: /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]\d$/,
    format: "07ABCDE1234F1Z5",
    description:
      "2 digits + 10 PAN characters + 1 digit + 1 letter/digit + 1 checksum digit",
  },
  "GSTIN Document": {
    regex: /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]\d$/,
    format: "07ABCDE1234F1Z5",
    description:
      "2 digits + 10 PAN characters + 1 digit + 1 letter/digit + 1 checksum digit",
  },
  "VAT Certificate": {
    regex: /^[A-Z0-9]{8,15}$/,
    format: "VAT12345678",
    description: "8-15 alphanumeric characters",
  },
  "Driving License": {
    regex: /^[A-Z]{2}[0-9]{2}[0-9]{11}$/,
    format: "DL0120230012345",
    description:
      "State Code (2 letters) + RTO Code (2 digits) + Issue Year (4 digits) + Unique Number (7 digits)",
  },
  "Driver License": {
    regex: /^[A-Z]{2}[0-9]{2}[0-9]{11}$/,
    format: "DL0120230012345",
    description:
      "State Code (2 letters) + RTO Code (2 digits) + Issue Year (4 digits) + Unique Number (7 digits)",
  },
  License: {
    regex: /^[A-Z]{2}[0-9]{2}[0-9]{11}$/,
    format: "DL0120230012345",
    description:
      "State Code (2 letters) + RTO Code (2 digits) + Issue Year (4 digits) + Unique Number (7 digits)",
  },
};

// Document type name aliases - maps backend names to validation pattern keys
export const documentTypeAliases = {
  // PAN variations
  "PAN/TIN": "PAN Card",
  Pan: "PAN Card",
  PAN: "PAN Card",
  pan: "PAN Card",

  // Aadhar variations
  Aadhar: "Aadhar Card",
  AADHAR: "Aadhar Card",
  aadhar: "Aadhar Card",
  Aadhaar: "Aadhar Card",

  // TAN variations
  tan: "TAN",

  // GST variations
  GST: "GST Certificate",
  gst: "GST Certificate",
  GSTIN: "GSTIN Document",

  // VAT variations
  VAT: "VAT Certificate",
  vat: "VAT Certificate",

  // License variations
  "Driving License": "Driving License",
  "Driver License": "Driver License",
  License: "License",
  license: "License",
  DL: "Driving License",
};

/**
 * Validates a document number based on its document type
 * @param {string} documentNumber - The document number to validate
 * @param {string} documentTypeName - The name of the document type (e.g., 'PAN Card', 'PAN/TIN', 'Pan')
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateDocumentNumber = (documentNumber, documentTypeName) => {
  if (!documentNumber || !documentTypeName) {
    return {
      isValid: false,
      message: "Document number and type are required",
    };
  }

  // Trim and convert to uppercase for consistent validation
  const cleanedNumber = documentNumber.trim().toUpperCase();

  // Normalize the document type name using aliases
  let normalizedTypeName = documentTypeName;
  if (documentTypeAliases[documentTypeName]) {
    normalizedTypeName = documentTypeAliases[documentTypeName];
  }

  // Get validation pattern for this document type
  const pattern = documentValidationPatterns[normalizedTypeName];

  // If no specific pattern exists (for 'Any License', 'Any Agreement Document', etc.)
  // just check basic alphanumeric with common special characters
  if (!pattern) {
    const basicRegex = /^[A-Z0-9\/-]+$/; // Uppercase check after normalization
    if (!basicRegex.test(cleanedNumber)) {
      return {
        isValid: false,
        message: `${documentTypeName} number should contain only letters, numbers, hyphens, and forward slashes`,
      };
    }
    return { isValid: true, message: "" };
  }

  // Validate against specific pattern (using cleaned uppercase number)
  if (!pattern.regex.test(cleanedNumber)) {
    return {
      isValid: false,
      message: `${documentTypeName} number is invalid. Expected format: ${pattern.format}`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Get expected format for a document type
 * @param {string} documentTypeName - The name of the document type
 * @returns {string} - Expected format description
 */
export const getDocumentFormat = (documentTypeName) => {
  const pattern = documentValidationPatterns[documentTypeName];
  return pattern ? pattern.format : "Alphanumeric with hyphens and slashes";
};
