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
    format: "ASDF1234N",
    description: "4 letters + 5 digits + 1 letter",
  },
  "GST Certificate": {
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
};

/**
 * Validates a document number based on its document type
 * @param {string} documentNumber - The document number to validate
 * @param {string} documentTypeName - The name of the document type (e.g., 'PAN Card', 'TAN')
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateDocumentNumber = (documentNumber, documentTypeName) => {
  if (!documentNumber || !documentTypeName) {
    return {
      isValid: false,
      message: "Document number and type are required",
    };
  }

  // Get validation pattern for this document type
  const pattern = documentValidationPatterns[documentTypeName];

  // If no specific pattern exists (for 'Any License', 'Any Agreement Document', etc.)
  // just check basic alphanumeric with common special characters
  if (!pattern) {
    const basicRegex = /^[A-Z0-9\/-]+$/;
    if (!basicRegex.test(documentNumber)) {
      return {
        isValid: false,
        message: `${documentTypeName} number should contain only uppercase letters, numbers, hyphens, and forward slashes`,
      };
    }
    return { isValid: true, message: "" };
  }

  // Validate against specific pattern
  if (!pattern.regex.test(documentNumber)) {
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
