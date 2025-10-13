import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { mapUserTypeToRole } from "../../utils/constants";

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      
      if (response.data.success) {
        const { token, user, requirePasswordReset } = response.data;
        localStorage.setItem("token", token);
        return { token, user, requirePasswordReset };
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
    // For now, just reject and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    return rejectWithValue("Token refresh not implemented");
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/logout");
      localStorage.removeItem("token");
      
      if (response.data.success) {
        return {};
      } else {
        return rejectWithValue(response.data.message || "Logout failed");
      }
    } catch (error) {
      localStorage.removeItem("token");
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("No token found");
      }
      
      const response = await api.get("/auth/verify");
      
      if (response.data.success) {
        return { user: response.data.user, token };
      } else {
        localStorage.removeItem("token");
        return rejectWithValue(response.data.message || "Token verification failed");
      }
    } catch (error) {
      localStorage.removeItem("token");
      return rejectWithValue(error.response?.data?.message || "Token verification failed");
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
        return rejectWithValue(response.data.message || "Password reset failed");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset failed"
      );
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false, // Will be set to true after token verification
  isPasswordReset: false, // Flag to track if user has reset their password
  isLoading: !!localStorage.getItem("token"), // Set loading if token exists to prevent premature routing
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
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      state.role = mapUserTypeToRole(user?.user_type_id);
      state.permissions = user?.permissions || [];
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
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
        state.token = action.payload.token;
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
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
        state.permissions = [];
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
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
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.role = mapUserTypeToRole(action.payload.user?.user_type_id);
        state.permissions = action.payload.user?.permissions || [];
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
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

export const { clearError, setCredentials, clearCredentials, setPasswordReset } =
  authSlice.actions;
export default authSlice.reducer;
