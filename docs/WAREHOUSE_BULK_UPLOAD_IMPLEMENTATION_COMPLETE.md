# Warehouse Bulk Upload - Complete Implementation Guide

**Date**: 2025-11-17  
**Status**: ✅ BACKEND 80% COMPLETE | ⏳ FRONTEND IMPLEMENTATION REQUIRED  
**Module**: Warehouse Management - Bulk Upload

---

## Executive Summary

This document provides the complete implementation guide for warehouse bulk upload functionality, following the exact pattern used in driver bulk upload (no Redis, synchronous processing).

### Implementation Status

#### ✅ Completed Components (Backend)

1. **Database Migration**: `20251117071800_create_warehouse_bulk_upload_tables.js`

   - `tms_warehouse_bulk_upload_batches` table
   - `tms_warehouse_bulk_upload_warehouses` table

2. **Excel Template Generator**: `warehouseExcelTemplateGenerator.js`

   - Sheet 1: Warehouse Basic Information (30 columns)
   - Sheet 2: Sub Location Header (6 columns)
   - Sheet 3: Sub Location Item (5 columns - coordinates)
   - Sheet 4: Instructions

3. **Controller**: `warehouseBulkUploadController.js`

   - `downloadTemplate()` - Generate & download Excel template
   - `uploadFile()` - Upload file & trigger processing
   - `getBatchStatus()` - Get batch processing status
   - `getUploadHistory()` - Get user's upload history
   - `downloadErrorReport()` - Download error report Excel

4. **Routes**: `warehouseBulkUploadRoutes.js`

   - GET `/api/warehouse-bulk-upload/template`
   - POST `/api/warehouse-bulk-upload/upload`
   - GET `/api/warehouse-bulk-upload/status/:batchId`
   - GET `/api/warehouse-bulk-upload/history`
   - GET `/api/warehouse-bulk-upload/error-report/:batchId`

5. **Server Registration**: Routes added to `server.js`

#### ⏳ Remaining Components

1. **Warehouse Bulk Upload Processor**: `warehouseBulkUploadProcessor.js` (⚠️ CRITICAL - 1200+ lines)
2. **Frontend Redux Actions**: Warehouse-specific bulk upload slice
3. **Frontend Components**:
   - WarehouseBulkUploadModal.jsx
   - WarehouseBulkUploadHistory.jsx
4. **Page Integration**: Update WarehouseCreatePage.jsx

---

## Part 1: Backend Processor Implementation

### File: `tms-backend/queues/warehouseBulkUploadProcessor.js`

**Reference**: Copy from `tms-backend/queues/driverBulkUploadProcessor.js` (1224 lines)

**Required Changes** (Find & Replace):

```javascript
// FIND & REPLACE PATTERN:
driver → warehouse
Driver → Warehouse
DRIVER → WAREHOUSE
DRV → WH
driver_basic_information → warehouse_basic_information
driver_documents → warehouse_documents
driver_history_information → (NOT APPLICABLE - Remove)
driver_accident_violation → (NOT APPLICABLE - Remove)
tms_driver_bulk_upload → tms_warehouse_bulk_upload

// Specific ID Generators:
generateDriverId → generateWarehouseId
generateAddressId → (Keep same)
generateDocumentId → generateWarehouseDocumentId
generateHistoryId → (NOT APPLICABLE - Remove)
generateAccidentId → (NOT APPLICABLE - Remove)
generateSubLocationHeaderId → (NEW - Add this)
generateSubLocationItemId → (NEW - Add this)
```

**Key Functions to Implement**:

```javascript
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

  throw new Error("Failed to generate unique sub-location header ID");
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

  // Parse Sheet 1: Warehouse Basic Information
  basicInfoSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1 || rowNumber === 2 || rowNumber === 3) return; // Skip header + sample + instructions

    const warehouseName1 = row.getCell(5).value; // Column E
    if (!warehouseName1) return;

    warehouses[warehouseName1] = {
      refId: warehouseName1, // Use warehouse name as reference
      basicInfo: {
        warehouseType: row.getCell(4).value, // Column D
        warehouseName1: row.getCell(5).value, // Column E
        warehouseName2: row.getCell(6).value, // Column F
        language: row.getCell(7).value || "EN", // Column G
        vehicleCapacity: row.getCell(8).value || 0, // Column H
        virtualYardIn:
          row.getCell(9).value === "TRUE" || row.getCell(9).value === true,
        radiusVirtualYardIn: row.getCell(10).value || 0,
        speedLimit: row.getCell(11).value || 20,
        weighBridge:
          row.getCell(12).value === "TRUE" || row.getCell(12).value === true,
        gatepassSystem:
          row.getCell(13).value === "TRUE" || row.getCell(13).value === true,
        fuelAvailability:
          row.getCell(14).value === "TRUE" || row.getCell(14).value === true,
        stagingArea:
          row.getCell(15).value === "TRUE" || row.getCell(15).value === true,
        driverWaitingArea:
          row.getCell(16).value === "TRUE" || row.getCell(16).value === true,
        gateInChecklist:
          row.getCell(17).value === "TRUE" || row.getCell(17).value === true,
        gateOutChecklist:
          row.getCell(18).value === "TRUE" || row.getCell(18).value === true,
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
      subLocations: [],
      excelRowNumber: rowNumber,
    };
  });

  // Parse Sheet 2: Sub Location Headers
  if (subLocHeaderSheet) {
    subLocHeaderSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1 || rowNumber === 2 || rowNumber === 3) return;

      const warehouseName1 = row.getCell(2).value; // Column B
      const subLocationName = row.getCell(5).value; // Column E
      if (!warehouseName1 || !subLocationName) return;

      if (warehouses[warehouseName1]) {
        if (!warehouses[warehouseName1].subLocationHeaders) {
          warehouses[warehouseName1].subLocationHeaders = [];
        }

        warehouses[warehouseName1].subLocationHeaders.push({
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

      if (warehouses[warehouseName1]) {
        const subLocationHeader = warehouses[
          warehouseName1
        ].subLocationHeaders?.find(
          (sl) => sl.subLocationName === subLocationName
        );

        if (subLocationHeader) {
          subLocationHeader.coordinates.push({
            latitude: row.getCell(3).value, // Column C
            longitude: row.getCell(4).value, // Column D
            sequence:
              row.getCell(5).value || subLocationHeader.coordinates.length + 1, // Column E
          });
        }
      }
    });
  }

  return Object.values(warehouses);
}

/**
 * Validate single warehouse
 */
async function validateWarehouse(warehouseData, rowNumber) {
  const errors = [];
  const { basicInfo, subLocationHeaders } = warehouseData;

  // Validate warehouse name
  if (!basicInfo.warehouseName1 || basicInfo.warehouseName1.trim().length < 2) {
    errors.push({
      field: "warehouseName1",
      message: "Warehouse Name1 is required and must be at least 2 characters",
      row: rowNumber,
    });
  }

  if (basicInfo.warehouseName1 && basicInfo.warehouseName1.length > 30) {
    errors.push({
      field: "warehouseName1",
      message: "Warehouse Name1 cannot exceed 30 characters",
      row: rowNumber,
    });
  }

  // Check uniqueness of warehouse name
  const existingWarehouse = await knex("warehouse_basic_information")
    .where("warehouse_name1", basicInfo.warehouseName1)
    .first();

  if (existingWarehouse) {
    errors.push({
      field: "warehouseName1",
      message: `Warehouse Name1 "${basicInfo.warehouseName1}" already exists`,
      row: rowNumber,
    });
  }

  // Validate warehouse type
  if (!basicInfo.warehouseType) {
    errors.push({
      field: "warehouseType",
      message: "Warehouse Type is required",
      row: rowNumber,
    });
  }

  // Validate material type
  if (!basicInfo.materialType) {
    errors.push({
      field: "materialType",
      message: "Material Type is required",
      row: rowNumber,
    });
  }

  // Validate address
  if (!basicInfo.country || !basicInfo.state || !basicInfo.city) {
    errors.push({
      field: "address",
      message: "Country, State, and City are required",
      row: rowNumber,
    });
  }

  if (!basicInfo.street1) {
    errors.push({
      field: "street1",
      message: "Street 1 is required",
      row: rowNumber,
    });
  }

  // Validate VAT Number
  if (!basicInfo.vatNumber) {
    errors.push({
      field: "vatNumber",
      message: "VAT Number is required",
      row: rowNumber,
    });
  } else {
    // Check uniqueness
    const existingVat = await knex("tms_address")
      .where("vat_number", basicInfo.vatNumber)
      .first();

    if (existingVat) {
      errors.push({
        field: "vatNumber",
        message: `VAT Number "${basicInfo.vatNumber}" already exists`,
        row: rowNumber,
      });
    }
  }

  // Validate TIN/PAN uniqueness if provided
  if (basicInfo.tinPan) {
    const existingTin = await knex("tms_address")
      .where("tin_pan", basicInfo.tinPan)
      .first();

    if (existingTin) {
      errors.push({
        field: "tinPan",
        message: `TIN/PAN "${basicInfo.tinPan}" already exists`,
        row: rowNumber,
      });
    }
  }

  // Validate TAN uniqueness if provided
  if (basicInfo.tan) {
    const existingTan = await knex("tms_address")
      .where("tan", basicInfo.tan)
      .first();

    if (existingTan) {
      errors.push({
        field: "tan",
        message: `TAN "${basicInfo.tan}" already exists`,
        row: rowNumber,
      });
    }
  }

  // Validate numeric fields
  if (
    basicInfo.vehicleCapacity < 0 ||
    !Number.isInteger(basicInfo.vehicleCapacity)
  ) {
    errors.push({
      field: "vehicleCapacity",
      message: "Vehicle Capacity must be a non-negative integer",
      row: rowNumber,
    });
  }

  if (basicInfo.speedLimit < 1 || basicInfo.speedLimit > 200) {
    errors.push({
      field: "speedLimit",
      message: "Speed Limit must be between 1 and 200 km/h",
      row: rowNumber,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create warehouse in database
 */
async function createWarehouseFromBulk(warehouseData, userId) {
  const trx = await knex.transaction();

  try {
    const { basicInfo, subLocationHeaders } = warehouseData;

    // Generate warehouse ID
    const warehouseId = await generateWarehouseId(trx);

    // Insert warehouse basic information
    await trx("warehouse_basic_information").insert({
      warehouse_id: warehouseId,
      consignor_id: basicInfo.consignorId || "SYSTEM",
      warehouse_type: basicInfo.warehouseType,
      material_type_id: basicInfo.materialType,
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
      address_type_id: "AT001",
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

    // Insert sub-locations and coordinates
    if (subLocationHeaders && subLocationHeaders.length > 0) {
      for (const subLoc of subLocationHeaders) {
        if (subLoc.subLocationType && subLoc.coordinates?.length > 0) {
          const subLocationHdrId = await generateSubLocationHeaderId(trx);

          // Insert header
          await trx("warehouse_sub_location_header").insert({
            sub_location_hdr_id: subLocationHdrId,
            warehouse_unique_id: warehouseId,
            consignor_id: basicInfo.consignorId || "SYSTEM",
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
  const { batchId, filePath, userId } = jobData;

  try {
    console.log(`📝 Step 1: Parsing Excel file for batch ${batchId}`);
    const warehouses = await parseWarehouseExcel(filePath);

    console.log(`📊 Found ${warehouses.length} warehouse(s)`);

    // Update batch with total rows
    await knex("tms_warehouse_bulk_upload_batches")
      .where({ batch_id: batchId })
      .update({ total_rows: warehouses.length });

    console.log(`✅ Step 2: Validating warehouse data`);
    let validCount = 0;
    let invalidCount = 0;

    for (const warehouse of warehouses) {
      const validation = await validateWarehouse(
        warehouse,
        warehouse.excelRowNumber
      );

      if (validation.isValid) {
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
      } else {
        // Store invalid warehouse
        await knex("tms_warehouse_bulk_upload_warehouses").insert({
          batch_id: batchId,
          warehouse_ref_id: warehouse.refId,
          excel_row_number: warehouse.excelRowNumber,
          validation_status: "invalid",
          validation_errors: JSON.stringify(validation.errors),
          data: JSON.stringify(warehouse),
        });
        invalidCount++;
      }
    }

    console.log(
      `✅ Validation complete: ${validCount} valid, ${invalidCount} invalid`
    );

    // Update batch counts
    await knex("tms_warehouse_bulk_upload_batches")
      .where({ batch_id: batchId })
      .update({
        total_valid: validCount,
        total_invalid: invalidCount,
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
        const warehouseData = JSON.parse(validWarehouse.data);
        warehouseData.basicInfo.consignorId = userId; // Set consignor ID from logged-in user

        const result = await createWarehouseFromBulk(warehouseData, userId);

        // Update with created warehouse ID
        await knex("tms_warehouse_bulk_upload_warehouses")
          .where({ id: validWarehouse.id })
          .update({ created_warehouse_id: result.warehouseId });

        createdCount++;
        console.log(`✅ Created warehouse: ${result.warehouseId}`);
      } catch (error) {
        console.error(`❌ Failed to create warehouse:`, error);

        // Update validation status to show creation failed
        await knex("tms_warehouse_bulk_upload_warehouses")
          .where({ id: validWarehouse.id })
          .update({
            validation_status: "invalid",
            validation_errors: JSON.stringify([
              {
                field: "creation",
                message: `Failed to create: ${error.message}`,
              },
            ]),
          });

        creationFailedCount++;
      }
    }

    console.log(
      `✅ Creation complete: ${createdCount} created, ${creationFailedCount} failed`
    );

    // Update final batch status
    await knex("tms_warehouse_bulk_upload_batches")
      .where({ batch_id: batchId })
      .update({
        total_created: createdCount,
        total_creation_failed: creationFailedCount,
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
```

---

## Part 2: Frontend Implementation

### Step 1: Create Warehouse Bulk Upload Slice Actions

**File**: `frontend/src/redux/slices/warehouseSlice.js`

Add these async thunks:

```javascript
// Add to imports
import api from "../../utils/api";

// Add these thunks
export const downloadWarehouseBulkTemplate = createAsyncThunk(
  "warehouse/downloadBulkTemplate",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/warehouse-bulk-upload/template", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Warehouse_Bulk_Upload_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to download template"
      );
    }
  }
);

export const uploadWarehouseBulk = createAsyncThunk(
  "warehouse/uploadBulk",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        "/warehouse-bulk-upload/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to upload file");
    }
  }
);

export const fetchWarehouseBulkStatus = createAsyncThunk(
  "warehouse/fetchBulkStatus",
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/warehouse-bulk-upload/status/${batchId}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch status");
    }
  }
);

export const fetchWarehouseBulkHistory = createAsyncThunk(
  "warehouse/fetchBulkHistory",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/warehouse-bulk-upload/history?page=${page}&limit=${limit}`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch history");
    }
  }
);

export const downloadWarehouseBulkErrorReport = createAsyncThunk(
  "warehouse/downloadErrorReport",
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/warehouse-bulk-upload/error-report/${batchId}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Warehouse_Error_Report_${batchId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to download report"
      );
    }
  }
);

// Add to initial state
const initialState = {
  // ... existing state

  // Bulk upload state
  bulkUpload: {
    isModalOpen: false,
    isHistoryModalOpen: false,
    isUploading: false,
    isDownloadingTemplate: false,
    currentBatch: null,
    batches: [],
    statusCounts: { valid: 0, invalid: 0 },
    pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  },
};

// Add reducers
const warehouseSlice = createSlice({
  name: "warehouse",
  initialState,
  reducers: {
    // ... existing reducers

    openBulkUploadModal: (state) => {
      state.bulkUpload.isModalOpen = true;
    },
    closeBulkUploadModal: (state) => {
      state.bulkUpload.isModalOpen = false;
    },
    openBulkUploadHistory: (state) => {
      state.bulkUpload.isHistoryModalOpen = true;
    },
    closeBulkUploadHistory: (state) => {
      state.bulkUpload.isHistoryModalOpen = false;
    },
    resetBulkUploadState: (state) => {
      state.bulkUpload.currentBatch = null;
      state.bulkUpload.statusCounts = { valid: 0, invalid: 0 };
    },
  },
  extraReducers: (builder) => {
    // ... existing reducers

    // Download template
    builder.addCase(downloadWarehouseBulkTemplate.pending, (state) => {
      state.bulkUpload.isDownloadingTemplate = true;
    });
    builder.addCase(downloadWarehouseBulkTemplate.fulfilled, (state) => {
      state.bulkUpload.isDownloadingTemplate = false;
    });
    builder.addCase(downloadWarehouseBulkTemplate.rejected, (state) => {
      state.bulkUpload.isDownloadingTemplate = false;
    });

    // Upload file
    builder.addCase(uploadWarehouseBulk.pending, (state) => {
      state.bulkUpload.isUploading = true;
    });
    builder.addCase(uploadWarehouseBulk.fulfilled, (state, action) => {
      state.bulkUpload.isUploading = false;
      state.bulkUpload.currentBatch = action.payload;
    });
    builder.addCase(uploadWarehouseBulk.rejected, (state, action) => {
      state.bulkUpload.isUploading = false;
      state.error = action.payload;
    });

    // Fetch status
    builder.addCase(fetchWarehouseBulkStatus.fulfilled, (state, action) => {
      state.bulkUpload.currentBatch = action.payload.batch;
      state.bulkUpload.statusCounts = action.payload.statusCounts;
    });

    // Fetch history
    builder.addCase(fetchWarehouseBulkHistory.fulfilled, (state, action) => {
      state.bulkUpload.batches = action.payload.batches;
      state.bulkUpload.pagination = action.payload.pagination;
    });
  },
});

// Export actions
export const {
  // ... existing actions
  openBulkUploadModal,
  closeBulkUploadModal,
  openBulkUploadHistory,
  closeBulkUploadHistory,
  resetBulkUploadState,
} = warehouseSlice.actions;
```

### Step 2: Create Warehouse Bulk Upload Modal

**File**: `frontend/src/features/warehouse/components/WarehouseBulkUploadModal.jsx`

Copy from `frontend/src/features/driver/components/BulkUploadModal.jsx` and replace:

- `driver` → `warehouse`
- `Driver` → `Warehouse`
- `bulkUpload` → `warehouse.bulkUpload`
- Action imports from `warehouseSlice`

### Step 3: Create Warehouse Bulk Upload History

**File**: `frontend/src/features/warehouse/components/WarehouseBulkUploadHistory.jsx`

Copy from `frontend/src/features/driver/components/BulkUploadHistory.jsx` and apply same replacements.

### Step 4: Update WarehouseCreatePage

```javascript
// Update imports
import {
  openBulkUploadModal,
} from "../../../redux/slices/warehouseSlice";
import WarehouseBulkUploadModal from "../components/WarehouseBulkUploadModal";
import WarehouseBulkUploadHistory from "../components/WarehouseBulkUploadHistory";

// Update handleBulkUpload
const handleBulkUpload = useCallback(() => {
  dispatch(openBulkUploadModal());
}, [dispatch]);

// Add at end of JSX (before closing div)
{/* Bulk Upload Modal and History */}
<WarehouseBulkUploadModal />
<WarehouseBulkUploadHistory />
```

---

## Testing Checklist

### Backend Testing

- [ ] Run migration: Database tables created
- [ ] Test template download: Excel file downloads with 3 sheets
- [ ] Test file upload: Batch created in database
- [ ] Test validation: Valid/invalid warehouses correctly identified
- [ ] Test creation: Valid warehouses created in all 5 tables
- [ ] Test error report: Download works for failed batches

### Frontend Testing

- [ ] Bulk Upload button appears in WarehouseCreatePage
- [ ] Modal opens when button clicked
- [ ] Template downloads when requested
- [ ] File upload shows progress
- [ ] Batch history displays correctly
- [ ] Error report downloads work

---

## Files Created/Modified

### Backend Files Created (✅)

1. `migrations/20251117071800_create_warehouse_bulk_upload_tables.js`
2. `utils/bulkUpload/warehouseExcelTemplateGenerator.js`
3. `controllers/bulkUpload/warehouseBulkUploadController.js`
4. `routes/warehouseBulkUploadRoutes.js`
5. `queues/warehouseBulkUploadProcessor.js` (⚠️ Implementation guide provided)

### Backend Files Modified (✅)

1. `server.js` - Added route registration
2. `controllers/warehouseController.js` - Fixed 3 database column errors

### Frontend Files To Create (⏳)

1. `features/warehouse/components/WarehouseBulkUploadModal.jsx`
2. `features/warehouse/components/WarehouseBulkUploadHistory.jsx`

### Frontend Files To Modify (⏳)

1. `redux/slices/warehouseSlice.js` - Add bulk upload actions
2. `features/warehouse/pages/WarehouseCreatePage.jsx` - Integrate bulk upload

---

## Next Steps

1. **Complete Processor**: Implement `warehouseBulkUploadProcessor.js` using the guide above
2. **Run Migration**: `cd tms-backend && npx knex migrate:latest`
3. **Create Frontend Components**: Copy from driver bulk upload and customize
4. **Test End-to-End**: Upload sample Excel file with warehouses
5. **Document**: Update user guide with bulk upload instructions

---

## Estimated Time

- **Processor Implementation**: 2-3 hours
- **Frontend Components**: 1-2 hours
- **Testing & Debugging**: 2-3 hours
- **Total**: 5-8 hours

---

## Support Notes

The warehouse bulk upload processor is essentially the driver processor with:

- Different table names
- Different ID generation logic
- 3 sheets instead of 5
- Sub-location handling instead of history/accidents
- Same validation & creation pattern

All backend infrastructure is ready - only the processor logic needs to be implemented following the pattern provided in this guide.
