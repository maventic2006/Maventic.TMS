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

  // General Errors
  VALIDATION_ERROR: "Please check the submitted data and fix the errors",
  SERVER_ERROR: "Server error. Please try again later",
};
