import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchContracts = createAsyncThunk(
  "contract/fetchContracts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/contract", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch contracts"
      );
    }
  }
);

const initialState = {
  contracts: [],
  currentContract: null,
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

const contractSlice = createSlice({
  name: "contract",
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
      .addCase(fetchContracts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contracts = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          };
        }
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilters, clearFilters } = contractSlice.actions;
export default contractSlice.reducer;
