import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunks

/**
 * Fetch pending approvals for current user
 */
export const fetchPendingApprovals = createAsyncThunk(
  "approval/fetchPendingApprovals",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/approval/pending");

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || "Failed to fetch pending approvals"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending approvals"
      );
    }
  }
);

/**
 * Fetch approval history for a specific user
 */
export const fetchApprovalHistory = createAsyncThunk(
  "approval/fetchApprovalHistory",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/approval/history/${userId}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || "Failed to fetch approval history"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch approval history"
      );
    }
  }
);

/**
 * Approve a user
 */
export const approveUser = createAsyncThunk(
  "approval/approveUser",
  async ({ userId, remarks }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/approval/approve/${userId}`, {
        remarks: remarks || "",
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || "Failed to approve user"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve user"
      );
    }
  }
);

/**
 * Reject a user
 */
export const rejectUser = createAsyncThunk(
  "approval/rejectUser",
  async ({ userId, remarks }, { rejectWithValue }) => {
    try {
      // Validate remarks are provided
      if (!remarks || remarks.trim().length === 0) {
        return rejectWithValue("Remarks are required when rejecting a user");
      }

      const response = await api.post(`/approval/reject/${userId}`, {
        remarks: remarks,
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || "Failed to reject user"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject user"
      );
    }
  }
);

/**
 * Fetch approval configuration by type
 */
export const fetchApprovalConfig = createAsyncThunk(
  "approval/fetchApprovalConfig",
  async (approvalTypeId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/approval/config/${approvalTypeId}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response.data.message || "Failed to fetch approval configuration"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch approval configuration"
      );
    }
  }
);

// Slice
const approvalSlice = createSlice({
  name: "approval",
  initialState: {
    pendingApprovals: [],
    approvalHistory: [],
    approvalConfig: null,
    isLoading: false,
    isApproving: false,
    isRejecting: false,
    isFetchingHistory: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearApprovalHistory: (state) => {
      state.approvalHistory = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch Pending Approvals
    builder
      .addCase(fetchPendingApprovals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingApprovals = action.payload;
      })
      .addCase(fetchPendingApprovals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Approval History
    builder
      .addCase(fetchApprovalHistory.pending, (state) => {
        state.isFetchingHistory = true;
        state.error = null;
      })
      .addCase(fetchApprovalHistory.fulfilled, (state, action) => {
        state.isFetchingHistory = false;
        state.approvalHistory = action.payload;
      })
      .addCase(fetchApprovalHistory.rejected, (state, action) => {
        state.isFetchingHistory = false;
        state.error = action.payload;
      });

    // Approve User
    builder
      .addCase(approveUser.pending, (state) => {
        state.isApproving = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        state.isApproving = false;
        state.successMessage = "User approved successfully";
        // Remove approved item from pending approvals
        state.pendingApprovals = state.pendingApprovals.filter(
          (approval) => approval.user_id !== action.payload.userId
        );
      })
      .addCase(approveUser.rejected, (state, action) => {
        state.isApproving = false;
        state.error = action.payload;
      });

    // Reject User
    builder
      .addCase(rejectUser.pending, (state) => {
        state.isRejecting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(rejectUser.fulfilled, (state, action) => {
        state.isRejecting = false;
        state.successMessage = "User rejected successfully";
        // Remove rejected item from pending approvals
        state.pendingApprovals = state.pendingApprovals.filter(
          (approval) => approval.user_id !== action.payload.userId
        );
      })
      .addCase(rejectUser.rejected, (state, action) => {
        state.isRejecting = false;
        state.error = action.payload;
      });

    // Fetch Approval Config
    builder
      .addCase(fetchApprovalConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApprovalConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvalConfig = action.payload;
      })
      .addCase(fetchApprovalConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccessMessage, clearApprovalHistory } =
  approvalSlice.actions;

export default approvalSlice.reducer;
