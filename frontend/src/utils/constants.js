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
};

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  CONSIGNOR: "consignor",
  TRANSPORTER: "transporter",
  DRIVER: "driver",
};

// User Type ID to Role Mapping
export const USER_TYPE_ROLE_MAPPING = {
  UT001: USER_ROLES.CONSIGNOR,     // Consignor
  UT002: USER_ROLES.TRANSPORTER,   // Transporter
  UT003: USER_ROLES.TRANSPORTER,   // Independent Vehicle Owner -> Transporter
  UT004: USER_ROLES.TRANSPORTER,   // Transporter Contact -> Transporter
  UT005: USER_ROLES.TRANSPORTER,   // Vehicle Ownership -> Transporter
  UT006: USER_ROLES.CONSIGNOR,     // Consignor WH -> Consignor
  UT007: USER_ROLES.DRIVER,        // Driver
  UT008: USER_ROLES.ADMIN,         // Owner -> Admin
};

// Utility function to map user_type_id to role
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
