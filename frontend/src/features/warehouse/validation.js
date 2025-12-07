import { z } from "zod";
import { ERROR_MESSAGES } from "../../utils/constants";
import { validateDocumentNumber } from "../../utils/documentValidation";

// Phone number validation
const phoneNumberSchema = z
  .string()
  .min(1, ERROR_MESSAGES.PHONE_NUMBER_REQUIRED)
  .refine((val) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(val);
  }, ERROR_MESSAGES.PHONE_NUMBER_INVALID);

// General Details Schema
export const generalDetailsSchema = z.object({
  warehouseName: z
    .string()
    .min(2, "Warehouse name must be at least 2 characters")
    .max(30, "Warehouse name cannot exceed 30 characters")
    .trim(),
  warehouseName2: z
    .string()
    .min(2, "Warehouse name 2 must be at least 2 characters")
    .max(30, "Warehouse name 2 cannot exceed 30 characters")
    .trim(),
  warehouseType: z.string().min(1, "Please select warehouse type"),
  materialType: z.string().min(1, "Please select material type"),
  language: z.string().max(10).optional(),
  vehicleCapacity: z.coerce
    .number()
    .min(0, "Vehicle capacity must be non-negative")
    .int("Vehicle capacity must be a whole number"),
  virtualYardIn: z.boolean().default(false),
  radiusVirtualYardIn: z.coerce
    .number()
    .min(0, "Radius must be non-negative")
    .optional(),
  speedLimit: z.coerce
    .number()
    .min(1, "Speed limit must be at least 1 KM/H")
    .max(80, "Speed limit cannot exceed 80 KM/H")
    .default(20),
});

// Facilities Schema
export const facilitiesSchema = z.object({
  weighBridge: z.boolean().default(false),
  gatepassSystem: z.boolean().default(false),
  fuelAvailability: z.boolean().default(false),
  stagingArea: z.boolean().default(false),
  driverWaitingArea: z.boolean().default(false),
  gateInChecklistAuth: z.boolean().default(false),
  gateOutChecklistAuth: z.boolean().default(false),
});

// Address Schema
export const addressSchema = z.object({
  country: z.string().min(1, ERROR_MESSAGES.COUNTRY_REQUIRED),
  state: z.string().min(1, ERROR_MESSAGES.STATE_REQUIRED),
  city: z.string().min(1, ERROR_MESSAGES.CITY_REQUIRED),
  district: z.string().optional(),
  street1: z.string().min(1, "Street address is required"),
  street2: z.string().optional(),
  postalCode: z
    .string()
    .regex(/^\d{6}$/, "Postal code must be exactly 6 digits")
    .min(1, "Postal code is required"),
  vatNumber: z
    .string()
    .min(1, "GST/VAT number is required")
    .transform((val) => val.trim().toUpperCase()) // Convert to uppercase
    .refine((val) => {
      // Indian GST format: 15 characters
      // Pattern: 2 digits (state) + 10 chars (PAN) + 1 digit (entity) + 1 letter (Z) + 1 digit (checksum)
      // Example: 27AAPFU0939F1ZV
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

      // International VAT format: 2 letter country code + 8-15 alphanumeric
      // Examples: GB123456789, DE123456789, FR12345678901
      const vatRegex = /^[A-Z]{2}[A-Z0-9]{8,15}$/;

      return gstRegex.test(val) || vatRegex.test(val);
    }, "Invalid GST/VAT format. Indian GST: 15 chars (e.g., 27AAPFU0939F1ZV), International VAT: Country code + 8-15 chars"),
  addressType: z.string().min(1, "Please select address type"),
  isPrimary: z.boolean().default(true),
});

// Document Schema (basic validation - document number format validation happens in submit handler)
export const documentSchema = z
  .object({
    documentType: z.string().min(1, ERROR_MESSAGES.DOCUMENT_TYPE_REQUIRED),
    documentNumber: z
      .string()
      .min(1, ERROR_MESSAGES.DOCUMENT_NUMBER_REQUIRED)
      .trim(),
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
    fileName: z.string().optional(),
    fileType: z.string().optional(),
    fileData: z.string().optional(), // base64 encoded file data
    status: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Validate that validTo is after validFrom
      const validFrom = new Date(data.validFrom);
      const validTo = new Date(data.validTo);
      return validTo > validFrom;
    },
    {
      message: "Valid to date must be after valid from date",
      path: ["validTo"],
    }
  );

// Geofencing/Sub-location Schema
export const subLocationSchema = z.object({
  subLocationType: z.string().min(1, "Please select sub-location type"),
  description: z.string().optional(),
  coordinates: z
    .array(
      z.object({
        latitude: z.coerce.number().min(-90).max(90),
        longitude: z.coerce.number().min(-180).max(180),
        sequence: z.number(),
      })
    )
    .min(3, "At least 3 coordinates required for geofencing"),
});

// Complete Warehouse Create Schema
export const createWarehouseSchema = z.object({
  generalDetails: generalDetailsSchema,
  address: addressSchema,
  documents: z.array(documentSchema).optional().default([]),
  subLocations: z.array(subLocationSchema).optional(),
});

// Form section validation helper
export const validateFormSection = (sectionName, data) => {
  const schemas = {
    generalDetails: generalDetailsSchema,
    address: addressSchema,
    documents: z.array(documentSchema),
    subLocations: z.array(subLocationSchema),
  };

  const schema = schemas[sectionName];
  if (!schema) return { isValid: true, errors: {} };

  const result = schema.safeParse(data);
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  });

  return { isValid: false, errors };
};
