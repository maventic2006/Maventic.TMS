import { z } from "zod";
import { ERROR_MESSAGES } from "../../utils/constants";
import { validateDocumentNumber } from "../../utils/documentValidation";
import { validateGSTPAN } from "../../utils/gstPanValidation";

// Phone number validation - accepts formats with or without + prefix
const phoneNumberSchema = z
  .string()
  .min(1, ERROR_MESSAGES.PHONE_NUMBER_REQUIRED)
  .refine((val) => {
    // Allow exactly 10 digits only (starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(val);
  }, ERROR_MESSAGES.PHONE_NUMBER_INVALID);

// Email validation
const emailSchema = z
  .string()
  .min(1, ERROR_MESSAGES.EMAIL_REQUIRED)
  .email(ERROR_MESSAGES.EMAIL_INVALID);

// VAT number validation by country
const validateVATNumber = (vatNumber, country) => {
  const vatPatterns = {
    IN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    US: /^[0-9]{2}-[0-9]{7}$/,
    GB: /^GB[0-9]{9}$/,
    DE: /^DE[0-9]{9}$/,
    FR: /^FR[A-Z0-9]{2}[0-9]{9}$/,
  };

  const pattern = vatPatterns[country];
  return pattern ? pattern.test(vatNumber) : /^[A-Z0-9]{8,15}$/.test(vatNumber);
};

// General Details Schema
export const generalDetailsSchema = z
  .object({
    businessName: z
      .string()
      .min(2, ERROR_MESSAGES.BUSINESS_NAME_TOO_SHORT)
      .max(100, ERROR_MESSAGES.BUSINESS_NAME_TOO_LONG)
      .trim(),
    fromDate: z
      .string()
      .min(1, ERROR_MESSAGES.FROM_DATE_REQUIRED)
      .refine((date) => {
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate <= today;
      }, ERROR_MESSAGES.FROM_DATE_FUTURE),
    toDate: z
      .string()
      .optional()
      .refine((date) => {
        if (!date) return true;
        return new Date(date) > new Date();
      }, ERROR_MESSAGES.TO_DATE_FUTURE),
    avgRating: z
      .number()
      .min(0, ERROR_MESSAGES.RATING_INVALID)
      .max(5, ERROR_MESSAGES.RATING_INVALID)
      .default(0),
    transMode: z
      .object({
        road: z.boolean().default(false),
        rail: z.boolean().default(false),
        air: z.boolean().default(false),
        sea: z.boolean().default(false),
      })
      .refine(
        (modes) => Object.values(modes).some(Boolean),
        ERROR_MESSAGES.TRANSPORT_MODE_REQUIRED
      ),
    activeFlag: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.fromDate && data.toDate) {
        return new Date(data.toDate) > new Date(data.fromDate);
      }
      return true;
    },
    {
      message: ERROR_MESSAGES.TO_DATE_BEFORE_FROM,
      path: ["toDate"],
    }
  );

// Contact Schema
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, ERROR_MESSAGES.CONTACT_NAME_TOO_SHORT)
    .max(50, ERROR_MESSAGES.CONTACT_NAME_TOO_LONG)
    .regex(/^[a-zA-Z\s]+$/, ERROR_MESSAGES.CONTACT_NAME_INVALID)
    .trim(),
  role: z.string().optional(),
  phoneNumber: phoneNumberSchema,
  alternatePhoneNumber: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === "") return true;
      const phoneRegex = /^[6-9]\d{9}$/;
      return phoneRegex.test(phone);
    }, ERROR_MESSAGES.ALTERNATE_PHONE_INVALID),
  email: emailSchema,
  alternateEmail: z
    .string()
    .optional()
    .refine((email) => {
      if (!email || email.trim() === "") return true;
      return z.string().email().safeParse(email).success;
    }, ERROR_MESSAGES.ALTERNATE_EMAIL_INVALID),
  whatsappNumber: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === "") return true;
      const phoneRegex = /^[6-9]\d{9}$/;
      return phoneRegex.test(phone);
    }, ERROR_MESSAGES.WHATSAPP_NUMBER_INVALID),
});

// Address Schema
export const addressSchema = z.object({
  vatNumber: z
    .string()
    .min(8, ERROR_MESSAGES.VAT_NUMBER_TOO_SHORT)
    .max(15, ERROR_MESSAGES.VAT_NUMBER_TOO_LONG)
    .regex(/^[A-Z0-9]{8,15}$/, ERROR_MESSAGES.VAT_NUMBER_INVALID),
  country: z.string().min(1, ERROR_MESSAGES.COUNTRY_REQUIRED),
  state: z.string().min(1, ERROR_MESSAGES.STATE_REQUIRED),
  city: z.string().min(1, ERROR_MESSAGES.CITY_REQUIRED),
  street1: z.string().optional(),
  street2: z.string().optional(),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  isPrimary: z.boolean().default(false),
  contacts: z.array(contactSchema).min(1, ERROR_MESSAGES.CONTACT_REQUIRED),
});

// Serviceable Area Schema
export const serviceableAreaSchema = z.object({
  country: z.string().min(1, ERROR_MESSAGES.SERVICEABLE_COUNTRY_REQUIRED),
  states: z
    .array(z.string())
    .min(1, ERROR_MESSAGES.SERVICEABLE_STATES_REQUIRED),
});

// Document Schema
export const documentSchema = z
  .object({
    documentType: z.string().min(1, ERROR_MESSAGES.DOCUMENT_TYPE_REQUIRED),
    documentNumber: z.string().min(1, ERROR_MESSAGES.DOCUMENT_NUMBER_REQUIRED),
    referenceNumber: z.string().optional(),
    country: z.string().min(1, ERROR_MESSAGES.DOCUMENT_COUNTRY_REQUIRED),
    validFrom: z
      .string()
      .min(1, ERROR_MESSAGES.DOCUMENT_VALID_FROM_REQUIRED)
      .refine((date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate <= today;
      }, ERROR_MESSAGES.DOCUMENT_VALID_FROM_FUTURE),
    validTo: z.string().min(1, ERROR_MESSAGES.DOCUMENT_VALID_TO_REQUIRED),
    status: z.boolean().default(true),
    fileName: z.string().optional(),
    fileType: z.string().optional(),
    fileData: z.string().optional(), // base64 encoded file data
  })
  .refine(
    (data) => {
      const validFrom = new Date(data.validFrom);
      const validTo = new Date(data.validTo);
      return validTo > validFrom;
    },
    {
      message: ERROR_MESSAGES.DOCUMENT_VALID_TO_BEFORE_FROM,
      path: ["validTo"],
    }
  )
  .refine(
    (data) => {
      // Validate document number format based on document type
      const validation = validateDocumentNumber(
        data.documentNumber,
        data.documentType
      );
      return validation.isValid;
    },
    (data) => {
      const validation = validateDocumentNumber(
        data.documentNumber,
        data.documentType
      );
      return {
        message: validation.message,
        path: ["documentNumber"],
      };
    }
  );

// Complete Transporter Schema
export const createTransporterSchema = z.object({
  generalDetails: generalDetailsSchema,
  addresses: z
    .array(addressSchema)
    .min(1, ERROR_MESSAGES.ADDRESS_REQUIRED)
    .refine((addresses) => {
      // Check for duplicate VAT numbers
      const vatNumbers = addresses.map((addr) => addr.vatNumber);
      const uniqueVATNumbers = [...new Set(vatNumbers)];
      return vatNumbers.length === uniqueVATNumbers.length;
    }, ERROR_MESSAGES.VAT_NUMBER_DUPLICATE),
  serviceableAreas: z
    .array(serviceableAreaSchema)
    .min(1, ERROR_MESSAGES.SERVICEABLE_AREA_REQUIRED)
    .refine((areas) => {
      // Check for duplicate countries
      const countries = areas.map((area) => area.country);
      const uniqueCountries = [...new Set(countries)];
      return countries.length === uniqueCountries.length;
    }, ERROR_MESSAGES.SERVICEABLE_AREA_DUPLICATE),
  documents: z
    .array(documentSchema)
    .min(1, ERROR_MESSAGES.DOCUMENT_REQUIRED)
    .refine((documents) => {
      // Check for duplicate document numbers within same type
      const docMap = new Map();
      for (const doc of documents) {
        const key = `${doc.documentType}_${doc.documentNumber}`;
        if (docMap.has(key)) {
          return false;
        }
        docMap.set(key, true);
      }
      return true;
    }, ERROR_MESSAGES.DOCUMENT_DUPLICATE),
});

// Validation helper functions
export const validateFormSection = (sectionName, formData) => {
  const errors = {};

  try {
    switch (sectionName) {
      case "generalDetails": {
        const result = generalDetailsSchema.safeParse(formData.generalDetails);
        if (!result.success && result.error && result.error.errors) {
          result.error.errors.forEach((err) => {
            const field = err.path.join(".");
            errors[field] = err.message;
          });
        }
        break;
      }

      case "addresses": {
        const addresses = formData.addresses || [];
        if (addresses.length === 0) {
          errors._general = ERROR_MESSAGES.ADDRESS_REQUIRED;
        } else {
          addresses.forEach((address, index) => {
            const result = addressSchema.safeParse(address);
            if (!result.success && result.error && result.error.errors) {
              result.error.errors.forEach((err) => {
                const field = err.path.join(".");
                if (!errors[index]) errors[index] = {};
                errors[index][field] = err.message;
              });
            }
          });
        }
        break;
      }

      case "serviceableAreas": {
        const areas = formData.serviceableAreas || [];
        if (areas.length === 0) {
          errors._general = ERROR_MESSAGES.SERVICEABLE_AREA_REQUIRED;
        } else {
          // Check for duplicate countries
          const countries = areas.map((area) => area.country);
          const uniqueCountries = [...new Set(countries)];
          if (countries.length !== uniqueCountries.length) {
            errors._general = ERROR_MESSAGES.SERVICEABLE_AREA_DUPLICATE;
          }

          areas.forEach((area, index) => {
            const result = serviceableAreaSchema.safeParse(area);
            if (!result.success && result.error && result.error.errors) {
              result.error.errors.forEach((err) => {
                const field = err.path.join(".");
                if (!errors[index]) errors[index] = {};
                errors[index][field] = err.message;
              });
            }
          });
        }
        break;
      }

      case "documents": {
        const documents = formData.documents || [];
        if (documents.length === 0) {
          errors._general = ERROR_MESSAGES.DOCUMENT_REQUIRED;
        } else {
          // Check for duplicate document numbers within same type
          const docMap = new Map();
          documents.forEach((doc, index) => {
            const key = `${doc.documentType}_${doc.documentNumber}`;
            if (docMap.has(key)) {
              if (!errors[index]) errors[index] = {};
              errors[index].documentNumber = ERROR_MESSAGES.DOCUMENT_DUPLICATE;
            }
            docMap.set(key, true);
          });

          documents.forEach((doc, index) => {
            const result = documentSchema.safeParse(doc);
            if (!result.success && result.error && result.error.errors) {
              result.error.errors.forEach((err) => {
                const field = err.path.join(".");
                if (!errors[index]) errors[index] = {};
                errors[index][field] = err.message;
              });
            }
          });
        }
        break;
      }

      default:
        errors._general = "Unknown section";
    }
  } catch (error) {
    console.error(`Validation error in ${sectionName}:`, error);
    errors._general = "Validation failed";
  }

  return errors;
};

// Custom validation for VAT number based on country
export const validateVATForCountry = (vatNumber, country) => {
  if (!vatNumber || !country) return false;
  return validateVATNumber(vatNumber, country);
};

// File validation for document uploads
export const validateFileUpload = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!file) return { valid: false, error: ERROR_MESSAGES.DOCUMENT_REQUIRED };

  if (file.size > maxSize) {
    return { valid: false, error: ERROR_MESSAGES.FILE_SIZE_TOO_LARGE };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TYPE_NOT_ALLOWED,
    };
  }

  return { valid: true };
};

// Convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data:image/jpeg;base64, part
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Validate GST-PAN relationship for transporter
 * This validation is only applicable for Indian addresses
 *
 * @param {object} formData - Complete form data with addresses and documents
 * @returns {object} - Validation result with errors object
 */
export const validateGSTPANRelationship = (formData) => {
  const errors = {};

  // Get primary address
  const primaryAddress = formData.addresses?.find(
    (addr) => addr.isPrimary === true
  );

  if (!primaryAddress) {
    return errors; // No primary address, skip validation
  }

  // Check if it's an Indian address
  const isIndia =
    primaryAddress.country === "IN" ||
    primaryAddress.country === "India" ||
    primaryAddress.country?.toLowerCase().includes("india");

  if (!isIndia) {
    return errors; // Not India, skip GST-PAN validation
  }

  // Only validate if GST number (vatNumber) is provided
  if (!primaryAddress.vatNumber || primaryAddress.vatNumber.trim() === "") {
    return errors; // No GST number provided, skip validation
  }

  // Find PAN card document (DN001 is PAN/TIN in master data)
  const panDocument = formData.documents?.find((doc) => {
    const docType = doc.documentType;
    return docType === "DN001" || docType?.toLowerCase().includes("pan");
  });

  if (!panDocument) {
    errors.gstPan = {
      field: "documents",
      message:
        "PAN card document (DN001) is mandatory when GST number is provided for Indian addresses",
      code: "PAN_REQUIRED",
      tab: "documents",
    };
    return errors;
  }

  // Validate GST-PAN match
  const gstValidation = validateGSTPAN(
    primaryAddress.vatNumber,
    panDocument.documentNumber,
    primaryAddress.state
  );

  if (!gstValidation.isValid) {
    errors.gstPan = {
      field: gstValidation.field || "vatNumber",
      message: gstValidation.error,
      code: gstValidation.code,
      tab: gstValidation.field === "documents" ? "documents" : "addresses",
      hint: "GST format: [2-digit state code][10-char PAN][Entity][Z][Check digit]. Example: 27ABCDE1234F1Z5",
    };
  }

  return errors;
};
