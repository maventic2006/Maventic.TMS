import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks for API calls

// Get all configurations
export const fetchConfigurations = createAsyncThunk(
  'configuration/fetchConfigurations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/configuration');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch configurations');
    }
  }
);

// Get configuration metadata
export const fetchConfigurationMetadata = createAsyncThunk(
  'configuration/fetchConfigurationMetadata',
  async (configName, { rejectWithValue }) => {
    try {
      const response = await api.get(`/configuration/${configName}/metadata`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch configuration metadata');
    }
  }
);

// Get configuration data with pagination
export const fetchConfigurationData = createAsyncThunk(
  'configuration/fetchConfigurationData',
  async ({ configName, params }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/configuration/${configName}/data?${queryParams}`);
      console.log("Fetched configuration data:", response.data);
      // Return the complete data structure with both data and pagination
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch configuration data');
    }
  }
);

// Get single record
export const fetchConfigurationRecord = createAsyncThunk(
  'configuration/fetchConfigurationRecord',
  async ({ configName, id }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/configuration/${configName}/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch record');
    }
  }
);

// Create new record
export const createRecord = createAsyncThunk(
  'configuration/createRecord',
  async ({ configName, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/configuration/${configName}`, data);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create record';
      const validationErrors = error.response?.data?.errors;
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Update record
export const updateRecord = createAsyncThunk(
  'configuration/updateRecord',
  async ({ configName, id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/configuration/${configName}/${id}`, data);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update record';
      const validationErrors = error.response?.data?.errors;
      return rejectWithValue({ message, validationErrors });
    }
  }
);

// Delete record
export const deleteRecord = createAsyncThunk(
  'configuration/deleteRecord',
  async ({ configName, id }, { rejectWithValue }) => {
    try {
      await api.delete(`/configuration/${configName}/${id}`);
      return { configName, id };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete record');
    }
  }
);

// Get dropdown options
export const fetchDropdownOptions = createAsyncThunk(
  'configuration/fetchDropdownOptions',
  async (type, { rejectWithValue }) => {
    try {
      const response = await api.get(`/configuration/dropdown-options/${type}`);
      return { type, options: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dropdown options');
    }
  }
);

// Initial state
const initialState = {
  configurations: [],
  metadata: null,
  data: [],
  currentRecord: null,
  dropdownOptions: {}, // Store dropdown options by type
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  },
  loading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  validationErrors: []
};

// Configuration slice
const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.validationErrors = [];
    },
    clearData: (state) => {
      state.data = [];
      state.currentRecord = null;
      state.pagination = initialState.pagination;
    },
    clearMetadata: (state) => {
      state.metadata = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch configurations
      .addCase(fetchConfigurations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfigurations.fulfilled, (state, action) => {
        state.loading = false;
        state.configurations = action.payload;
      })
      .addCase(fetchConfigurations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch configuration metadata
      .addCase(fetchConfigurationMetadata.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfigurationMetadata.fulfilled, (state, action) => {
        state.loading = false;
        state.metadata = action.payload;
      })
      .addCase(fetchConfigurationMetadata.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch configuration data
      .addCase(fetchConfigurationData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfigurationData.fulfilled, (state, action) => {
        state.loading = false;
        // Fix: action.payload contains { data: [...], pagination: {...} }
        // so we need action.payload.data for the records array
        state.data = action.payload.data || action.payload;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchConfigurationData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch single record
      .addCase(fetchConfigurationRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfigurationRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecord = action.payload;
      })
      .addCase(fetchConfigurationRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create record
      .addCase(createRecord.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = [];
      })
      .addCase(createRecord.fulfilled, (state, action) => {
        state.isCreating = false;
        // Add new record to the beginning of the data array
        state.data.unshift(action.payload);
        // Update pagination
        state.pagination.totalRecords += 1;
      })
      .addCase(createRecord.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload.message;
        state.validationErrors = action.payload.validationErrors || [];
      })

      // Update record
      .addCase(updateRecord.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = [];
      })
      .addCase(updateRecord.fulfilled, (state, action) => {
        state.isUpdating = false;
        // Update the record in the data array
        const index = state.data.findIndex(record => 
          record[state.metadata?.primaryKey] === action.payload[state.metadata?.primaryKey]
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        // Update current record if it's the same one
        if (state.currentRecord && 
            state.currentRecord[state.metadata?.primaryKey] === action.payload[state.metadata?.primaryKey]) {
          state.currentRecord = action.payload;
        }
      })
      .addCase(updateRecord.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload.message;
        state.validationErrors = action.payload.validationErrors || [];
      })

      // Delete record
      .addCase(deleteRecord.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.isDeleting = false;
        // Remove the record from data array
        state.data = state.data.filter(record => 
          record[state.metadata?.primaryKey] !== action.payload.id
        );
        // Update pagination
        state.pagination.totalRecords = Math.max(0, state.pagination.totalRecords - 1);
        // Clear current record if it was deleted
        if (state.currentRecord && 
            state.currentRecord[state.metadata?.primaryKey] === action.payload.id) {
          state.currentRecord = null;
        }
      })
      .addCase(deleteRecord.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })

      // Fetch dropdown options
      .addCase(fetchDropdownOptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDropdownOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.dropdownOptions[action.payload.type] = action.payload.options;
      })
      .addCase(fetchDropdownOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearErrors, clearData, clearMetadata, setCurrentPage } = configurationSlice.actions;

export default configurationSlice.reducer;