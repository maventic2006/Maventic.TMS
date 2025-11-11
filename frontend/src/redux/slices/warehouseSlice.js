import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { API_ENDPOINTS } from '../../utils/constants';

// Mock data for initial development
const mockWarehouses = [
  {
    warehouse_id: 'WH001',
    consignor_id: 'C001',
    warehouse_type_id: 'WT001',
    warehouse_type_name: 'Manufacturing',
    warehouse_name_1: 'Central Manufacturing Hub',
    weigh_bridge: true,
    virtual_yard_in: true,
    geo_fencing: true,
    gate_pass: true,
    fuel_filling: false,
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    created_by: 'Admin',
    created_at: '2025-01-15',
    status: 'ACTIVE',
    approver: 'John Doe',
    approved_on: '2025-01-16',
  },
  {
    warehouse_id: 'WH002',
    consignor_id: 'C001',
    warehouse_type_id: 'WT002',
    warehouse_type_name: 'Cold Storage',
    warehouse_name_1: 'Refrigerated Storage Facility',
    weigh_bridge: true,
    virtual_yard_in: false,
    geo_fencing: true,
    gate_pass: true,
    fuel_filling: false,
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    created_by: 'Admin',
    created_at: '2025-02-10',
    status: 'ACTIVE',
    approver: 'Jane Smith',
    approved_on: '2025-02-11',
  },
  {
    warehouse_id: 'WH003',
    consignor_id: 'C001',
    warehouse_type_id: 'WT003',
    warehouse_type_name: 'Distributor',
    warehouse_name_1: 'Regional Distribution Center',
    weigh_bridge: false,
    virtual_yard_in: true,
    geo_fencing: false,
    gate_pass: true,
    fuel_filling: true,
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    created_by: 'Manager',
    created_at: '2025-03-05',
    status: 'PENDING',
    approver: null,
    approved_on: null,
  },
];

// Initial state
const initialState = {
  warehouses: [],
  filteredWarehouses: [],
  currentWarehouse: null,
  masterData: {
    warehouseTypes: [],
    subLocationTypes: [],
  },
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  },
  filters: {
    warehouseId: '',
    warehouseName: '',
    weighBridge: null,
    virtualYardIn: null,
    geoFencing: null,
    status: '',
  },
  useMockData: false, // Flag to switch between mock and real data
};

// Async thunks (will be implemented with real API later)
export const fetchWarehouses = createAsyncThunk(
  'warehouse/fetchWarehouses',
  async (params, { getState, rejectWithValue }) => {
    try {
      const { useMockData } = getState().warehouse;
      
      if (useMockData) {
        // Return mock data for now
        return {
          warehouses: mockWarehouses,
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 25,
            total: mockWarehouses.length,
            totalPages: Math.ceil(mockWarehouses.length / (params?.limit || 25)),
          },
        };
      }
      
      // Real API call (to be implemented)
      const response = await api.get(API_ENDPOINTS.WAREHOUSE.LIST, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouses');
    }
  }
);

export const fetchWarehouseById = createAsyncThunk(
  'warehouse/fetchWarehouseById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.WAREHOUSE.GET_BY_ID}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouse details');
    }
  }
);

export const createWarehouse = createAsyncThunk(
  'warehouse/createWarehouse',
  async (warehouseData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.WAREHOUSE.CREATE, warehouseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create warehouse');
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  'warehouse/updateWarehouse',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.WAREHOUSE.UPDATE}/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update warehouse');
    }
  }
);

export const fetchMasterData = createAsyncThunk(
  'warehouse/fetchMasterData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.WAREHOUSE.MASTER_DATA);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch master data');
    }
  }
);

// Warehouse slice
const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setFilteredWarehouses: (state, action) => {
      state.filteredWarehouses = action.payload;
    },
    setUseMockData: (state, action) => {
      state.useMockData = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch warehouses
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload.warehouses || action.payload;
        state.filteredWarehouses = action.payload.warehouses || action.payload;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch warehouse by ID
      .addCase(fetchWarehouseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWarehouse = action.payload;
      })
      .addCase(fetchWarehouseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create warehouse
      .addCase(createWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses.push(action.payload);
      })
      .addCase(createWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update warehouse
      .addCase(updateWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.warehouses.findIndex(
          (w) => w.warehouse_id === action.payload.warehouse_id
        );
        if (index !== -1) {
          state.warehouses[index] = action.payload;
        }
      })
      .addCase(updateWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch master data
      .addCase(fetchMasterData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.loading = false;
        state.masterData = action.payload;
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, setFilteredWarehouses, setUseMockData, clearError } = warehouseSlice.actions;

export default warehouseSlice.reducer;
