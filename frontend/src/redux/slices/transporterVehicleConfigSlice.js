import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunks
export const fetchHdrList = createAsyncThunk(
  "transporterVehicleConfig/fetchHdrList",
  async ({ page = 1, limit = 10, search = "", include_inactive = false }, { rejectWithValue }) => {
    try {
      const response = await api.get("/transporter-vehicle-config/hdr", {
        params: { page, limit, search, include_inactive }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch HDR list");
    }
  }
);

export const fetchHdrById = createAsyncThunk(
  "transporterVehicleConfig/fetchHdrById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transporter-vehicle-config/hdr/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch HDR details");
    }
  }
);

export const createHdr = createAsyncThunk(
  "transporterVehicleConfig/createHdr",
  async (hdrData, { rejectWithValue }) => {
    try {
      const response = await api.post("/transporter-vehicle-config/hdr", hdrData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create HDR");
    }
  }
);

export const updateHdr = createAsyncThunk(
  "transporterVehicleConfig/updateHdr",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/transporter-vehicle-config/hdr/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update HDR");
    }
  }
);

export const updateHdrStatus = createAsyncThunk(
  "transporterVehicleConfig/updateHdrStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/transporter-vehicle-config/hdr/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update HDR status");
    }
  }
);

export const fetchAlerts = createAsyncThunk(
  "transporterVehicleConfig/fetchAlerts",
  async (hdrId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/transporter-vehicle-config/hdr/${hdrId}/alerts`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch alerts");
    }
  }
);

export const createAlert = createAsyncThunk(
  "transporterVehicleConfig/createAlert",
  async ({ hdrId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/transporter-vehicle-config/hdr/${hdrId}/alerts`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create alert");
    }
  }
);

export const updateAlert = createAsyncThunk(
  "transporterVehicleConfig/updateAlert",
  async ({ hdrId, alertId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/transporter-vehicle-config/hdr/${hdrId}/alerts/${alertId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update alert");
    }
  }
);

export const updateAlertStatus = createAsyncThunk(
  "transporterVehicleConfig/updateAlertStatus",
  async ({ hdrId, alertId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/transporter-vehicle-config/hdr/${hdrId}/alerts/${alertId}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update alert status");
    }
  }
);

// Master data thunks
export const fetchVehicleTypes = createAsyncThunk(
  "transporterVehicleConfig/fetchVehicleTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/transporter-vehicle-config/masters/vehicle-types");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch vehicle types");
    }
  }
);

export const fetchParameters = createAsyncThunk(
  "transporterVehicleConfig/fetchParameters",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/transporter-vehicle-config/masters/parameters");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch parameters");
    }
  }
);

export const fetchAlertTypes = createAsyncThunk(
  "transporterVehicleConfig/fetchAlertTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/transporter-vehicle-config/masters/alert-types");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch alert types");
    }
  }
);

export const fetchVehicles = createAsyncThunk(
  "transporterVehicleConfig/fetchVehicles",
  async (search = "", { rejectWithValue }) => {
    try {
      const response = await api.get("/transporter-vehicle-config/masters/vehicles", {
        params: { search }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch vehicles");
    }
  }
);

export const fetchTransporters = createAsyncThunk(
  "transporterVehicleConfig/fetchTransporters",
  async (search = "", { rejectWithValue }) => {
    try {
      const response = await api.get("/transporter-vehicle-config/masters/transporters", {
        params: { search }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch transporters");
    }
  }
);

export const fetchConsignors = createAsyncThunk(
  "transporterVehicleConfig/fetchConsignors",
  async (search = "", { rejectWithValue }) => {
    try {
      const response = await api.get("/transporter-vehicle-config/masters/consignors", {
        params: { search }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch consignors");
    }
  }
);

export const fetchUsers = createAsyncThunk(
  "transporterVehicleConfig/fetchUsers",
  async (search = "", { rejectWithValue }) => {
    try {
      const response = await api.get("/transporter-vehicle-config/masters/users", {
        params: { search }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  }
);

const initialState = {
  hdrList: [],
  selectedHdr: null,
  alerts: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  },
  vehicleTypes: [],
  parameters: [],
  alertTypes: [],
  vehicles: [],
  transporters: [],
  consignors: [],
  users: [],
  loading: false,
  error: null,
  success: false
};

const transporterVehicleConfigSlice = createSlice({
  name: "transporterVehicleConfig",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setSelectedHdr: (state, action) => {
      state.selectedHdr = action.payload;
    },
    clearSelectedHdr: (state) => {
      state.selectedHdr = null;
      state.alerts = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch HDR List
      .addCase(fetchHdrList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHdrList.fulfilled, (state, action) => {
        state.loading = false;
        state.hdrList = action.payload.data?.data || [];
        state.pagination = action.payload.data?.pagination || initialState.pagination;
      })
      .addCase(fetchHdrList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch HDR By ID
      .addCase(fetchHdrById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHdrById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedHdr = action.payload.data;
        state.alerts = action.payload.data?.alerts || [];
      })
      .addCase(fetchHdrById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create HDR
      .addCase(createHdr.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createHdr.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createHdr.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update HDR
      .addCase(updateHdr.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateHdr.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateHdr.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Alerts
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.alerts = action.payload.data || [];
      })
      // Create Alert
      .addCase(createAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAlert.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Alert
      .addCase(updateAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAlert.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Master data
      .addCase(fetchVehicleTypes.fulfilled, (state, action) => {
        state.vehicleTypes = action.payload.data || [];
      })
      .addCase(fetchParameters.fulfilled, (state, action) => {
        state.parameters = action.payload.data || [];
      })
      .addCase(fetchAlertTypes.fulfilled, (state, action) => {
        state.alertTypes = action.payload.data || [];
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.vehicles = action.payload.data || [];
      })
      .addCase(fetchTransporters.fulfilled, (state, action) => {
        state.transporters = action.payload.data || [];
      })
      .addCase(fetchConsignors.fulfilled, (state, action) => {
        state.consignors = action.payload.data || [];
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.data || [];
      });
  }
});

export const { clearError, clearSuccess, setSelectedHdr, clearSelectedHdr } = transporterVehicleConfigSlice.actions;

export default transporterVehicleConfigSlice.reducer;
