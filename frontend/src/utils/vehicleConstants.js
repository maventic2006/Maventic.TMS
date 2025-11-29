// Vehicle Master Constants

// Vehicle Types (array format for dropdowns) - matching database
export const VEHICLE_TYPES = [
  { value: "VT001", label: "HCV - Heavy Commercial Vehicle" },
  { value: "VT002", label: "MCV - Medium Commercial Vehicle" },
  { value: "VT003", label: "LCV - Light Commercial Vehicle" },
  { value: "VT004", label: "TRAILER - Trailer" },
  { value: "VT005", label: "CONTAINER - Container" },
  { value: "VT006", label: "TANKER - Tanker" },
  { value: "VT007", label: "REFRIGERATED - Refrigerated Vehicle" },
  { value: "VT008", label: "FLATBED - Flatbed" },
];

// Usage Types
export const USAGE_TYPES = [
  { value: "PASSENGER", label: "Passenger" },
  { value: "CARGO", label: "Cargo" },
  { value: "SPECIAL_EQUIPMENT", label: "Special Equipment" },
];

// Vehicle Status
export const VEHICLE_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  MAINTENANCE: "Under Maintenance",
  BLACKLISTED: "Blacklisted",
  PENDING_APPROVAL: "Pending Approval",
  DECOMMISSIONED: "Decommissioned",
};

// Vehicle Status Options
export const VEHICLE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "MAINTENANCE", label: "Under Maintenance" },
  { value: "BLACKLISTED", label: "Blacklisted" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "DECOMMISSIONED", label: "Decommissioned" },
];

// Fuel Types (array format for dropdowns) - matching database  
export const FUEL_TYPES = [
  { value: "FT001", label: "DIESEL" },
  { value: "FT002", label: "CNG" },
  { value: "FT003", label: "ELECTRIC" },
  { value: "FT004", label: "PETROL" },
];

// Ownership Types (array format for dropdowns)
export const OWNERSHIP_TYPES = [
  { value: "OWNED", label: "Owned" },
  { value: "LEASED", label: "Leased" },
  { value: "RENTED", label: "Rented" },
  { value: "THIRD_PARTY", label: "Third Party" },
];

// Document Types for Vehicles
export const VEHICLE_DOCUMENT_TYPES = {
  RC: "Registration Certificate (RC)",
  INSURANCE: "Insurance Certificate",
  PERMIT: "Permit",
  FITNESS: "Fitness Certificate",
  PUC: "Pollution Under Control (PUC)",
  ROAD_TAX: "Road Tax Receipt",
  LOAN: "Loan Agreement",
  LEASE: "Lease Agreement",
  INSPECTION: "Inspection Report",
};

// Document Type Options
export const VEHICLE_DOCUMENT_TYPE_OPTIONS = [
  { value: "RC", label: "Registration Certificate (RC)" },
  { value: "INSURANCE", label: "Insurance Certificate" },
  { value: "PERMIT", label: "Permit" },
  { value: "FITNESS", label: "Fitness Certificate" },
  { value: "PUC", label: "Pollution Under Control (PUC)" },
  { value: "ROAD_TAX", label: "Road Tax Receipt" },
  { value: "LOAN", label: "Loan Agreement" },
  { value: "LEASE", label: "Lease Agreement" },
  { value: "INSPECTION", label: "Inspection Report" },
];

// Transmission Types (array format for dropdowns)
export const TRANSMISSION_TYPES = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATIC", label: "Automatic" },
  { value: "AMT", label: "AMT (Automated Manual Transmission)" },
];

// GPS Provider Options
export const GPS_PROVIDER_OPTIONS = [
  { value: "PROVIDER1", label: "GPS Provider 1" },
  { value: "PROVIDER2", label: "GPS Provider 2" },
  { value: "PROVIDER3", label: "GPS Provider 3" },
  { value: "CUSTOM", label: "Custom Provider" },
];

// Maintenance Types
export const MAINTENANCE_TYPES = {
  ROUTINE: "Routine Maintenance",
  PREVENTIVE: "Preventive Maintenance",
  CORRECTIVE: "Corrective Maintenance",
  EMERGENCY: "Emergency Repair",
};

// Maintenance Type Options
export const MAINTENANCE_TYPE_OPTIONS = [
  { value: "ROUTINE", label: "Routine Maintenance" },
  { value: "PREVENTIVE", label: "Preventive Maintenance" },
  { value: "CORRECTIVE", label: "Corrective Maintenance" },
  { value: "EMERGENCY", label: "Emergency Repair" },
];

// Service Frequency Options
export const SERVICE_FREQUENCY_OPTIONS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "HALF_YEARLY", label: "Half-Yearly" },
  { value: "YEARLY", label: "Yearly" },
  { value: "CUSTOM", label: "Custom" },
];

// Blacklist Reasons
export const BLACKLIST_REASONS = [
  { value: "ACCIDENT", label: "Multiple Accidents" },
  { value: "MAINTENANCE", label: "Poor Maintenance Record" },
  { value: "PERFORMANCE", label: "Poor Performance" },
  { value: "DOCUMENTS", label: "Expired Documents" },
  { value: "COMPLIANCE", label: "Non-Compliance" },
  { value: "OTHER", label: "Other Reason" },
];

// Capacity Units
export const CAPACITY_UNITS = {
  weight: [
    { value: "KG", label: "Kilograms (kg)" },
    { value: "TON", label: "Metric Tons (MT)" },
    { value: "LBS", label: "Pounds (lbs)" },
  ],
  volume: [
    { value: "CBM", label: "Cubic Meters (m³)" },
    { value: "CFT", label: "Cubic Feet (ft³)" },
    { value: "LITERS", label: "Liters (L)" },
  ],
};

// Door Types
export const DOOR_TYPES = [
  { value: "SWING", label: "Swing Door" },
  { value: "ROLL_UP", label: "Roll-Up Door" },
  { value: "SLIDING", label: "Sliding Door" },
  { value: "CURTAIN", label: "Curtain Side" },
  { value: "TAILGATE", label: "Tailgate" },
  { value: "NONE", label: "No Door (Open)" },
];

// Emission Standards
export const EMISSION_STANDARDS = [
  { value: "BS_II", label: "BS-II" },
  { value: "BS_III", label: "BS-III" },
  { value: "BS_IV", label: "BS-IV" },
  { value: "BS_V", label: "BS-V" },
  { value: "BS_VI", label: "BS-VI" },
  { value: "EURO_III", label: "Euro-III" },
  { value: "EURO_IV", label: "Euro-IV" },
  { value: "EURO_V", label: "Euro-V" },
  { value: "EURO_VI", label: "Euro-VI" },
];

// Suspension Types
export const SUSPENSION_TYPES = [
  { value: "LEAF_SPRING", label: "Leaf Spring" },
  { value: "AIR_SUSPENSION", label: "Air Suspension" },
  { value: "COIL_SPRING", label: "Coil Spring" },
  { value: "TORSION_BAR", label: "Torsion Bar" },
  { value: "HYDRAULIC", label: "Hydraulic" },
];

// Vehicle Condition
export const VEHICLE_CONDITIONS = [
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
];

// Permit Types
export const PERMIT_TYPES = [
  { value: "NATIONAL", label: "National Permit" },
  { value: "STATE", label: "State Permit" },
  { value: "INTER_STATE", label: "Inter-State Permit" },
  { value: "TEMPORARY", label: "Temporary Permit" },
  { value: "SPECIAL", label: "Special Permit" },
];

// Status Colors (matching TMS theme)
export const VEHICLE_STATUS_COLORS = {
  ACTIVE: { bg: "#D1FAE5", text: "#10B981" }, // Green
  INACTIVE: { bg: "#E5E7EB", text: "#6B7280" }, // Gray
  MAINTENANCE: { bg: "#FEF3C7", text: "#F97316" }, // Orange
  BLACKLISTED: { bg: "#FEE2E2", text: "#EF4444" }, // Red
  PENDING_APPROVAL: { bg: "#E0E7FF", text: "#6366F1" }, // Indigo
  DECOMMISSIONED: { bg: "#F3F4F6", text: "#9CA3AF" }, // Light Gray
};

// Vehicle Tabs (for Details Page)
export const VEHICLE_TABS = [
  { id: "basic", label: "Basic Information" },
  { id: "specifications", label: "Specifications" },
  { id: "capacity", label: "Capacity Details" },
  { id: "ownership", label: "Ownership Details" },
  { id: "maintenance", label: "Maintenance History" },
  { id: "documents", label: "Documents" },
  { id: "mappings", label: "Mappings" },
  { id: "dashboard", label: "Performance Dashboard" },
  { id: "gps", label: "GPS Tracker" },
];

// Vehicle Table Columns
export const VEHICLE_TABLE_COLUMNS = [
  { key: "vehicleId", label: "Vehicle ID", sortable: true },
  { key: "registrationNumber", label: "Registration No.", sortable: true },
  { key: "vehicleType", label: "Type", sortable: true },
  { key: "make", label: "Make/Brand", sortable: true },
  { key: "model", label: "Model", sortable: true },
  { key: "year", label: "Year", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "ownership", label: "Ownership", sortable: true },
  { key: "transporter", label: "Transporter", sortable: true },
  { key: "actions", label: "Actions", sortable: false },
];

// Error Messages specific to Vehicle Master
export const VEHICLE_ERROR_MESSAGES = {
  // Basic Information
  VEHICLE_ID_REQUIRED: "Vehicle ID is required",
  REGISTRATION_NUMBER_REQUIRED: "Registration number is required",
  REGISTRATION_NUMBER_INVALID: "Invalid registration number format",
  VEHICLE_TYPE_REQUIRED: "Vehicle type is required",
  MAKE_REQUIRED: "Make/Brand is required",
  MODEL_REQUIRED: "Model is required",
  YEAR_REQUIRED: "Manufacturing year is required",
  YEAR_INVALID: "Year must be between 1990 and current year",
  
  // Specifications
  ENGINE_NUMBER_REQUIRED: "Engine number is required",
  CHASSIS_NUMBER_REQUIRED: "Chassis number is required",
  FUEL_TYPE_REQUIRED: "Fuel type is required",
  
  // Ownership
  OWNERSHIP_TYPE_REQUIRED: "Ownership type is required",
  OWNER_NAME_REQUIRED: "Owner name is required",
  
  // Documents
  DOCUMENT_TYPE_REQUIRED: "Document type is required",
  DOCUMENT_NUMBER_REQUIRED: "Document number is required",
  EXPIRY_DATE_REQUIRED: "Expiry date is required for this document",
  EXPIRY_DATE_PAST: "Document has expired",
  
  // GPS
  GPS_DEVICE_ID_REQUIRED: "GPS device ID is required",
  GPS_PROVIDER_REQUIRED: "GPS provider is required",
  
  // General
  VALIDATION_ERROR: "Please fix the errors before submitting",
  NETWORK_ERROR: "Network error. Please try again",
  SERVER_ERROR: "Server error. Please contact support",
};

export default {
  VEHICLE_TYPES,
  VEHICLE_STATUS,
  VEHICLE_STATUS_OPTIONS,
  FUEL_TYPES,
  OWNERSHIP_TYPES,
  VEHICLE_DOCUMENT_TYPES,
  VEHICLE_DOCUMENT_TYPE_OPTIONS,
  TRANSMISSION_TYPES,
  GPS_PROVIDER_OPTIONS,
  MAINTENANCE_TYPES,
  MAINTENANCE_TYPE_OPTIONS,
  SERVICE_FREQUENCY_OPTIONS,
  BLACKLIST_REASONS,
  CAPACITY_UNITS,
  DOOR_TYPES,
  EMISSION_STANDARDS,
  PERMIT_TYPES,
  VEHICLE_STATUS_COLORS,
  VEHICLE_TABS,
  VEHICLE_TABLE_COLUMNS,
  VEHICLE_ERROR_MESSAGES,
  USAGE_TYPES,
  SUSPENSION_TYPES,
  VEHICLE_CONDITIONS,
};
