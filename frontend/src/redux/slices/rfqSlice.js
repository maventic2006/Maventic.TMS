import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunks
export const fetchRFQs = createAsyncThunk(
  "rfq/fetchRFQs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/rfq", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch RFQs"
      );
    }
  }
);

const initialState = {
  rfqs: [],
  currentRFQ: null,
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

const rfqSlice = createSlice({
  name: "rfq",
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRFQs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRFQs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rfqs = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          };
        }
      })
      .addCase(fetchRFQs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilters, clearFilters } = rfqSlice.actions;
export default rfqSlice.reducer;
