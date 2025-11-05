import { z } from "zod";

// Phone number validation - 10 digits starting with 6-9
const phoneNumberSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine((val) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(val);
  }, "Please enter a valid 10-digit phone number starting with 6-9");

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
  whatsAppNumber: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === "") return true;
      const phoneRegex = /^[6-9]\d{9}$/;
      return phoneRegex.test(phone);
    }, "Please enter a valid 10-digit WhatsApp number"),
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
  district: z.string().optional(),
  street1: z.string().optional(),
  street2: z.string().optional(),
  postalCode: z.string().optional(),
  isPrimary: z.boolean().default(false),
  addressTypeId: z.string().min(1, "Address type is required"),
});

// Document Schema
export const documentSchema = z
  .object({
    documentType: z.string().min(1, "Document type is required"),
    documentNumber: z.string().min(1, "Document number is required"),
    referenceNumber: z.string().optional(),
    country: z.string().optional(),
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
    fileData: z.string().optional(),
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

// History Schema (Employment History)
export const historySchema = z.object({
  employerName: z.string().optional(),
  position: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  reasonForLeaving: z.string().optional(),
  contactPerson: z.string().optional(),
  contactNumber: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone || phone.trim() === "") return true;
      const phoneRegex = /^[6-9]\d{9}$/;
      return phoneRegex.test(phone);
    }, "Please enter a valid 10-digit contact number"),
});

// Accident/Violation Schema
export const accidentViolationSchema = z.object({
  incidentType: z.enum(["accident", "violation"]).default("accident"),
  incidentDate: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  severity: z.enum(["minor", "moderate", "major", "critical"]).default("minor"),
  damageAmount: z.string().optional(),
  injuries: z.string().optional(),
  policeCaseNumber: z.string().optional(),
  insuranceClaimNumber: z.string().optional(),
});

// Complete Driver Creation Schema
export const createDriverSchema = z.object({
  basicInfo: basicInfoSchema,
  addresses: z.array(addressSchema).min(1, "At least one address is required"),
  documents: z.array(documentSchema).optional(),
  history: z.array(historySchema).optional(),
  accidents: z.array(accidentViolationSchema).optional(),
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
