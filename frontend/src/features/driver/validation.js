import { z } from "zod";
import { validateDocumentNumber } from "../../utils/documentValidation";

// Helper function to format field names to Title Case with spaces
export const formatFieldName = (fieldName) => {
  if (!fieldName) return "Field";

  // Convert camelCase to Title Case with spaces
  return fieldName
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim()
    .replace(/\s+/g, " ") // Remove multiple spaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Phone number validation - 10 digits starting with 6-9
const phoneNumberSchema = z.string().refine(
  (val) => {
    // Check if empty first
    if (!val || val.trim() === "") {
      return false;
    }
    // Then check format
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(val);
  },
  (val) => {
    if (!val || val.trim() === "") {
      return { message: "Phone number is required" };
    }
    return {
      message: "Please enter a valid 10-digit phone number starting with 6-9",
    };
  }
);

// Email validation
const emailSchema = z.string().email("Please enter a valid email address");

// Basic Info Schema
export const basicInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .trim(),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate < today;
    }, "Date of birth must be in the past"),
  gender: z.string().optional(),
  bloodGroup: z.string().optional(),
  phoneNumber: phoneNumberSchema,
  emailId: z
    .string()
    .optional()
    .refine((email) => {
      if (!email || email.trim() === "") return true;
      return z.string().email().safeParse(email).success;
    }, "Please enter a valid email address"),
  emergencyContact: phoneNumberSchema,
  alternatePhoneNumber: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === "") return true;
      const phoneRegex = /^[6-9]\d{9}$/;
      return phoneRegex.test(phone);
    }, "Please enter a valid 10-digit alternate phone number"),
});

// Address Schema (NO CONTACTS - simpler than transporter)
export const addressSchema = z.object({
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().nullable().optional(),
  street1: z.string().nullable().optional(),
  street2: z.string().nullable().optional(),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .regex(/^\d{6}$/, "Postal code must be 6 digits"),
  isPrimary: z
    .union([z.boolean(), z.number()])
    .transform((val) => Boolean(val))
    .default(false),
  addressTypeId: z.string().min(1, "Address type is required"),
});

// Document Schema
export const documentSchema = z
  .object({
    documentType: z.string().min(1, "Document type is required"),
    documentNumber: z.string().min(1, "Document number is required"),
    issuingCountry: z.string().nullable().optional(),
    issuingState: z.string().nullable().optional(),
    validFrom: z
      .string()
      .nullable()
      .optional()
      .refine((date) => {
        if (!date) return true; // Allow empty
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate <= today;
      }, "Valid from date cannot be in the future"),
    validTo: z.string().nullable().optional(),
    status: z
      .union([z.boolean(), z.number()])
      .transform((val) => Boolean(val))
      .default(true),
    fileName: z.string().nullable().optional(),
    fileType: z.string().nullable().optional(),
    fileData: z
      .string()
      .nullable()
      .optional()
      .refine((data) => {
        if (!data) return true; // File is optional
        // Check base64 size (approximately 5MB when decoded)
        const sizeInBytes = (data.length * 3) / 4;
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
        return sizeInBytes <= maxSizeInBytes;
      }, "File size must be less than 5MB"),
  })
  .refine(
    (data) => {
      if (!data.validFrom || !data.validTo) return true; // Skip if dates are empty
      const validFrom = new Date(data.validFrom);
      const validTo = new Date(data.validTo);
      return validTo > validFrom;
    },
    {
      message: "Valid to date must be after valid from date",
      path: ["validTo"],
    }
  )
  .superRefine((data, ctx) => {
    // Validate document number format based on document type
    if (data.documentNumber && data.documentType) {
      const validation = validateDocumentNumber(
        data.documentNumber,
        data.documentType
      );
      if (!validation.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["documentNumber"],
          message: validation.message || "Invalid document number format",
        });
      }
    }
  });

// History Schema (Employment History)
export const historySchema = z.object({
  employer: z.string().nullable().optional(),
  employmentStatus: z.string().nullable().optional(),
  fromDate: z.string().nullable().optional(),
  toDate: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
});

// Accident/Violation Schema
export const accidentViolationSchema = z.object({
  type: z.string().min(1, "Type is required"),
  date: z.string().min(1, "Date is required"),
  vehicleRegistrationNumber: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

// Complete Driver Creation Schema
export const createDriverSchema = z.object({
  basicInfo: basicInfoSchema,
  addresses: z.array(addressSchema).min(1, "At least one address is required"),
  documents: z
    .array(documentSchema)
    .min(1, "At least one document is required")
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
    }, "Duplicate document numbers found for the same document type"),
  history: z
    .array(historySchema)
    .min(1, "At least one employment history record is required"),
  accidents: z
    .array(accidentViolationSchema)
    .min(1, "At least one accident/violation record is required"),
});

// Helper function to format Zod errors into a flat object
export const formatZodErrors = (error) => {
  const errors = {};
  error.errors.forEach((err) => {
    const path = err.path.join(".");
    errors[path] = err.message;
  });
  return errors;
};
