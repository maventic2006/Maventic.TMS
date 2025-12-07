/**
 * Consignor Validation Schemas using Joi
 * Provides comprehensive field-level validation for all consignor operations
 */

const Joi = require("joi");

// Custom validator for date not in future
const dateNotInFuture = (value, helpers) => {
  if (new Date(value) > new Date()) {
    return helpers.error("date.future");
  }
  return value;
};

// Custom validator for valid date range
const validDateRange = (value, helpers) => {
  const { valid_from, valid_to } = helpers.state.ancestors[0];
  if (valid_to && valid_from && new Date(valid_to) < new Date(valid_from)) {
    return helpers.error("date.range");
  }
  return value;
};

/**
 * General Section Validation Schema
 */
const generalSchema = Joi.object({
  customer_id: Joi.string()
    .trim()
    .max(10)
    .optional() // Made optional - will be auto-generated if not provided
    .allow(null, "")
    .pattern(/^[A-Z0-9]*$/) // Allow empty string for auto-generation
    .messages({
      "string.max": "Customer ID cannot exceed 10 characters",
      "string.pattern.base":
        "Customer ID must contain only uppercase letters and numbers",
    }),

  customer_name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Customer name is required",
    "string.min": "Customer name must be at least 2 characters long",
    "string.max": "Customer name cannot exceed 100 characters",
    "any.required": "Customer name is required",
  }),

  search_term: Joi.string().trim().max(100).required().messages({
    "string.empty": "Search term is required",
    "string.max": "Search term cannot exceed 100 characters",
    "any.required": "Search term is required",
  }),

  industry_type: Joi.string().trim().max(30).required().messages({
    "string.empty": "Industry type is required",
    "string.max": "Industry type cannot exceed 30 characters",
    "any.required": "Industry type is required",
  }),

  currency_type: Joi.string()
    .trim()
    .max(30)
    .optional()
    .allow(null, "")
    .messages({
      "string.max": "Currency type cannot exceed 30 characters",
    }),

  payment_term: Joi.string().trim().max(10).required().messages({
    "string.empty": "Payment term is required",
    "string.max": "Payment term cannot exceed 10 characters",
    "any.required": "Payment term is required",
  }),

  remark: Joi.string().trim().max(255).optional().allow(null, "").messages({
    "string.max": "Remark cannot exceed 255 characters",
  }),

  website_url: Joi.string()
    .trim()
    .uri()
    .max(200)
    .optional()
    .allow(null, "")
    .messages({
      "string.uri": "Please enter a valid website URL",
      "string.max": "Website URL cannot exceed 200 characters",
    }),

  name_on_po: Joi.string().trim().max(30).optional().allow(null, "").messages({
    "string.max": "Name on PO cannot exceed 30 characters",
  }),

  approved_by: Joi.string().trim().max(30).optional().allow(null, "").messages({
    "string.max": "Approved by cannot exceed 30 characters",
  }),

  approved_date: Joi.date()
    .iso()
    .custom(dateNotInFuture)
    .optional()
    .allow(null)
    .messages({
      "date.base": "Approved date must be a valid date",
      "date.format": "Approved date must be in ISO format (YYYY-MM-DD)",
      "date.future": "Approved date cannot be in the future",
    }),

  // NDA/MSA document upload fields (frontend sends these)
  upload_nda: Joi.alternatives()
    .try(Joi.string().allow(null, ""), Joi.object())
    .optional()
    .messages({
      "alternatives.types": "NDA upload must be a string or file object",
    }),

  nda_validity: Joi.date().iso().optional().allow(null, "").messages({
    "date.base": "NDA validity must be a valid date",
    "date.format": "NDA validity must be in ISO format (YYYY-MM-DD)",
  }),

  upload_msa: Joi.alternatives()
    .try(Joi.string().allow(null, ""), Joi.object())
    .optional()
    .messages({
      "alternatives.types": "MSA upload must be a string or file object",
    }),

  msa_validity: Joi.date().iso().optional().allow(null, "").messages({
    "date.base": "MSA validity must be a valid date",
    "date.format": "MSA validity must be in ISO format (YYYY-MM-DD)",
  }),

  // Address ID field (frontend uses this for linking)
  address_id: Joi.string().trim().max(10).optional().allow(null, "").messages({
    "string.max": "Address ID cannot exceed 10 characters",
  }),

  status: Joi.string()
    .valid("ACTIVE", "INACTIVE", "PENDING", "SAVE_AS_DRAFT")
    .default("ACTIVE")
    .messages({
      "any.only":
        "Status must be one of: ACTIVE, INACTIVE, PENDING, SAVE_AS_DRAFT",
    }),

  // Frontend sends this field for UI state management
  userApprovalStatus: Joi.any().optional().allow(null).messages({
    "any.base": "User approval status can be any value",
  }),
});

/**
 * Contact Section Validation Schema
 * Updated to match current database column limits and frontend field names
 */
const contactSchema = Joi.object({
  contact_id: Joi.string().trim().max(10).optional().allow(null, "").messages({
    "string.max": "Contact ID cannot exceed 10 characters",
  }),

  // Frontend uses 'designation', maps to 'contact_designation' (VARCHAR(50))
  designation: Joi.string().trim().max(50).required().messages({
    "string.empty": "Designation is required",
    "string.max": "Designation cannot exceed 50 characters",
    "any.required": "Designation is required",
  }),

  // Frontend uses 'name', maps to 'contact_name' (VARCHAR(100))
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Contact name is required",
    "string.min": "Contact name must be at least 2 characters long",
    "string.max": "Contact name cannot exceed 100 characters",
    "any.required": "Contact name is required",
  }),

  // Frontend uses 'number', maps to 'contact_number' (VARCHAR(15))
  number: Joi.string()
    .trim()
    .max(15)
    .pattern(/^\+?[1-9]\d{6,14}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.max": "Phone number cannot exceed 15 characters",
      "string.pattern.base": "Please enter a valid phone number with 7-15 digits",
      "any.required": "Phone number is required",
    }),

  country_code: Joi.string()
    .trim()
    .max(10)
    .pattern(/^\+[1-9]\d{0,3}$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.max": "Country code cannot exceed 10 characters",
      "string.pattern.base": "Please enter a valid country code (e.g., +1, +91)",
    }),

  // Frontend uses 'email', maps to 'email_id' (VARCHAR(100))
  email: Joi.string()
    .trim()
    .email()
    .max(100)
    .optional()
    .allow(null, "")
    .messages({
      "string.email": "Please enter a valid email address",
      "string.max": "Email cannot exceed 100 characters",
    }),

  linkedin_link: Joi.string()
    .trim()
    .uri()
    .max(500)
    .optional()
    .allow(null, "")
    .messages({
      "string.uri": "Please enter a valid LinkedIn URL",
      "string.max": "LinkedIn URL cannot exceed 500 characters",
    }),

  // Frontend uses 'team', maps to 'contact_team' (VARCHAR(100) - increased)
  team: Joi.string().trim().max(100).optional().allow(null, "").messages({
    "string.max": "Team name cannot exceed 100 characters",
  }),

  // Frontend uses 'role', maps to 'contact_role' (VARCHAR(100) - increased)
  role: Joi.string().trim().max(100).required().messages({
    "string.empty": "Role is required",
    "string.max": "Role cannot exceed 100 characters",
    "any.required": "Role is required",
  }),

  // Frontend uses 'photo' instead of 'contact_photo'
  photo: Joi.alternatives()
    .try(
      Joi.string().allow(null, ""), // URL or base64 string
      Joi.object() // File object
    )
    .optional()
    .messages({
      "alternatives.types":
        "Photo must be a string (URL/base64) or file object",
    }),

  // Backend compatibility - also accept contact_photo
  contact_photo: Joi.alternatives()
    .try(
      Joi.string().allow(null, ""), // URL or base64 string
      Joi.object() // File object
    )
    .optional()
    .messages({
      "alternatives.types":
        "Contact photo must be a string (URL/base64) or file object",
    }),

  // File metadata fields (added by ThemeTable component during file uploads)
  fileName: Joi.string().trim().max(255).optional().allow(null, "").messages({
    "string.max": "File name cannot exceed 255 characters",
  }),

  fileType: Joi.string().trim().max(100).optional().allow(null, "").messages({
    "string.max": "File type cannot exceed 100 characters",
  }),

  fileData: Joi.string().optional().allow(null, "").messages({
    "string.base": "File data must be a string",
  }),

  status: Joi.string()
    .valid("ACTIVE", "INACTIVE", "Active", "Inactive")
    .default("ACTIVE")
    .messages({
      "any.only": "Status must be either ACTIVE or INACTIVE",
    }),
});

/**
 * Organization Section Validation Schema
 * Updated to match database schema: company_code (VARCHAR(20)), business_area (TEXT/JSON)
 */
const organizationSchema = Joi.object({
  // Maps to 'company_code' (VARCHAR(20))
  company_code: Joi.string().trim().max(20).required().messages({
    "string.empty": "Company code is required",
    "string.max": "Company code cannot exceed 20 characters",
    "any.required": "Company code is required",
  }),

  // Maps to 'business_area' (TEXT - JSON array of state names)
  business_area: Joi.array()
    .items(
      Joi.string().trim().min(2).max(50).messages({
        "string.empty": "State name cannot be empty",
        "string.min": "State name must be at least 2 characters",
        "string.max": "State name cannot exceed 50 characters",
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Business area must be an array of state names",
      "array.min": "At least one state must be selected",
      "any.required": "Business area is required",
    }),

  status: Joi.string()
    .valid("ACTIVE", "INACTIVE", "Active", "Inactive")
    .default("ACTIVE")
    .messages({
      "any.only": "Status must be either ACTIVE or INACTIVE",
    }),
});

/**
 * Document Section Validation Schema
 * Accepts both frontend camelCase and backend snake_case field names
 */
const documentSchema = Joi.object({
  document_unique_id: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow(null, "")
    .messages({
      "string.max": "Document unique ID cannot exceed 10 characters",
    }),

  // Backend field name
  document_type_id: Joi.string()
    .trim()
    .max(30)
    .optional()
    .allow(null, "")
    .messages({
      "string.empty": "Document type is required",
      "string.max": "Document type ID cannot exceed 30 characters",
    }),

  // Frontend field name (documentType)
  documentType: Joi.string()
    .trim()
    .max(30)
    .optional()
    .allow(null, "")
    .messages({
      "string.max": "Document type cannot exceed 30 characters",
    }),

  // Backend field name
  document_number: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow(null, "")
    .messages({
      "string.max": "Document number cannot exceed 50 characters",
    }),

  // Frontend field name (documentNumber)
  documentNumber: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow(null, "")
    .messages({
      "string.max": "Document number cannot exceed 50 characters",
    }),

  // Frontend field name (referenceNumber)
  referenceNumber: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow(null, "")
    .messages({
      "string.max": "Reference number cannot exceed 50 characters",
    }),

  // Backend field name
  valid_from: Joi.date().iso().optional().allow(null, "").messages({
    "date.base": "Valid from date must be a valid date",
    "date.format": "Valid from date must be in ISO format (YYYY-MM-DD)",
  }),

  // Frontend field name (validFrom)
  validFrom: Joi.string().optional().allow(null, "").messages({
    "string.base": "Valid from must be a string",
  }),

  // Backend field name
  valid_to: Joi.date()
    .iso()
    .custom(validDateRange)
    .optional()
    .allow(null)
    .messages({
      "date.base": "Valid to date must be a valid date",
      "date.format": "Valid to date must be in ISO format (YYYY-MM-DD)",
      "date.range": "Valid to date must be after valid from date",
    }),

  // Frontend field name (validTo)
  validTo: Joi.string().optional().allow(null, "").messages({
    "string.base": "Valid to must be a string",
  }),

  // Frontend sends these additional fields
  country: Joi.string().trim().max(50).optional().allow(null, "").messages({
    "string.max": "Country cannot exceed 50 characters",
  }),

  status: Joi.alternatives()
    .try(
      Joi.boolean(),
      Joi.string().valid("ACTIVE", "INACTIVE", "Active", "Inactive")
    )
    .optional()
    .default(true)
    .messages({
      "alternatives.types": "Status must be a boolean value or valid status string (ACTIVE/INACTIVE)",
    }),

  fileKey: Joi.string().optional().allow(null, "").messages({
    "string.base": "File key must be a string",
  }),

  // Frontend UI fields
  fileName: Joi.string().optional().allow(null, "").messages({
    "string.base": "File name must be a string",
  }),

  fileType: Joi.string().optional().allow(null, "").messages({
    "string.base": "File type must be a string",
  }),

  fileData: Joi.string().optional().allow(null, "").messages({
    "string.base": "File data must be a string",
  }),

  // Backend fields added during processing (should be allowed)
  _backend_document_id: Joi.string().optional().allow(null, "").messages({
    "string.base": "Backend document ID must be a string",
  }),

  _backend_document_unique_id: Joi.string().optional().allow(null, "").messages({
    "string.base": "Backend document unique ID must be a string",
  }),
});

/**
 * Complete Consignor Creation/Update Validation Schema
 */
const consignorCreateSchema = Joi.object({
  consignorId: Joi.string().optional().allow(null, "").messages({
    "string.base": "Consignor ID must be a string",
  }),

  general: generalSchema.required().messages({
    "any.required": "General information is required",
  }),

  contacts: Joi.array().items(contactSchema).min(1).required().messages({
    "array.min": "At least one contact is required",
    "any.required": "Contacts information is required",
  }),

  organization: organizationSchema.required().messages({
    "any.required": "Organization information is required",
  }),

  documents: Joi.array().items(documentSchema).optional().messages({
    "array.base": "Documents must be an array",
  }),
});

/**
 * Consignor Update Schema (allows partial updates)
 */
const consignorUpdateSchema = Joi.object({
  general: generalSchema.optional(),
  contacts: Joi.array().items(contactSchema).optional(),
  organization: organizationSchema.optional(),
  documents: Joi.array().items(documentSchema).optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one section must be provided for update",
  });

/**
 * Query Parameter Validation for List Endpoint
 */
const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number().integer().min(1).max(100).default(25).messages({
    "number.base": "Limit must be a number",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),

  search: Joi.string().trim().optional().allow("").messages({
    "string.base": "Search must be a string",
  }),

  customer_id: Joi.string().trim().optional().allow("").messages({
    "string.base": "Customer ID must be a string",
  }),

  status: Joi.string()
    .valid("ACTIVE", "INACTIVE", "PENDING", "SAVE_AS_DRAFT")
    .optional()
    .allow("")
    .messages({
      "any.only":
        "Status must be one of: ACTIVE, INACTIVE, PENDING, SAVE_AS_DRAFT",
    }),

  industry_type: Joi.string().trim().optional().allow("").messages({
    "string.base": "Industry type must be a string",
  }),

  currency_type: Joi.string().trim().optional().allow("").messages({
    "string.base": "Currency type must be a string",
  }),

  sortBy: Joi.string()
    .valid(
      "customer_id",
      "customer_name",
      "industry_type",
      "created_at",
      "approved_date"
    )
    .default("created_at")
    .messages({
      "any.only":
        "Sort by must be one of: customer_id, customer_name, industry_type, created_at, approved_date",
    }),

  sortOrder: Joi.string()
    .valid("asc", "desc", "ASC", "DESC")
    .default("desc")
    .messages({
      "any.only": "Sort order must be either asc or desc",
    }),

  createdOnStart: Joi.string()
    .trim()
    .optional()
    .allow("")
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      "string.base": "Created on start date must be a string",
      "string.pattern.base":
        "Created on start date must be in YYYY-MM-DD format",
    }),

  createdOnEnd: Joi.string()
    .trim()
    .optional()
    .allow("")
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      "string.base": "Created on end date must be a string",
      "string.pattern.base": "Created on end date must be in YYYY-MM-DD format",
    }),
});

/**
 * Document Upload Validation
 */
const documentUploadSchema = Joi.object({
  document_type_id: Joi.string().trim().required().messages({
    "string.empty": "Document type is required",
    "any.required": "Document type is required",
  }),

  document_number: Joi.string().trim().optional().allow(null, "").messages({
    "string.base": "Document number must be a string",
  }),

  valid_from: Joi.date().iso().required().messages({
    "date.base": "Valid from date must be a valid date",
    "any.required": "Valid from date is required",
  }),

  valid_to: Joi.date().iso().optional().allow(null).messages({
    "date.base": "Valid to date must be a valid date",
  }),
});

module.exports = {
  generalSchema,
  contactSchema,
  organizationSchema,
  documentSchema,
  consignorCreateSchema,
  consignorUpdateSchema,
  listQuerySchema,
  documentUploadSchema,
};
