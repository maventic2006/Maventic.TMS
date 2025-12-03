import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { API_ENDPOINTS } from "../../utils/constants";

// Mock data for initial development
const mockWarehouses = [
  {
    warehouse_id: "WH001",
    consignor_id: "C001",
    warehouse_type_id: "WT001",
    warehouse_type_name: "Manufacturing",
    warehouse_name_1: "Central Manufacturing Hub",
    weigh_bridge: true,
    virtual_yard_in: true,
    geo_fencing: true,
    gate_pass: true,
    fuel_filling: false,
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    created_by: "Admin",
    created_at: "2025-01-15",
    status: "ACTIVE",
    approver: "John Doe",
    approved_on: "2025-01-16",
  },
  {
    warehouse_id: "WH002",
    consignor_id: "C001",
    warehouse_type_id: "WT002",
    warehouse_type_name: "Cold Storage",
    warehouse_name_1: "Refrigerated Storage Facility",
    weigh_bridge: true,
    virtual_yard_in: false,
    geo_fencing: true,
    gate_pass: true,
    fuel_filling: false,
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    created_by: "Admin",
    created_at: "2025-02-10",
    status: "ACTIVE",
    approver: "Jane Smith",
    approved_on: "2025-02-11",
  },
  {
    warehouse_id: "WH003",
    consignor_id: "C001",
    warehouse_type_id: "WT003",
    warehouse_type_name: "Distributor",
    warehouse_name_1: "Regional Distribution Center",
    weigh_bridge: false,
    virtual_yard_in: true,
    geo_fencing: false,
    gate_pass: true,
    fuel_filling: true,
    city: "Delhi",
    state: "Delhi",
    country: "India",
    created_by: "Manager",
    created_at: "2025-03-05",
    status: "PENDING",
    approver: null,
    approved_on: null,
  },
];

// Initial state
const initialState = {
  warehouses: [],
  filteredWarehouses: [],
  currentWarehouse: null,
  lastCreatedWarehouse: null,
  masterData: {
    warehouseTypes: [],
    materialTypes: [],
    addressTypes: [],
    subLocationTypes: [],
    documentTypes: [],
  },
  loading: false,
  isCreating: false,
  isSavingDraft: false,
  isUpdatingDraft: false,
  isSubmittingDraft: false,
  isDeletingDraft: false,
  error: null,
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  },
  filters: {
    warehouseId: "",
    warehouseName: "",
    weighBridge: null,
    virtualYardIn: null,
    geoFencing: null,
    status: "",
  },
  useMockData: false, // Flag to switch between mock and real data - now using real API

  // Approval state (for warehouse manager users)
  userApprovalStatus: null,
  approvalHistory: [],
  isApproving: false,
  isRejecting: false,

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

// Async thunks (will be implemented with real API later)
export const fetchWarehouses = createAsyncThunk(
  "warehouse/fetchWarehouses",
  async (params, { getState, rejectWithValue }) => {
    try {
      const { useMockData } = getState().warehouse;

      if (useMockData) {
        // Return mock data for now
        return {
          warehouses: mockWarehouses,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 25,
            total: mockWarehouses.length,
            totalPages: Math.ceil(
              mockWarehouses.length / (params?.limit || 25)
            ),
          },
        };
      }

      // Real API call
      const response = await api.get(API_ENDPOINTS.WAREHOUSE.LIST, { params });
      return {
        warehouses: response.data.warehouses,
        pagination: response.data.pagination,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch warehouses"
      );
    }
  }
);

export const fetchWarehouseById = createAsyncThunk(
  "warehouse/fetchWarehouseById",
  async (id, { getState, rejectWithValue }) => {
    try {
      console.log("📦 Fetching warehouse details for ID:", id);

      const { useMockData } = getState().warehouse;

      if (useMockData) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Find warehouse in mock data
        const warehouse = mockWarehouses.find((w) => w.warehouse_id === id);

        if (!warehouse) {
          throw new Error("Warehouse not found");
        }

        return { warehouse };
      }

      // Real API call
      const response = await api.get(
        `${API_ENDPOINTS.WAREHOUSE.GET_BY_ID}/${id}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch warehouse details"
      );
    }
  }
);

export const createWarehouse = createAsyncThunk(
  "warehouse/createWarehouse",
  async (warehouseData, { rejectWithValue }) => {
    try {
      console.log("📦 Creating warehouse via API:", warehouseData);
      const response = await api.post("/warehouse/create", warehouseData);
      return response.data;
    } catch (error) {
      console.error("❌ Create warehouse error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.error || {
          message:
            error.response?.data?.message || "Failed to create warehouse",
        }
      );
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  "warehouse/updateWarehouse",
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      console.log("📦 Updating warehouse:", id, data);

      const { useMockData } = getState().warehouse;

      if (useMockData) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Basic validation
        if (!data.warehouse_name1 || data.warehouse_name1.trim() === "") {
          throw {
            code: "VALIDATION_ERROR",
            field: "warehouse_name1",
            message: "Warehouse name is required",
          };
        }

        // Find and update warehouse in mock data
        const warehouseIndex = mockWarehouses.findIndex(
          (w) => w.warehouse_id === id
        );

        if (warehouseIndex === -1) {
          throw new Error("Warehouse not found");
        }

        // Update mock data
        mockWarehouses[warehouseIndex] = {
          ...mockWarehouses[warehouseIndex],
          ...data,
          updated_at: new Date().toISOString().split("T")[0],
        };

        return {
          warehouse: mockWarehouses[warehouseIndex],
          message: "Warehouse updated successfully",
        };
      }

      // Real API call
      const response = await api.put(
        `${API_ENDPOINTS.WAREHOUSE.UPDATE}/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error);
    }
  }
);

export const fetchMasterData = createAsyncThunk(
  "warehouse/fetchMasterData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.WAREHOUSE.MASTER_DATA);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch master data"
      );
    }
  }
);

// Bulk Upload Async Thunks
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

/**
 * Save warehouse as draft
 * Creates a new draft record with minimal validation (warehouse_name + consignor_id only)
 */
export const saveWarehouseAsDraft = createAsyncThunk(
  "warehouse/saveAsDraft",
  async (warehouseData, { rejectWithValue }) => {
    try {
      console.log("🏭 Saving warehouse as draft:", warehouseData);

      const response = await api.post("/warehouse/save-draft", warehouseData);

      console.log("✅ Warehouse draft saved successfully:", response.data);

      return {
        success: response.data.success,
        warehouseId: response.data.data?.warehouseId,
        status: response.data.data?.status,
        message:
          response.data.message || "Warehouse saved as draft successfully",
      };
    } catch (error) {
      console.error("❌ Error saving warehouse draft:", error);
      return rejectWithValue({
        code: error.response?.data?.error?.code || "DRAFT_SAVE_ERROR",
        message:
          error.response?.data?.error?.message ||
          "Failed to save warehouse as draft",
        errors: error.response?.data?.errors || [],
      });
    }
  }
);

/**
 * Update existing warehouse draft
 * No validation, only allows updating drafts created by current user
 */
export const updateWarehouseDraft = createAsyncThunk(
  "warehouse/updateDraft",
  async ({ warehouseId, warehouseData }, { rejectWithValue }) => {
    try {
      console.log("🏭 Updating warehouse draft:", warehouseId, warehouseData);

      const response = await api.put(
        `/warehouse/${warehouseId}/update-draft`,
        warehouseData
      );

      console.log("✅ Warehouse draft updated successfully:", response.data);

      return {
        success: response.data.success,
        warehouseId: response.data.data?.warehouseId,
        status: response.data.data?.status,
        message:
          response.data.message || "Warehouse draft updated successfully",
      };
    } catch (error) {
      console.error("❌ Error updating warehouse draft:", error);
      return rejectWithValue({
        code: error.response?.data?.error?.code || "DRAFT_UPDATE_ERROR",
        message:
          error.response?.data?.error?.message ||
          "Failed to update warehouse draft",
        errors: error.response?.data?.errors || [],
      });
    }
  }
);

/**
 * Submit warehouse from draft to PENDING status
 * Performs full validation and changes status from DRAFT to PENDING
 */
export const submitWarehouseFromDraft = createAsyncThunk(
  "warehouse/submitFromDraft",
  async ({ warehouseId, warehouseData }, { rejectWithValue }) => {
    try {
      console.log(
        "🏭 Submitting warehouse draft for approval:",
        warehouseId,
        warehouseData
      );

      const response = await api.put(
        `/warehouse/${warehouseId}/submit-draft`,
        warehouseData
      );

      console.log("✅ Warehouse draft submitted successfully:", response.data);

      return {
        success: response.data.success,
        warehouseId: response.data.data?.warehouseId,
        status: response.data.data?.status,
        message:
          response.data.message ||
          "Warehouse submitted for approval successfully",
      };
    } catch (error) {
      console.error("❌ Error submitting warehouse draft:", error);
      return rejectWithValue({
        code: error.response?.data?.error?.code || "DRAFT_SUBMIT_ERROR",
        message:
          error.response?.data?.error?.message ||
          "Failed to submit warehouse draft",
        field: error.response?.data?.error?.field || null,
        expectedFormat: error.response?.data?.error?.expectedFormat || null,
        errors: error.response?.data?.errors || [],
      });
    }
  }
);

/**
 * Delete warehouse draft
 * Hard delete - only allows deleting drafts created by current user
 */
export const deleteWarehouseDraft = createAsyncThunk(
  "warehouse/deleteDraft",
  async (warehouseId, { rejectWithValue }) => {
    try {
      console.log("🏭 Deleting warehouse draft:", warehouseId);

      await api.delete(`/warehouse/${warehouseId}/delete-draft`);

      console.log("✅ Warehouse draft deleted successfully");

      return {
        success: true,
        warehouseId,
        message: "Warehouse draft deleted successfully",
      };
    } catch (error) {
      console.error("❌ Error deleting warehouse draft:", error);
      return rejectWithValue({
        code: error.response?.data?.error?.code || "DRAFT_DELETE_ERROR",
        message:
          error.response?.data?.error?.message ||
          "Failed to delete warehouse draft",
        errors: error.response?.data?.errors || [],
      });
    }
  }
);

// Warehouse slice
const warehouseSlice = createSlice({
  name: "warehouse",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setFilteredWarehouses: (state, action) => {
      state.filteredWarehouses = action.payload;
    },
    setUseMockData: (state, action) => {
      state.useMockData = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearLastCreated: (state) => {
      state.lastCreatedWarehouse = null;
    },
    // Bulk upload reducers
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
    resetPaginationToFirstPage: (state) => {
      state.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch warehouses
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload.warehouses || action.payload;
        state.filteredWarehouses = action.payload.warehouses || action.payload;
        // ✅ FIX: Properly update pagination from API response
        if (action.payload.pagination) {
          state.pagination = {
            page: action.payload.pagination.page || 1,
            limit: action.payload.pagination.limit || 25,
            total: action.payload.pagination.total || 0,
            totalPages: action.payload.pagination.totalPages || 0,
          };
        }
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch warehouse by ID
      .addCase(fetchWarehouseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouseById.fulfilled, (state, action) => {
        state.loading = false;

        // Flatten warehouse data and include userApprovalStatus at top level (match consignor pattern)
        const warehouseData = action.payload.warehouse || action.payload;
        const userApprovalStatus = action.payload.userApprovalStatus || null;

        state.currentWarehouse = {
          ...warehouseData,
          userApprovalStatus, // Include approval status at top level for ApprovalActionBar
        };

        // Store approval status separately for backward compatibility
        state.userApprovalStatus = userApprovalStatus;
        state.approvalHistory = action.payload.approvalHistory || [];

        console.log(
          "📊 Warehouse loaded with approval status:",
          userApprovalStatus?.currentApprovalStatus
        );
      })
      .addCase(fetchWarehouseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create warehouse
      .addCase(createWarehouse.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.isCreating = false;
        state.lastCreatedWarehouse = action.payload.warehouse || action.payload;
        state.warehouses.push(action.payload.warehouse || action.payload);
      })
      .addCase(createWarehouse.rejected, (state, action) => {
        state.isCreating = false;
        // ✅ Don't set error state for validation errors (they'll be shown as toast)
        if (action.payload?.code !== "VALIDATION_ERROR") {
          state.error = action.payload;
        }
      })

      // Update warehouse
      .addCase(updateWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        state.loading = false;
        const updatedWarehouse = action.payload.warehouse || action.payload;

        // Update in warehouses list
        const index = state.warehouses.findIndex(
          (w) => w.warehouse_id === updatedWarehouse.warehouse_id
        );
        if (index !== -1) {
          state.warehouses[index] = updatedWarehouse;
        }

        // Update current warehouse if it's the same
        if (
          state.currentWarehouse &&
          state.currentWarehouse.warehouse_id === updatedWarehouse.warehouse_id
        ) {
          state.currentWarehouse = updatedWarehouse;
        }
      })
      .addCase(updateWarehouse.rejected, (state, action) => {
        state.loading = false;
        // ✅ Don't set error state for validation errors (they'll be shown as toast)
        if (action.payload?.code !== "VALIDATION_ERROR") {
          state.error = action.payload;
        }
      })

      // Fetch master data
      .addCase(fetchMasterData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.loading = false;
        state.masterData = action.payload;
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Download template
      .addCase(downloadWarehouseBulkTemplate.pending, (state) => {
        state.bulkUpload.isDownloadingTemplate = true;
      })
      .addCase(downloadWarehouseBulkTemplate.fulfilled, (state) => {
        state.bulkUpload.isDownloadingTemplate = false;
      })
      .addCase(downloadWarehouseBulkTemplate.rejected, (state) => {
        state.bulkUpload.isDownloadingTemplate = false;
      })

      // Upload file
      .addCase(uploadWarehouseBulk.pending, (state) => {
        state.bulkUpload.isUploading = true;
      })
      .addCase(uploadWarehouseBulk.fulfilled, (state, action) => {
        state.bulkUpload.isUploading = false;
        state.bulkUpload.currentBatch = action.payload;
      })
      .addCase(uploadWarehouseBulk.rejected, (state, action) => {
        state.bulkUpload.isUploading = false;
        state.error = action.payload;
      })

      // Fetch status
      .addCase(fetchWarehouseBulkStatus.fulfilled, (state, action) => {
        state.bulkUpload.currentBatch = action.payload.batch;
        state.bulkUpload.statusCounts = action.payload.statusCounts;
      })

      // Fetch history
      .addCase(fetchWarehouseBulkHistory.fulfilled, (state, action) => {
        state.bulkUpload.batches = action.payload.batches;
        state.bulkUpload.pagination = action.payload.pagination;
      })

      // Save warehouse as draft
      .addCase(saveWarehouseAsDraft.pending, (state) => {
        state.isSavingDraft = true;
        state.error = null;
      })
      .addCase(saveWarehouseAsDraft.fulfilled, (state, action) => {
        state.isSavingDraft = false;
        state.lastCreatedWarehouse = action.payload;
      })
      .addCase(saveWarehouseAsDraft.rejected, (state, action) => {
        state.isSavingDraft = false;
        // ✅ Don't set error state for validation errors (they'll be shown as toast)
        if (action.payload?.code !== "VALIDATION_ERROR") {
          state.error = action.payload;
        }
      })

      // Update warehouse draft
      .addCase(updateWarehouseDraft.pending, (state) => {
        state.isUpdatingDraft = true;
        state.error = null;
      })
      .addCase(updateWarehouseDraft.fulfilled, (state, action) => {
        state.isUpdatingDraft = false;
        state.lastCreatedWarehouse = action.payload;
      })
      .addCase(updateWarehouseDraft.rejected, (state, action) => {
        state.isUpdatingDraft = false;
        // ✅ Don't set error state for validation errors (they'll be shown as toast)
        if (action.payload?.code !== "VALIDATION_ERROR") {
          state.error = action.payload;
        }
      })

      // Submit warehouse draft
      .addCase(submitWarehouseFromDraft.pending, (state) => {
        state.isSubmittingDraft = true;
        state.error = null;
      })
      .addCase(submitWarehouseFromDraft.fulfilled, (state, action) => {
        state.isSubmittingDraft = false;
        state.lastCreatedWarehouse = action.payload;
      })
      .addCase(submitWarehouseFromDraft.rejected, (state, action) => {
        state.isSubmittingDraft = false;
        // ✅ Don't set error state for validation errors (they'll be shown as toast)
        // Only set error state for critical errors (server errors, network errors, etc.)
        if (action.payload?.code !== "VALIDATION_ERROR") {
          state.error = action.payload;
        }
      })

      // Delete warehouse draft
      .addCase(deleteWarehouseDraft.pending, (state) => {
        state.isDeletingDraft = true;
        state.error = null;
      })
      .addCase(deleteWarehouseDraft.fulfilled, (state, action) => {
        state.isDeletingDraft = false;
        // Remove draft from warehouses list if present
        state.warehouses = state.warehouses.filter(
          (w) => w.warehouse_id !== action.payload.warehouseId
        );
      })
      .addCase(deleteWarehouseDraft.rejected, (state, action) => {
        state.isDeletingDraft = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setFilteredWarehouses,
  setUseMockData,
  clearError,
  clearLastCreated,
  openBulkUploadModal,
  closeBulkUploadModal,
  openBulkUploadHistory,
  closeBulkUploadHistory,
  resetBulkUploadState,
  resetPaginationToFirstPage,
} = warehouseSlice.actions;

export default warehouseSlice.reducer;
