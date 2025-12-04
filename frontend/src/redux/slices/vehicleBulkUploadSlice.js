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

/**
 * Fetch detailed error information for a batch
 */
export const fetchVehicleBatchErrors = createAsyncThunk(
  "vehicleBulkUpload/fetchBatchErrors",
  async ({ batchId, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/vehicle/bulk-upload/errors/${batchId}?page=${page}&limit=${limit}`
      );

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to fetch error details"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "FETCH_ERROR",
          message: "Failed to fetch error details",
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
  
  // Error details state
  errorDetails: [],
  errorPagination: {
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  },
  errorSummary: null,
  
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
  isErrorDetailsOpen: false,
  
  // Loading states
  isFetchingHistory: false,
  isFetchingStatus: false,
  isFetchingErrors: false,
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
    
    /**
     * Open error details modal
     */
    openVehicleErrorDetailsModal: (state) => {
      state.isErrorDetailsOpen = true;
    },
    
    /**
     * Close error details modal
     */
    closeVehicleErrorDetailsModal: (state) => {
      state.isErrorDetailsOpen = false;
      state.errorDetails = [];
      state.errorPagination = {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0,
      };
      state.errorSummary = null;
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
      // Reset error details state
      state.errorDetails = [];
      state.errorPagination = {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0,
      };
      state.errorSummary = null;
      state.isErrorDetailsOpen = false;
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
        // Keep isUploading = true because processing is still happening
        // isUploading will be set to false when batch completes or fails
        state.currentBatch = action.payload;
        state.uploadProgress = 10; // Small progress to show upload completed
        state.progressLogs.push({
          timestamp: new Date().toISOString(),
          message: "File uploaded successfully. Starting background processing...",
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
        const batchData = action.payload.batch;
        const statusCounts = action.payload.statusCounts;
        
        // Update current batch
        state.currentBatch = batchData;
        state.validationResults = statusCounts;
        
        // Update upload state based on batch status
        if (batchData.status === 'processing') {
          state.isUploading = true;
          // Estimate progress based on processed rows
          if (batchData.total_rows > 0 && batchData.processed_rows > 0) {
            state.uploadProgress = Math.min(95, Math.round((batchData.processed_rows / batchData.total_rows) * 100));
          }
          
          // Add progress log for processing status
          if (batchData.processed_rows > 0) {
            const lastLog = state.progressLogs[state.progressLogs.length - 1];
            const progressMessage = `Processing: ${batchData.processed_rows}/${batchData.total_rows} rows completed`;
            
            // Only add if this is a different message than the last one
            if (!lastLog || lastLog.message !== progressMessage) {
              state.progressLogs.push({
                timestamp: new Date().toISOString(),
                message: progressMessage,
                type: "info",
              });
            }
          }
        } else if (batchData.status === 'completed') {
          state.isUploading = false;
          state.uploadProgress = 100;
          
          // Add completion log if not already added
          const lastLog = state.progressLogs[state.progressLogs.length - 1];
          const completionMessage = `Batch completed: ${batchData.success_count} created, ${batchData.error_count} failed`;
          
          if (!lastLog || !lastLog.message.includes('completed')) {
            state.progressLogs.push({
              timestamp: new Date().toISOString(),
              message: completionMessage,
              type: batchData.success_count > 0 && batchData.error_count === 0 ? "success" : "warning",
            });
          }
        } else if (batchData.status === 'failed') {
          state.isUploading = false;
          state.error = {
            code: "BATCH_FAILED",
            message: batchData.processing_notes || "Batch processing failed",
          };
          
          state.progressLogs.push({
            timestamp: new Date().toISOString(),
            message: `Batch failed: ${batchData.processing_notes || "Unknown error"}`,
            type: "error",
          });
        }
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

    // ========================================================================
    // FETCH BATCH ERRORS
    // ========================================================================
    builder
      .addCase(fetchVehicleBatchErrors.pending, (state) => {
        state.isFetchingErrors = true;
        state.error = null;
      })
      .addCase(fetchVehicleBatchErrors.fulfilled, (state, action) => {
        state.isFetchingErrors = false;
        state.errorDetails = action.payload.errors;
        state.errorPagination = action.payload.pagination;
        state.errorSummary = action.payload.summary;
      })
      .addCase(fetchVehicleBatchErrors.rejected, (state, action) => {
        state.isFetchingErrors = false;
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
  openVehicleErrorDetailsModal,
  closeVehicleErrorDetailsModal,
  updateVehicleProgress,
  updateVehicleBatchStatus,
  handleVehicleBatchComplete,
  handleVehicleBatchError,
  setVehicleValidationResults,
  resetVehicleUploadState,
  clearVehicleError,
} = vehicleBulkUploadSlice.actions;

export default vehicleBulkUploadSlice.reducer;
