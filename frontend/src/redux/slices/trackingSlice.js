import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchTrackingData = createAsyncThunk(
  "tracking/fetchTrackingData",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/tracking", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tracking data"
      );
    }
  }
);

const initialState = {
  trackingData: [],
  currentTracking: null,
  isLoading: false,
  error: null,
  filters: {
    status: "",
    dateFrom: "",
    dateTo: "",
    search: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

const trackingSlice = createSlice({
  name: "tracking",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    updateTrackingStatus: (state, action) => {
      const { id, status } = action.payload;
      const tracking = state.trackingData.find((item) => item.id === id);
      if (tracking) {
        tracking.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrackingData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrackingData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trackingData = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          };
        }
      })
      .addCase(fetchTrackingData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilters, clearFilters, updateTrackingStatus } =
  trackingSlice.actions;
export default trackingSlice.reducer;
