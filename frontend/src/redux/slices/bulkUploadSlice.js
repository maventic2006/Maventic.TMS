import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunks
export const downloadTemplate = createAsyncThunk(
  "bulkUpload/downloadTemplate",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/bulk-upload/template", {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Transporter_Bulk_Upload_Template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: "Template downloaded successfully" };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "DOWNLOAD_ERROR",
          message: "Failed to download template",
        }
      );
    }
  }
);

export const uploadTransporterBulk = createAsyncThunk(
  "bulkUpload/uploadFile",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/bulk-upload/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to upload file"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "UPLOAD_ERROR",
          message: "Failed to upload file",
        }
      );
    }
  }
);

export const fetchBatchStatus = createAsyncThunk(
  "bulkUpload/fetchBatchStatus",
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bulk-upload/status/${batchId}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to fetch batch status"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "FETCH_ERROR",
          message: "Failed to fetch batch status",
        }
      );
    }
  }
);

export const fetchUploadHistory = createAsyncThunk(
  "bulkUpload/fetchHistory",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/bulk-upload/history?page=${page}&limit=${limit}`
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to fetch upload history"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "FETCH_ERROR",
          message: "Failed to fetch upload history",
        }
      );
    }
  }
);

export const downloadErrorReport = createAsyncThunk(
  "bulkUpload/downloadErrorReport",
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bulk-upload/error-report/${batchId}`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Error_Report_${batchId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: "Error report downloaded successfully" };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "DOWNLOAD_ERROR",
          message: "Failed to download error report",
        }
      );
    }
  }
);

// Initial state
const initialState = {
  // Upload state
  isUploading: false,
  uploadProgress: 0,
  currentBatch: null,
  
  // Validation state
  validationResults: null,
  
  // History state
  uploadHistory: [],
  historyPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  
  // UI state
  isModalOpen: false,
  isHistoryModalOpen: false,
  
  // Loading states
  isFetchingHistory: false,
  isFetchingStatus: false,
  isDownloadingTemplate: false,
  isDownloadingErrorReport: false,
  
  // Error handling
  error: null,
  
  // Real-time progress logs
  progressLogs: [],
};

// Slice
const bulkUploadSlice = createSlice({
  name: "bulkUpload",
  initialState,
  reducers: {
    // Modal controls
    openModal: (state) => {
      state.isModalOpen = true;
      state.error = null;
      state.validationResults = null;
      state.progressLogs = [];
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.currentBatch = null;
      state.uploadProgress = 0;
      state.validationResults = null;
      state.progressLogs = [];
    },
    openHistoryModal: (state) => {
      state.isHistoryModalOpen = true;
    },
    closeHistoryModal: (state) => {
      state.isHistoryModalOpen = false;
    },
    
    // Progress updates (WebSocket)
    updateProgress: (state, action) => {
      state.uploadProgress = action.payload.progress;
      if (action.payload.log) {
        state.progressLogs.push({
          timestamp: new Date().toISOString(),
          message: action.payload.log,
          type: action.payload.type || "info",
        });
      }
    },
    
    // Batch updates (WebSocket)
    updateBatchStatus: (state, action) => {
      state.currentBatch = {
        ...state.currentBatch,
        ...action.payload,
      };
    },
    
    // Validation results (WebSocket)
    setValidationResults: (state, action) => {
      state.validationResults = action.payload;
    },
    
    // Reset state
    resetUploadState: (state) => {
      state.isUploading = false;
      state.uploadProgress = 0;
      state.currentBatch = null;
      state.validationResults = null;
      state.progressLogs = [];
      state.error = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Download Template
    builder
      .addCase(downloadTemplate.pending, (state) => {
        state.isDownloadingTemplate = true;
        state.error = null;
      })
      .addCase(downloadTemplate.fulfilled, (state) => {
        state.isDownloadingTemplate = false;
      })
      .addCase(downloadTemplate.rejected, (state, action) => {
        state.isDownloadingTemplate = false;
        state.error = action.payload;
      });

    // Upload File
    builder
      .addCase(uploadTransporterBulk.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
        state.validationResults = null;
        state.progressLogs = [
          {
            timestamp: new Date().toISOString(),
            message: "Upload started...",
            type: "info",
          },
        ];
      })
      .addCase(uploadTransporterBulk.fulfilled, (state, action) => {
        state.isUploading = false;
        state.currentBatch = action.payload.batch;
        state.progressLogs.push({
          timestamp: new Date().toISOString(),
          message: "File uploaded successfully. Processing...",
          type: "success",
        });
      })
      .addCase(uploadTransporterBulk.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
        state.progressLogs.push({
          timestamp: new Date().toISOString(),
          message: `Upload failed: ${action.payload?.message || "Unknown error"}`,
          type: "error",
        });
      });

    // Fetch Batch Status
    builder
      .addCase(fetchBatchStatus.pending, (state) => {
        state.isFetchingStatus = true;
      })
      .addCase(fetchBatchStatus.fulfilled, (state, action) => {
        state.isFetchingStatus = false;
        state.currentBatch = action.payload.batch;
        state.validationResults = action.payload.validationResults;
      })
      .addCase(fetchBatchStatus.rejected, (state, action) => {
        state.isFetchingStatus = false;
        state.error = action.payload;
      });

    // Fetch Upload History
    builder
      .addCase(fetchUploadHistory.pending, (state) => {
        state.isFetchingHistory = true;
        state.error = null;
      })
      .addCase(fetchUploadHistory.fulfilled, (state, action) => {
        state.isFetchingHistory = false;
        state.uploadHistory = action.payload.batches;
        state.historyPagination = action.payload.pagination;
      })
      .addCase(fetchUploadHistory.rejected, (state, action) => {
        state.isFetchingHistory = false;
        state.error = action.payload;
      });

    // Download Error Report
    builder
      .addCase(downloadErrorReport.pending, (state) => {
        state.isDownloadingErrorReport = true;
        state.error = null;
      })
      .addCase(downloadErrorReport.fulfilled, (state) => {
        state.isDownloadingErrorReport = false;
      })
      .addCase(downloadErrorReport.rejected, (state, action) => {
        state.isDownloadingErrorReport = false;
        state.error = action.payload;
      });
  },
});

export const {
  openModal,
  closeModal,
  openHistoryModal,
  closeHistoryModal,
  updateProgress,
  updateBatchStatus,
  setValidationResults,
  resetUploadState,
  clearError,
} = bulkUploadSlice.actions;

export default bulkUploadSlice.reducer;
