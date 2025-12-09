import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async Thunks

// Fetch approvals with filters
export const fetchApprovals = createAsyncThunk(
  'approval/fetchApprovals',
  async ({ page = 1, limit = 25, filters = {} }, { rejectWithValue }) => {
    try {
      const params = {
        page,
        limit,
        ...filters
      };
      
      const response = await api.get('/approvals', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Approve request
export const approveRequest = createAsyncThunk(
  'approval/approveRequest',
  async (approvalId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/approvals/${approvalId}/approve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Reject request (remarks mandatory)
export const rejectRequest = createAsyncThunk(
  'approval/rejectRequest',
  async ({ approvalId, remarks }, { rejectWithValue }) => {
    try {
      if (!remarks || remarks.trim().length === 0) {
        return rejectWithValue({
          message: 'Remarks are required to reject this request',
          field: 'remarks'
        });
      }

      const response = await api.post(`/approvals/${approvalId}/reject`, {
        remarks: remarks.trim()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Send back request (remarks mandatory)
export const sendBackRequest = createAsyncThunk(
  'approval/sendBackRequest',
  async ({ approvalId, remarks }, { rejectWithValue }) => {
    try {
      if (!remarks || remarks.trim().length === 0) {
        return rejectWithValue({
          message: 'Remarks are required to send back this request',
          field: 'remarks'
        });
      }

      const response = await api.post(`/approvals/${approvalId}/sendBack`, {
        remarks: remarks.trim()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch master data
export const fetchApprovalMasterData = createAsyncThunk(
  'approval/fetchMasterData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/approvals/master-data');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Approve user (for Transporter Admin user approval workflow)
export const approveUser = createAsyncThunk(
  'approval/approveUser',
  async ({ userId, remarks }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/approvals/user/${userId}/approve`, {
        remarks
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Reject user (for Transporter Admin user approval workflow)
export const rejectUser = createAsyncThunk(
  'approval/rejectUser',
  async ({ userId, remarks }, { rejectWithValue }) => {
    try {
      if (!remarks || remarks.trim().length === 0) {
        return rejectWithValue('Remarks are required to reject this user');
      }

      const response = await api.post(`/approvals/user/${userId}/reject`, {
        remarks: remarks.trim()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Approve approval flow (for entity approval workflow using approval_flow_trans_id)
export const approveApprovalFlow = createAsyncThunk(
  'approval/approveApprovalFlow',
  async ({ approvalFlowTransId, remarks }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/approvals/${approvalFlowTransId}/approve`, {
        remarks
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Reject approval flow (for entity approval workflow using approval_flow_trans_id)
export const rejectApprovalFlow = createAsyncThunk(
  'approval/rejectApprovalFlow',
  async ({ approvalFlowTransId, remarks }, { rejectWithValue }) => {
    try {
      if (!remarks || remarks.trim().length === 0) {
        return rejectWithValue('Remarks are required to reject this approval');
      }

      const response = await api.post(`/approvals/${approvalFlowTransId}/reject`, {
        remarks: remarks.trim()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Initial State
const initialState = {
  approvals: [],
  masterData: {
    approvalTypes: []
  },
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1
  },
  filters: {
    requestType: '',
    dateFrom: '',
    dateTo: '',
    status: 'PENDING' // ✅ STANDARDIZED: Use single "PENDING" status
  },
  isFetching: false,
  isApproving: false,
  isRejecting: false,
  isSendingBack: false,
  error: null,
  actionError: null
};

// Slice
const approvalSlice = createSlice({
  name: 'approval',
  initialState,
  reducers: {
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        requestType: '',
        dateFrom: '',
        dateTo: '',
        status: 'PENDING' // ✅ STANDARDIZED: Use single "PENDING" status
      };
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.actionError = null;
    },

    // Clear action error
    clearActionError: (state) => {
      state.actionError = null;
    }
  },

  extraReducers: (builder) => {
    // Fetch Approvals
    builder
      .addCase(fetchApprovals.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchApprovals.fulfilled, (state, action) => {
        state.isFetching = false;
        state.approvals = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchApprovals.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload?.message || 'Failed to fetch approvals';
      });

    // Approve Request
    builder
      .addCase(approveRequest.pending, (state) => {
        state.isApproving = true;
        state.actionError = null;
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.isApproving = false;
        // Remove approved request from list
        const approvalId = action.payload.data?.approvalId;
        state.approvals = state.approvals.filter(
          (approval) => approval.approvalId !== approvalId
        );
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(approveRequest.rejected, (state, action) => {
        state.isApproving = false;
        state.actionError = action.payload?.message || 'Failed to approve request';
      });

    // Reject Request
    builder
      .addCase(rejectRequest.pending, (state) => {
        state.isRejecting = true;
        state.actionError = null;
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.isRejecting = false;
        // Remove rejected request from list
        const approvalId = action.payload.data?.approvalId;
        state.approvals = state.approvals.filter(
          (approval) => approval.approvalId !== approvalId
        );
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(rejectRequest.rejected, (state, action) => {
        state.isRejecting = false;
        state.actionError = action.payload?.message || 'Failed to reject request';
      });

    // Send Back Request
    builder
      .addCase(sendBackRequest.pending, (state) => {
        state.isSendingBack = true;
        state.actionError = null;
      })
      .addCase(sendBackRequest.fulfilled, (state, action) => {
        state.isSendingBack = false;
        // Remove sent back request from list
        const approvalId = action.payload.data?.approvalId;
        state.approvals = state.approvals.filter(
          (approval) => approval.approvalId !== approvalId
        );
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(sendBackRequest.rejected, (state, action) => {
        state.isSendingBack = false;
        state.actionError = action.payload?.message || 'Failed to send back request';
      });

    // Fetch Master Data
    builder
      .addCase(fetchApprovalMasterData.pending, (state) => {
        state.isFetching = true;
      })
      .addCase(fetchApprovalMasterData.fulfilled, (state, action) => {
        state.isFetching = false;
        state.masterData = action.payload.data || state.masterData;
      })
      .addCase(fetchApprovalMasterData.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload?.message || 'Failed to fetch master data';
      });

    // Approve User (Transporter Admin User Approval)
    builder
      .addCase(approveUser.pending, (state) => {
        state.isApproving = true;
        state.actionError = null;
      })
      .addCase(approveUser.fulfilled, (state) => {
        state.isApproving = false;
      })
      .addCase(approveUser.rejected, (state, action) => {
        state.isApproving = false;
        state.actionError = action.payload || 'Failed to approve user';
      });

    // Reject User (Transporter Admin User Approval)
    builder
      .addCase(rejectUser.pending, (state) => {
        state.isRejecting = true;
        state.actionError = null;
      })
      .addCase(rejectUser.fulfilled, (state) => {
        state.isRejecting = false;
      })
      .addCase(rejectUser.rejected, (state, action) => {
        state.isRejecting = false;
        state.actionError = action.payload || 'Failed to reject user';
      });

    // Approve Approval Flow (Entity Approval using approval_flow_trans_id)
    builder
      .addCase(approveApprovalFlow.pending, (state) => {
        state.isApproving = true;
        state.actionError = null;
      })
      .addCase(approveApprovalFlow.fulfilled, (state) => {
        state.isApproving = false;
      })
      .addCase(approveApprovalFlow.rejected, (state, action) => {
        state.isApproving = false;
        state.actionError = action.payload || 'Failed to approve approval';
      });

    // Reject Approval Flow (Entity Approval using approval_flow_trans_id)
    builder
      .addCase(rejectApprovalFlow.pending, (state) => {
        state.isRejecting = true;
        state.actionError = null;
      })
      .addCase(rejectApprovalFlow.fulfilled, (state) => {
        state.isRejecting = false;
      })
      .addCase(rejectApprovalFlow.rejected, (state, action) => {
        state.isRejecting = false;
        state.actionError = action.payload || 'Failed to reject approval';
      });
  }
});

// Export actions
export const {
  setFilters,
  clearFilters,
  clearError,
  clearActionError
} = approvalSlice.actions;

// Export reducer
export default approvalSlice.reducer;
