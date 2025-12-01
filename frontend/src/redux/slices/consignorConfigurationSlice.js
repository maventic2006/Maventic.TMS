import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks for API calls

// Get all consignor configurations
export const fetchConsignorConfigurations = createAsyncThunk(
  'consignorConfiguration/fetchConsignorConfigurations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/consignor-configuration');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch consignor configurations');
    }
  }
);

// Get consignor configuration metadata
export const fetchConsignorConfigurationMetadata = createAsyncThunk(
  'consignorConfiguration/fetchConsignorConfigurationMetadata',
  async (configName, { rejectWithValue }) => {
    try {
      const response = await api.get(`/consignor-configuration/${configName}/metadata`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch consignor configuration metadata');
    }
  }
);

// Get consignor configuration data with pagination
export const fetchConsignorConfigurationData = createAsyncThunk(
  'consignorConfiguration/fetchConsignorConfigurationData',
  async ({ configName, params }, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/consignor-configuration/${configName}/data?${queryString}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch consignor configuration data');
    }
  }
);

// Create new record
export const createConsignorRecord = createAsyncThunk(
  'consignorConfiguration/createConsignorRecord',
  async ({ configName, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/consignor-configuration/${configName}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create record');
    }
  }
);

// Update record
export const updateConsignorRecord = createAsyncThunk(
  'consignorConfiguration/updateConsignorRecord',
  async ({ configName, id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/consignor-configuration/${configName}/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update record');
    }
  }
);

// Delete record
export const deleteConsignorRecord = createAsyncThunk(
  'consignorConfiguration/deleteConsignorRecord',
  async ({ configName, id }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/consignor-configuration/${configName}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete record');
    }
  }
);

// Initial state
const initialState = {
  configurations: [],
  metadata: null,
  data: [],
  currentRecord: null,
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

// Consignor configuration slice
const consignorConfigurationSlice = createSlice({
  name: 'consignorConfiguration',
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
      // Fetch consignor configurations
      .addCase(fetchConsignorConfigurations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConsignorConfigurations.fulfilled, (state, action) => {
        state.loading = false;
        state.configurations = action.payload.data || action.payload;
      })
      .addCase(fetchConsignorConfigurations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch consignor configuration metadata
      .addCase(fetchConsignorConfigurationMetadata.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConsignorConfigurationMetadata.fulfilled, (state, action) => {
        state.loading = false;
        state.metadata = action.payload.data || action.payload;
      })
      .addCase(fetchConsignorConfigurationMetadata.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch consignor configuration data
      .addCase(fetchConsignorConfigurationData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConsignorConfigurationData.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload.data || action.payload;
        state.data = response.data || response;
        if (response.pagination) {
          state.pagination = response.pagination;
        }
      })
      .addCase(fetchConsignorConfigurationData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create record
      .addCase(createConsignorRecord.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.validationErrors = [];
      })
      .addCase(createConsignorRecord.fulfilled, (state, action) => {
        state.isCreating = false;
        const newRecord = action.payload.data || action.payload;
        state.data.push(newRecord);
      })
      .addCase(createConsignorRecord.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
        if (action.payload?.validationErrors) {
          state.validationErrors = action.payload.validationErrors;
        }
      })
      
      // Update record
      .addCase(updateConsignorRecord.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.validationErrors = [];
      })
      .addCase(updateConsignorRecord.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedRecord = action.payload.data || action.payload;
        const index = state.data.findIndex(item => 
          item[state.metadata?.primaryKey] === updatedRecord[state.metadata?.primaryKey]
        );
        if (index !== -1) {
          state.data[index] = updatedRecord;
        }
        state.currentRecord = updatedRecord;
      })
      .addCase(updateConsignorRecord.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
        if (action.payload?.validationErrors) {
          state.validationErrors = action.payload.validationErrors;
        }
      })
      
      // Delete record
      .addCase(deleteConsignorRecord.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteConsignorRecord.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedId = action.meta.arg.id;
        state.data = state.data.filter(item => 
          item[state.metadata?.primaryKey] !== deletedId
        );
      })
      .addCase(deleteConsignorRecord.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      });
  }
});

export const { clearErrors, clearData, clearMetadata, setCurrentPage } = consignorConfigurationSlice.actions;

export default consignorConfigurationSlice.reducer;