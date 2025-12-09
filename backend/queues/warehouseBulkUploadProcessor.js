const ExcelJS = require("exceljs");
const knex = require("knex")(require("../knexfile").development);
const fs = require("fs");
const path = require("path");
const { Country, State, City } = require("country-state-city");

/**
 * Generate unique warehouse ID
 */
const generateWarehouseId = async (trx = knex) => {
  const result = await trx("warehouse_basic_information")
    .count("* as count")
    .first();
  const count = parseInt(result.count) + 1;
  return `WH${count.toString().padStart(3, "0")}`;
};

/**
 * Generate unique address ID
 */
const generateAddressId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("tms_address").count("* as count").first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `ADDR${count.toString().padStart(4, "0")}`;

    const existing = await trx("tms_address")
      .where("address_id", newId)
      .first();
    if (!existing) return newId;
    attempts++;
  }

  throw new Error("Failed to generate unique address ID after 100 attempts");
};

/**
 * Generate unique document ID
 */
const generateDocumentId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("warehouse_documents").count("* as count").first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `WDOC${count.toString().padStart(4, "0")}`;

    const existing = await trx("warehouse_documents")
      .where("document_unique_id", newId)
      .first();
    if (!existing) return newId;
    attempts++;
  }

  throw new Error("Failed to generate unique document ID after 100 attempts");
};

/**
 * Generate unique sub-location header ID
 */
const generateSubLocationHeaderId = async (trx = knex) => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const result = await trx("warehouse_sub_location_header")
      .count("* as count")
      .first();
    const count = parseInt(result.count) + 1 + attempts;
    const newId = `WSLH${count.toString().padStart(4, "0")}`;

    const existing = await trx("warehouse_sub_location_header")
      .where("sub_location_hdr_id", newId)
      .first();
    if (!existing) return newId;
    attempts++;
  }

  throw new Error(
    "Failed to generate unique sub-location header ID after 100 attempts"
  );
};

/**
 * Parse Excel file and extract warehouse data
 */
async function parseWarehouseExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const basicInfoSheet = workbook.getWorksheet("Warehouse Basic Information");
  const subLocHeaderSheet = workbook.getWorksheet("Sub Location Header");
  const subLocItemSheet = workbook.getWorksheet("Sub Location Item");

  const warehouses = {};
  const warehouseNameToRefId = {}; // Map warehouse name to row-based refId for sub-location lookups

  // Parse Sheet 1: Warehouse Basic Information
  basicInfoSheet.eachRow((row, rowNumber) => {
    // Skip header row (1) and sample data row (2)
    // Row 3 onwards contains actual user data
    if (rowNumber === 1 || rowNumber === 2) return;

    const warehouseName1 = row.getCell(5).value; // Column E
    if (!warehouseName1) return;

    // Use row number as unique reference ID (safer than warehouse name which can be very long)
    const refId = `WH-ROW-${rowNumber}`;

    warehouses[refId] = {
      refId: refId, // Use row number as reference (guaranteed unique and short)
      basicInfo: {
        consignorId: row.getCell(3).value || null, // Column C - Consignor_ID (can be from Excel or auto-filled later)
        warehouseType: row.getCell(4).value, // Column D
        warehouseName1: row.getCell(5).value, // Column E
        warehouseName2: row.getCell(6).value, // Column F
        language: row.getCell(7).value || "EN", // Column G
        vehicleCapacity: parseInt(row.getCell(8).value) || 0, // Column H
        virtualYardIn:
          row.getCell(9).value === "TRUE" ||
          row.getCell(9).value === "Yes" ||
          row.getCell(9).value === true,
        radiusVirtualYardIn: parseInt(row.getCell(10).value) || 0,
        speedLimit: parseInt(row.getCell(11).value) || 20,
        weighBridge:
          row.getCell(12).value === "TRUE" ||
          row.getCell(12).value === "Yes" ||
          row.getCell(12).value === true,
        gatepassSystem:
          row.getCell(13).value === "TRUE" ||
          row.getCell(13).value === "Yes" ||
          row.getCell(13).value === true,
        fuelAvailability:
          row.getCell(14).value === "TRUE" ||
          row.getCell(14).value === "Yes" ||
          row.getCell(14).value === true,
        stagingArea:
          row.getCell(15).value === "TRUE" ||
          row.getCell(15).value === "Yes" ||
          row.getCell(15).value === true,
        driverWaitingArea:
          row.getCell(16).value === "TRUE" ||
          row.getCell(16).value === "Yes" ||
          row.getCell(16).value === true,
        gateInChecklist: !!(
          row.getCell(17).value === "TRUE" ||
          row.getCell(17).value === "Yes" ||
          row.getCell(17).value === true ||
          row.getCell(17).value === "Admin"
        ),
        gateOutChecklist: !!(
          row.getCell(18).value === "TRUE" ||
          row.getCell(18).value === "Yes" ||
          row.getCell(18).value === true ||
          row.getCell(18).value === "Admin"
        ),
        country: row.getCell(19).value, // Column S
        state: row.getCell(20).value, // Column T
        city: row.getCell(21).value, // Column U
        district: row.getCell(22).value || null, // Column V
        street1: row.getCell(23).value, // Column W
        street2: row.getCell(24).value || null, // Column X
        postalCode: row.getCell(25).value || null, // Column Y
        vatNumber: row.getCell(26).value, // Column Z
        tinPan: row.getCell(27).value || null, // Column AA
        tan: row.getCell(28).value || null, // Column AB
        addressType: row.getCell(29).value, // Column AC
        materialType: row.getCell(30).value, // Column AD
      },
      subLocationHeaders: [],
      excelRowNumber: rowNumber,
    };

    // Create mapping from warehouse name to refId for sub-location lookups
    warehouseNameToRefId[warehouseName1] = refId;
  });

  // Parse Sheet 2: Sub Location Headers
  if (subLocHeaderSheet) {
    subLocHeaderSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1 || rowNumber === 2 || rowNumber === 3) return;

      const warehouseName1 = row.getCell(2).value; // Column B
      const subLocationName = row.getCell(5).value; // Column E
      if (!warehouseName1 || !subLocationName) return;

      const refId = warehouseNameToRefId[warehouseName1];
      if (refId && warehouses[refId]) {
        if (!warehouses[refId].subLocationHeaders) {
          warehouses[refId].subLocationHeaders = [];
        }

        warehouses[refId].subLocationHeaders.push({
          subLocationType: row.getCell(4).value, // Column D
          subLocationName: row.getCell(5).value, // Column E
          description: row.getCell(6).value || null, // Column F
          coordinates: [],
        });
      }
    });
  }

  // Parse Sheet 3: Sub Location Items (Coordinates)
  if (subLocItemSheet) {
    subLocItemSheet.eachRow((row, rowNumber) => {
      if (
        rowNumber === 1 ||
        rowNumber === 2 ||
        rowNumber === 3 ||
        rowNumber === 4
      )
        return;

      const subLocationName = row.getCell(1).value; // Column A
      const warehouseName1 = row.getCell(2).value; // Column B
      if (!subLocationName || !warehouseName1) return;

      const refId = warehouseNameToRefId[warehouseName1];
      if (refId && warehouses[refId]) {
        const subLocationHeader = warehouses[refId].subLocationHeaders?.find(
          (sl) => sl.subLocationName === subLocationName
        );

        if (subLocationHeader) {
          subLocationHeader.coordinates.push({
            latitude: parseFloat(row.getCell(3).value), // Column C
            longitude: parseFloat(row.getCell(4).value), // Column D
            sequence:
              parseInt(row.getCell(5).value) ||
              subLocationHeader.coordinates.length + 1, // Column E
          });
        }
      }
    });
  }

  return Object.values(warehouses);
}

/**
 * Validate warehouse data
 */
function validateWarehouseData(warehouse) {
  const errors = [];
  const { basicInfo, subLocationHeaders } = warehouse;

  // Validate consignor_id (required after auto-fill)
  if (
    !basicInfo.consignorId ||
    basicInfo.consignorId.toString().trim().length === 0
  ) {
    errors.push({
      field: "Consignor_ID",
      message:
        "Consignor ID is required. Please fill it in Excel or ensure you're logged in as a consignor.",
      sheet: "Warehouse Basic Information",
    });
  }

  // Validate warehouse name
  if (!basicInfo.warehouseName1 || basicInfo.warehouseName1.trim().length < 2) {
    errors.push({
      field: "Warehouse_Name1",
      message: "Warehouse Name1 is required and must be at least 2 characters",
      sheet: "Warehouse Basic Information",
    });
  }

  if (basicInfo.warehouseName1 && basicInfo.warehouseName1.length > 30) {
    errors.push({
      field: "Warehouse_Name1",
      message: "Warehouse Name1 cannot exceed 30 characters",
      sheet: "Warehouse Basic Information",
    });
  }

  // Validate warehouse type
  if (!basicInfo.warehouseType) {
    errors.push({
      field: "Warehouse_Type",
      message: "Warehouse Type is required",
      sheet: "Warehouse Basic Information",
    });
  }

  // Validate material type
  if (!basicInfo.materialType) {
    errors.push({
      field: "Material_Type",
      message: "Material Type is required",
      sheet: "Warehouse Basic Information",
    });
  }

  // Validate address
  if (!basicInfo.country || !basicInfo.state || !basicInfo.city) {
    errors.push({
      field: "Address",
      message: "Country, State, and City are required",
      sheet: "Warehouse Basic Information",
    });
  }

  if (!basicInfo.street1 || basicInfo.street1.trim().length === 0) {
    errors.push({
      field: "Street_1",
      message: "Street 1 is required",
      sheet: "Warehouse Basic Information",
    });
  }

  // Validate VAT Number
  if (!basicInfo.vatNumber) {
    errors.push({
      field: "VAT_Number",
      message: "VAT Number is required",
      sheet: "Warehouse Basic Information",
    });
  }

  // Validate postal code format if provided
  if (basicInfo.postalCode && !/^\d{6}$/.test(basicInfo.postalCode)) {
    errors.push({
      field: "Postal_Code",
      message: "Postal code must be 6 digits",
      sheet: "Warehouse Basic Information",
    });
  }

  // Validate numeric fields
  if (
    basicInfo.vehicleCapacity < 0 ||
    !Number.isInteger(basicInfo.vehicleCapacity)
  ) {
    errors.push({
      field: "Vehicle_Capacity",
      message: "Vehicle Capacity must be a non-negative integer",
      sheet: "Warehouse Basic Information",
    });
  }

  if (basicInfo.speedLimit < 1 || basicInfo.speedLimit > 200) {
    errors.push({
      field: "Speed_Limit",
      message: "Speed Limit must be between 1 and 200 km/h",
      sheet: "Warehouse Basic Information",
    });
  }

  // Validate coordinates if geofencing data present
  if (subLocationHeaders && subLocationHeaders.length > 0) {
    subLocationHeaders.forEach((subLoc, idx) => {
      if (subLoc.coordinates && subLoc.coordinates.length > 0) {
        subLoc.coordinates.forEach((coord, coordIdx) => {
          if (
            !coord.latitude ||
            isNaN(coord.latitude) ||
            coord.latitude < -90 ||
            coord.latitude > 90
          ) {
            errors.push({
              field: `Latitude (Sub-Location ${idx + 1}, Coordinate ${
                coordIdx + 1
              })`,
              message: "Latitude must be between -90 and 90",
              sheet: "Sub Location Item",
            });
          }
          if (
            !coord.longitude ||
            isNaN(coord.longitude) ||
            coord.longitude < -180 ||
            coord.longitude > 180
          ) {
            errors.push({
              field: `Longitude (Sub-Location ${idx + 1}, Coordinate ${
                coordIdx + 1
              })`,
              message: "Longitude must be between -180 and 180",
              sheet: "Sub Location Item",
            });
          }
        });
      }
    });
  }

  return errors;
}

/**
 * Generate error report Excel file for invalid warehouses
 */
async function generateWarehouseErrorReport(invalidWarehouses, batchId) {
  try {
    console.log(`📄 Generating warehouse error report for batch ${batchId}...`);

    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Error Summary
    const summarySheet = workbook.addWorksheet("Error Summary");

    // Title
    summarySheet.mergeCells("A1:D1");
    const titleCell = summarySheet.getCell("A1");
    titleCell.value = `Warehouse Bulk Upload Error Report - Batch ${batchId}`;
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD32F2F" },
    };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    summarySheet.getRow(1).height = 30;

    // Stats
    summarySheet.getCell("A3").value = "Total Invalid Records:";
    summarySheet.getCell("B3").value = invalidWarehouses.length;
    summarySheet.getCell("A3").font = { bold: true };

    // Headers for error list
    summarySheet.getCell("A5").value = "Row Number";
    summarySheet.getCell("B5").value = "Warehouse Name";
    summarySheet.getCell("C5").value = "Warehouse Type";
    summarySheet.getCell("D5").value = "Error Count";
    summarySheet.getRow(5).font = { bold: true };
    summarySheet.getRow(5).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Error list
    let row = 6;
    invalidWarehouses.forEach((item) => {
      summarySheet.getCell(`A${row}`).value =
        item.warehouse.excelRowNumber || "N/A";
      summarySheet.getCell(`B${row}`).value =
        item.warehouse.basicInfo?.warehouseName1 || "N/A";
      summarySheet.getCell(`C${row}`).value =
        item.warehouse.basicInfo?.warehouseType || "N/A";
      summarySheet.getCell(`D${row}`).value = item.errors.length;
      row++;
    });

    // Column widths
    summarySheet.getColumn("A").width = 15;
    summarySheet.getColumn("B").width = 35;
    summarySheet.getColumn("C").width = 25;
    summarySheet.getColumn("D").width = 15;

    // Sheet 2: Detailed Errors
    const detailSheet = workbook.addWorksheet("Detailed Errors");

    // Headers
    detailSheet.getCell("A1").value = "Row Number";
    detailSheet.getCell("B1").value = "Warehouse Name";
    detailSheet.getCell("C1").value = "Sheet";
    detailSheet.getCell("D1").value = "Field";
    detailSheet.getCell("E1").value = "Error Message";
    detailSheet.getRow(1).font = { bold: true };
    detailSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Detailed error list
    row = 2;
    invalidWarehouses.forEach((item) => {
      item.errors.forEach((error) => {
        detailSheet.getCell(`A${row}`).value =
          item.warehouse.excelRowNumber || "N/A";
        detailSheet.getCell(`B${row}`).value =
          item.warehouse.basicInfo?.warehouseName1 || "N/A";
        detailSheet.getCell(`C${row}`).value = error.sheet || "N/A";
        detailSheet.getCell(`D${row}`).value = error.field || "N/A";
        detailSheet.getCell(`E${row}`).value = error.message || "N/A";

        // Highlight error rows
        detailSheet.getRow(row).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFF0F0" },
        };

        row++;
      });
    });

    // Column widths
    detailSheet.getColumn("A").width = 15;
    detailSheet.getColumn("B").width = 35;
    detailSheet.getColumn("C").width = 30;
    detailSheet.getColumn("D").width = 30;
    detailSheet.getColumn("E").width = 60;

    // Save to file
    const errorReportsDir = path.join(__dirname, "../uploads/error-reports");
    if (!fs.existsSync(errorReportsDir)) {
      fs.mkdirSync(errorReportsDir, { recursive: true });
    }

    const filename = `warehouse-error-report-${batchId}-${Date.now()}.xlsx`;
    const filePath = path.join(errorReportsDir, filename);

    await workbook.xlsx.writeFile(filePath);

    console.log(`✅ Warehouse error report generated: ${filename}`);

    return filePath;
  } catch (error) {
    console.error("Error generating warehouse error report:", error);
    throw error;
  }
}

/**
 * Check for duplicate warehouses in database
 */
async function checkDatabaseDuplicates(warehouses) {
  const duplicateErrors = {};

  for (const warehouse of warehouses) {
    const errors = [];
    const { basicInfo } = warehouse;

    // Check warehouse name duplicates
    if (basicInfo.warehouseName1) {
      const existingWarehouse = await knex("warehouse_basic_information")
        .where("warehouse_name1", basicInfo.warehouseName1)
        .first();

      if (existingWarehouse) {
        errors.push({
          field: "Warehouse_Name1",
          message: `Warehouse Name1 "${basicInfo.warehouseName1}" already exists for warehouse ${existingWarehouse.warehouse_id}`,
          sheet: "Warehouse Basic Information",
        });
      }
    }

    // Check VAT number duplicates
    if (basicInfo.vatNumber) {
      const existingVat = await knex("tms_address")
        .where("vat_number", basicInfo.vatNumber)
        .first();

      if (existingVat) {
        errors.push({
          field: "VAT_Number",
          message: `VAT Number "${basicInfo.vatNumber}" already exists in database`,
          sheet: "Warehouse Basic Information",
        });
      }
    }

    // Check TIN/PAN duplicates if provided
    if (basicInfo.tinPan) {
      const existingTin = await knex("tms_address")
        .where("tin_pan", basicInfo.tinPan)
        .first();

      if (existingTin) {
        errors.push({
          field: "TIN_PAN",
          message: `TIN/PAN "${basicInfo.tinPan}" already exists in database`,
          sheet: "Warehouse Basic Information",
        });
      }
    }

    // Check TAN duplicates if provided
    if (basicInfo.tan) {
      const existingTan = await knex("tms_address")
        .where("tan", basicInfo.tan)
        .first();

      if (existingTan) {
        errors.push({
          field: "TAN",
          message: `TAN "${basicInfo.tan}" already exists in database`,
          sheet: "Warehouse Basic Information",
        });
      }
    }

    if (errors.length > 0) {
      duplicateErrors[warehouse.refId] = errors;
    }
  }

  return duplicateErrors;
}

/**
 * Check for duplicates within the upload batch itself
 */
function checkBatchDuplicates(warehouses) {
  const duplicateErrors = {};
  const warehouseNames = {};
  const vatNumbers = {};
  const tinPans = {};
  const tans = {};

  warehouses.forEach((warehouse) => {
    const errors = [];
    const { basicInfo } = warehouse;

    // Check warehouse name duplicates within batch
    if (basicInfo.warehouseName1) {
      if (warehouseNames[basicInfo.warehouseName1]) {
        errors.push({
          field: "Warehouse_Name1",
          message: `Warehouse Name1 "${
            basicInfo.warehouseName1
          }" is duplicated in this batch (also used by ${
            warehouseNames[basicInfo.warehouseName1]
          })`,
          sheet: "Warehouse Basic Information",
        });
      } else {
        warehouseNames[basicInfo.warehouseName1] = warehouse.refId;
      }
    }

    // Check VAT number duplicates within batch
    if (basicInfo.vatNumber) {
      if (vatNumbers[basicInfo.vatNumber]) {
        errors.push({
          field: "VAT_Number",
          message: `VAT Number "${
            basicInfo.vatNumber
          }" is duplicated in this batch (also used by ${
            vatNumbers[basicInfo.vatNumber]
          })`,
          sheet: "Warehouse Basic Information",
        });
      } else {
        vatNumbers[basicInfo.vatNumber] = warehouse.refId;
      }
    }

    // Check TIN/PAN duplicates within batch
    if (basicInfo.tinPan) {
      if (tinPans[basicInfo.tinPan]) {
        errors.push({
          field: "TIN_PAN",
          message: `TIN/PAN "${
            basicInfo.tinPan
          }" is duplicated in this batch (also used by ${
            tinPans[basicInfo.tinPan]
          })`,
          sheet: "Warehouse Basic Information",
        });
      } else {
        tinPans[basicInfo.tinPan] = warehouse.refId;
      }
    }

    // Check TAN duplicates within batch
    if (basicInfo.tan) {
      if (tans[basicInfo.tan]) {
        errors.push({
          field: "TAN",
          message: `TAN "${
            basicInfo.tan
          }" is duplicated in this batch (also used by ${tans[basicInfo.tan]})`,
          sheet: "Warehouse Basic Information",
        });
      } else {
        tans[basicInfo.tan] = warehouse.refId;
      }
    }

    if (errors.length > 0) {
      duplicateErrors[warehouse.refId] = errors;
    }
  });

  return duplicateErrors;
}

/**
 * Create warehouse in database
 */
async function createWarehouseFromBulk(warehouseData, userId) {
  const trx = await knex.transaction();

  try {
    const { basicInfo, subLocationHeaders } = warehouseData;

    // Look up warehouse_type_id from warehouse_type name if needed
    let warehouseTypeId = basicInfo.warehouseType;
    if (warehouseTypeId && !warehouseTypeId.startsWith("WT")) {
      // It's a name, not an ID - look up the ID
      const warehouseType = await trx("warehouse_type_master")
        .where("warehouse_type", warehouseTypeId)
        .first();
      if (warehouseType) {
        warehouseTypeId = warehouseType.warehouse_type_id;
      }
    }

    // Look up material_type_id from material_type name if needed
    let materialTypeId = basicInfo.materialType;
    if (materialTypeId && !materialTypeId.startsWith("MT")) {
      // It's a name, not an ID - look up the ID
      const materialType = await trx("material_types_master")
        .where("material_types", materialTypeId)
        .first();
      if (materialType) {
        materialTypeId = materialType.material_types_id;
      }
    }

    // Look up address_type_id from address_type name if needed
    let addressTypeId = basicInfo.addressType || "AT001";
    if (addressTypeId && !addressTypeId.startsWith("AT")) {
      // It's a name, not an ID - look up the ID
      const addressType = await trx("address_type_master")
        .where("address_type", addressTypeId)
        .first();
      if (addressType) {
        addressTypeId = addressType.address_type_id;
      }
    }

    // Generate warehouse ID
    const warehouseId = await generateWarehouseId(trx);

    // Insert warehouse basic information
    await trx("warehouse_basic_information").insert({
      warehouse_id: warehouseId,
      consignor_id: basicInfo.consignorId, // Use consignor_id from Excel or auto-filled
      warehouse_type: warehouseTypeId,
      material_type_id: materialTypeId,
      warehouse_name1: basicInfo.warehouseName1,
      warehouse_name2: basicInfo.warehouseName2 || null,
      language: basicInfo.language || "EN",
      vehicle_capacity: basicInfo.vehicleCapacity,
      virtual_yard_in: basicInfo.virtualYardIn,
      radius_for_virtual_yard_in: basicInfo.radiusVirtualYardIn || 0,
      speed_limit: basicInfo.speedLimit || 20,
      weigh_bridge_availability: basicInfo.weighBridge,
      gatepass_system_available: basicInfo.gatepassSystem,
      fuel_availability: basicInfo.fuelAvailability,
      staging_area_for_goods_organization: basicInfo.stagingArea,
      driver_waiting_area: basicInfo.driverWaitingArea,
      gate_in_checklist_auth: basicInfo.gateInChecklist,
      gate_out_checklist_auth: basicInfo.gateOutChecklist,
      status: "ACTIVE",
      created_by: userId,
      created_at: knex.fn.now(),
    });

    // Insert address
    const addressId = await generateAddressId(trx);
    await trx("tms_address").insert({
      address_id: addressId,
      user_reference_id: warehouseId,
      user_type: "WH",
      address_type_id: addressTypeId,
      country: basicInfo.country,
      state: basicInfo.state,
      city: basicInfo.city,
      district: basicInfo.district,
      street_1: basicInfo.street1,
      street_2: basicInfo.street2,
      postal_code: basicInfo.postalCode,
      vat_number: basicInfo.vatNumber,
      tin_pan: basicInfo.tinPan,
      tan: basicInfo.tan,
      is_primary: true,
      status: "ACTIVE",
      created_by: userId,
      created_at: knex.fn.now(),
    });

    // Insert sub-locations and coordinates if present
    if (subLocationHeaders && subLocationHeaders.length > 0) {
      for (const subLoc of subLocationHeaders) {
        if (subLoc.subLocationType && subLoc.coordinates?.length > 0) {
          const subLocationHdrId = await generateSubLocationHeaderId(trx);

          // Insert header
          await trx("warehouse_sub_location_header").insert({
            sub_location_hdr_id: subLocationHdrId,
            warehouse_unique_id: warehouseId,
            consignor_id: basicInfo.consignorId, // Use consignor_id from basicInfo
            sub_location_id: subLoc.subLocationType,
            description: subLoc.description || null,
            status: "ACTIVE",
            created_by: userId,
            created_at: knex.fn.now(),
          });

          // Insert coordinates
          for (let j = 0; j < subLoc.coordinates.length; j++) {
            const coord = subLoc.coordinates[j];
            await trx("warehouse_sub_location_item").insert({
              geo_fence_item_id: `${subLocationHdrId}_${j + 1}`,
              sub_location_hdr_id: subLocationHdrId,
              latitude: coord.latitude,
              longitude: coord.longitude,
              sequence: j + 1,
              status: "ACTIVE",
              created_by: userId,
              created_at: knex.fn.now(),
            });
          }
        }
      }
    }

    await trx.commit();
    return {
      success: true,
      warehouseId,
    };
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

/**
 * Main processing function
 */
async function processWarehouseBulkUpload(jobData) {
  const { batchId, filePath, userId, userConsignorId } = jobData;

  try {
    console.log(`📝 Step 1: Parsing Excel file for batch ${batchId}`);
    console.log(`👤 User ID: ${userId}, Consignor ID: ${userConsignorId}`);
    const warehouses = await parseWarehouseExcel(filePath);

    console.log(`📊 Found ${warehouses.length} warehouse(s)`);

    // Auto-fill consignor_id if not provided in Excel
    warehouses.forEach((warehouse) => {
      if (!warehouse.basicInfo.consignorId && userConsignorId) {
        warehouse.basicInfo.consignorId = userConsignorId;
        console.log(
          `  ✅ Auto-filled consignor_id for warehouse row ${warehouse.excelRowNumber}: ${userConsignorId}`
        );
      }
    });

    // Update batch with total rows
    await knex("tms_warehouse_bulk_upload_batches")
      .where({ batch_id: batchId })
      .update({ total_rows: warehouses.length });

    // If no warehouses found, mark as completed with 0 records
    if (warehouses.length === 0) {
      await knex("tms_warehouse_bulk_upload_batches")
        .where({ batch_id: batchId })
        .update({
          status: "completed",
          processed_timestamp: knex.fn.now(),
        });

      // Delete uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      console.log(`✅ Batch ${batchId} completed with 0 warehouses`);
      return {
        success: true,
        batchId,
        totalRows: 0,
        validCount: 0,
        invalidCount: 0,
        createdCount: 0,
        creationFailedCount: 0,
      };
    }

    console.log(`✅ Step 2: Validating warehouse data`);
    let validCount = 0;
    let invalidCount = 0;

    // Validation errors map
    const allValidationErrors = {};

    // Step 2a: Format validation
    warehouses.forEach((warehouse) => {
      const formatErrors = validateWarehouseData(warehouse);
      if (formatErrors.length > 0) {
        allValidationErrors[warehouse.refId] = formatErrors;
      }
    });

    // Step 2b: Batch duplicate check
    const batchDuplicateErrors = checkBatchDuplicates(warehouses);
    Object.keys(batchDuplicateErrors).forEach((refId) => {
      if (allValidationErrors[refId]) {
        allValidationErrors[refId].push(...batchDuplicateErrors[refId]);
      } else {
        allValidationErrors[refId] = batchDuplicateErrors[refId];
      }
    });

    // Step 2c: Database duplicate check
    const dbDuplicateErrors = await checkDatabaseDuplicates(warehouses);
    Object.keys(dbDuplicateErrors).forEach((refId) => {
      if (allValidationErrors[refId]) {
        allValidationErrors[refId].push(...dbDuplicateErrors[refId]);
      } else {
        allValidationErrors[refId] = dbDuplicateErrors[refId];
      }
    });

    // Store validation results
    for (const warehouse of warehouses) {
      const hasErrors = allValidationErrors[warehouse.refId];

      try {
        if (hasErrors) {
          // Store invalid warehouse
          await knex("tms_warehouse_bulk_upload_warehouses").insert({
            batch_id: batchId,
            warehouse_ref_id: warehouse.refId,
            excel_row_number: warehouse.excelRowNumber,
            validation_status: "invalid",
            validation_errors: JSON.stringify(hasErrors),
            data: JSON.stringify(warehouse),
          });
          invalidCount++;
        } else {
          // Store valid warehouse
          await knex("tms_warehouse_bulk_upload_warehouses").insert({
            batch_id: batchId,
            warehouse_ref_id: warehouse.refId,
            excel_row_number: warehouse.excelRowNumber,
            validation_status: "valid",
            validation_errors: JSON.stringify([]),
            data: JSON.stringify(warehouse),
          });
          validCount++;
        }
      } catch (insertError) {
        // If insertion fails due to database constraint, log it and continue
        console.error(
          `⚠️ Failed to store warehouse row ${warehouse.excelRowNumber}:`,
          insertError.message
        );
        // Count as invalid if we couldn't store it
        if (!hasErrors) {
          invalidCount++;
        }
      }
    }

    console.log(
      `✅ Validation complete: ${validCount} valid, ${invalidCount} invalid`
    );

    // Generate error report if there are invalid warehouses
    let errorReportPath = null;
    if (invalidCount > 0) {
      console.log("📄 Generating error report for invalid warehouses...");

      // Prepare invalid warehouses data for error report
      const invalidWarehousesData = warehouses
        .filter((warehouse) => allValidationErrors[warehouse.refId])
        .map((warehouse) => ({
          warehouse: warehouse,
          errors: allValidationErrors[warehouse.refId],
        }));

      errorReportPath = await generateWarehouseErrorReport(
        invalidWarehousesData,
        batchId
      );
      console.log(`✅ Error report saved: ${errorReportPath}`);
    }

    // Update batch counts
    await knex("tms_warehouse_bulk_upload_batches")
      .where({ batch_id: batchId })
      .update({
        total_valid: validCount,
        total_invalid: invalidCount,
        error_report_path: errorReportPath, // Save error report path
      });

    console.log(`🏗️ Step 3: Creating valid warehouses`);
    let createdCount = 0;
    let creationFailedCount = 0;

    // Get valid warehouses
    const validWarehouses = await knex("tms_warehouse_bulk_upload_warehouses")
      .where({ batch_id: batchId, validation_status: "valid" })
      .select("*");

    for (const validWarehouse of validWarehouses) {
      try {
        // Handle both JSON object and string (database might return either depending on driver)
        const warehouseData =
          typeof validWarehouse.data === "string"
            ? JSON.parse(validWarehouse.data)
            : validWarehouse.data;

        const result = await createWarehouseFromBulk(warehouseData, userId);

        // Update with created warehouse ID
        await knex("tms_warehouse_bulk_upload_warehouses")
          .where({ id: validWarehouse.id })
          .update({ created_warehouse_id: result.warehouseId });

        createdCount++;
        console.log(`✅ Created warehouse: ${result.warehouseId}`);
      } catch (error) {
        console.error(`❌ Failed to create warehouse:`, error);

        // Mark as creation_failed instead of changing validation status
        await knex("tms_warehouse_bulk_upload_warehouses")
          .where({ id: validWarehouse.id })
          .update({
            validation_errors: JSON.stringify([
              {
                field: "creation",
                message: `Failed to create: ${error.message}`,
                sheet: "System",
              },
            ]),
          });

        creationFailedCount++;
      }
    }

    console.log(
      `✅ Creation complete: ${createdCount} created, ${creationFailedCount} failed`
    );

    // Recalculate final valid/invalid counts from database (in case any changed during creation)
    const finalValidCount = await knex("tms_warehouse_bulk_upload_warehouses")
      .where({ batch_id: batchId, validation_status: "valid" })
      .count("* as count")
      .first();

    const finalInvalidCount = await knex("tms_warehouse_bulk_upload_warehouses")
      .where({ batch_id: batchId, validation_status: "invalid" })
      .count("* as count")
      .first();

    // Update final batch status with accurate counts
    await knex("tms_warehouse_bulk_upload_batches")
      .where({ batch_id: batchId })
      .update({
        total_valid: parseInt(finalValidCount.count) || 0,
        total_invalid: parseInt(finalInvalidCount.count) || 0,
        total_created: createdCount,
        total_creation_failed: creationFailedCount,
        error_report_path: errorReportPath, // Preserve error report path
        status: "completed",
        processed_timestamp: knex.fn.now(),
      });

    // Delete uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.log(`✅ Batch ${batchId} processing completed successfully`);

    return {
      success: true,
      batchId,
      totalRows: warehouses.length,
      validCount,
      invalidCount,
      createdCount,
      creationFailedCount,
    };
  } catch (error) {
    console.error(`❌ Error processing batch ${batchId}:`, error);

    await knex("tms_warehouse_bulk_upload_batches")
      .where({ batch_id: batchId })
      .update({
        status: "failed",
        processed_timestamp: knex.fn.now(),
      });

    throw error;
  }
}

module.exports = {
  processWarehouseBulkUpload,
  generateWarehouseId,
  generateAddressId,
  generateSubLocationHeaderId,
};
