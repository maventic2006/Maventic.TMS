import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunks for User Management
export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await api.get(`/users`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("❌ fetchUsers error:", error);

      // ✅ CRITICAL: Classify error types to prevent unwanted logout
      
      // Network errors (backend down)
      if (!error.response) {
        return rejectWithValue({
          message: "Unable to connect to server. Please check if the backend is running.",
          code: "NETWORK_ERROR",
          shouldLogout: false, // Don't logout on network errors
        });
      }

      // 404 - Endpoint not found (development scenario)
      if (error.response.status === 404) {
        return rejectWithValue({
          message: "User management endpoint not available. Please ensure backend routes are configured.",
          code: "ENDPOINT_NOT_FOUND",
          shouldLogout: false, // Don't logout on missing endpoints
        });
      }

      // 401 - Authentication error (should logout)
      if (error.response.status === 401) {
        return rejectWithValue({
          message: "Session expired. Please log in again.",
          code: "AUTH_ERROR",
          shouldLogout: true, // Only logout on real auth errors
        });
      }

      // 500 - Server error (don't logout)
      if (error.response.status >= 500) {
        return rejectWithValue({
          message: "Server error. Please try again later.",
          code: "SERVER_ERROR",
          shouldLogout: false,
        });
      }

      // Other errors
      return rejectWithValue({
        message: error.response?.data?.message || error.message || "Failed to fetch users",
        code: "UNKNOWN_ERROR",
        shouldLogout: false,
      });
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.error || "Failed to fetch user details");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch user details",
        }
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/users", userData);

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.error || "Failed to create user");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to create user",
        }
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.error || "Failed to update user");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to update user",
        }
      );
    }
  }
);

export const deactivateUser = createAsyncThunk(
  "user/deactivateUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${userId}/deactivate`);

      if (response.data.success) {
        return { userId, ...response.data };
      } else {
        return rejectWithValue(response.data.error || "Failed to deactivate user");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to deactivate user",
        }
      );
    }
  }
);

export const forceChangePassword = createAsyncThunk(
  "user/forceChangePassword",
  async ({ userId, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/${userId}/force-change-password`, {
        newPassword,
      });

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.error || "Failed to change password");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to change password",
        }
      );
    }
  }
);

export const assignRoles = createAsyncThunk(
  "user/assignRoles",
  async ({ userId, roles }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/${userId}/roles`, roles);

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.error || "Failed to assign roles");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to assign roles",
        }
      );
    }
  }
);

export const fetchUserRoles = createAsyncThunk(
  "user/fetchUserRoles",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}/roles`);

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.error || "Failed to fetch user roles");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch user roles",
        }
      );
    }
  }
);

export const removeRole = createAsyncThunk(
  "user/removeRole",
  async ({ userId, roleId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/${userId}/roles/${roleId}`);

      if (response.data.success) {
        return { userId, roleId, ...response.data };
      } else {
        return rejectWithValue(response.data.error || "Failed to remove role");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to remove role",
        }
      );
    }
  }
);

export const fetchUserTypes = createAsyncThunk(
  "user/fetchUserTypes",
  async (_, { rejectWithValue }) => {
    try {
      // This should fetch from your user type master table
      // For now using a placeholder - adapt to your actual endpoint
      const response = await api.get("/user-types");

      if (response.data.success) {
        return response.data.data;
      } else {
        // Fallback to hardcoded list if API fails
        return [
          { user_type_id: "UT001", user_type_name: "Owner" },
          { user_type_id: "UT002", user_type_name: "Transporter" },
          { user_type_id: "UT006", user_type_name: "Consignor WH" },
          { user_type_id: "UT007", user_type_name: "Driver" },
          { user_type_id: "UT008", user_type_name: "Consignor" },
        ];
      }
    } catch (error) {
      // Return fallback data on error
      return [
        { user_type_id: "UT001", user_type_name: "Owner" },
        { user_type_id: "UT002", user_type_name: "Transporter" },
        { user_type_id: "UT006", user_type_name: "Consignor WH" },
        { user_type_id: "UT007", user_type_name: "Driver" },
        { user_type_id: "UT008", user_type_name: "Consignor" },
      ];
    }
  }
);

export const fetchWarehouses = createAsyncThunk(
  "user/fetchWarehouses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/warehouse");

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.error || "Failed to fetch warehouses");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || {
          code: "NETWORK_ERROR",
          message: "Failed to fetch warehouses",
        }
      );
    }
  }
);

// User slice
const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit: 10,
    },
    isFetching: false,
    error: null,
  },
  reducers: {
    // ✅ Add new reducer for page changes
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    resetPaginationToFirstPage: (state) => {
      state.pagination.currentPage = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isFetching = false;
        state.users = action.payload.data || [];
        state.pagination = {
          currentPage: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
          totalCount: action.payload.total || 0,
          limit: action.payload.size || 25,
        };
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isFetching = false;
        
        // ✅ CRITICAL: Only set error if it's NOT an auth error that should logout
        if (!action.payload?.shouldLogout) {
          state.error = action.payload || { message: "Failed to fetch users" };
        }
        
        // If shouldLogout is true, let the API interceptor handle it
        // Don't set Redux error state to prevent "Error Loading Data" page
      })

      // Fetch User By ID
      .addCase(fetchUserById.pending, (state) => {
        state.isFetchingDetails = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isFetchingDetails = false;
        state.selectedUser = action.payload.data;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isFetchingDetails = false;
        state.error = action.payload;
      })

      // Create User
      .addCase(createUser.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isCreating = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      // Update User
      .addCase(updateUser.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        if (state.selectedUser) {
          state.selectedUser = { ...state.selectedUser, ...action.payload.data };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Deactivate User
      .addCase(deactivateUser.fulfilled, (state, action) => {
        if (state.selectedUser && state.selectedUser.userId === action.payload.userId) {
          state.selectedUser.isActive = false;
          state.selectedUser.status = "INACTIVE";
        }
      })

      // Force Change Password
      .addCase(forceChangePassword.fulfilled, (state) => {
        // No state changes needed, just show toast
      })

      // Assign Roles
      .addCase(assignRoles.pending, (state) => {
        state.isAssigningRoles = true;
        state.error = null;
      })
      .addCase(assignRoles.fulfilled, (state, action) => {
        state.isAssigningRoles = false;
      })
      .addCase(assignRoles.rejected, (state, action) => {
        state.isAssigningRoles = false;
        state.error = action.payload;
      })

      // Fetch User Roles
      .addCase(fetchUserRoles.pending, (state) => {
        state.isFetchingRoles = true;
        state.error = null;
      })
      .addCase(fetchUserRoles.fulfilled, (state, action) => {
        state.isFetchingRoles = false;
        state.userRoles = action.payload.data;
      })
      .addCase(fetchUserRoles.rejected, (state, action) => {
        state.isFetchingRoles = false;
        state.error = action.payload;
      })

      // Remove Role
      .addCase(removeRole.fulfilled, (state, action) => {
        state.userRoles = state.userRoles.filter(
          (role) => role.userRoleId !== action.payload.roleId
        );
      })

      // Fetch User Types
      .addCase(fetchUserTypes.fulfilled, (state, action) => {
        state.userTypes = action.payload;
      })

      // Fetch Warehouses
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.warehouses = action.payload;
      });
  },
});

export const { setCurrentPage, resetPaginationToFirstPage, clearError } = userSlice.actions;

export default userSlice.reducer;
