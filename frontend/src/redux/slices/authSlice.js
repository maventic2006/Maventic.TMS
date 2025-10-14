import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);

      if (response.data.success) {
        const { user, requirePasswordReset } = response.data;
        return { user, requirePasswordReset };
      } else {
        return rejectWithValue(response.data.message || "Login failed");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    // Refresh token endpoint not implemented yet
    // For cookie-based auth, just reject and redirect to login
    return rejectWithValue("Token refresh not implemented");
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/logout");
      // Cookie will be cleared by the server

      if (response.data.success) {
        return {};
      } else {
        return rejectWithValue(response.data.message || "Logout failed");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/verify");

      if (response.data.success) {
        const { user } = response.data;
        return { user };
      } else {
        return rejectWithValue(
          response.data.message || "Token verification failed"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Token verification failed"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ userId, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/reset-password", {
        user_id: userId,
        newPassword: newPassword,
      });

      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(
          response.data.message || "Password reset failed"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset failed"
      );
    }
  }
);

// Simple synchronous role mapping
const mapUserTypeToRole = (userTypeId) => {
  const roleMapping = {
    UT001: "product_owner",
    UT002: "transporter",
    UT003: "transporter",
    UT004: "transporter",
    UT005: "transporter",
    UT006: "consignor",
    UT007: "driver",
    UT008: "consignor",
  };
  return roleMapping[userTypeId] || "user";
};

const initialState = {
  user: null,
  isAuthenticated: false,
  isPasswordReset: false,
  isLoading: true, // Set loading to true to check auth status on app start
  error: null,
  permissions: [],
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      // Role should be set separately via mapUserRole thunk
      state.permissions = user?.permissions || [];
    },
    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isPasswordReset = false;
      state.role = null;
      state.permissions = [];
    },
    setPasswordReset: (state, action) => {
      state.isPasswordReset = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.role = mapUserTypeToRole(action.payload.user?.user_type_id);
        state.permissions = action.payload.user?.permissions || [];
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Refresh Token
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
        state.permissions = [];
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
        state.permissions = [];
      })
      // Verify Token
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.role = mapUserTypeToRole(action.payload.user?.user_type_id);
        state.permissions = action.payload.user?.permissions || [];
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
        state.permissions = [];
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.isPasswordReset = true; // Mark password as reset
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setCredentials,
  clearCredentials,
  setPasswordReset,
} = authSlice.actions;
export default authSlice.reducer;
