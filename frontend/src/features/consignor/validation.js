import { z } from "zod";

/**
 * Validation schemas for Consignor Module
 * Uses Zod for type-safe form validation
 */

// ============================================
// General Information Tab Schema
// ============================================
export const generalInfoSchema = z.object({
  customer_name: z
    .string()
    .min(1, "Customer name is required")
    .max(100, "Customer name must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-&.,()]+$/, "Only alphanumeric characters and basic symbols allowed"),

  search_term: z
    .string()
    .min(1, "Search term is required")
    .max(100, "Search term must not exceed 100 characters"),

  industry_type: z
    .string()
    .min(1, "Industry type is required"),

  currency_type: z
    .string()
    .optional()
    .nullable(),

  payment_term: z
    .string()
    .min(1, "Payment term is required"),

  remark: z
    .string()
    .max(255, "Remark must not exceed 255 characters")
    .optional()
    .nullable(),

  website_url: z
    .string()
    .url("Invalid URL format")
    .max(200, "Website URL must not exceed 200 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  name_on_po: z
    .string()
    .max(30, "Name on PO must not exceed 30 characters")
    .optional()
    .nullable(),

  approved_by: z
    .string()
    .max(30, "Approver name must not exceed 30 characters")
    .optional()
    .nullable(),

  approved_date: z
    .string()
    .optional()
    .nullable(),

  // NDA/MSA Document Upload References - Increased length for long references
  upload_nda: z
    .string()
    .max(255, "NDA reference must not exceed 255 characters")
    .optional()
    .nullable(),

  upload_msa: z
    .string()
    .max(255, "MSA reference must not exceed 255 characters")
    .optional()
    .nullable(),

  address_id: z
    .string()
    .max(20, "Address ID must not exceed 20 characters")
    .optional()
    .nullable(),

  status: z
    .enum(["ACTIVE", "INACTIVE", "PENDING"])
    .default("ACTIVE"),
});

// ============================================
// Contact Tab Schema
// ============================================
export const contactSchema = z.object({
  contact_id: z
    .string()
    .max(10, "Contact ID must not exceed 10 characters")
    .optional()
    .nullable(),

  designation: z
    .string()
    .min(1, "Designation is required")
    .max(50, "Designation must not exceed 50 characters"),

  name: z
    .string()
    .min(1, "Contact name is required")
    .max(100, "Contact name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s\-'.]+$/, "Only alphabetic characters allowed"),

  number: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9+\-() ]{7,20}$/, "Invalid phone number format"),

  photo: z
    .string()
    .max(255, "Photo URL must not exceed 255 characters")
    .optional()
    .nullable(),

  role: z
    .string()
    .min(1, "Role is required")
    .max(50, "Role must not exceed 50 characters"),

  email: z
    .string()
    .email("Invalid email format")
    .max(100, "Email must not exceed 100 characters")
    .optional()
    .nullable(),

  linkedin_link: z
    .string()
    .url("Invalid LinkedIn URL")
    .max(200, "LinkedIn URL must not exceed 200 characters")
    .optional()
    .nullable()
    .or(z.literal("")),

  status: z
    .enum(["ACTIVE", "INACTIVE"])
    .default("ACTIVE"),
});

// Array schema for multiple contacts
export const contactsArraySchema = z.array(contactSchema).min(1, "At least one contact is required");

// ============================================
// Organization Tab Schema
// ============================================
export const organizationSchema = z.object({
  company_code: z
    .string()
    .min(1, "Company code is required")
    .max(20, "Company code must not exceed 20 characters")
    .regex(/^[A-Z0-9\-]+$/, "Company code must be uppercase alphanumeric with hyphens"),

  business_area: z
    .array(z.string())
    .min(1, "At least one business area (state) is required")
    .max(50, "Cannot select more than 50 states"),

  status: z
    .enum(["ACTIVE", "INACTIVE"])
    .default("ACTIVE"),
});

// ============================================
// Documents Tab Schema
// ============================================
export const documentSchema = z.object({
  // DocumentsTab uses camelCase field names
  documentType: z
    .string()
    .min(1, "Document type is required"),

  documentNumber: z
    .string()
    .min(1, "Document number is required")
    .max(50, "Document number must not exceed 50 characters"),

  country: z
    .string()
    .optional()
    .nullable(),

  validFrom: z
    .string()
    .min(1, "Valid from date is required"),

  validTo: z
    .string()
    .min(1, "Valid to date is required"),

  // File-related fields from ThemeTable
  fileName: z
    .string()
    .optional()
    .nullable(),

  fileType: z
    .string()
    .optional()
    .nullable(),

  fileData: z
    .any()
    .optional()
    .nullable(),

  // Optional fields used by component
  referenceNumber: z
    .string()
    .optional()
    .nullable(),

  status: z
    .boolean()
    .optional()
    .nullable(),
}).refine(
  (data) => {
    if (!data.validFrom || !data.validTo) return true;
    const fromDate = new Date(data.validFrom);
    const toDate = new Date(data.validTo);
    return toDate > fromDate;
  },
  {
    message: "Valid to date must be after valid from date",
    path: ["validTo"],
  }
);

// Array schema for multiple documents
export const documentsArraySchema = z.array(documentSchema);

// ============================================
// Complete Consignor Form Schema (for Create/Edit Page)
// ============================================
export const consignorFormSchema = z.object({
  general: generalInfoSchema,
  contacts: contactsArraySchema,
  organization: organizationSchema,
  documents: documentsArraySchema.optional(),
});

// Export as createConsignorSchema to match transporter pattern
export const createConsignorSchema = consignorFormSchema;

// ============================================
// Helper Functions for Validation
// ============================================

/**
 * Validates a single form tab and returns errors
 * @param {string} tabName - Name of the tab (general, contact, contacts, organization, documents)
 * @param {object} data - Form data to validate
 * @returns {object} Validation result { isValid: boolean, errors: object }
 */
export const validateTab = (tabName, data) => {
  try {
    let schema;
    switch (tabName) {
      case "general":
        schema = generalInfoSchema;
        break;
      case "contact":
        schema = contactSchema;
        break;
      case "contacts":
        schema = contactsArraySchema;
        break;
      case "organization":
        schema = organizationSchema;
        break;
      case "document":
        schema = documentSchema;
        break;
      case "documents":
        schema = documentsArraySchema;
        break;
      default:
        throw new Error(`Unknown tab: ${tabName}`);
    }

    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = {};
      error.errors.forEach((err) => {
        const fieldPath = err.path.join(".");
        formattedErrors[fieldPath || '_error'] = err.message;
      });
      return { isValid: false, errors: formattedErrors };
    }
    return { isValid: false, errors: { _form: error.message } };
  }
};

/**
 * Validates the entire consignor form
 * @param {object} formData - Complete form data
 * @returns {object} Validation result { isValid: boolean, errors: object }
 */
export const validateConsignorForm = (formData) => {
  try {
    consignorFormSchema.parse(formData);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Group errors by tab section
      const formattedErrors = {
        general: {},
        contacts: {},
        organization: {},
        documents: {},
      };
      
      error.errors.forEach((err) => {
        const [section, ...fieldPath] = err.path;
        const fieldName = fieldPath.join(".");
        
        if (section && formattedErrors[section] !== undefined) {
          if (fieldPath.length > 0) {
            formattedErrors[section][fieldName] = err.message;
          } else {
            formattedErrors[section]._error = err.message;
          }
        }
      });
      
      return { isValid: false, errors: formattedErrors };
    }
    return { isValid: false, errors: { _form: error.message } };
  }
};

/**
 * Gets validation error for a specific field
 * @param {object} errors - Validation errors object
 * @param {string} fieldPath - Path to field (e.g., "generalInfo.customer_name")
 * @returns {string|null} Error message or null
 */
export const getFieldError = (errors, fieldPath) => {
  return errors?.[fieldPath] || null;
};

/**
 * Checks if a tab has any validation errors
 * @param {object} tabErrors - Tab-specific errors object (e.g., errors.general)
 * @returns {boolean} True if tab has errors
 */
export const hasTabErrors = (tabErrors) => {
  if (!tabErrors || typeof tabErrors !== 'object') return false;
  return Object.keys(tabErrors).length > 0;
};

/**
 * Gets count of errors for a specific tab
 * @param {object} tabErrors - Tab-specific errors object (e.g., errors.general)
 * @returns {number} Count of errors in tab
 */
export const getTabErrorCount = (tabErrors) => {
  if (!tabErrors || typeof tabErrors !== 'object') return 0;
  return Object.keys(tabErrors).length;
};

// ============================================
// Export all schemas and utilities
// ============================================
export default {
  generalInfoSchema,
  contactSchema,
  contactsArraySchema,
  organizationSchema,
  documentSchema,
  documentsArraySchema,
  consignorFormSchema,
  validateTab,
  validateConsignorForm,
  getFieldError,
  hasTabErrors,
  getTabErrorCount,
};
