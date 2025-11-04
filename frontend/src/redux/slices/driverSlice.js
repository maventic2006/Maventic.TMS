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

const initialState = {
  // Master data
  masterData: {
    countries: [],
    documentTypes: [],
    documentNames: [],
    addressTypes: [],
    genderOptions: [],
    bloodGroupOptions: [],
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
      });
  },
});

export const { clearError, clearLastCreated, resetDriverState } =
  driverSlice.actions;

export default driverSlice.reducer;
