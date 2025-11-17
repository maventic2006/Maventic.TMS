const ExcelJS = require("exceljs");

/**
 * Generate Excel template for bulk warehouse upload
 * @returns {Promise<Buffer>} Excel file buffer
 */
async function generateWarehouseBulkUploadTemplate() {
  const workbook = new ExcelJS.Workbook();

  // ========================================
  // SHEET 1: Warehouse Basic Information
  // ========================================
  const basicInfoSheet = workbook.addWorksheet("Warehouse Basic Information");
  basicInfoSheet.columns = [
    { header: "Warehouse_Unique_Id", key: "warehouse_unique_id", width: 20 },
    { header: "Warehouse_ID", key: "warehouse_id", width: 15 },
    { header: "Consignor_ID", key: "consignor_id", width: 15 },
    { header: "Warehouse_Type", key: "warehouse_type", width: 25 },
    { header: "Warehouse_Name1", key: "warehouse_name1", width: 35 },
    { header: "Warehouse_Name2", key: "warehouse_name2", width: 35 },
    { header: "Language", key: "language", width: 12 },
    { header: "Vehicle_Capacity", key: "vehicle_capacity", width: 18 },
    { header: "Virtual_Yard_In", key: "virtual_yard_in", width: 18 },
    {
      header: "Radius_Virtual_Yard_In",
      key: "radius_virtual_yard_in",
      width: 25,
    },
    { header: "Speed_Limit", key: "speed_limit", width: 15 },
    { header: "Weigh_Bridge_Availability", key: "weigh_bridge", width: 28 },
    { header: "Gatepass_System_Available", key: "gatepass_system", width: 28 },
    { header: "Fuel_Availability", key: "fuel_availability", width: 20 },
    { header: "Staging_Area", key: "staging_area", width: 18 },
    { header: "Driver_Waiting_Area", key: "driver_waiting_area", width: 22 },
    { header: "Gate_In_Checklist_Auth", key: "gate_in_checklist", width: 25 },
    { header: "Gate_Out_Checklist_Auth", key: "gate_out_checklist", width: 25 },
    { header: "Country", key: "country", width: 12 },
    { header: "State", key: "state", width: 12 },
    { header: "City", key: "city", width: 20 },
    { header: "District", key: "district", width: 20 },
    { header: "Street_1", key: "street_1", width: 35 },
    { header: "Street_2", key: "street_2", width: 35 },
    { header: "Postal_Code", key: "postal_code", width: 15 },
    { header: "VAT_Number", key: "vat_number", width: 20 },
    { header: "TIN_PAN", key: "tin_pan", width: 20 },
    { header: "TAN", key: "tan", width: 15 },
    { header: "Address_Type", key: "address_type", width: 20 },
    { header: "Material_Type", key: "material_type", width: 25 },
  ];

  // Style header row
  basicInfoSheet.getRow(1).font = {
    bold: true,
    color: { argb: "FFFFFFFF" },
    size: 11,
  };
  basicInfoSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  basicInfoSheet.getRow(1).alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  basicInfoSheet.getRow(1).height = 30;

  // Add sample data row
  basicInfoSheet.addRow({
    warehouse_unique_id: "AUTO-GENERATED",
    warehouse_id: "AUTO-GENERATED",
    consignor_id: "AUTO-FILLED",
    warehouse_type: "Manufacturing",
    warehouse_name1: "Central Warehouse",
    warehouse_name2: "Main Distribution Center",
    language: "EN",
    vehicle_capacity: 50,
    virtual_yard_in: "TRUE",
    radius_virtual_yard_in: 5,
    speed_limit: 20,
    weigh_bridge: "TRUE",
    gatepass_system: "TRUE",
    fuel_availability: "FALSE",
    staging_area: "TRUE",
    driver_waiting_area: "TRUE",
    gate_in_checklist: "FALSE",
    gate_out_checklist: "FALSE",
    country: "IN",
    state: "MH",
    city: "Mumbai",
    district: "Mumbai Suburban",
    street_1: "123 Industrial Area",
    street_2: "Near Highway Exit 5",
    postal_code: "400001",
    vat_number: "VAT12345678",
    tin_pan: "ABCDE1234F",
    tan: "ABCD12345E",
    address_type: "Primary",
    material_type: "General Goods",
  });

  // Add instructions row
  const instructionRow = basicInfoSheet.addRow({
    warehouse_unique_id: "Leave blank - Auto-generated",
    warehouse_id: "Leave blank - Auto-generated",
    consignor_id: "Leave blank - Auto-filled from your login",
    warehouse_type: "Select from master data",
    warehouse_name1: "Required - Max 30 chars, must be unique",
    warehouse_name2: "Required - Max 30 chars",
    language: "Default: EN",
    vehicle_capacity: "Required - Number, Min: 0",
    virtual_yard_in: "TRUE/FALSE",
    radius_virtual_yard_in: "In KM (if Virtual_Yard_In is TRUE)",
    speed_limit: "Default: 20 KM/H",
    weigh_bridge: "TRUE/FALSE",
    gatepass_system: "TRUE/FALSE",
    fuel_availability: "TRUE/FALSE",
    staging_area: "TRUE/FALSE",
    driver_waiting_area: "TRUE/FALSE",
    gate_in_checklist: "TRUE/FALSE",
    gate_out_checklist: "TRUE/FALSE",
    country: "ISO Code (e.g., IN, US)",
    state: "ISO Code (e.g., MH, CA)",
    city: "City name",
    district: "Optional",
    street_1: "Required",
    street_2: "Optional",
    postal_code: "Optional",
    vat_number: "Required - Must be unique",
    tin_pan: "Optional - Must be unique if provided",
    tan: "Optional - Must be unique if provided",
    address_type: "Select from master data",
    material_type: "Select from master data",
  });

  // Style instruction row
  instructionRow.font = { italic: true, color: { argb: "FF808080" }, size: 9 };
  instructionRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2F2F2" },
  };

  // ========================================
  // SHEET 2: Warehouse Sub Location Header
  // ========================================
  const subLocationHeaderSheet = workbook.addWorksheet("Sub Location Header");
  subLocationHeaderSheet.columns = [
    { header: "SubLocation_Hdr_Id", key: "sub_location_hdr_id", width: 22 },
    { header: "Warehouse_Name1", key: "warehouse_name1", width: 35 },
    { header: "Consignor_Id", key: "consignor_id", width: 15 },
    { header: "SubLocation_Type", key: "sub_location_type", width: 25 },
    { header: "SubLocation_Name", key: "sub_location_name", width: 25 },
    { header: "Description", key: "description", width: 40 },
  ];

  // Style header row
  subLocationHeaderSheet.getRow(1).font = {
    bold: true,
    color: { argb: "FFFFFFFF" },
    size: 11,
  };
  subLocationHeaderSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF70AD47" },
  };
  subLocationHeaderSheet.getRow(1).alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  subLocationHeaderSheet.getRow(1).height = 30;

  // Add sample data
  subLocationHeaderSheet.addRow({
    sub_location_hdr_id: "AUTO-GENERATED",
    warehouse_name1: "Central Warehouse",
    consignor_id: "AUTO-FILLED",
    sub_location_type: "Loading Zone",
    sub_location_name: "Zone A",
    description: "Primary loading area for heavy vehicles",
  });

  // Add instructions
  const subLocInstructionRow = subLocationHeaderSheet.addRow({
    sub_location_hdr_id: "Leave blank - Auto-generated",
    warehouse_name1: "Must match Warehouse_Name1 from Sheet 1",
    consignor_id: "Leave blank - Auto-filled",
    sub_location_type: "Select from master data",
    sub_location_name: "Name for this sub-location",
    description: "Optional - Description of the sub-location",
  });

  subLocInstructionRow.font = {
    italic: true,
    color: { argb: "FF808080" },
    size: 9,
  };
  subLocInstructionRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2F2F2" },
  };

  // ========================================
  // SHEET 3: Warehouse Sub Location Item (Coordinates)
  // ========================================
  const subLocationItemSheet = workbook.addWorksheet("Sub Location Item");
  subLocationItemSheet.columns = [
    { header: "SubLocation_Name", key: "sub_location_name", width: 25 },
    { header: "Warehouse_Name1", key: "warehouse_name1", width: 35 },
    { header: "Latitude", key: "latitude", width: 18 },
    { header: "Longitude", key: "longitude", width: 18 },
    { header: "Sequence", key: "sequence", width: 12 },
  ];

  // Style header row
  subLocationItemSheet.getRow(1).font = {
    bold: true,
    color: { argb: "FFFFFFFF" },
    size: 11,
  };
  subLocationItemSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFC000" },
  };
  subLocationItemSheet.getRow(1).alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  subLocationItemSheet.getRow(1).height = 30;

  // Add sample data (multiple coordinates for one sub-location)
  subLocationItemSheet.addRow({
    sub_location_name: "Zone A",
    warehouse_name1: "Central Warehouse",
    latitude: "19.0760",
    longitude: "72.8777",
    sequence: 1,
  });

  subLocationItemSheet.addRow({
    sub_location_name: "Zone A",
    warehouse_name1: "Central Warehouse",
    latitude: "19.0765",
    longitude: "72.8780",
    sequence: 2,
  });

  subLocationItemSheet.addRow({
    sub_location_name: "Zone A",
    warehouse_name1: "Central Warehouse",
    latitude: "19.0770",
    longitude: "72.8785",
    sequence: 3,
  });

  // Add instructions
  const itemInstructionRow = subLocationItemSheet.addRow({
    sub_location_name: "Must match SubLocation_Name from Sheet 2",
    warehouse_name1: "Must match Warehouse_Name1 from Sheet 1",
    latitude: "Decimal degrees (e.g., 19.0760)",
    longitude: "Decimal degrees (e.g., 72.8777)",
    sequence: "Order of coordinates (1, 2, 3, ...)",
  });

  itemInstructionRow.font = {
    italic: true,
    color: { argb: "FF808080" },
    size: 9,
  };
  itemInstructionRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF2F2F2" },
  };

  // ========================================
  // SHEET 4: Instructions
  // ========================================
  const instructionsSheet = workbook.addWorksheet("Instructions");
  instructionsSheet.columns = [
    { header: "Step", key: "step", width: 8 },
    { header: "Instructions", key: "instructions", width: 100 },
  ];

  // Style header
  instructionsSheet.getRow(1).font = { bold: true, size: 12 };
  instructionsSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF5B9BD5" },
  };

  // Add instructions
  const instructions = [
    {
      step: 1,
      instructions:
        "Fill in Sheet 1 (Warehouse Basic Information) with warehouse details. Warehouse_Name1 must be unique and will be used as a reference across all sheets.",
    },
    {
      step: 2,
      instructions:
        "Leave Warehouse_Unique_Id, Warehouse_ID, and Consignor_ID blank - these will be auto-generated by the system.",
    },
    {
      step: 3,
      instructions:
        "Use TRUE/FALSE for boolean fields (e.g., Virtual_Yard_In, Weigh_Bridge_Availability).",
    },
    {
      step: 4,
      instructions:
        "VAT_Number must be unique across all warehouses. TIN_PAN and TAN must also be unique if provided.",
    },
    {
      step: 5,
      instructions:
        "If you want to add geofencing coordinates, fill Sheet 2 (Sub Location Header) with sub-location details.",
    },
    {
      step: 6,
      instructions:
        "In Sheet 2, use the EXACT Warehouse_Name1 from Sheet 1 to link the sub-location to the correct warehouse.",
    },
    {
      step: 7,
      instructions:
        "Fill Sheet 3 (Sub Location Item) with geofencing coordinates. Use the EXACT SubLocation_Name from Sheet 2 and Warehouse_Name1 from Sheet 1.",
    },
    {
      step: 8,
      instructions:
        "You can add multiple coordinate rows for the same sub-location. Use the Sequence column to order them (1, 2, 3, ...).",
    },
    {
      step: 9,
      instructions:
        "Coordinates should be in decimal degrees format (e.g., Latitude: 19.0760, Longitude: 72.8777).",
    },
    {
      step: 10,
      instructions:
        "Save the file and upload it via the Bulk Upload button on the Warehouse Create page.",
    },
    {
      step: 11,
      instructions:
        "Monitor the upload progress in real-time. If there are validation errors, download the error report to see what needs to be fixed.",
    },
    {
      step: 12,
      instructions:
        "Only valid warehouses will be created. Invalid rows will be highlighted in the error report.",
    },
  ];

  instructions.forEach((instruction, index) => {
    const row = instructionsSheet.addRow(instruction);
    if (index % 2 === 0) {
      row.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEAF2F8" },
      };
    }
    row.alignment = { vertical: "top", wrapText: true };
    row.height = 40;
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = {
  generateWarehouseBulkUploadTemplate,
};
