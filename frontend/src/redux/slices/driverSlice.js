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
    clearLastCreated: (state) => {
      state.lastCreated = null;
    },
    resetDriverState: (state) => {
      Object.assign(state, initialState);
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
      });
  },
});

export const { clearError, clearLastCreated, resetDriverState } =
  driverSlice.actions;

export default driverSlice.reducer;
