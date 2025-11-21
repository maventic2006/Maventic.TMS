import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/**
 * Vehicle Bulk Upload Redux Slice
 * Manages state for vehicle bulk upload functionality
 */

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Download vehicle bulk upload Excel template
 */
export const downloadVehicleTemplate = createAsyncThunk(
  "vehicleBulkUpload/downloadTemplate",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/vehicle/bulk-upload/template", {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Vehicle_Bulk_Upload_Template.xlsx");
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

/**
 * Upload vehicle bulk upload file
 * Optimized: Backend returns immediately after queuing job
 * Timeout extended but should complete in < 2 seconds now
 */
export const uploadVehicleBulk = createAsyncThunk(
  "vehicleBulkUpload/uploadFile",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log('📤 Uploading vehicle file:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
      const uploadStart = Date.now();

      const response = await api.post("/vehicle/bulk-upload/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 10000, // 10 seconds - should complete in < 2s with optimization
      });

      const uploadTime = Date.now() - uploadStart;
      console.log(`✅ Upload completed in ${uploadTime}ms`);

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to upload file"
        );
      }
    } catch (error) {
      console.error('❌ Upload failed:', error.message);
      
      // Check if it's a Redis connection error
      if (error.response?.status === 503 && error.response?.data?.message?.includes('Redis')) {
        console.error('');
        console.error('🔴 REDIS NOT RUNNING!');
        console.error('   The bulk upload feature requires Redis to be installed and running.');
        console.error('   Solution: Install Memurai from https://www.memurai.com/get-memurai');
        console.error('');
        
        return rejectWithValue({
          code: "REDIS_NOT_RUNNING",
          message: "Redis is not running. Please install and start Redis/Memurai to use bulk upload.",
          solution: error.response?.data?.solution || "Install Memurai from https://www.memurai.com/get-memurai",
          quickFix: error.response?.data?.quickFix
        });
      }
      
      return rejectWithValue(
        error.response?.data?.error || {
          code: "UPLOAD_ERROR",
          message: error.message || "Failed to upload file",
        }
      );
    }
  }
);

/**
 * Fetch vehicle batch status
 */
export const fetchVehicleBatchStatus = createAsyncThunk(
  "vehicleBulkUpload/fetchBatchStatus",
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/vehicle/bulk-upload/status/${batchId}`);

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

/**
 * Fetch vehicle upload history
 */
export const fetchVehicleUploadHistory = createAsyncThunk(
  "vehicleBulkUpload/fetchHistory",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/vehicle/bulk-upload/history?page=${page}&limit=${limit}`
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

/**
 * Download vehicle error report
 */
export const downloadVehicleErrorReport = createAsyncThunk(
  "vehicleBulkUpload/downloadErrorReport",
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/vehicle/bulk-upload/error-report/${batchId}`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Vehicle_Error_Report_${batchId}.xlsx`);
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

// ============================================================================
// INITIAL STATE
// ============================================================================

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

// ============================================================================
// SLICE
// ============================================================================

const vehicleBulkUploadSlice = createSlice({
  name: "vehicleBulkUpload",
  initialState,
  reducers: {
    // ========================================================================
    // MODAL CONTROLS
    // ========================================================================
    
    /**
     * Open bulk upload modal
     */
    openVehicleBulkUploadModal: (state) => {
      state.isModalOpen = true;
      state.error = null;
      state.validationResults = null;
      state.progressLogs = [];
    },
    
    /**
     * Close bulk upload modal
     */
    closeVehicleBulkUploadModal: (state) => {
      state.isModalOpen = false;
      state.currentBatch = null;
      state.uploadProgress = 0;
      state.validationResults = null;
      state.progressLogs = [];
    },
    
    /**
     * Open history modal
     */
    openVehicleHistoryModal: (state) => {
      state.isHistoryModalOpen = true;
    },
    
    /**
     * Close history modal
     */
    closeVehicleHistoryModal: (state) => {
      state.isHistoryModalOpen = false;
    },
    
    // ========================================================================
    // PROGRESS UPDATES (WebSocket)
    // ========================================================================
    
    /**
     * Update upload progress
     */
    updateVehicleProgress: (state, action) => {
      const { progress, message, type } = action.payload;
      
      // Update progress percentage
      if (progress !== undefined) {
        state.uploadProgress = progress;
      }
      
      // Add progress log if message provided
      if (message) {
        state.progressLogs.push({
          timestamp: new Date().toISOString(),
          message: message,
          type: type || "info",
        });
        
        // Keep only last 50 logs to prevent memory issues
        if (state.progressLogs.length > 50) {
          state.progressLogs = state.progressLogs.slice(-50);
        }
      }
    },
    
    /**
     * Update batch status from Socket.IO event
     */
    updateVehicleBatchStatus: (state, action) => {
      state.currentBatch = {
        ...state.currentBatch,
        ...action.payload,
      };
      
      // Update validation results if provided
      if (action.payload.total_valid !== undefined || action.payload.total_invalid !== undefined) {
        state.validationResults = {
          valid: action.payload.total_valid || 0,
          invalid: action.payload.total_invalid || 0,
        };
      }
    },
    
    /**
     * Handle batch completion from Socket.IO
     */
    handleVehicleBatchComplete: (state, action) => {
      const { validCount, invalidCount, createdCount, failedCount, errorReportPath } = action.payload;
      
      state.isUploading = false;
      state.uploadProgress = 100;
      
      state.validationResults = {
        valid: validCount || 0,
        invalid: invalidCount || 0,
      };
      
      if (state.currentBatch) {
        state.currentBatch.status = 'completed';
        state.currentBatch.total_valid = validCount || 0;
        state.currentBatch.total_invalid = invalidCount || 0;
        state.currentBatch.total_created = createdCount || 0;
        state.currentBatch.total_creation_failed = failedCount || 0;
        state.currentBatch.error_report_path = errorReportPath || null;
      }
      
      // Add completion log
      state.progressLogs.push({
        timestamp: new Date().toISOString(),
        message: `Batch complete: ${createdCount} created, ${failedCount} failed, ${invalidCount} invalid`,
        type: createdCount > 0 && invalidCount === 0 ? "success" : invalidCount > 0 ? "warning" : "error",
      });
    },
    
    /**
     * Handle batch error from Socket.IO
     */
    handleVehicleBatchError: (state, action) => {
      state.isUploading = false;
      state.error = {
        code: "BATCH_ERROR",
        message: action.payload.message || "Batch processing failed",
      };
      
      if (state.currentBatch) {
        state.currentBatch.status = 'failed';
      }
      
      state.progressLogs.push({
        timestamp: new Date().toISOString(),
        message: `Error: ${action.payload.message || "Unknown error"}`,
        type: "error",
      });
    },
    
    /**
     * Set validation results
     */
    setVehicleValidationResults: (state, action) => {
      state.validationResults = action.payload;
    },
    
    // ========================================================================
    // STATE MANAGEMENT
    // ========================================================================
    
    /**
     * Reset upload state
     */
    resetVehicleUploadState: (state) => {
      state.isUploading = false;
      state.uploadProgress = 0;
      state.currentBatch = null;
      state.validationResults = null;
      state.progressLogs = [];
      state.error = null;
    },
    
    /**
     * Clear error
     */
    clearVehicleError: (state) => {
      state.error = null;
    },
  },
  
  // ==========================================================================
  // EXTRA REDUCERS (Async Thunks)
  // ==========================================================================
  
  extraReducers: (builder) => {
    // ========================================================================
    // DOWNLOAD TEMPLATE
    // ========================================================================
    builder
      .addCase(downloadVehicleTemplate.pending, (state) => {
        state.isDownloadingTemplate = true;
        state.error = null;
      })
      .addCase(downloadVehicleTemplate.fulfilled, (state) => {
        state.isDownloadingTemplate = false;
      })
      .addCase(downloadVehicleTemplate.rejected, (state, action) => {
        state.isDownloadingTemplate = false;
        state.error = action.payload;
      });

    // ========================================================================
    // UPLOAD FILE
    // ========================================================================
    builder
      .addCase(uploadVehicleBulk.pending, (state) => {
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
      .addCase(uploadVehicleBulk.fulfilled, (state, action) => {
        state.isUploading = false;
        state.currentBatch = action.payload.batch;
        state.progressLogs.push({
          timestamp: new Date().toISOString(),
          message: "File uploaded successfully. Processing...",
          type: "success",
        });
      })
      .addCase(uploadVehicleBulk.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
        state.progressLogs.push({
          timestamp: new Date().toISOString(),
          message: `Upload failed: ${action.payload?.message || "Unknown error"}`,
          type: "error",
        });
      });

    // ========================================================================
    // FETCH BATCH STATUS
    // ========================================================================
    builder
      .addCase(fetchVehicleBatchStatus.pending, (state) => {
        state.isFetchingStatus = true;
      })
      .addCase(fetchVehicleBatchStatus.fulfilled, (state, action) => {
        state.isFetchingStatus = false;
        state.currentBatch = action.payload.batch;
        state.validationResults = action.payload.statusCounts;
      })
      .addCase(fetchVehicleBatchStatus.rejected, (state, action) => {
        state.isFetchingStatus = false;
        state.error = action.payload;
      });

    // ========================================================================
    // FETCH UPLOAD HISTORY
    // ========================================================================
    builder
      .addCase(fetchVehicleUploadHistory.pending, (state) => {
        state.isFetchingHistory = true;
        state.error = null;
      })
      .addCase(fetchVehicleUploadHistory.fulfilled, (state, action) => {
        state.isFetchingHistory = false;
        state.uploadHistory = action.payload.batches;
        state.historyPagination = action.payload.pagination;
      })
      .addCase(fetchVehicleUploadHistory.rejected, (state, action) => {
        state.isFetchingHistory = false;
        state.error = action.payload;
      });

    // ========================================================================
    // DOWNLOAD ERROR REPORT
    // ========================================================================
    builder
      .addCase(downloadVehicleErrorReport.pending, (state) => {
        state.isDownloadingErrorReport = true;
        state.error = null;
      })
      .addCase(downloadVehicleErrorReport.fulfilled, (state) => {
        state.isDownloadingErrorReport = false;
      })
      .addCase(downloadVehicleErrorReport.rejected, (state, action) => {
        state.isDownloadingErrorReport = false;
        state.error = action.payload;
      });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const {
  openVehicleBulkUploadModal,
  closeVehicleBulkUploadModal,
  openVehicleHistoryModal,
  closeVehicleHistoryModal,
  updateVehicleProgress,
  updateVehicleBatchStatus,
  handleVehicleBatchComplete,
  handleVehicleBatchError,
  setVehicleValidationResults,
  resetVehicleUploadState,
  clearVehicleError,
} = vehicleBulkUploadSlice.actions;

export default vehicleBulkUploadSlice.reducer;
