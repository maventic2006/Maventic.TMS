import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { API_ENDPOINTS } from "../../utils/constants";
import draftService from "../../utils/draftService";

// Async thunks
export const createTransporter = createAsyncThunk(
  "transporter/createTransporter",
  async (transporterData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.TRANSPORTER.CREATE,
        transporterData
      );

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to create transporter"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to create transporter",
        }
      );
    }
  }
);

export const updateTransporter = createAsyncThunk(
  "transporter/updateTransporter",
  async ({ transporterId, transporterData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.TRANSPORTER.UPDATE}/${transporterId}`,
        transporterData
      );

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to update transporter"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to update transporter",
        }
      );
    }
  }
);

export const fetchMasterData = createAsyncThunk(
  "transporter/fetchMasterData",
  async (_, { rejectWithValue }) => {
    // Temporarily disable API call and return mock data for development
    console.log("🔄 Using mock master data (auth disabled for development)");

    // Simulate API delay for realistic behavior
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      countries: [
        { code: "IN", name: "India" },
        { code: "US", name: "United States" },
        { code: "UK", name: "United Kingdom" },
        { code: "CA", name: "Canada" },
        { code: "AU", name: "Australia" },
        { code: "DE", name: "Germany" },
        { code: "FR", name: "France" },
        { code: "JP", name: "Japan" },
      ],
      addressTypes: [
        { value: "AT001", label: "Billing Address" },
        { value: "AT002", label: "Shipping Address" },
        { value: "AT003", label: "Contact Person Address" },
        { value: "AT004", label: "Temporary Address" },
        { value: "AT005", label: "Permanent Address" },
      ],
      documentNames: [
        { value: "DN001", label: "PAN/TIN" },
        { value: "DN002", label: "Aadhar Card" },
        { value: "DN003", label: "TAN" },
        { value: "DN004", label: "GSTIN Document" },
        { value: "DN005", label: "VAT Certificate" },
        { value: "DN006", label: "Any License" },
        { value: "DN007", label: "Any Agreement Document" },
        { value: "DN008", label: "Contact Person ID Proof" },
        { value: "DN009", label: "NDA" },
      ],
    };

    /* 
    // Original API call - temporarily disabled
    try {
      const response = await api.get(API_ENDPOINTS.TRANSPORTER.MASTER_DATA);

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to fetch master data"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch master data",
        }
      );
    }
    */
  }
);

export const fetchStates = createAsyncThunk(
  "transporter/fetchStates",
  async (countryCode, { rejectWithValue }) => {
    // Temporarily disable API call and return mock data for development
    console.log(
      `🔄 Using mock states data for ${countryCode} (auth disabled for development)`
    );

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockStatesByCountry = {
      IN: [
        { code: "MH", name: "Maharashtra" },
        { code: "KA", name: "Karnataka" },
        { code: "TN", name: "Tamil Nadu" },
        { code: "DL", name: "Delhi" },
        { code: "GJ", name: "Gujarat" },
        { code: "RJ", name: "Rajasthan" },
        { code: "UP", name: "Uttar Pradesh" },
        { code: "WB", name: "West Bengal" },
      ],
      US: [
        { code: "CA", name: "California" },
        { code: "NY", name: "New York" },
        { code: "TX", name: "Texas" },
        { code: "FL", name: "Florida" },
        { code: "IL", name: "Illinois" },
      ],
      CA: [
        { code: "ON", name: "Ontario" },
        { code: "QC", name: "Quebec" },
        { code: "BC", name: "British Columbia" },
        { code: "AB", name: "Alberta" },
      ],
    };

    const states = mockStatesByCountry[countryCode] || [
      { code: "ST1", name: "State 1" },
      { code: "ST2", name: "State 2" },
    ];

    return { countryCode, states };

    /* 
    // Original API call - temporarily disabled
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TRANSPORTER.STATES}/${countryCode}`
      );

      if (response.data.success) {
        return { countryCode, states: response.data.data };
      } else {
        return rejectWithValue(response.data.error || "Failed to fetch states");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch states",
        }
      );
    }
    */
  }
);

export const fetchCities = createAsyncThunk(
  "transporter/fetchCities",
  async ({ countryCode, stateCode }, { rejectWithValue }) => {
    // Temporarily disable API call and return mock data for development
    console.log(
      `🔄 Using mock cities data for ${countryCode}/${stateCode} (auth disabled for development)`
    );

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const mockCitiesByState = {
      IN_MH: [
        { code: "MUM", name: "Mumbai" },
        { code: "PUN", name: "Pune" },
        { code: "NAG", name: "Nagpur" },
        { code: "NAS", name: "Nashik" },
        { code: "AUR", name: "Aurangabad" },
      ],
      IN_KA: [
        { code: "BLR", name: "Bangalore" },
        { code: "MYS", name: "Mysore" },
        { code: "MAN", name: "Mangalore" },
        { code: "HUB", name: "Hubli" },
      ],
      US_CA: [
        { code: "LA", name: "Los Angeles" },
        { code: "SF", name: "San Francisco" },
        { code: "SD", name: "San Diego" },
        { code: "SAC", name: "Sacramento" },
      ],
    };

    const key = `${countryCode}_${stateCode}`;
    const cities = mockCitiesByState[key] || [
      { code: "CT1", name: "City 1" },
      { code: "CT2", name: "City 2" },
      { code: "CT3", name: "City 3" },
    ];

    return { countryCode, stateCode, cities };

    /* 
    // Original API call - temporarily disabled
    try {
      const response = await api.get(
        `${API_ENDPOINTS.TRANSPORTER.CITIES}/${countryCode}/${stateCode}`
      );

      if (response.data.success) {
        return { countryCode, stateCode, cities: response.data.data };
      } else {
        return rejectWithValue(response.data.error || "Failed to fetch cities");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch cities",
        }
      );
    }
    */
  }
);

// Fetch all transporters with pagination and filters
export const fetchTransporters = createAsyncThunk(
  "transporter/fetchTransporters",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/transporter", { params });

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to fetch transporters"
        );
      }
    } catch (error) {
      console.error("API Error fetching transporters:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch transporters",
        }
      );
    }
  }
);

// Fetch single transporter by ID
export const fetchTransporterById = createAsyncThunk(
  "transporter/fetchTransporterById",
  async (transporterId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transporter/${transporterId}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to fetch transporter details"
        );
      }
    } catch (error) {
      console.error("API Error fetching transporter details:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch transporter details",
        }
      );
    }
  }
);

// ============================================
// DRAFT MANAGEMENT ASYNC THUNKS
// ============================================

/**
 * Save transporter as draft
 * Creates a new draft record with minimal validation
 */
export const saveTransporterAsDraft = createAsyncThunk(
  "transporter/saveAsDraft",
  async (transporterData, { rejectWithValue }) => {
    try {
      const result = await draftService.saveDraft(
        "transporter",
        transporterData
      );

      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      console.error("Error saving transporter draft:", error);
      return rejectWithValue({
        code: "DRAFT_SAVE_ERROR",
        message: error.message || "Failed to save draft",
      });
    }
  }
);

/**
 * Update existing transporter draft
 * Only allows updating drafts created by current user
 */
export const updateTransporterDraft = createAsyncThunk(
  "transporter/updateDraft",
  async ({ transporterId, transporterData }, { rejectWithValue }) => {
    try {
      const result = await draftService.updateDraft(
        "transporter",
        transporterId,
        transporterData
      );

      if (result.success) {
        return result.data;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      console.error("Error updating transporter draft:", error);
      return rejectWithValue({
        code: "DRAFT_UPDATE_ERROR",
        message: error.message || "Failed to update draft",
      });
    }
  }
);

/**
 * Delete transporter draft
 * Only allows deleting drafts created by current user
 */
export const deleteTransporterDraft = createAsyncThunk(
  "transporter/deleteDraft",
  async (transporterId, { rejectWithValue }) => {
    try {
      const result = await draftService.deleteDraft(
        "transporter",
        transporterId
      );

      if (result.success) {
        return { transporterId };
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      console.error("Error deleting transporter draft:", error);
      return rejectWithValue({
        code: "DRAFT_DELETE_ERROR",
        message: error.message || "Failed to delete draft",
      });
    }
  }
);

/**
 * Submit transporter from draft to PENDING status
 * Performs full validation and changes status from SAVE_AS_DRAFT to PENDING
 * Only allows submitting drafts created by current user
 */
export const submitTransporterFromDraft = createAsyncThunk(
  "transporter/submitFromDraft",
  async ({ transporterId, transporterData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/transporter/${transporterId}/submit-draft`,
        transporterData
      );

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.error);
      }
    } catch (error) {
      console.error("Error submitting draft for approval:", error);
      return rejectWithValue(
        error.response?.data?.error || {
          code: "SUBMIT_DRAFT_ERROR",
          message: error.message || "Failed to submit draft for approval",
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
  },
  statesByCountry: {},
  citiesByCountryState: {},

  // Transporter data
  transporters: [],
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    pages: 0,
  },
  selectedTransporter: null,

  // UI state
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isFetching: false,
  isFetchingDetails: false,
  error: null,

  // Draft state
  isSavingDraft: false,
  isUpdatingDraft: false,
  isDeletingDraft: false,
  isSubmittingDraft: false,
  draftError: null,
  lastDraftAction: null, // 'saved', 'updated', 'deleted', 'submitted'

  // Success state
  lastCreatedTransporter: null,
};

const transporterSlice = createSlice({
  name: "transporter",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastCreated: (state) => {
      state.lastCreatedTransporter = null;
    },
    resetTransporterState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Transporter
      .addCase(createTransporter.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createTransporter.fulfilled, (state, action) => {
        state.isCreating = false;
        state.lastCreatedTransporter = action.payload.data;
        state.error = null;
      })
      .addCase(createTransporter.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      // Update Transporter
      .addCase(updateTransporter.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateTransporter.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.error = null;

        // Update the selected transporter in state if it's currently loaded
        if (
          state.selectedTransporter &&
          state.selectedTransporter.transporterId ===
            action.payload.data.transporterId
        ) {
          // Refresh will be done by re-fetching the transporter
        }
      })
      .addCase(updateTransporter.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Fetch Master Data
      .addCase(fetchMasterData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.masterData = action.payload;
        state.error = null;
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;

        // Provide mock data for development when API fails
        console.warn("API failed, using mock master data for development");
        state.masterData = {
          countries: [
            { code: "IN", name: "India" },
            { code: "US", name: "United States" },
            { code: "UK", name: "United Kingdom" },
            { code: "CA", name: "Canada" },
            { code: "AU", name: "Australia" },
          ],
          addressTypes: [
            { value: "AT001", label: "Billing Address" },
            { value: "AT002", label: "Shipping Address" },
            { value: "AT003", label: "Contact Person Address" },
            { value: "AT004", label: "Temporary Address" },
            { value: "AT005", label: "Permanent Address" },
          ],
          documentNames: [
            { value: "DN001", label: "PAN/TIN" },
            { value: "DN002", label: "Aadhar Card" },
            { value: "DN003", label: "TAN" },
            { value: "DN004", label: "GSTIN Document" },
            { value: "DN005", label: "VAT Certificate" },
            { value: "DN006", label: "Any License" },
            { value: "DN007", label: "Any Agreement Document" },
            { value: "DN008", label: "Contact Person ID Proof" },
          ],
        };
      })

      // Fetch States
      .addCase(fetchStates.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.isLoading = false;
        const { countryCode, states } = action.payload;
        state.statesByCountry[countryCode] = states;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;

        // Provide mock states data for development when API fails
        console.warn("States API failed, using mock data for development");
        const countryCode = action.meta?.arg?.countryCode || "IN";
        state.statesByCountry[countryCode] = [
          { code: "MH", name: "Maharashtra" },
          { code: "KA", name: "Karnataka" },
          { code: "TN", name: "Tamil Nadu" },
          { code: "DL", name: "Delhi" },
          { code: "GJ", name: "Gujarat" },
        ];
      })

      // Fetch Cities
      .addCase(fetchCities.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.isLoading = false;
        const { countryCode, stateCode, cities } = action.payload;
        const key = `${countryCode}_${stateCode}`;
        state.citiesByCountryState[key] = cities;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;

        // Provide mock cities data for development when API fails
        console.warn("Cities API failed, using mock data for development");
        const { countryCode = "IN", stateCode = "MH" } = action.meta?.arg || {};
        const key = `${countryCode}_${stateCode}`;
        state.citiesByCountryState[key] = [
          { code: "MUM", name: "Mumbai" },
          { code: "PUN", name: "Pune" },
          { code: "NAG", name: "Nagpur" },
          { code: "NAS", name: "Nashik" },
          { code: "AUR", name: "Aurangabad" },
        ];
      })

      // Fetch Transporters
      .addCase(fetchTransporters.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchTransporters.fulfilled, (state, action) => {
        state.isFetching = false;
        state.transporters = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchTransporters.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload;
      })

      // Fetch Transporter By ID
      .addCase(fetchTransporterById.pending, (state) => {
        state.isFetchingDetails = true;
        state.error = null;
      })
      .addCase(fetchTransporterById.fulfilled, (state, action) => {
        state.isFetchingDetails = false;
        state.selectedTransporter = action.payload;
        state.error = null;
      })
      .addCase(fetchTransporterById.rejected, (state, action) => {
        state.isFetchingDetails = false;
        state.error = action.payload;
      })

      // ============================================
      // DRAFT ASYNC THUNK REDUCERS
      // ============================================

      // Save Draft
      .addCase(saveTransporterAsDraft.pending, (state) => {
        state.isSavingDraft = true;
        state.draftError = null;
        state.lastDraftAction = null;
      })
      .addCase(saveTransporterAsDraft.fulfilled, (state, action) => {
        state.isSavingDraft = false;
        state.draftError = null;
        state.lastDraftAction = "saved";
        state.lastCreatedTransporter = action.payload;
      })
      .addCase(saveTransporterAsDraft.rejected, (state, action) => {
        state.isSavingDraft = false;
        state.draftError = action.payload;
        state.lastDraftAction = null;
      })

      // Update Draft
      .addCase(updateTransporterDraft.pending, (state) => {
        state.isUpdatingDraft = true;
        state.draftError = null;
        state.lastDraftAction = null;
      })
      .addCase(updateTransporterDraft.fulfilled, (state, action) => {
        state.isUpdatingDraft = false;
        state.draftError = null;
        state.lastDraftAction = "updated";
      })
      .addCase(updateTransporterDraft.rejected, (state, action) => {
        state.isUpdatingDraft = false;
        state.draftError = action.payload;
        state.lastDraftAction = null;
      })

      // Delete Draft
      .addCase(deleteTransporterDraft.pending, (state) => {
        state.isDeletingDraft = true;
        state.draftError = null;
        state.lastDraftAction = null;
      })
      .addCase(deleteTransporterDraft.fulfilled, (state, action) => {
        state.isDeletingDraft = false;
        state.draftError = null;
        state.lastDraftAction = "deleted";
        // Remove deleted draft from transporters list
        state.transporters = state.transporters.filter(
          (t) => t.transporter_id !== action.payload.transporterId
        );
      })
      .addCase(deleteTransporterDraft.rejected, (state, action) => {
        state.isDeletingDraft = false;
        state.draftError = action.payload;
        state.lastDraftAction = null;
      })

      // Submit Draft for Approval
      .addCase(submitTransporterFromDraft.pending, (state) => {
        state.isSubmittingDraft = true;
        state.draftError = null;
        state.error = null;
        state.lastDraftAction = null;
      })
      .addCase(submitTransporterFromDraft.fulfilled, (state, action) => {
        state.isSubmittingDraft = false;
        state.draftError = null;
        state.error = null;
        state.lastDraftAction = "submitted";
        // Update the transporter status in the list if present
        const transporterIndex = state.transporters.findIndex(
          (t) => t.transporter_id === action.payload.data.transporterId
        );
        if (transporterIndex !== -1) {
          state.transporters[transporterIndex].status = "PENDING";
        }
        // Update selected transporter if it's the same one
        if (
          state.selectedTransporter &&
          state.selectedTransporter.transporterId ===
            action.payload.data.transporterId
        ) {
          state.selectedTransporter.generalDetails.status = "PENDING";
        }
      })
      .addCase(submitTransporterFromDraft.rejected, (state, action) => {
        state.isSubmittingDraft = false;
        state.draftError = action.payload;
        state.error = action.payload;
        state.lastDraftAction = null;
      });
  },
});

export const { clearError, clearLastCreated, resetTransporterState } =
  transporterSlice.actions;

export default transporterSlice.reducer;
