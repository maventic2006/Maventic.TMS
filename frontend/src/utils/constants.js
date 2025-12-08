// Application Constants
export const APP_NAME = "TMS - Transportation Management System";
export const APP_VERSION = "1.0.0";

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile",
  },
  INDENT: "/indent",
  RFQ: "/rfq",
  CONTRACT: "/contract",
  TRACKING: "/tracking",
  DASHBOARD: "/dashboard",
  TRANSPORTER: {
    CREATE: "/transporter",
    UPDATE: "/transporter",
    MASTER_DATA: "/transporter/master-data",
    STATES: "/transporter/states",
    CITIES: "/transporter/cities",
    MAPPING_MASTER_DATA: "/transporter/mapping-master-data",
    CONSIGNOR_MAPPINGS: "/transporter/:id/consignor-mappings",
    VEHICLE_MAPPINGS: "/transporter/:id/vehicle-mappings",
    DRIVER_MAPPINGS: "/transporter/:id/driver-mappings",
    OWNER_MAPPINGS: "/transporter/:id/owner-mappings",
    BLACKLIST_MAPPINGS: "/transporter/:id/blacklist-mappings",
  },
  WAREHOUSE: {
    LIST: "/warehouse",
    GET_BY_ID: "/warehouse",
    CREATE: "/warehouse",
    UPDATE: "/warehouse",
    MASTER_DATA: "/warehouse/master-data",
  },
  BULK_UPLOAD: {
    TEMPLATE: "/bulk-upload/template",
    UPLOAD: "/bulk-upload/upload",
    STATUS: "/bulk-upload/status",
    HISTORY: "/bulk-upload/history",
    ERROR_REPORT: "/bulk-upload/error-report",
  },
};

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  CONSIGNOR: "consignor",
  TRANSPORTER: "transporter",
  DRIVER: "driver",
  PRODUCT_OWNER: "product_owner",
};

// Note: User type mapping is now dynamic and fetched from database
// See utils/userTypes.js for the dynamic mapping implementation

// Legacy fallback mapping (will be replaced by database-driven mapping)
export const USER_TYPE_ROLE_MAPPING = {
  UT001: USER_ROLES.PRODUCT_OWNER, // Owner -> Product Owner
  UT002: USER_ROLES.TRANSPORTER, // Transporter
  UT003: USER_ROLES.TRANSPORTER, // Independent Vehicle Owner -> Transporter
  UT004: USER_ROLES.TRANSPORTER, // Transporter Contact -> Transporter
  UT005: USER_ROLES.TRANSPORTER, // Vehicle Ownership -> Transporter
  UT006: USER_ROLES.CONSIGNOR, // Consignor WH -> Consignor
  UT007: USER_ROLES.DRIVER, // Driver
  UT008: USER_ROLES.CONSIGNOR, // Consignor
};

// Legacy utility function - use mapUserTypeToRole from utils/userTypes.js instead
export const mapUserTypeToRole = (user_type_id) => {
  return USER_TYPE_ROLE_MAPPING[user_type_id] || null;
};

// Status Constants
export const INDENT_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PUBLISHED: "published",
  CANCELLED: "cancelled",
};

export const RFQ_STATUS = {
  ACTIVE: "active",
  CLOSED: "closed",
  AWARDED: "awarded",
  CANCELLED: "cancelled",
};

export const CONTRACT_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  COMPLETED: "completed",
  TERMINATED: "terminated",
};

export const TRACKING_STATUS = {
  ASSIGNED: "assigned",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  DELAYED: "delayed",
  EXCEPTION: "exception",
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// Centralized Error Messages
export const ERROR_MESSAGES = {
  // General Details Errors
  BUSINESS_NAME_REQUIRED: "Please enter the business name",
  BUSINESS_NAME_TOO_SHORT: "Business name must be at least 2 characters long",
  BUSINESS_NAME_TOO_LONG: "Business name cannot exceed 100 characters",
  FROM_DATE_REQUIRED: "Please select a start date",
  FROM_DATE_FUTURE: "Start date cannot be in the future",
  TO_DATE_FUTURE: "End date must be in the future",
  TO_DATE_BEFORE_FROM: "End date must be after the start date",
  TRANSPORT_MODE_REQUIRED:
    "Please select at least one transport mode (Road, Rail, Air, or Sea)",
  RATING_INVALID: "Rating must be between 0 and 5",

  // Address & Contact Errors
  VAT_NUMBER_REQUIRED: "Please enter the VAT/Tax number",
  VAT_NUMBER_TOO_SHORT: "VAT/Tax number must be at least 8 characters",
  VAT_NUMBER_TOO_LONG: "VAT/Tax number cannot exceed 15 characters",
  VAT_NUMBER_INVALID:
    "VAT/Tax number must contain only uppercase letters and numbers",
  VAT_NUMBER_DUPLICATE:
    "This VAT/Tax number is already used. Please enter a unique number",
  COUNTRY_REQUIRED: "Please select a country",
  STATE_REQUIRED: "Please select a state",
  CITY_REQUIRED: "Please select a city",
  ADDRESS_REQUIRED: "Please provide at least one address",
  CONTACT_REQUIRED:
    "Please provide at least one contact person for each address",

  // Contact Person Errors
  CONTACT_NAME_REQUIRED: "Please enter the contact person's name",
  CONTACT_NAME_TOO_SHORT: "Name must be at least 2 characters long",
  CONTACT_NAME_TOO_LONG: "Name cannot exceed 50 characters",
  CONTACT_NAME_INVALID: "Name can only contain letters and spaces",
  PHONE_NUMBER_REQUIRED: "Please enter a phone number",
  PHONE_NUMBER_INVALID:
    "Please enter a valid 10-digit phone number (e.g., 9876543210)",
  ALTERNATE_PHONE_INVALID:
    "Please enter a valid 10-digit alternate phone number",
  EMAIL_REQUIRED: "Please enter an email address",
  EMAIL_INVALID:
    "Please enter a valid email address (e.g., example@domain.com)",
  ALTERNATE_EMAIL_INVALID: "Please enter a valid alternate email address",
  WHATSAPP_NUMBER_INVALID: "Please enter a valid 10-digit WhatsApp number",

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
  DOCUMENT_NUMBER_INVALID:
    "Document number can only contain uppercase letters, numbers, hyphens, and forward slashes",
  DOCUMENT_COUNTRY_REQUIRED: "Please select the issuing country",
  DOCUMENT_VALID_FROM_REQUIRED: "Please select the start date",
  DOCUMENT_VALID_FROM_FUTURE: "Start date cannot be in the future",
  DOCUMENT_VALID_TO_REQUIRED: "Please select the expiry date",
  DOCUMENT_VALID_TO_BEFORE_FROM: "Expiry date must be after the start date",
  DOCUMENT_DUPLICATE:
    "This document number already exists for this document type",
  FILE_SIZE_TOO_LARGE: "File size must be less than 5MB",
  FILE_TYPE_NOT_ALLOWED:
    "Please upload a file in JPG, PNG, GIF, PDF, DOC, or DOCX format",

  // Driver-Specific Errors
  DRIVER_NAME_REQUIRED: "Please enter the driver's full name",
  DRIVER_NAME_TOO_SHORT: "Full name must be at least 2 characters long",
  DRIVER_NAME_TOO_LONG: "Full name cannot exceed 100 characters",
  DATE_OF_BIRTH_REQUIRED: "Please select date of birth",
  DATE_OF_BIRTH_FUTURE: "Date of birth cannot be in the future",
  DRIVER_AGE_INVALID: "Driver must be at least 18 years old",
  DRIVER_PHONE_REQUIRED: "Please enter a phone number",
  DRIVER_PHONE_INVALID:
    "Please enter a valid 10-digit phone number starting with 6-9",
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
  DRIVER_DOCUMENT_NUMBER_INVALID: "Document number format is invalid",
  LICENSE_NUMBER_INVALID: "License number format is invalid",
  DUPLICATE_PHONE_DRIVER: "This phone number is already registered",
  DUPLICATE_EMAIL_DRIVER: "This email is already registered",
  DUPLICATE_LICENSE: "This license number is already registered",
  DUPLICATE_DOCUMENT_DRIVER: "This document number already exists",
  VEHICLE_REGISTRATION_INVALID:
    "Invalid vehicle registration number format (e.g., MH12AB1234)",
  ACCIDENT_TYPE_REQUIRED: "Please select accident/violation type",
  ACCIDENT_DATE_REQUIRED: "Please select accident/violation date",

  // General Errors
  VALIDATION_ERROR: "Please check the form and fix the validation errors",
  SUBMISSION_ERROR: "Unable to submit the form. Please try again",
  NETWORK_ERROR: "Network error. Please check your internet connection",
  SERVER_ERROR: "Server error. Please try again later",
};

// Theme Constants
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Navigation Tabs
export const NAVIGATION_TABS = {
  DASHBOARD: "dashboard",
  INDENT: "indent",
  RFQ: "rfq",
  CONTRACT: "contract",
  TRACKING: "tracking",
  EPOD: "epod",
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "DD/MM/YYYY",
  API: "YYYY-MM-DD",
  DATETIME: "DD/MM/YYYY HH:mm",
  TIME: "HH:mm",
};

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ALLOWED_EXTENSIONS: [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".pdf",
    ".doc",
    ".docx",
  ],
};

// Modal Names
export const MODAL_NAMES = {
  CREATE_INDENT: "createIndent",
  EDIT_INDENT: "editIndent",
  CREATE_RFQ: "createRFQ",
  EDIT_RFQ: "editRFQ",
  CREATE_CONTRACT: "createContract",
  EDIT_CONTRACT: "editContract",
  VIEW_DETAILS: "viewDetails",
  CONFIRM_DELETE: "confirmDelete",
};

// Status Colors for UI
export const STATUS_COLORS = {
  // List View Theme Colors
  delivered: { bg: "#D1FAE5", text: "#10B981" },
  processing: { bg: "#E0E7FF", text: "#6366F1" },
  cancelled: { bg: "#FEE2E2", text: "#EF4444" },
  draft: { bg: "#E5E7EB", text: "#6B7280" },
  delayed: { bg: "#FEF3C7", text: "#F97316" },

  // Tab View Theme Colors
  approved: { bg: "#D1FAE5", text: "#10B981" },
  backToEdit: { border: "#F97316", text: "#F97316", bg: "transparent" },
  edit: { border: "#E5E7EB", text: "#0D1A33", bg: "transparent" },

  // General Pages Theme Colors
  pending: { bg: "#FDE68A", text: "#92400E" },
  reject: { border: "#DC2626", text: "#DC2626", bg: "transparent" },
};

// WebSocket Events
export const SOCKET_EVENTS = {
  JOIN_ROOM: "joinRoom",
  LEAVE_ROOM: "leaveRoom",
  INDENT_CREATED: "indentCreated",
  INDENT_UPDATED: "indentUpdated",
  STATUS_CHANGED: "statusChanged",
  POD_UPLOADED: "podUploaded",
  MESSAGE_RECEIVED: "messageReceived",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
  THEME: "theme",
  SIDEBAR_STATE: "sidebarState",
};

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
};
