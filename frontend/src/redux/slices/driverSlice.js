import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunks
export const createDriver = createAsyncThunk(
  "driver/createDriver",
  async (driverData, { rejectWithValue }) => {
    try {
      const response = await api.post("/driver", driverData);

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to create driver"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to create driver",
        }
      );
    }
  }
);

export const updateDriver = createAsyncThunk(
  "driver/updateDriver",
  async ({ driverId, driverData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/driver/${driverId}`, driverData);

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to update driver"
        );
      }
    } catch (error) {
      console.error("API Error updating driver:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to update driver",
        }
      );
    }
  }
);

export const fetchMasterData = createAsyncThunk(
  "driver/fetchMasterData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/driver/master-data");

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to fetch master data"
        );
      }
    } catch (error) {
      console.error("API Error fetching master data:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch master data",
        }
      );
    }
  }
);

export const fetchMandatoryDocuments = createAsyncThunk(
  "driver/fetchMandatoryDocuments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/driver/mandatory-documents");

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to fetch mandatory documents"
        );
      }
    } catch (error) {
      console.error("API Error fetching mandatory documents:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch mandatory documents",
        }
      );
    }
  }
);

export const fetchStatesByCountry = createAsyncThunk(
  "driver/fetchStatesByCountry",
  async (countryCode, { rejectWithValue }) => {
    try {
      const response = await api.get(`/driver/states/${countryCode}`);

      if (response.data.success) {
        return { countryCode, states: response.data.data };
      } else {
        return rejectWithValue(response.data.error || "Failed to fetch states");
      }
    } catch (error) {
      console.error("API Error fetching states:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch states",
        }
      );
    }
  }
);

export const fetchCitiesByCountryAndState = createAsyncThunk(
  "driver/fetchCitiesByCountryAndState",
  async ({ countryCode, stateCode }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/driver/cities/${countryCode}/${stateCode}`
      );

      if (response.data.success) {
        return {
          countryCode,
          stateCode,
          cities: response.data.data,
        };
      } else {
        return rejectWithValue(response.data.error || "Failed to fetch cities");
      }
    } catch (error) {
      console.error("API Error fetching cities:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch cities",
        }
      );
    }
  }
);

export const fetchDrivers = createAsyncThunk(
  "driver/fetchDrivers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/driver", { params });

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to fetch drivers"
        );
      }
    } catch (error) {
      console.error("API Error fetching drivers:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch drivers",
        }
      );
    }
  }
);

// Fetch driver status counts
export const fetchDriverStatusCounts = createAsyncThunk(
  "driver/fetchStatusCounts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/driver/status-counts");

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to fetch status counts"
        );
      }
    } catch (error) {
      console.error("API Error fetching status counts:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch status counts",
        }
      );
    }
  }
);

// Fetch single driver by ID
export const fetchDriverById = createAsyncThunk(
  "driver/fetchDriverById",
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/driver/${driverId}`);

      if (response.data.success) {
        const data = response.data.data;

        // Flatten the nested structure for easier component access
        const flattenedData = {
          driverId: data.driverId,
          // Flatten basicInfo fields to top level
          ...data.basicInfo,
          // Keep nested data as-is for tabs
          addresses: data.addresses || [],
          documents: data.documents || [],
          history: data.history || [],
          accidents: data.accidents || [],
          transporterMappings: data.transporterMappings || [],
          vehicleMappings: data.vehicleMappings || [],
          blacklistMappings: data.blacklistMappings || [],
          // CRITICAL: Include approval status for ApprovalActionBar
          userApprovalStatus: data.userApprovalStatus || null,
          approvalHistory: data.approvalHistory || [],
        };

        return flattenedData;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to fetch driver details"
        );
      }
    } catch (error) {
      console.error("API Error fetching driver details:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch driver details",
        }
      );
    }
  }
);

// Bulk Upload Actions
export const downloadDriverTemplate = createAsyncThunk(
  "driver/downloadTemplate",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/driver-bulk-upload/template", {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Driver_Bulk_Upload_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (error) {
      console.error("Error downloading template:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "DOWNLOAD_ERROR",
          message: "Failed to download template",
        }
      );
    }
  }
);

export const uploadDriverBulk = createAsyncThunk(
  "driver/uploadBulk",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/driver-bulk-upload/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.error || "Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "UPLOAD_ERROR",
          message: "Failed to upload file",
        }
      );
    }
  }
);

export const fetchDriverBatchStatus = createAsyncThunk(
  "driver/fetchBatchStatus",
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/driver-bulk-upload/status/${batchId}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to fetch batch status"
        );
      }
    } catch (error) {
      console.error("Error fetching batch status:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "FETCH_ERROR",
          message: "Failed to fetch batch status",
        }
      );
    }
  }
);

export const fetchDriverUploadHistory = createAsyncThunk(
  "driver/fetchUploadHistory",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/driver-bulk-upload/history", { params });

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to fetch upload history"
        );
      }
    } catch (error) {
      console.error("Error fetching upload history:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "FETCH_ERROR",
          message: "Failed to fetch upload history",
        }
      );
    }
  }
);

export const downloadDriverErrorReport = createAsyncThunk(
  "driver/downloadErrorReport",
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/driver-bulk-upload/error-report/${batchId}`,
        {
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Driver_Error_Report_${batchId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (error) {
      console.error("Error downloading error report:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "DOWNLOAD_ERROR",
          message: "Failed to download error report",
        }
      );
    }
  }
);

// ============================================
// DRAFT MANAGEMENT ASYNC THUNKS
// ============================================

/**
 * Save driver as draft
 * Creates a new draft record with minimal validation
 */
export const saveDriverAsDraft = createAsyncThunk(
  "driver/saveAsDraft",
  async (driverData, { rejectWithValue }) => {
    try {
      const response = await api.post("/driver/save-draft", driverData);

      if (response.data.success) {
        // Backend returns driver_id directly in response.data, not in response.data.data
        return {
          driver_id: response.data.driver_id,
          message: response.data.message,
        };
      } else {
        return rejectWithValue(response.data.error || "Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "SAVE_DRAFT_ERROR",
          message: "Failed to save driver as draft",
        }
      );
    }
  }
);

/**
 * Update existing driver draft
 * Only allows updating drafts created by current user
 */
export const updateDriverDraft = createAsyncThunk(
  "driver/updateDraft",
  async ({ driverId, driverData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/driver/${driverId}/update-draft`,
        driverData
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.error || "Failed to update draft");
      }
    } catch (error) {
      console.error("Error updating draft:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "UPDATE_DRAFT_ERROR",
          message: "Failed to update draft",
        }
      );
    }
  }
);

/**
 * Delete driver draft
 * Only allows deleting drafts created by current user
 */
export const deleteDriverDraft = createAsyncThunk(
  "driver/deleteDraft",
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/driver/${driverId}/delete-draft`);

      if (response.data.success) {
        return { driverId };
      } else {
        return rejectWithValue(response.data.error || "Failed to delete draft");
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "DELETE_DRAFT_ERROR",
          message: "Failed to delete draft",
        }
      );
    }
  }
);

/**
 * Submit driver from draft to PENDING status
 * Performs full validation and changes status from SAVE_AS_DRAFT to PENDING
 * Only allows submitting drafts created by current user
 */
export const submitDriverFromDraft = createAsyncThunk(
  "driver/submitFromDraft",
  async ({ driverId, driverData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/driver/${driverId}/submit-draft`,
        driverData
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.error || "Failed to submit draft");
      }
    } catch (error) {
      console.error("Error submitting draft:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "SUBMIT_DRAFT_ERROR",
          message: "Failed to submit draft for approval",
        }
      );
    }
  }
);

// ============================================
// MAPPING MANAGEMENT ASYNC THUNKS
// ============================================

/**
 * Fetch mapping master data (transporters, vehicles, consignors for dropdowns)
 */
export const fetchMappingMasterData = createAsyncThunk(
  "driver/fetchMappingMasterData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/driver/mapping-master-data");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "FETCH_ERROR",
          message: "Failed to fetch mapping master data",
        }
      );
    }
  }
);

/**
 * Fetch transporter mappings for a driver
 */
export const fetchTransporterMappings = createAsyncThunk(
  "driver/fetchTransporterMappings",
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/driver/${driverId}/transporter-mappings`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "FETCH_ERROR",
          message: "Failed to fetch transporter mappings",
        }
      );
    }
  }
);

/**
 * Create transporter mapping
 */
export const createTransporterMapping = createAsyncThunk(
  "driver/createTransporterMapping",
  async ({ driverId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/driver/${driverId}/transporter-mappings`,
        mappingData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "CREATE_ERROR",
          message: "Failed to create transporter mapping",
        }
      );
    }
  }
);

/**
 * Update transporter mapping
 */
export const updateTransporterMapping = createAsyncThunk(
  "driver/updateTransporterMapping",
  async ({ driverId, mappingId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/driver/${driverId}/transporter-mappings/${mappingId}`,
        mappingData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "UPDATE_ERROR",
          message: "Failed to update transporter mapping",
        }
      );
    }
  }
);

/**
 * Delete transporter mapping
 */
export const deleteTransporterMapping = createAsyncThunk(
  "driver/deleteTransporterMapping",
  async ({ driverId, mappingId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/driver/${driverId}/transporter-mappings/${mappingId}`
      );
      return { mappingId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "DELETE_ERROR",
          message: "Failed to delete transporter mapping",
        }
      );
    }
  }
);

/**
 * Fetch vehicle mappings for a driver
 */
export const fetchVehicleMappings = createAsyncThunk(
  "driver/fetchVehicleMappings",
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/driver/${driverId}/vehicle-mappings`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "FETCH_ERROR",
          message: "Failed to fetch vehicle mappings",
        }
      );
    }
  }
);

/**
 * Create vehicle mapping
 */
export const createVehicleMapping = createAsyncThunk(
  "driver/createVehicleMapping",
  async ({ driverId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/driver/${driverId}/vehicle-mappings`,
        mappingData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "CREATE_ERROR",
          message: "Failed to create vehicle mapping",
        }
      );
    }
  }
);

/**
 * Update vehicle mapping
 */
export const updateVehicleMapping = createAsyncThunk(
  "driver/updateVehicleMapping",
  async ({ driverId, mappingId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/driver/${driverId}/vehicle-mappings/${mappingId}`,
        mappingData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "UPDATE_ERROR",
          message: "Failed to update vehicle mapping",
        }
      );
    }
  }
);

/**
 * Delete vehicle mapping
 */
export const deleteVehicleMapping = createAsyncThunk(
  "driver/deleteVehicleMapping",
  async ({ driverId, mappingId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/driver/${driverId}/vehicle-mappings/${mappingId}`
      );
      return { mappingId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "DELETE_ERROR",
          message: "Failed to delete vehicle mapping",
        }
      );
    }
  }
);

/**
 * Fetch blacklist mappings for a driver
 */
export const fetchBlacklistMappings = createAsyncThunk(
  "driver/fetchBlacklistMappings",
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/driver/${driverId}/blacklist-mappings`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "FETCH_ERROR",
          message: "Failed to fetch blacklist mappings",
        }
      );
    }
  }
);

/**
 * Create blacklist mapping
 */
export const createBlacklistMapping = createAsyncThunk(
  "driver/createBlacklistMapping",
  async ({ driverId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/driver/${driverId}/blacklist-mappings`,
        mappingData
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "CREATE_ERROR",
          message: "Failed to create blacklist mapping",
        }
      );
    }
  }
);

/**
 * Update blacklist mapping
 */
export const updateBlacklistMapping = createAsyncThunk(
  "driver/updateBlacklistMapping",
  async ({ driverId, mappingId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/driver/${driverId}/blacklist-mappings/${mappingId}`,
        mappingData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "UPDATE_ERROR",
          message: "Failed to update blacklist mapping",
        }
      );
    }
  }
);

/**
 * Delete blacklist mapping
 */
export const deleteBlacklistMapping = createAsyncThunk(
  "driver/deleteBlacklistMapping",
  async ({ driverId, mappingId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/driver/${driverId}/blacklist-mappings/${mappingId}`
      );
      return { mappingId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "DELETE_ERROR",
          message: "Failed to delete blacklist mapping",
        }
      );
    }
  }
);

const initialState = {
  // Master data
  masterData: {
    countries: [],
    documentTypes: [],
    documentNames: [],
    addressTypes: [],
    genderOptions: [],
    bloodGroupOptions: [],
    violationTypes: [],
  },
  statesByCountry: {},
  citiesByCountryState: {},

  // Mandatory documents from doc_type_configuration
  mandatoryDocuments: [],

  // Driver data
  drivers: [],
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    pages: 0,
  },
  selectedDriver: null,

  // UI state
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isFetching: false,
  isFetchingDetails: false,
  error: null,

  // Success state
  lastCreated: null,

  // Status counts
  statusCounts: {
    ACTIVE: 0,
    INACTIVE: 0,
    PENDING: 0,
    DRAFT: 0,
  },
  statusCountsLoading: false,
  statusCountsError: null,

  // Draft management state
  isSavingDraft: false,
  isUpdatingDraft: false,
  isDeletingDraft: false,
  isSubmittingDraft: false,
  draftError: null,
  lastDraftAction: null,

  // Mapping state
  transporterMappings: [],
  vehicleMappings: [],
  blacklistMappings: [],
  mappingMasterData: {
    transporters: [],
    vehicles: [],
    consignors: [],
    userTypes: [],
  },
  isFetchingMappings: false,
  mappingError: null,

  // Bulk upload state
  bulkUpload: {
    isUploading: false,
    isDownloadingTemplate: false,
    isDownloadingError: false,
    uploadProgress: 0,
    validationResults: null,
    currentBatch: null,
    uploadHistory: [],
    errors: null,
  },
};

const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedDriver: (state) => {
      state.selectedDriver = null;
      state.isFetchingDetails = false;
      state.error = null;
    },
    clearLastCreated: (state) => {
      state.lastCreated = null;
    },
    resetDriverState: (state) => {
      Object.assign(state, initialState);
    },
    resetPaginationToFirstPage: (state) => {
      state.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Driver
      .addCase(createDriver.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createDriver.fulfilled, (state, action) => {
        state.isCreating = false;
        state.lastCreated = action.payload.data;
        state.error = null;
      })
      .addCase(createDriver.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      // Update Driver
      .addCase(updateDriver.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateDriver.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.error = null;
      })
      .addCase(updateDriver.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Fetch Master Data
      .addCase(fetchMasterData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.masterData = action.payload;
        state.error = null;
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Mandatory Documents
      .addCase(fetchMandatoryDocuments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMandatoryDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mandatoryDocuments = action.payload;
        state.error = null;
      })
      .addCase(fetchMandatoryDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch States By Country
      .addCase(fetchStatesByCountry.fulfilled, (state, action) => {
        state.statesByCountry[action.payload.countryCode] =
          action.payload.states;
      })

      // Fetch Cities By Country and State
      .addCase(fetchCitiesByCountryAndState.fulfilled, (state, action) => {
        const key = `${action.payload.countryCode}-${action.payload.stateCode}`;
        state.citiesByCountryState[key] = action.payload.cities;
      })

      // Fetch Drivers
      .addCase(fetchDrivers.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.isFetching = false;
        state.drivers = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })

      // Fetch Driver By ID
      .addCase(fetchDriverById.pending, (state) => {
        state.isFetchingDetails = true;
        state.error = null;
      })
      .addCase(fetchDriverById.fulfilled, (state, action) => {
        state.isFetchingDetails = false;
        state.selectedDriver = action.payload;
        state.error = null;
      })
      .addCase(fetchDriverById.rejected, (state, action) => {
        state.isFetchingDetails = false;
        state.error = action.payload;
      })

      // Fetch Driver Status Counts
      .addCase(fetchDriverStatusCounts.pending, (state) => {
        state.statusCountsLoading = true;
        state.statusCountsError = null;
      })
      .addCase(fetchDriverStatusCounts.fulfilled, (state, action) => {
        state.statusCountsLoading = false;
        state.statusCounts = action.payload;
        state.statusCountsError = null;
      })
      .addCase(fetchDriverStatusCounts.rejected, (state, action) => {
        state.statusCountsLoading = false;
        state.statusCountsError = action.payload;
      })

      // Download Template
      .addCase(downloadDriverTemplate.pending, (state) => {
        state.bulkUpload.isDownloadingTemplate = true;
        state.bulkUpload.errors = null;
      })
      .addCase(downloadDriverTemplate.fulfilled, (state) => {
        state.bulkUpload.isDownloadingTemplate = false;
      })
      .addCase(downloadDriverTemplate.rejected, (state, action) => {
        state.bulkUpload.isDownloadingTemplate = false;
        state.bulkUpload.errors = action.payload;
      })

      // Upload Bulk File
      .addCase(uploadDriverBulk.pending, (state) => {
        state.bulkUpload.isUploading = true;
        state.bulkUpload.uploadProgress = 0;
        state.bulkUpload.errors = null;
      })
      .addCase(uploadDriverBulk.fulfilled, (state, action) => {
        state.bulkUpload.isUploading = false;
        // Backend returns: {batchId, status}
        state.bulkUpload.currentBatch = {
          batch_id: action.payload.batchId,
          status: action.payload.status,
        };
        state.bulkUpload.uploadProgress = 100;
      })
      .addCase(uploadDriverBulk.rejected, (state, action) => {
        state.bulkUpload.isUploading = false;
        state.bulkUpload.errors = action.payload;
        state.bulkUpload.uploadProgress = 0;
      })

      // Fetch Batch Status
      .addCase(fetchDriverBatchStatus.fulfilled, (state, action) => {
        state.bulkUpload.currentBatch = action.payload.batch;
        state.bulkUpload.validationResults = action.payload.statusCounts;
      })

      // Fetch Upload History
      .addCase(fetchDriverUploadHistory.fulfilled, (state, action) => {
        state.bulkUpload.uploadHistory = action.payload.batches;
      })

      // Download Error Report
      .addCase(downloadDriverErrorReport.pending, (state) => {
        state.bulkUpload.isDownloadingError = true;
      })
      .addCase(downloadDriverErrorReport.fulfilled, (state) => {
        state.bulkUpload.isDownloadingError = false;
      })
      .addCase(downloadDriverErrorReport.rejected, (state, action) => {
        state.bulkUpload.isDownloadingError = false;
        state.bulkUpload.errors = action.payload;
      })

      // Save Driver as Draft
      .addCase(saveDriverAsDraft.pending, (state) => {
        state.isSavingDraft = true;
        state.draftError = null;
      })
      .addCase(saveDriverAsDraft.fulfilled, (state, action) => {
        state.isSavingDraft = false;
        state.lastDraftAction = { type: "save", data: action.payload };
        state.draftError = null;
      })
      .addCase(saveDriverAsDraft.rejected, (state, action) => {
        state.isSavingDraft = false;
        state.draftError = action.payload;
      })

      // Update Driver Draft
      .addCase(updateDriverDraft.pending, (state) => {
        state.isUpdatingDraft = true;
        state.draftError = null;
      })
      .addCase(updateDriverDraft.fulfilled, (state, action) => {
        state.isUpdatingDraft = false;
        state.lastDraftAction = { type: "update", data: action.payload };
        state.draftError = null;
      })
      .addCase(updateDriverDraft.rejected, (state, action) => {
        state.isUpdatingDraft = false;
        state.draftError = action.payload;
      })

      // Delete Driver Draft
      .addCase(deleteDriverDraft.pending, (state) => {
        state.isDeletingDraft = true;
        state.draftError = null;
      })
      .addCase(deleteDriverDraft.fulfilled, (state, action) => {
        state.isDeletingDraft = false;
        // Remove the deleted draft from the drivers list
        state.drivers = state.drivers.filter(
          (driver) => driver.driverId !== action.payload.driverId
        );
        state.lastDraftAction = { type: "delete", data: action.payload };
        state.draftError = null;
      })
      .addCase(deleteDriverDraft.rejected, (state, action) => {
        state.isDeletingDraft = false;
        state.draftError = action.payload;
      })

      // Submit Driver Draft for Approval
      .addCase(submitDriverFromDraft.pending, (state) => {
        state.isSubmittingDraft = true;
        state.draftError = null;
      })
      .addCase(submitDriverFromDraft.fulfilled, (state, action) => {
        state.isSubmittingDraft = false;
        // Update the driver in the list if present
        const index = state.drivers.findIndex(
          (driver) => driver.driverId === action.payload.driverId
        );
        if (index !== -1) {
          state.drivers[index].status = "PENDING";
        }
        // Update selectedDriver if it's the same one
        if (state.selectedDriver?.driverId === action.payload.driverId) {
          state.selectedDriver.status = "PENDING";
        }
        state.lastDraftAction = { type: "submit", data: action.payload };
        state.draftError = null;
      })
      .addCase(submitDriverFromDraft.rejected, (state, action) => {
        state.isSubmittingDraft = false;
        state.draftError = action.payload;
      })

      // Mapping Master Data
      .addCase(fetchMappingMasterData.pending, (state) => {
        state.isFetchingMappings = true;
      })
      .addCase(fetchMappingMasterData.fulfilled, (state, action) => {
        state.isFetchingMappings = false;
        state.mappingMasterData = action.payload;
      })
      .addCase(fetchMappingMasterData.rejected, (state, action) => {
        state.isFetchingMappings = false;
        state.mappingError = action.payload;
      })

      // Transporter Mappings
      .addCase(fetchTransporterMappings.pending, (state) => {
        state.isFetchingMappings = true;
      })
      .addCase(fetchTransporterMappings.fulfilled, (state, action) => {
        state.isFetchingMappings = false;
        state.transporterMappings = action.payload;
      })
      .addCase(fetchTransporterMappings.rejected, (state, action) => {
        state.isFetchingMappings = false;
        state.mappingError = action.payload;
      })

      // Vehicle Mappings
      .addCase(fetchVehicleMappings.pending, (state) => {
        state.isFetchingMappings = true;
      })
      .addCase(fetchVehicleMappings.fulfilled, (state, action) => {
        state.isFetchingMappings = false;
        state.vehicleMappings = action.payload;
      })
      .addCase(fetchVehicleMappings.rejected, (state, action) => {
        state.isFetchingMappings = false;
        state.mappingError = action.payload;
      })

      // Blacklist Mappings
      .addCase(fetchBlacklistMappings.pending, (state) => {
        state.isFetchingMappings = true;
      })
      .addCase(fetchBlacklistMappings.fulfilled, (state, action) => {
        state.isFetchingMappings = false;
        state.blacklistMappings = action.payload;
      })
      .addCase(fetchBlacklistMappings.rejected, (state, action) => {
        state.isFetchingMappings = false;
        state.mappingError = action.payload;
      });
  },
});

export const {
  clearError,
  clearSelectedDriver,
  clearLastCreated,
  resetDriverState,
  resetPaginationToFirstPage,
} = driverSlice.actions;

export default driverSlice.reducer;
