const ExcelJS = require("exceljs");
const path = require("path");

/**
 * Master Data Values (from backend database)
 */
const MASTER_DATA = {
  warehouseTypes: [
    "WT001",
    "WT002",
    "WT003",
    "WT004",
    "WT005",
    "WT006",
    "WT007",
  ],
  materialTypes: [
    "MT001",
    "MT002",
    "MT003",
    "MT004",
    "MT005",
    "MT006",
    "MT007",
    "MT008",
  ],
  addressTypes: ["AT001", "AT002", "AT003", "AT004", "AT005"],
  countries: [
    { code: "IN", name: "India", states: ["MH", "DL", "KA", "TN", "GJ"] },
    {
      code: "US",
      name: "United States",
      states: ["CA", "NY", "TX", "FL", "IL"],
    },
  ],
  cities: {
    "IN-MH": ["Mumbai", "Pune", "Nagpur"],
    "IN-DL": ["New Delhi", "Delhi"],
    "IN-KA": ["Bangalore", "Mysore"],
    "IN-TN": ["Chennai", "Coimbatore"],
    "IN-GJ": ["Ahmedabad", "Surat"],
    "US-CA": ["Los Angeles", "San Francisco", "San Diego"],
    "US-NY": ["New York", "Buffalo"],
    "US-TX": ["Houston", "Dallas", "Austin"],
    "US-FL": ["Miami", "Orlando", "Tampa"],
    "US-IL": ["Chicago", "Springfield"],
  },
};

/**
 * Generate a valid warehouse data object
 */
function generateValidWarehouse(index) {
  const countryIndex = index % MASTER_DATA.countries.length;
  const country = MASTER_DATA.countries[countryIndex];
  const stateIndex = index % country.states.length;
  const state = country.states[stateIndex];
  const cityKey = `${country.code}-${state}`;
  const cities = MASTER_DATA.cities[cityKey] || ["Default City"];
  const city = cities[index % cities.length];

  return {
    // Auto-generated fields (leave empty)
    Warehouse_Unique_Id: "",
    Warehouse_ID: "",
    Consignor_ID: "",
    // Required fields
    Warehouse_Type:
      MASTER_DATA.warehouseTypes[index % MASTER_DATA.warehouseTypes.length],
    Warehouse_Name1: `TEST-WH-${String(index + 1).padStart(4, "0")}`,
    Warehouse_Name2: `Test Warehouse ${index + 1}`,
    Language: "EN",
    Vehicle_Capacity: 50 + index * 10,
    Virtual_Yard_In: index % 2 === 0 ? "TRUE" : "FALSE",
    Radius_Virtual_Yard_In: 500,
    Speed_Limit: 20,
    Weigh_Bridge_Availability: index % 3 === 0 ? "TRUE" : "FALSE",
    Gatepass_System_Available: "TRUE",
    Fuel_Availability: index % 2 === 0 ? "TRUE" : "FALSE",
    Staging_Area: "TRUE",
    Driver_Waiting_Area: "TRUE",
    Gate_In_Checklist_Auth: "TRUE",
    Gate_Out_Checklist_Auth: "TRUE",
    // Address fields
    Country: country.code,
    State: state,
    City: city,
    District: `District ${index + 1}`,
    Street_1: `${100 + index} Main Street`,
    Street_2: `Building ${index + 1}`,
    Postal_Code: String(400000 + index).padStart(6, "0"),
    // Tax fields (must be unique)
    VAT_Number: `VAT${String(10000 + index).padStart(10, "0")}`,
    TIN_PAN: `TIN${String(20000 + index).padStart(10, "0")}`,
    TAN: index % 5 === 0 ? `TAN${String(30000 + index).padStart(10, "0")}` : "",
    // Master data references
    Address_Type:
      MASTER_DATA.addressTypes[index % MASTER_DATA.addressTypes.length],
    Material_Type:
      MASTER_DATA.materialTypes[index % MASTER_DATA.materialTypes.length],
  };
}

/**
 * Generate an invalid warehouse with various validation errors
 */
function generateInvalidWarehouse(index) {
  const errorType = index % 5;

  switch (errorType) {
    case 0: // Missing required fields
      return {
        Warehouse_Unique_Id: "",
        Warehouse_ID: "",
        Consignor_ID: "",
        Warehouse_Type: "", // Missing
        Warehouse_Name1: "", // Missing
        Warehouse_Name2: "",
        Language: "EN",
        Vehicle_Capacity: 0,
        Virtual_Yard_In: "FALSE",
        Radius_Virtual_Yard_In: 0,
        Speed_Limit: 20,
        Weigh_Bridge_Availability: "FALSE",
        Gatepass_System_Available: "FALSE",
        Fuel_Availability: "FALSE",
        Staging_Area: "FALSE",
        Driver_Waiting_Area: "FALSE",
        Gate_In_Checklist_Auth: "FALSE",
        Gate_Out_Checklist_Auth: "FALSE",
        Country: "", // Missing
        State: "", // Missing
        City: "", // Missing
        District: "",
        Street_1: "", // Missing
        Street_2: "",
        Postal_Code: "",
        VAT_Number: "", // Missing
        TIN_PAN: "",
        TAN: "",
        Address_Type: "", // Missing
        Material_Type: "", // Missing
      };

    case 1: // Invalid data types
      return {
        Warehouse_Unique_Id: "",
        Warehouse_ID: "",
        Consignor_ID: "",
        Warehouse_Type: "WT001",
        Warehouse_Name1: `INVALID-TYPE-${index}`,
        Warehouse_Name2: `Invalid Type Test ${index}`,
        Language: "EN",
        Vehicle_Capacity: "NOT_A_NUMBER", // Should be numeric
        Virtual_Yard_In: "YES", // Should be TRUE/FALSE
        Radius_Virtual_Yard_In: "LARGE", // Should be numeric
        Speed_Limit: "FAST", // Should be numeric
        Weigh_Bridge_Availability: "YES",
        Gatepass_System_Available: "YES",
        Fuel_Availability: "YES",
        Staging_Area: "YES",
        Driver_Waiting_Area: "YES",
        Gate_In_Checklist_Auth: "YES",
        Gate_Out_Checklist_Auth: "YES",
        Country: "IN",
        State: "MH",
        City: "Mumbai",
        District: "Mumbai District",
        Street_1: "123 Test Street",
        Street_2: "",
        Postal_Code: "400001",
        VAT_Number: `INVALID-VAT-${index}`,
        TIN_PAN: `INVALID-TIN-${index}`,
        TAN: "",
        Address_Type: "AT001",
        Material_Type: "MT001",
      };

    case 2: // Invalid master data references
      return {
        Warehouse_Unique_Id: "",
        Warehouse_ID: "",
        Consignor_ID: "",
        Warehouse_Type: "INVALID_TYPE", // Not in master data
        Warehouse_Name1: `INVALID-MASTER-${index}`,
        Warehouse_Name2: `Invalid Master Data ${index}`,
        Language: "EN",
        Vehicle_Capacity: 100,
        Virtual_Yard_In: "TRUE",
        Radius_Virtual_Yard_In: 500,
        Speed_Limit: 20,
        Weigh_Bridge_Availability: "TRUE",
        Gatepass_System_Available: "TRUE",
        Fuel_Availability: "TRUE",
        Staging_Area: "TRUE",
        Driver_Waiting_Area: "TRUE",
        Gate_In_Checklist_Auth: "TRUE",
        Gate_Out_Checklist_Auth: "TRUE",
        Country: "XX", // Invalid country code
        State: "ZZ", // Invalid state code
        City: "Invalid City",
        District: "Invalid District",
        Street_1: "456 Invalid Street",
        Street_2: "",
        Postal_Code: "999999",
        VAT_Number: `VATIN${String(40000 + index).padStart(10, "0")}`,
        TIN_PAN: `TININ${String(50000 + index).padStart(10, "0")}`,
        TAN: "",
        Address_Type: "INVALID_AT", // Not in master data
        Material_Type: "INVALID_MT", // Not in master data
      };

    case 3: // Duplicate VAT number
      return {
        Warehouse_Unique_Id: "",
        Warehouse_ID: "",
        Consignor_ID: "",
        Warehouse_Type: "WT001",
        Warehouse_Name1: `DUPLICATE-VAT-${index}`,
        Warehouse_Name2: `Duplicate VAT Test ${index}`,
        Language: "EN",
        Vehicle_Capacity: 100,
        Virtual_Yard_In: "TRUE",
        Radius_Virtual_Yard_In: 500,
        Speed_Limit: 20,
        Weigh_Bridge_Availability: "TRUE",
        Gatepass_System_Available: "TRUE",
        Fuel_Availability: "TRUE",
        Staging_Area: "TRUE",
        Driver_Waiting_Area: "TRUE",
        Gate_In_Checklist_Auth: "TRUE",
        Gate_Out_Checklist_Auth: "TRUE",
        Country: "IN",
        State: "MH",
        City: "Mumbai",
        District: "Mumbai",
        Street_1: "789 Duplicate Street",
        Street_2: "",
        Postal_Code: "400001",
        VAT_Number: "VAT_DUPLICATE_001", // Same for all case 3 warehouses
        TIN_PAN: `TINDUP${String(60000 + index).padStart(10, "0")}`,
        TAN: "",
        Address_Type: "AT001",
        Material_Type: "MT001",
      };

    case 4: // Warehouse name too long
      return {
        Warehouse_Unique_Id: "",
        Warehouse_ID: "",
        Consignor_ID: "",
        Warehouse_Type: "WT001",
        Warehouse_Name1:
          "THIS_IS_A_VERY_LONG_WAREHOUSE_NAME_THAT_EXCEEDS_30_CHARACTERS", // Max 30
        Warehouse_Name2: `Long Name Test ${index}`,
        Language: "EN",
        Vehicle_Capacity: 100,
        Virtual_Yard_In: "TRUE",
        Radius_Virtual_Yard_In: 500,
        Speed_Limit: 20,
        Weigh_Bridge_Availability: "TRUE",
        Gatepass_System_Available: "TRUE",
        Fuel_Availability: "TRUE",
        Staging_Area: "TRUE",
        Driver_Waiting_Area: "TRUE",
        Gate_In_Checklist_Auth: "TRUE",
        Gate_Out_Checklist_Auth: "TRUE",
        Country: "IN",
        State: "MH",
        City: "Mumbai",
        District: "Mumbai",
        Street_1: "101 Long Name Street",
        Street_2: "",
        Postal_Code: "400001",
        VAT_Number: `VATLN${String(70000 + index).padStart(10, "0")}`,
        TIN_PAN: `TINLN${String(80000 + index).padStart(10, "0")}`,
        TAN: "",
        Address_Type: "AT001",
        Material_Type: "MT001",
      };

    default:
      return generateInvalidWarehouse(0);
  }
}

/**
 * Generate sub-location header for a warehouse
 */
function generateSubLocationHeader(warehouseName, index) {
  return {
    SubLocation_Hdr_Id: "", // Auto-generated
    Warehouse_Name1: warehouseName,
    Consignor_Id: "", // Auto-filled
    SubLocation_Type: "GEOFENCE",
    SubLocation_Name: `${warehouseName}-SUB-${index + 1}`,
    Description: `Sub-location ${index + 1} for ${warehouseName}`,
  };
}

/**
 * Generate sub-location coordinates (polygon points)
 */
function generateSubLocationItems(warehouseName, subLocationName, baseIndex) {
  // Create a rectangle polygon (4 points)
  const baseLat = 19.0 + baseIndex * 0.01;
  const baseLng = 72.8 + baseIndex * 0.01;

  return [
    {
      SubLocation_Name: subLocationName,
      Warehouse_Name1: warehouseName,
      Latitude: baseLat,
      Longitude: baseLng,
      Sequence: 1,
    },
    {
      SubLocation_Name: subLocationName,
      Warehouse_Name1: warehouseName,
      Latitude: baseLat + 0.001,
      Longitude: baseLng,
      Sequence: 2,
    },
    {
      SubLocation_Name: subLocationName,
      Warehouse_Name1: warehouseName,
      Latitude: baseLat + 0.001,
      Longitude: baseLng + 0.001,
      Sequence: 3,
    },
    {
      SubLocation_Name: subLocationName,
      Warehouse_Name1: warehouseName,
      Latitude: baseLat,
      Longitude: baseLng + 0.001,
      Sequence: 4,
    },
  ];
}

/**
 * Create Excel file with warehouse test data
 */
async function createTestFile(
  filename,
  warehouses,
  includeSubLocations = true
) {
  const workbook = new ExcelJS.Workbook();

  // SHEET 1: Warehouse Basic Information
  const basicInfoSheet = workbook.addWorksheet("Warehouse Basic Information");

  // Define columns
  basicInfoSheet.columns = [
    { header: "Warehouse_Unique_Id", key: "Warehouse_Unique_Id", width: 20 },
    { header: "Warehouse_ID", key: "Warehouse_ID", width: 15 },
    { header: "Consignor_ID", key: "Consignor_ID", width: 15 },
    { header: "Warehouse_Type", key: "Warehouse_Type", width: 18 },
    { header: "Warehouse_Name1", key: "Warehouse_Name1", width: 25 },
    { header: "Warehouse_Name2", key: "Warehouse_Name2", width: 25 },
    { header: "Language", key: "Language", width: 12 },
    { header: "Vehicle_Capacity", key: "Vehicle_Capacity", width: 18 },
    { header: "Virtual_Yard_In", key: "Virtual_Yard_In", width: 18 },
    {
      header: "Radius_Virtual_Yard_In",
      key: "Radius_Virtual_Yard_In",
      width: 25,
    },
    { header: "Speed_Limit", key: "Speed_Limit", width: 15 },
    {
      header: "Weigh_Bridge_Availability",
      key: "Weigh_Bridge_Availability",
      width: 28,
    },
    {
      header: "Gatepass_System_Available",
      key: "Gatepass_System_Available",
      width: 28,
    },
    { header: "Fuel_Availability", key: "Fuel_Availability", width: 20 },
    { header: "Staging_Area", key: "Staging_Area", width: 18 },
    { header: "Driver_Waiting_Area", key: "Driver_Waiting_Area", width: 22 },
    {
      header: "Gate_In_Checklist_Auth",
      key: "Gate_In_Checklist_Auth",
      width: 25,
    },
    {
      header: "Gate_Out_Checklist_Auth",
      key: "Gate_Out_Checklist_Auth",
      width: 25,
    },
    { header: "Country", key: "Country", width: 12 },
    { header: "State", key: "State", width: 12 },
    { header: "City", key: "City", width: 18 },
    { header: "District", key: "District", width: 18 },
    { header: "Street_1", key: "Street_1", width: 30 },
    { header: "Street_2", key: "Street_2", width: 30 },
    { header: "Postal_Code", key: "Postal_Code", width: 15 },
    { header: "VAT_Number", key: "VAT_Number", width: 20 },
    { header: "TIN_PAN", key: "TIN_PAN", width: 20 },
    { header: "TAN", key: "TAN", width: 15 },
    { header: "Address_Type", key: "Address_Type", width: 18 },
    { header: "Material_Type", key: "Material_Type", width: 18 },
  ];

  // Style header row
  basicInfoSheet.getRow(1).font = { bold: true, size: 11 };
  basicInfoSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  basicInfoSheet.getRow(1).alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  // Add sample data row (for reference - will be skipped by parser)
  const sampleRow = generateValidWarehouse(999);
  sampleRow.Warehouse_Name1 = "SAMPLE-WAREHOUSE";
  sampleRow.VAT_Number = "SAMPLE-VAT-NUMBER";
  basicInfoSheet.addRow(sampleRow);
  basicInfoSheet.getRow(2).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFD966" },
  };

  // Add instructions row (will be skipped by parser)
  const instructionRow = basicInfoSheet.addRow({
    Warehouse_Unique_Id: "AUTO-GENERATED",
    Warehouse_ID: "AUTO-GENERATED",
    Consignor_ID: "AUTO-FILLED",
    Warehouse_Type: "Select from: WT001-WT007",
    Warehouse_Name1: "Required - Max 30 chars, must be unique",
    Warehouse_Name2: "Optional",
    Language: "EN (default)",
    Vehicle_Capacity: "Required - Numeric",
    Virtual_Yard_In: "TRUE or FALSE",
    Radius_Virtual_Yard_In: "Numeric (meters)",
    Speed_Limit: "Numeric (default 20)",
    Weigh_Bridge_Availability: "TRUE or FALSE",
    Gatepass_System_Available: "TRUE or FALSE",
    Fuel_Availability: "TRUE or FALSE",
    Staging_Area: "TRUE or FALSE",
    Driver_Waiting_Area: "TRUE or FALSE",
    Gate_In_Checklist_Auth: "TRUE or FALSE",
    Gate_Out_Checklist_Auth: "TRUE or FALSE",
    Country: "ISO code (e.g., IN, US)",
    State: "ISO code (e.g., MH, CA)",
    City: "City name",
    District: "Optional",
    Street_1: "Required",
    Street_2: "Optional",
    Postal_Code: "Optional",
    VAT_Number: "Required - Must be unique",
    TIN_PAN: "Optional - Must be unique if provided",
    TAN: "Optional",
    Address_Type: "Select from: AT001-AT005",
    Material_Type: "Select from: MT001-MT008",
  });
  instructionRow.font = { italic: true, size: 10 };
  instructionRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFE699" },
  };

  // Add actual test data (starts from row 4 - this is where parser starts reading)
  warehouses.forEach((warehouse) => {
    basicInfoSheet.addRow(warehouse);
  });

  // SHEET 2: Sub Location Header
  const subLocHeaderSheet = workbook.addWorksheet("Sub Location Header");
  subLocHeaderSheet.columns = [
    { header: "SubLocation_Hdr_Id", key: "SubLocation_Hdr_Id", width: 25 },
    { header: "Warehouse_Name1", key: "Warehouse_Name1", width: 25 },
    { header: "Consignor_Id", key: "Consignor_Id", width: 18 },
    { header: "SubLocation_Type", key: "SubLocation_Type", width: 20 },
    { header: "SubLocation_Name", key: "SubLocation_Name", width: 30 },
    { header: "Description", key: "Description", width: 40 },
  ];

  subLocHeaderSheet.getRow(1).font = { bold: true, size: 11 };
  subLocHeaderSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };

  // Add sample data
  subLocHeaderSheet.addRow({
    SubLocation_Hdr_Id: "AUTO-GENERATED",
    Warehouse_Name1: "SAMPLE-WAREHOUSE",
    Consignor_Id: "AUTO-FILLED",
    SubLocation_Type: "GEOFENCE",
    SubLocation_Name: "SAMPLE-SUB-LOCATION",
    Description: "Sample description",
  });
  subLocHeaderSheet.getRow(2).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFD966" },
  };

  // Add instructions
  const subLocInstructionRow = subLocHeaderSheet.addRow({
    SubLocation_Hdr_Id: "AUTO-GENERATED",
    Warehouse_Name1: "Must match a Warehouse_Name1 from Sheet 1",
    Consignor_Id: "AUTO-FILLED",
    SubLocation_Type: "GEOFENCE",
    SubLocation_Name: "Unique name for this sub-location",
    Description: "Optional description",
  });
  subLocInstructionRow.font = { italic: true, size: 10 };
  subLocInstructionRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFE699" },
  };

  // Add sub-location headers (if enabled)
  if (includeSubLocations) {
    warehouses.forEach((warehouse, whIndex) => {
      // Add 2 sub-locations per warehouse
      for (let i = 0; i < 2; i++) {
        const subLoc = generateSubLocationHeader(warehouse.Warehouse_Name1, i);
        subLocHeaderSheet.addRow(subLoc);
      }
    });
  }

  // SHEET 3: Sub Location Item
  const subLocItemSheet = workbook.addWorksheet("Sub Location Item");
  subLocItemSheet.columns = [
    { header: "SubLocation_Name", key: "SubLocation_Name", width: 30 },
    { header: "Warehouse_Name1", key: "Warehouse_Name1", width: 25 },
    { header: "Latitude", key: "Latitude", width: 15 },
    { header: "Longitude", key: "Longitude", width: 15 },
    { header: "Sequence", key: "Sequence", width: 12 },
  ];

  subLocItemSheet.getRow(1).font = { bold: true, size: 11 };
  subLocItemSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };

  // Add sample data (4 points for polygon)
  const sampleCoords = [
    {
      SubLocation_Name: "SAMPLE-SUB-LOCATION",
      Warehouse_Name1: "SAMPLE-WAREHOUSE",
      Latitude: 19.076,
      Longitude: 72.8777,
      Sequence: 1,
    },
    {
      SubLocation_Name: "SAMPLE-SUB-LOCATION",
      Warehouse_Name1: "SAMPLE-WAREHOUSE",
      Latitude: 19.077,
      Longitude: 72.8777,
      Sequence: 2,
    },
    {
      SubLocation_Name: "SAMPLE-SUB-LOCATION",
      Warehouse_Name1: "SAMPLE-WAREHOUSE",
      Latitude: 19.077,
      Longitude: 72.8787,
      Sequence: 3,
    },
    {
      SubLocation_Name: "SAMPLE-SUB-LOCATION",
      Warehouse_Name1: "SAMPLE-WAREHOUSE",
      Latitude: 19.076,
      Longitude: 72.8787,
      Sequence: 4,
    },
  ];
  sampleCoords.forEach((coord) => {
    const row = subLocItemSheet.addRow(coord);
    row.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFD966" },
    };
  });

  // Add instruction row
  const coordInstructionRow = subLocItemSheet.addRow({
    SubLocation_Name: "Must match SubLocation_Name from Sheet 2",
    Warehouse_Name1: "Must match Warehouse_Name1 from Sheet 1",
    Latitude: "Decimal degrees (e.g., 19.0760)",
    Longitude: "Decimal degrees (e.g., 72.8777)",
    Sequence: "Order of polygon points (1, 2, 3...)",
  });
  coordInstructionRow.font = { italic: true, size: 10 };
  coordInstructionRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFE699" },
  };

  // Add coordinate items (if enabled)
  if (includeSubLocations) {
    warehouses.forEach((warehouse, whIndex) => {
      // Add coordinates for 2 sub-locations per warehouse
      for (let i = 0; i < 2; i++) {
        const subLocationName = `${warehouse.Warehouse_Name1}-SUB-${i + 1}`;
        const coords = generateSubLocationItems(
          warehouse.Warehouse_Name1,
          subLocationName,
          whIndex * 2 + i
        );
        coords.forEach((coord) => {
          subLocItemSheet.addRow(coord);
        });
      }
    });
  }

  // SHEET 4: Instructions
  const instructionsSheet = workbook.addWorksheet("Instructions");
  instructionsSheet.columns = [
    { header: "Instructions", key: "instructions", width: 100 },
  ];

  instructionsSheet.getRow(1).font = { bold: true, size: 12 };
  instructionsSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };

  const instructions = [
    "",
    "📋 WAREHOUSE BULK UPLOAD INSTRUCTIONS",
    "",
    "1. DATA ENTRY GUIDELINES:",
    "   - Fill data starting from Row 4 in each sheet (Rows 1-3 are for reference only)",
    "   - Do not modify column headers",
    "   - Leave auto-generated fields empty (Warehouse_Unique_Id, Warehouse_ID, Consignor_ID, SubLocation_Hdr_Id)",
    "",
    "2. REQUIRED FIELDS (Sheet 1 - Warehouse Basic Information):",
    "   - Warehouse_Type: Must be one of WT001-WT007",
    "   - Warehouse_Name1: Max 30 characters, must be unique",
    "   - Vehicle_Capacity: Numeric value (minimum 0)",
    "   - Country, State, City: Use ISO codes for Country/State",
    "   - Street_1: Required address field",
    "   - VAT_Number: Required and must be unique",
    "   - Address_Type: Must be one of AT001-AT005",
    "   - Material_Type: Must be one of MT001-MT008",
    "",
    "3. BOOLEAN FIELDS:",
    "   - Use TRUE or FALSE (case-insensitive)",
    "   - Examples: Virtual_Yard_In, Weigh_Bridge_Availability, etc.",
    "",
    "4. SUB-LOCATIONS (Optional):",
    "   - Sheet 2 defines sub-location headers",
    "   - Warehouse_Name1 must match exactly from Sheet 1",
    "   - Sheet 3 defines polygon coordinates for geofencing",
    "   - SubLocation_Name must match from Sheet 2",
    "   - Add multiple coordinate rows for polygon shape (minimum 3 points)",
    "   - Sequence determines the order of polygon points",
    "",
    "5. VALIDATION RULES:",
    "   - Duplicate VAT_Number will be rejected",
    "   - Duplicate TIN_PAN will be rejected (if provided)",
    "   - Invalid master data references (Warehouse_Type, Material_Type, etc.) will fail",
    "   - Missing required fields will cause validation errors",
    "",
    "6. TESTING THIS FILE:",
    "   - Upload via Warehouse Maintenance → Bulk Upload button",
    "   - System will validate all rows and report errors",
    "   - Download error report if validation fails",
    "   - Check batch status in Bulk Upload History",
    "",
    "7. COUNTRY/STATE CODES:",
    "   - India: IN (States: MH, DL, KA, TN, GJ, etc.)",
    "   - United States: US (States: CA, NY, TX, FL, IL, etc.)",
    "   - Use standard ISO 3166-1 alpha-2 country codes",
    "   - Use standard ISO 3166-2 state/province codes",
    "",
    "8. SUPPORT:",
    "   - For issues, check the error report downloaded after upload",
    "   - Contact system administrator for master data values",
  ];

  instructions.forEach((instruction, index) => {
    if (index === 0) return; // Skip first row (header)
    const row = instructionsSheet.addRow({ instructions: instruction });
    if (instruction.startsWith("📋") || instruction.match(/^\d+\./)) {
      row.font = { bold: true, size: 11 };
    }
  });

  // Save file
  const filepath = path.join(__dirname, filename);
  await workbook.xlsx.writeFile(filepath);
  console.log(`✅ Created: ${filename} (${warehouses.length} warehouses)`);
  return filepath;
}

/**
 * Main execution
 */
async function main() {
  console.log("🏗️  Generating warehouse bulk upload test files...\n");

  // Test 1: All Valid (10 warehouses)
  console.log("📝 Test 1: All Valid Data (10 warehouses)");
  const validWarehouses = [];
  for (let i = 0; i < 10; i++) {
    validWarehouses.push(generateValidWarehouse(i));
  }
  await createTestFile(
    "warehouse-test-all-valid-10.xlsx",
    validWarehouses,
    true
  );

  // Test 2: All Invalid (10 warehouses)
  console.log("📝 Test 2: All Invalid Data (10 warehouses)");
  const invalidWarehouses = [];
  for (let i = 0; i < 10; i++) {
    invalidWarehouses.push(generateInvalidWarehouse(i));
  }
  await createTestFile(
    "warehouse-test-all-invalid-10.xlsx",
    invalidWarehouses,
    false
  );

  // Test 3: Mixed (7 valid, 3 invalid)
  console.log("📝 Test 3: Mixed Data (7 valid, 3 invalid)");
  const mixedWarehouses = [];
  for (let i = 0; i < 7; i++) {
    mixedWarehouses.push(generateValidWarehouse(100 + i));
  }
  for (let i = 0; i < 3; i++) {
    mixedWarehouses.push(generateInvalidWarehouse(200 + i));
  }
  await createTestFile(
    "warehouse-test-mixed-7valid-3invalid.xlsx",
    mixedWarehouses,
    true
  );

  // Test 4: Stress Test (100 warehouses)
  console.log("📝 Test 4: Stress Test (100 warehouses)");
  const stressWarehouses = [];
  for (let i = 0; i < 100; i++) {
    stressWarehouses.push(generateValidWarehouse(1000 + i));
  }
  await createTestFile(
    "warehouse-test-stress-100.xlsx",
    stressWarehouses,
    true
  );

  console.log("\n✅ All test files generated successfully!");
  console.log("\n📋 Test Files Created:");
  console.log("   1. warehouse-test-all-valid-10.xlsx - All data valid");
  console.log(
    "   2. warehouse-test-all-invalid-10.xlsx - All data invalid (various error types)"
  );
  console.log(
    "   3. warehouse-test-mixed-7valid-3invalid.xlsx - Mixed valid/invalid data"
  );
  console.log(
    "   4. warehouse-test-stress-100.xlsx - Performance test with 100 warehouses"
  );
  console.log("\n🚀 Ready to test bulk upload functionality!");
}

// Run the generator
main().catch((error) => {
  console.error("❌ Error generating test files:", error);
  process.exit(1);
});
