import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as consignorService from "../../services/consignorService";

// Async Thunks

// Fetch all consignors with filters and pagination
export const fetchConsignors = createAsyncThunk(
  "consignor/fetchConsignors",
  async ({ page = 1, limit = 25, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await consignorService.getConsignors(
        page,
        limit,
        filters
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch single consignor by ID
export const fetchConsignorById = createAsyncThunk(
  "consignor/fetchConsignorById",
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await consignorService.getConsignorById(customerId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create new consignor
export const createConsignor = createAsyncThunk(
  "consignor/createConsignor",
  async (consignorData, { rejectWithValue }) => {
    try {
      const response = await consignorService.createConsignor(consignorData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update existing consignor
export const updateConsignor = createAsyncThunk(
  "consignor/updateConsignor",
  async ({ customerId, data }, { rejectWithValue }) => {
    try {
      const response = await consignorService.updateConsignor(customerId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete consignor
export const deleteConsignor = createAsyncThunk(
  "consignor/deleteConsignor",
  async (customerId, { rejectWithValue }) => {
    try {
      await consignorService.deleteConsignor(customerId);
      return customerId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Upload document
export const uploadConsignorDocument = createAsyncThunk(
  "consignor/uploadDocument",
  async ({ customerId, formData, onProgress }, { rejectWithValue }) => {
    try {
      const response = await consignorService.uploadDocument(
        customerId,
        formData,
        onProgress
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch master data (industry types, currencies, payment terms, etc.)
export const fetchConsignorMasterData = createAsyncThunk(
  "consignor/fetchMasterData",
  async (_, { rejectWithValue }) => {
    try {
      console.log("🔄 Redux Thunk: Calling getMasterData service...");
      const response = await consignorService.getMasterData();
      console.log("✅ Redux Thunk: Service returned:", response);
      console.log("✅ Redux Thunk: documentTypes:", response.documentTypes);
      console.log(
        "✅ Redux Thunk: documentTypes length:",
        response.documentTypes?.length
      );
      return response;
    } catch (error) {
      console.error("❌ Redux Thunk: Error fetching master data:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Save consignor as draft
 * Creates a new draft record with minimal validation (business_name only)
 */
export const saveConsignorAsDraft = createAsyncThunk(
  "consignor/saveAsDraft",
  async ({ consignorData, files = {} }, { rejectWithValue }) => {
    try {
      console.log("📦 Saving consignor as draft:", consignorData);

      const response = await consignorService.saveConsignorAsDraft(
        consignorData,
        files
      );

      console.log("✅ Consignor draft saved successfully:", response);

      return {
        success: true,
        customerId: response.customerId,
        status: response.status,
        message: "Consignor saved as draft successfully",
      };
    } catch (error) {
      console.error("❌ Error saving consignor draft:", error);
      return rejectWithValue({
        code: error.error?.code || "DRAFT_SAVE_ERROR",
        message: error.error?.message || "Failed to save consignor as draft",
        errors: error.errors || [],
      });
    }
  }
);

/**
 * Update existing consignor draft
 * No validation, only allows updating drafts created by current user
 */
export const updateConsignorDraft = createAsyncThunk(
  "consignor/updateDraft",
  async ({ customerId, consignorData, files = {} }, { rejectWithValue }) => {
    try {
      console.log("📦 Updating consignor draft:", customerId, consignorData);

      const response = await consignorService.updateConsignorDraft(
        customerId,
        consignorData,
        files
      );

      console.log("✅ Consignor draft updated successfully:", response);

      return {
        success: true,
        customerId: response.customerId,
        status: response.status,
        message: "Consignor draft updated successfully",
      };
    } catch (error) {
      console.error("❌ Error updating consignor draft:", error);
      return rejectWithValue({
        code: error.error?.code || "DRAFT_UPDATE_ERROR",
        message: error.error?.message || "Failed to update consignor draft",
        errors: error.errors || [],
      });
    }
  }
);

/**
 * Submit consignor from draft to PENDING status
 * Performs full validation and changes status from DRAFT to PENDING
 */
export const submitConsignorFromDraft = createAsyncThunk(
  "consignor/submitFromDraft",
  async ({ customerId, consignorData, files = {} }, { rejectWithValue }) => {
    try {
      console.log(
        "📦 Submitting consignor draft for approval:",
        customerId,
        consignorData
      );

      const response = await consignorService.submitConsignorDraft(
        customerId,
        consignorData,
        files
      );

      console.log("✅ Consignor draft submitted successfully:", response);

      return {
        success: true,
        customerId: response.customerId,
        status: response.status,
        message: "Consignor submitted for approval successfully",
      };
    } catch (error) {
      console.error("❌ Error submitting consignor draft:", error);
      return rejectWithValue({
        code: error.error?.code || "DRAFT_SUBMIT_ERROR",
        message: error.error?.message || "Failed to submit consignor draft",
        field: error.error?.field || null,
        expectedFormat: error.error?.expectedFormat || null,
        errors: error.errors || [],
      });
    }
  }
);

/**
 * Delete consignor draft
 * Hard delete - only allows deleting drafts created by current user
 */
export const deleteConsignorDraft = createAsyncThunk(
  "consignor/deleteDraft",
  async (customerId, { rejectWithValue }) => {
    try {
      console.log("📦 Deleting consignor draft:", customerId);

      await consignorService.deleteConsignorDraft(customerId);

      console.log("✅ Consignor draft deleted successfully");

      return {
        success: true,
        customerId,
        message: "Consignor draft deleted successfully",
      };
    } catch (error) {
      console.error("❌ Error deleting consignor draft:", error);
      return rejectWithValue({
        code: error.error?.code || "DRAFT_DELETE_ERROR",
        message: error.error?.message || "Failed to delete consignor draft",
        errors: error.errors || [],
      });
    }
  }
);

// Initial State
const initialState = {
  consignors: [],
  currentConsignor: null,
  masterData: {
    industryTypes: [],
    currencyTypes: [],
    paymentTerms: [],
    documentTypes: [],
    countries: [],
  },
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    pages: 1,
  },
  filters: {
    customerId: "",
    customerName: "",
    industryType: "",
    status: "",
  },
  isFetching: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isUploadingDocument: false,
  isSavingDraft: false,
  isUpdatingDraft: false,
  isSubmittingDraft: false,
  isDeletingDraft: false,
  uploadProgress: 0,
  error: null,
  lastCreatedConsignor: null,
  lastUpdatedConsignor: null,
};

// Slice
const consignorSlice = createSlice({
  name: "consignor",
  initialState,
  reducers: {
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        customerId: "",
        customerName: "",
        industryType: "",
        status: "",
      };
    },

    // Set current consignor
    setCurrentConsignor: (state, action) => {
      state.currentConsignor = action.payload;
    },

    // Clear current consignor
    clearCurrentConsignor: (state) => {
      state.currentConsignor = null;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
    },

    // Reset last created consignor
    resetLastCreated: (state) => {
      state.lastCreatedConsignor = null;
    },

    // Reset last updated consignor
    resetLastUpdated: (state) => {
      state.lastUpdatedConsignor = null;
    },

    // Set upload progress
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },

    // Reset upload progress
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
  },

  extraReducers: (builder) => {
    // Fetch Consignors
    builder
      .addCase(fetchConsignors.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchConsignors.fulfilled, (state, action) => {
        state.isFetching = false;
        state.consignors = action.payload.data || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 25,
          total: action.payload.total || 0,
          pages: action.payload.totalPages || 1, // Backend returns 'totalPages', not 'pages'
        };
      })
      .addCase(fetchConsignors.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      });

    // Fetch Consignor By ID
    builder
      .addCase(fetchConsignorById.pending, (state) => {
        state.isFetching = true;
        state.error = null;
        state.currentConsignor = null;
      })
      .addCase(fetchConsignorById.fulfilled, (state, action) => {
        state.isFetching = false;

        console.log("🔍 ===== CONSIGNOR FETCH DEBUG =====");
        console.log("Raw API payload:", action.payload);

        // Flatten nested structure from backend
        // Backend returns: { general: {...}, contacts: [...], organization: {...}, documents: [...], userApprovalStatus: {...} }
        // Frontend expects: { ...general, contacts: [...], organization: {...}, documents: [...], userApprovalStatus: {...} }
        const {
          general,
          contacts,
          organization,
          documents,
          userApprovalStatus,
        } = action.payload;

        const flattenedData = {
          ...general, // Spread general fields to top level
          contacts, // Keep contacts array
          organization, // Keep organization object
          documents, // Keep documents array
          userApprovalStatus, // Keep user approval status for approval flow
        };

        console.log("Flattened data:", flattenedData);
        console.log(
          "userApprovalStatus included?",
          !!flattenedData.userApprovalStatus
        );
        console.log("✅ Data should now be accessible at top level");
        console.log("===================================");

        state.currentConsignor = flattenedData;
      })
      .addCase(fetchConsignorById.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      });

    // Create Consignor
    builder
      .addCase(createConsignor.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.lastCreatedConsignor = null;
      })
      .addCase(createConsignor.fulfilled, (state, action) => {
        state.isCreating = false;
        state.lastCreatedConsignor = action.payload;
        // Optionally add to list if on same page
        if (state.consignors.length < state.pagination.limit) {
          state.consignors.unshift(action.payload);
        }
        state.pagination.total += 1;
      })
      .addCase(createConsignor.rejected, (state, action) => {
        state.isCreating = false;
        // ✅ Don't set error state for validation errors (they'll be shown as toast)
        if (action.payload?.code !== "VALIDATION_ERROR") {
          state.error = action.payload;
        }
      });

    // Update Consignor
    builder
      .addCase(updateConsignor.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.lastUpdatedConsignor = null;
      })
      .addCase(updateConsignor.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.lastUpdatedConsignor = action.payload;
        state.currentConsignor = action.payload;

        // Update in list if exists
        const index = state.consignors.findIndex(
          (c) => c.customer_id === action.payload.customer_id
        );
        if (index !== -1) {
          state.consignors[index] = action.payload;
        }
      })
      .addCase(updateConsignor.rejected, (state, action) => {
        state.isUpdating = false;
        // ✅ Don't set error state for validation errors (they'll be shown as toast)
        if (action.payload?.code !== "VALIDATION_ERROR") {
          state.error = action.payload;
        }
      });

    // Delete Consignor
    builder
      .addCase(deleteConsignor.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteConsignor.fulfilled, (state, action) => {
        state.isDeleting = false;
        // Remove from list
        state.consignors = state.consignors.filter(
          (c) => c.customer_id !== action.payload
        );
        state.pagination.total -= 1;
      })
      .addCase(deleteConsignor.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      });

    // Upload Document
    builder
      .addCase(uploadConsignorDocument.pending, (state) => {
        state.isUploadingDocument = true;
        state.error = null;
      })
      .addCase(uploadConsignorDocument.fulfilled, (state, action) => {
        state.isUploadingDocument = false;
        state.uploadProgress = 0;
        // Add document to current consignor if exists
        if (state.currentConsignor) {
          if (!state.currentConsignor.documents) {
            state.currentConsignor.documents = [];
          }
          state.currentConsignor.documents.push(action.payload);
        }
      })
      .addCase(uploadConsignorDocument.rejected, (state, action) => {
        state.isUploadingDocument = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      });

    // Fetch Master Data
    builder
      .addCase(fetchConsignorMasterData.pending, (state) => {
        console.log("⏳ Redux Reducer: fetchConsignorMasterData PENDING");
        state.isFetching = true;
      })
      .addCase(fetchConsignorMasterData.fulfilled, (state, action) => {
        console.log("✅ Redux Reducer: fetchConsignorMasterData FULFILLED");
        console.log("✅ Redux Reducer: Payload received:", action.payload);
        console.log(
          "✅ Redux Reducer: documentTypes in payload:",
          action.payload?.documentTypes
        );
        state.isFetching = false;
        state.masterData = action.payload;
        console.log(
          "✅ Redux Reducer: State updated. masterData.documentTypes:",
          state.masterData.documentTypes
        );
      })
      .addCase(fetchConsignorMasterData.rejected, (state, action) => {
        console.error("❌ Redux Reducer: fetchConsignorMasterData REJECTED");
        console.error("❌ Redux Reducer: Error:", action.payload);
        state.isFetching = false;
        state.error = action.payload;
      })

      // Save consignor as draft
      .addCase(saveConsignorAsDraft.pending, (state) => {
        state.isSavingDraft = true;
        state.error = null;
      })
      .addCase(saveConsignorAsDraft.fulfilled, (state, action) => {
        state.isSavingDraft = false;
        state.lastCreatedConsignor = action.payload;
      })
      .addCase(saveConsignorAsDraft.rejected, (state, action) => {
        state.isSavingDraft = false;
        // ✅ Don't set error state for validation errors (they'll be shown as toast)
        if (action.payload?.code !== "VALIDATION_ERROR") {
          state.error = action.payload;
        }
      })

      // Update consignor draft
      .addCase(updateConsignorDraft.pending, (state) => {
        state.isUpdatingDraft = true;
        state.error = null;
      })
      .addCase(updateConsignorDraft.fulfilled, (state, action) => {
        state.isUpdatingDraft = false;
        state.lastUpdatedConsignor = action.payload;
      })
      .addCase(updateConsignorDraft.rejected, (state, action) => {
        state.isUpdatingDraft = false;
        // ✅ Don't set error state for validation errors (they'll be shown as toast)
        if (action.payload?.code !== "VALIDATION_ERROR") {
          state.error = action.payload;
        }
      })

      // Submit consignor draft
      .addCase(submitConsignorFromDraft.pending, (state) => {
        state.isSubmittingDraft = true;
        state.error = null;
      })
      .addCase(submitConsignorFromDraft.fulfilled, (state, action) => {
        state.isSubmittingDraft = false;
        state.lastUpdatedConsignor = action.payload;
      })
      .addCase(submitConsignorFromDraft.rejected, (state, action) => {
        state.isSubmittingDraft = false;
        // ✅ Don't set error state for validation errors (they'll be shown as toast)
        if (action.payload?.code !== "VALIDATION_ERROR") {
          state.error = action.payload;
        }
      })

      // Delete consignor draft
      .addCase(deleteConsignorDraft.pending, (state) => {
        state.isDeletingDraft = true;
        state.error = null;
      })
      .addCase(deleteConsignorDraft.fulfilled, (state, action) => {
        state.isDeletingDraft = false;
        // Remove draft from consignors list if present
        state.consignors = state.consignors.filter(
          (c) => c.customerId !== action.payload.customerId
        );
      })
      .addCase(deleteConsignorDraft.rejected, (state, action) => {
        state.isDeletingDraft = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setFilters,
  clearFilters,
  setCurrentConsignor,
  clearCurrentConsignor,
  clearError,
  resetLastCreated,
  resetLastUpdated,
  setUploadProgress,
  resetUploadProgress,
} = consignorSlice.actions;

// Export reducer
export default consignorSlice.reducer;
