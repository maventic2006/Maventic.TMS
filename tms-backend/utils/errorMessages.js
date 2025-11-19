// Centralized Error Messages for Backend Validation
module.exports = {
  // General Details Errors
  BUSINESS_NAME_REQUIRED: "Please enter the business name",
  BUSINESS_NAME_TOO_SHORT: "Business name must be at least 2 characters long",
  FROM_DATE_REQUIRED: "Please select a start date",
  TRANSPORT_MODE_REQUIRED:
    "Please select at least one transport mode (Road, Rail, Air, or Sea)",

  // Address & Contact Errors
  ADDRESS_REQUIRED: "Please provide at least one address",
  VAT_NUMBER_INVALID:
    "Please enter a valid VAT/Tax number for the selected country",
  COUNTRY_STATE_CITY_REQUIRED: "Please select country, state, and city",
  CONTACT_REQUIRED:
    "Please provide at least one contact person for each address",

  // Contact Person Errors
  CONTACT_NAME_REQUIRED:
    "Please enter the contact person's name (at least 2 characters)",
  PHONE_NUMBER_INVALID:
    "Please enter a valid 10-digit phone number (e.g., 9876543210)",
  ALTERNATE_PHONE_INVALID:
    "Please enter a valid 10-digit alternate phone number",
  EMAIL_INVALID:
    "Please enter a valid email address (e.g., example@domain.com)",
  ALTERNATE_EMAIL_INVALID: "Please enter a valid alternate email address",

  // Serviceable Area Errors
  SERVICEABLE_AREA_REQUIRED: "Please add at least one serviceable area",
  SERVICEABLE_COUNTRY_REQUIRED:
    "Please select a country for the serviceable area",
  SERVICEABLE_STATES_REQUIRED: "Please select at least one state",
  SERVICEABLE_AREA_DUPLICATE:
    "This country is already added. Please select a different country",

  // Document Errors
  DOCUMENT_REQUIRED: "Please add at least one document",
  DOCUMENT_TYPE_REQUIRED: "Please select the document type",
  DOCUMENT_NUMBER_REQUIRED: "Please enter the document number",
  DOCUMENT_NUMBER_INVALID: "Document number format is invalid",
  DOCUMENT_COUNTRY_REQUIRED: "Please select the issuing country",
  DOCUMENT_VALID_FROM_REQUIRED: "Please select the start date",
  DOCUMENT_VALID_TO_REQUIRED: "Please select the expiry date",
  DOCUMENT_DATE_INVALID: "Expiry date must be after the start date",
  DOCUMENT_DUPLICATE:
    "This document number already exists for this document type",

  // Driver-Specific Errors
  DRIVER_NAME_REQUIRED: "Please enter the driver's full name",
  DRIVER_NAME_TOO_SHORT: "Full name must be at least 2 characters long",
  DRIVER_NAME_TOO_LONG: "Full name cannot exceed 100 characters",
  DATE_OF_BIRTH_REQUIRED: "Please select date of birth",
  DATE_OF_BIRTH_FUTURE: "Date of birth cannot be in the future",
  DRIVER_AGE_INVALID: "Driver must be at least 18 years old",
  DRIVER_PHONE_REQUIRED: "Please enter a phone number",
  DRIVER_PHONE_INVALID:
    "Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9",
  DRIVER_EMAIL_INVALID: "Please enter a valid email address",
  EMERGENCY_CONTACT_REQUIRED: "Please enter emergency contact number",
  EMERGENCY_CONTACT_INVALID:
    "Please enter a valid 10-digit emergency contact number",
  ALTERNATE_PHONE_DRIVER_INVALID:
    "Please enter a valid 10-digit alternate phone number",
  POSTAL_CODE_REQUIRED: "Please enter postal code/PIN code",
  POSTAL_CODE_INVALID: "Postal code must be 6 digits",
  ADDRESS_TYPE_REQUIRED: "Please select address type",
  DRIVER_DOCUMENT_REQUIRED: "Please add at least one document",
  DRIVER_DOCUMENT_TYPE_REQUIRED: "Please select document type",
  DRIVER_DOCUMENT_NUMBER_REQUIRED: "Please enter document number",
  LICENSE_NUMBER_INVALID: "License number format is invalid",
  DUPLICATE_PHONE_DRIVER: "This phone number is already registered",
  DUPLICATE_EMAIL_DRIVER: "This email is already registered",
  DUPLICATE_LICENSE: "This license number is already registered",
  DUPLICATE_DOCUMENT_DRIVER: "This document number already exists",
  VEHICLE_REGISTRATION_INVALID:
    "Invalid vehicle registration number format. Expected format: XX00XX0000 (e.g., MH12AB1234)",
  ACCIDENT_TYPE_REQUIRED: "Please select accident/violation type",
  ACCIDENT_DATE_REQUIRED: "Please select accident/violation date",

  // General Errors
  VALIDATION_ERROR: "Please check the submitted data and fix the errors",
  SERVER_ERROR: "Server error. Please try again later",
  
  // Field Length Errors
  FIELD_TOO_LONG: "Field exceeds maximum allowed length",
  CUSTOMER_NAME_TOO_LONG: "Customer name cannot exceed 100 characters",
  CONTACT_ROLE_TOO_LONG: "Contact role cannot exceed 100 characters",
  CONTACT_TEAM_TOO_LONG: "Contact team cannot exceed 100 characters",
  DOCUMENT_FILE_NAME_TOO_LONG: "Document file name cannot exceed 500 characters. Please rename the file.",
  LINKEDIN_LINK_TOO_LONG: "LinkedIn link cannot exceed 500 characters",
  EMAIL_TOO_LONG: "Email address cannot exceed 100 characters",
  PHONE_NUMBER_TOO_LONG: "Phone number cannot exceed 20 characters",
  ADDRESS_TOO_LONG: "Address line cannot exceed 200 characters",
  REMARK_TOO_LONG: "Remark cannot exceed 255 characters",
  WEBSITE_URL_TOO_LONG: "Website URL cannot exceed 200 characters",
};
