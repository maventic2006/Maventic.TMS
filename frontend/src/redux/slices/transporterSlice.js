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
      mandatoryDocuments: [
        {
          value: "DN001",
          label: "PAN/TIN",
          is_mandatory: true,
          is_expiry_required: true,
          is_verification_required: true,
        },
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

// ============================================
// MAPPING MANAGEMENT ASYNC THUNKS
// ============================================

/**
 * Fetch mapping master data for dropdowns
 */
export const fetchMappingMasterData = createAsyncThunk(
  "transporter/fetchMappingMasterData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/transporter/mapping-master-data");

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.error || "Failed to fetch mapping master data"
        );
      }
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

// Consignor Mappings
export const fetchConsignorMappings = createAsyncThunk(
  "transporter/fetchConsignorMappings",
  async (transporterId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/transporter/${transporterId}/consignor-mappings`
      );
      return response.data.success
        ? response.data.data
        : rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "FETCH_ERROR",
          message: "Failed to fetch consignor mappings",
        }
      );
    }
  }
);

export const createConsignorMapping = createAsyncThunk(
  "transporter/createConsignorMapping",
  async ({ transporterId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/transporter/${transporterId}/consignor-mappings`,
        mappingData
      );
      return response.data.success
        ? response.data
        : rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "CREATE_ERROR",
          message: "Failed to create consignor mapping",
        }
      );
    }
  }
);

export const updateConsignorMapping = createAsyncThunk(
  "transporter/updateConsignorMapping",
  async ({ transporterId, mappingId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/transporter/${transporterId}/consignor-mappings/${mappingId}`,
        mappingData
      );
      return response.data.success
        ? response.data
        : rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "UPDATE_ERROR",
          message: "Failed to update consignor mapping",
        }
      );
    }
  }
);

export const deleteConsignorMapping = createAsyncThunk(
  "transporter/deleteConsignorMapping",
  async ({ transporterId, mappingId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/transporter/${transporterId}/consignor-mappings/${mappingId}`
      );
      return response.data.success
        ? { mappingId }
        : rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "DELETE_ERROR",
          message: "Failed to delete consignor mapping",
        }
      );
    }
  }
);

// Vehicle Mappings
export const fetchVehicleMappings = createAsyncThunk(
  "transporter/fetchVehicleMappings",
  async (transporterId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/transporter/${transporterId}/vehicle-mappings`
      );
      return response.data.success
        ? response.data.data
        : rejectWithValue(response.data.error);
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

export const createVehicleMapping = createAsyncThunk(
  "transporter/createVehicleMapping",
  async ({ transporterId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/transporter/${transporterId}/vehicle-mappings`,
        mappingData
      );
      return response.data.success
        ? response.data
        : rejectWithValue(response.data.error);
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

export const updateVehicleMapping = createAsyncThunk(
  "transporter/updateVehicleMapping",
  async ({ transporterId, mappingId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/transporter/${transporterId}/vehicle-mappings/${mappingId}`,
        mappingData
      );
      return response.data.success
        ? response.data
        : rejectWithValue(response.data.error);
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

export const deleteVehicleMapping = createAsyncThunk(
  "transporter/deleteVehicleMapping",
  async ({ transporterId, mappingId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/transporter/${transporterId}/vehicle-mappings/${mappingId}`
      );
      return response.data.success
        ? { mappingId }
        : rejectWithValue(response.data.error);
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

// Driver Mappings
export const fetchDriverMappings = createAsyncThunk(
  "transporter/fetchDriverMappings",
  async (transporterId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/transporter/${transporterId}/driver-mappings`
      );
      return response.data.success
        ? response.data.data
        : rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "FETCH_ERROR",
          message: "Failed to fetch driver mappings",
        }
      );
    }
  }
);

export const createDriverMapping = createAsyncThunk(
  "transporter/createDriverMapping",
  async ({ transporterId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/transporter/${transporterId}/driver-mappings`,
        mappingData
      );
      return response.data.success
        ? response.data
        : rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "CREATE_ERROR",
          message: "Failed to create driver mapping",
        }
      );
    }
  }
);

export const updateDriverMapping = createAsyncThunk(
  "transporter/updateDriverMapping",
  async ({ transporterId, mappingId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/transporter/${transporterId}/driver-mappings/${mappingId}`,
        mappingData
      );
      return response.data.success
        ? response.data
        : rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "UPDATE_ERROR",
          message: "Failed to update driver mapping",
        }
      );
    }
  }
);

export const deleteDriverMapping = createAsyncThunk(
  "transporter/deleteDriverMapping",
  async ({ transporterId, mappingId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/transporter/${transporterId}/driver-mappings/${mappingId}`
      );
      return response.data.success
        ? { mappingId }
        : rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "DELETE_ERROR",
          message: "Failed to delete driver mapping",
        }
      );
    }
  }
);

// Owner Mappings
export const fetchOwnerMappings = createAsyncThunk(
  "transporter/fetchOwnerMappings",
  async (transporterId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/transporter/${transporterId}/owner-mappings`
      );
      return response.data.success
        ? response.data.data
        : rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "FETCH_ERROR",
          message: "Failed to fetch owner mappings",
        }
      );
    }
  }
);

export const createOwnerMapping = createAsyncThunk(
  "transporter/createOwnerMapping",
  async ({ transporterId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/transporter/${transporterId}/owner-mappings`,
        mappingData
      );
      return response.data.success
        ? response.data
        : rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "CREATE_ERROR",
          message: "Failed to create owner mapping",
        }
      );
    }
  }
);

export const updateOwnerMapping = createAsyncThunk(
  "transporter/updateOwnerMapping",
  async ({ transporterId, mappingId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/transporter/${transporterId}/owner-mappings/${mappingId}`,
        mappingData
      );
      return response.data.success
        ? response.data
        : rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "UPDATE_ERROR",
          message: "Failed to update owner mapping",
        }
      );
    }
  }
);

export const deleteOwnerMapping = createAsyncThunk(
  "transporter/deleteOwnerMapping",
  async ({ transporterId, mappingId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/transporter/${transporterId}/owner-mappings/${mappingId}`
      );
      return response.data.success
        ? { mappingId }
        : rejectWithValue(response.data.error);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "DELETE_ERROR",
          message: "Failed to delete owner mapping",
        }
      );
    }
  }
);

// Blacklist Mappings
export const fetchBlacklistMappings = createAsyncThunk(
  "transporter/fetchBlacklistMappings",
  async (transporterId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/transporter/${transporterId}/blacklist-mappings`
      );
      return response.data.success
        ? response.data.data
        : rejectWithValue(response.data.error);
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

export const createBlacklistMapping = createAsyncThunk(
  "transporter/createBlacklistMapping",
  async ({ transporterId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/transporter/${transporterId}/blacklist-mappings`,
        mappingData
      );
      return response.data.success
        ? response.data
        : rejectWithValue(response.data.error);
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

export const updateBlacklistMapping = createAsyncThunk(
  "transporter/updateBlacklistMapping",
  async ({ transporterId, mappingId, mappingData }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/transporter/${transporterId}/blacklist-mappings/${mappingId}`,
        mappingData
      );
      return response.data.success
        ? response.data
        : rejectWithValue(response.data.error);
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

export const deleteBlacklistMapping = createAsyncThunk(
  "transporter/deleteBlacklistMapping",
  async ({ transporterId, mappingId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `/transporter/${transporterId}/blacklist-mappings/${mappingId}`
      );
      return response.data.success
        ? { mappingId }
        : rejectWithValue(response.data.error);
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
    mandatoryDocuments: [],
  },
  statesByCountry: {},
  citiesByCountryState: {},

  // Mapping master data
  mappingMasterData: {
    consignors: [],
    vehicles: [],
    drivers: [],
    owners: [],
    userTypes: [],
  },

  // Mapping data
  consignorMappings: [],
  vehicleMappings: [],
  driverMappings: [],
  ownerMappings: [],
  blacklistMappings: [],

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

  // Mapping UI state
  isFetchingMappings: false,
  isCreatingMapping: false,
  isUpdatingMapping: false,
  isDeletingMapping: false,
  mappingError: null,

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
    clearSelectedTransporter: (state) => {
      state.selectedTransporter = null;
      state.isFetchingDetails = false;
      state.error = null;
    },
    resetPaginationToFirstPage: (state) => {
      state.pagination.page = 1;
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
      // Consignor Mappings
      .addCase(fetchConsignorMappings.pending, (state) => {
        state.isFetchingMappings = true;
      })
      .addCase(fetchConsignorMappings.fulfilled, (state, action) => {
        state.isFetchingMappings = false;
        state.consignorMappings = action.payload;
      })
      .addCase(fetchConsignorMappings.rejected, (state, action) => {
        state.isFetchingMappings = false;
        state.mappingError = action.payload;
      })
      .addCase(createConsignorMapping.pending, (state) => {
        state.isCreatingMapping = true;
      })
      .addCase(createConsignorMapping.fulfilled, (state) => {
        state.isCreatingMapping = false;
      })
      .addCase(createConsignorMapping.rejected, (state, action) => {
        state.isCreatingMapping = false;
        state.mappingError = action.payload;
      })
      .addCase(updateConsignorMapping.pending, (state) => {
        state.isUpdatingMapping = true;
      })
      .addCase(updateConsignorMapping.fulfilled, (state) => {
        state.isUpdatingMapping = false;
      })
      .addCase(updateConsignorMapping.rejected, (state, action) => {
        state.isUpdatingMapping = false;
        state.mappingError = action.payload;
      })
      .addCase(deleteConsignorMapping.pending, (state) => {
        state.isDeletingMapping = true;
      })
      .addCase(deleteConsignorMapping.fulfilled, (state) => {
        state.isDeletingMapping = false;
      })
      .addCase(deleteConsignorMapping.rejected, (state, action) => {
        state.isDeletingMapping = false;
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
      .addCase(createVehicleMapping.pending, (state) => {
        state.isCreatingMapping = true;
      })
      .addCase(createVehicleMapping.fulfilled, (state) => {
        state.isCreatingMapping = false;
      })
      .addCase(createVehicleMapping.rejected, (state, action) => {
        state.isCreatingMapping = false;
        state.mappingError = action.payload;
      })
      .addCase(updateVehicleMapping.pending, (state) => {
        state.isUpdatingMapping = true;
      })
      .addCase(updateVehicleMapping.fulfilled, (state) => {
        state.isUpdatingMapping = false;
      })
      .addCase(updateVehicleMapping.rejected, (state, action) => {
        state.isUpdatingMapping = false;
        state.mappingError = action.payload;
      })
      .addCase(deleteVehicleMapping.pending, (state) => {
        state.isDeletingMapping = true;
      })
      .addCase(deleteVehicleMapping.fulfilled, (state) => {
        state.isDeletingMapping = false;
      })
      .addCase(deleteVehicleMapping.rejected, (state, action) => {
        state.isDeletingMapping = false;
        state.mappingError = action.payload;
      })
      // Driver Mappings
      .addCase(fetchDriverMappings.pending, (state) => {
        state.isFetchingMappings = true;
      })
      .addCase(fetchDriverMappings.fulfilled, (state, action) => {
        state.isFetchingMappings = false;
        state.driverMappings = action.payload;
      })
      .addCase(fetchDriverMappings.rejected, (state, action) => {
        state.isFetchingMappings = false;
        state.mappingError = action.payload;
      })
      .addCase(createDriverMapping.pending, (state) => {
        state.isCreatingMapping = true;
      })
      .addCase(createDriverMapping.fulfilled, (state) => {
        state.isCreatingMapping = false;
      })
      .addCase(createDriverMapping.rejected, (state, action) => {
        state.isCreatingMapping = false;
        state.mappingError = action.payload;
      })
      .addCase(updateDriverMapping.pending, (state) => {
        state.isUpdatingMapping = true;
      })
      .addCase(updateDriverMapping.fulfilled, (state) => {
        state.isUpdatingMapping = false;
      })
      .addCase(updateDriverMapping.rejected, (state, action) => {
        state.isUpdatingMapping = false;
        state.mappingError = action.payload;
      })
      .addCase(deleteDriverMapping.pending, (state) => {
        state.isDeletingMapping = true;
      })
      .addCase(deleteDriverMapping.fulfilled, (state) => {
        state.isDeletingMapping = false;
      })
      .addCase(deleteDriverMapping.rejected, (state, action) => {
        state.isDeletingMapping = false;
        state.mappingError = action.payload;
      })
      // Owner Mappings
      .addCase(fetchOwnerMappings.pending, (state) => {
        state.isFetchingMappings = true;
      })
      .addCase(fetchOwnerMappings.fulfilled, (state, action) => {
        state.isFetchingMappings = false;
        state.ownerMappings = action.payload;
      })
      .addCase(fetchOwnerMappings.rejected, (state, action) => {
        state.isFetchingMappings = false;
        state.mappingError = action.payload;
      })
      .addCase(createOwnerMapping.pending, (state) => {
        state.isCreatingMapping = true;
      })
      .addCase(createOwnerMapping.fulfilled, (state) => {
        state.isCreatingMapping = false;
      })
      .addCase(createOwnerMapping.rejected, (state, action) => {
        state.isCreatingMapping = false;
        state.mappingError = action.payload;
      })
      .addCase(updateOwnerMapping.pending, (state) => {
        state.isUpdatingMapping = true;
      })
      .addCase(updateOwnerMapping.fulfilled, (state) => {
        state.isUpdatingMapping = false;
      })
      .addCase(updateOwnerMapping.rejected, (state, action) => {
        state.isUpdatingMapping = false;
        state.mappingError = action.payload;
      })
      .addCase(deleteOwnerMapping.pending, (state) => {
        state.isDeletingMapping = true;
      })
      .addCase(deleteOwnerMapping.fulfilled, (state) => {
        state.isDeletingMapping = false;
      })
      .addCase(deleteOwnerMapping.rejected, (state, action) => {
        state.isDeletingMapping = false;
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
      })
      .addCase(createBlacklistMapping.pending, (state) => {
        state.isCreatingMapping = true;
      })
      .addCase(createBlacklistMapping.fulfilled, (state) => {
        state.isCreatingMapping = false;
      })
      .addCase(createBlacklistMapping.rejected, (state, action) => {
        state.isCreatingMapping = false;
        state.mappingError = action.payload;
      })
      .addCase(updateBlacklistMapping.pending, (state) => {
        state.isUpdatingMapping = true;
      })
      .addCase(updateBlacklistMapping.fulfilled, (state) => {
        state.isUpdatingMapping = false;
      })
      .addCase(updateBlacklistMapping.rejected, (state, action) => {
        state.isUpdatingMapping = false;
        state.mappingError = action.payload;
      })
      .addCase(deleteBlacklistMapping.pending, (state) => {
        state.isDeletingMapping = true;
      })
      .addCase(deleteBlacklistMapping.fulfilled, (state) => {
        state.isDeletingMapping = false;
      })
      .addCase(deleteBlacklistMapping.rejected, (state, action) => {
        state.isDeletingMapping = false;
        state.mappingError = action.payload;
      });
  },
});

export const {
  clearError,
  clearLastCreated,
  resetTransporterState,
  resetPaginationToFirstPage,
} = transporterSlice.actions;

export default transporterSlice.reducer;
