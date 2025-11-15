import { z } from "zod";
import { ERROR_MESSAGES } from "../../utils/constants";

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
    .max(200, "Speed limit cannot exceed 200 KM/H")
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
    .regex(/^\d{6}$/, ERROR_MESSAGES.POSTAL_CODE_INVALID)
    .optional(),
  vatNumber: z
    .string()
    .min(1, "VAT number is required")
    .regex(
      /^[A-Z0-9]{8,20}$/,
      "VAT number must be 8-20 alphanumeric characters"
    ),
  addressType: z.string().min(1, "Please select address type"),
  isPrimary: z.boolean().default(true),
});

// Document Schema
export const documentSchema = z.object({
  documentType: z.string().min(1, ERROR_MESSAGES.DOCUMENT_TYPE_REQUIRED),
  documentNumber: z
    .string()
    .min(1, ERROR_MESSAGES.DOCUMENT_NUMBER_REQUIRED)
    .regex(/^[A-Z0-9\-\/]+$/, ERROR_MESSAGES.DOCUMENT_NUMBER_INVALID),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  fileData: z.string().optional(),
  status: z.boolean().default(true),
});

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
  facilities: facilitiesSchema,
  address: addressSchema,
  documents: z.array(documentSchema).min(1, ERROR_MESSAGES.DOCUMENT_REQUIRED),
  subLocations: z.array(subLocationSchema).optional(),
});

// Form section validation helper
export const validateFormSection = (sectionName, data) => {
  const schemas = {
    generalDetails: generalDetailsSchema,
    facilities: facilitiesSchema,
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
