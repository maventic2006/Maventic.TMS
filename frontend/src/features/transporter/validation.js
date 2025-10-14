import { z } from "zod";

// Phone number validation
const phoneNumberSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(
    /^\+[1-9]\d{1,14}$/,
    "Invalid phone number format. Use format: +[country code][number]"
  );

// Email validation
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format. Use format: example@domain.com");

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
      .min(2, "Business name must be at least 2 characters")
      .max(100, "Business name must not exceed 100 characters")
      .trim(),
    fromDate: z
      .string()
      .min(1, "From date is required")
      .refine((date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate <= today;
      }, "From date cannot be in the future"),
    toDate: z
      .string()
      .optional()
      .refine((date) => {
        if (!date) return true;
        return new Date(date) > new Date();
      }, "To date must be in the future"),
    avgRating: z
      .number()
      .min(0, "Rating must be at least 0")
      .max(5, "Rating must not exceed 5")
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
        "At least one transport mode must be selected"
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
      message: "To date must be after from date",
      path: ["toDate"],
    }
  );

// Contact Schema
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Contact name must be at least 2 characters")
    .max(50, "Contact name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Contact name can only contain letters and spaces")
    .trim(),
  role: z.string().optional(),
  phoneNumber: phoneNumberSchema,
  alternatePhoneNumber: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === "") return true;
      return /^\+[1-9]\d{1,14}$/.test(phone);
    }, "Invalid alternate phone number format"),
  email: emailSchema,
  alternateEmail: z
    .string()
    .optional()
    .refine((email) => {
      if (!email || email.trim() === "") return true;
      return z.string().email().safeParse(email).success;
    }, "Invalid alternate email format"),
  whatsappNumber: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === "") return true;
      return /^\+[1-9]\d{1,14}$/.test(phone);
    }, "Invalid WhatsApp number format"),
});

// Address Schema
export const addressSchema = z.object({
  vatNumber: z
    .string()
    .min(8, "VAT number must be at least 8 characters")
    .max(15, "VAT number must not exceed 15 characters")
    .regex(
      /^[A-Z0-9]{8,15}$/,
      "VAT number must contain only uppercase letters and numbers"
    ),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  street1: z.string().optional(),
  street2: z.string().optional(),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  isPrimary: z.boolean().default(false),
  contacts: z
    .array(contactSchema)
    .min(1, "At least one contact must be provided for each address"),
});

// Serviceable Area Schema
export const serviceableAreaSchema = z.object({
  country: z.string().min(1, "Country is required"),
  states: z.array(z.string()).min(1, "At least one state must be selected"),
});

// Document Schema
export const documentSchema = z
  .object({
    documentType: z.string().min(1, "Document type is required"),
    documentNumber: z
      .string()
      .min(1, "Document number is required")
      .regex(
        /^[A-Z0-9\-\/]+$/,
        "Document number can only contain uppercase letters, numbers, hyphens, and forward slashes"
      ),
    referenceNumber: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    validFrom: z
      .string()
      .min(1, "Valid from date is required")
      .refine((date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate <= today;
      }, "Valid from date cannot be in the future"),
    validTo: z.string().min(1, "Valid to date is required"),
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
      message: "Valid to date must be after valid from date",
      path: ["validTo"],
    }
  );

// Complete Transporter Schema
export const createTransporterSchema = z.object({
  generalDetails: generalDetailsSchema,
  addresses: z
    .array(addressSchema)
    .min(1, "At least one address must be provided")
    .refine((addresses) => {
      // Check for duplicate VAT numbers
      const vatNumbers = addresses.map((addr) => addr.vatNumber);
      const uniqueVATNumbers = [...new Set(vatNumbers)];
      return vatNumbers.length === uniqueVATNumbers.length;
    }, "Duplicate VAT numbers are not allowed"),
  serviceableAreas: z
    .array(serviceableAreaSchema)
    .min(1, "At least one serviceable area must be provided")
    .refine((areas) => {
      // Check for duplicate countries
      const countries = areas.map((area) => area.country);
      const uniqueCountries = [...new Set(countries)];
      return countries.length === uniqueCountries.length;
    }, "Duplicate countries are not allowed in serviceable areas"),
  documents: z
    .array(documentSchema)
    .min(1, "At least one document must be provided")
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
    }, "Duplicate document numbers are not allowed for the same document type"),
});

// Validation helper functions
export const validateFormSection = (sectionName, data) => {
  switch (sectionName) {
    case "generalDetails":
      return generalDetailsSchema.safeParse(data);
    case "addresses":
      return z.array(addressSchema).min(1).safeParse(data);
    case "serviceableAreas":
      return z.array(serviceableAreaSchema).min(1).safeParse(data);
    case "documents":
      return z.array(documentSchema).min(1).safeParse(data);
    default:
      return {
        success: false,
        error: { issues: [{ message: "Unknown section" }] },
      };
  }
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

  if (!file) return { valid: false, error: "No file selected" };

  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 5MB" };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error:
        "File type not allowed. Please upload JPEG, PNG, GIF, PDF, DOC, or DOCX files",
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
