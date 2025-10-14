import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { API_ENDPOINTS } from "../../utils/constants";

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

export const fetchMasterData = createAsyncThunk(
  "transporter/fetchMasterData",
  async (_, { rejectWithValue }) => {
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
  }
);

export const fetchStates = createAsyncThunk(
  "transporter/fetchStates",
  async (countryCode, { rejectWithValue }) => {
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
  }
);

export const fetchCities = createAsyncThunk(
  "transporter/fetchCities",
  async ({ countryCode, stateCode }, { rejectWithValue }) => {
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

  // UI state
  isLoading: false,
  isCreating: false,
  error: null,

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
      });
  },
});

export const { clearError, clearLastCreated, resetTransporterState } =
  transporterSlice.actions;
export default transporterSlice.reducer;
