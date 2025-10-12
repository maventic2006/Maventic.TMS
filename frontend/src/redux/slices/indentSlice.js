import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunks
export const fetchIndents = createAsyncThunk(
  "indent/fetchIndents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/indent", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch indents"
      );
    }
  }
);

export const createIndent = createAsyncThunk(
  "indent/createIndent",
  async (indentData, { rejectWithValue }) => {
    try {
      const response = await api.post("/indent", indentData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create indent"
      );
    }
  }
);

export const updateIndent = createAsyncThunk(
  "indent/updateIndent",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/indent/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update indent"
      );
    }
  }
);

export const deleteIndent = createAsyncThunk(
  "indent/deleteIndent",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/indent/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete indent"
      );
    }
  }
);

export const fetchIndentById = createAsyncThunk(
  "indent/fetchIndentById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/indent/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch indent"
      );
    }
  }
);

const initialState = {
  indents: [],
  currentIndent: null,
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
  sorting: {
    field: "created_at",
    order: "desc",
  },
};

const indentSlice = createSlice({
  name: "indent",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSorting: (state, action) => {
      state.sorting = action.payload;
    },
    setCurrentIndent: (state, action) => {
      state.currentIndent = action.payload;
    },
    clearCurrentIndent: (state) => {
      state.currentIndent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch indents
      .addCase(fetchIndents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIndents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.indents = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = {
            ...state.pagination,
            ...action.payload.pagination,
          };
        }
      })
      .addCase(fetchIndents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create indent
      .addCase(createIndent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createIndent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.indents.unshift(action.payload);
      })
      .addCase(createIndent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update indent
      .addCase(updateIndent.fulfilled, (state, action) => {
        const index = state.indents.findIndex(
          (indent) => indent.id === action.payload.id
        );
        if (index !== -1) {
          state.indents[index] = action.payload;
        }
        if (state.currentIndent?.id === action.payload.id) {
          state.currentIndent = action.payload;
        }
      })
      // Delete indent
      .addCase(deleteIndent.fulfilled, (state, action) => {
        state.indents = state.indents.filter(
          (indent) => indent.id !== action.payload
        );
        if (state.currentIndent?.id === action.payload) {
          state.currentIndent = null;
        }
      })
      // Fetch indent by ID
      .addCase(fetchIndentById.fulfilled, (state, action) => {
        state.currentIndent = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setPagination,
  setSorting,
  setCurrentIndent,
  clearCurrentIndent,
} = indentSlice.actions;

export default indentSlice.reducer;
