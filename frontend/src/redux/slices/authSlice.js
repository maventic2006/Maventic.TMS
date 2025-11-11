import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    const controller = new AbortController();
    let timeoutId;

    try {
      console.log("📡 Starting login attempt:", {
        user_id: credentials.user_id,
      });
      console.log("🌐 API Base URL:", import.meta.env.VITE_API_BASE_URL);

      const loginUrl = `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
      }/auth/login`;
      console.log("🔗 Login URL:", loginUrl);

      // First, check if backend is reachable with a quick health check
      console.log("🏥 Checking backend health...");
      try {
        const healthCheck = await fetch(
          loginUrl.replace("/auth/login", "/health"),
          {
            method: "GET",
            signal: AbortSignal.timeout(3000), // 3 second timeout for health check
          }
        );
        console.log("✅ Backend is reachable");
      } catch (healthError) {
        console.error("❌ Backend health check failed:", healthError);
        if (
          healthError.name === "TimeoutError" ||
          healthError.name === "AbortError"
        ) {
          return rejectWithValue(
            "Backend server is not responding. Please ensure the server is running on http://localhost:5000"
          );
        }
        // Continue anyway - health endpoint might not exist
      }

      console.log("🚀 Making login request...");

      // Set a longer timeout for actual login (30 seconds)
      timeoutId = setTimeout(() => {
        console.warn("⏱️ Login request timeout triggered after 30 seconds");
        controller.abort();
      }, 30000);

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify(credentials),
        signal: controller.signal,
      });

      // Clear timeout on successful response
      clearTimeout(timeoutId);

      console.log("📨 Fetch response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      const data = await response.json();
      console.log("📦 Response data:", data);

      if (response.ok && data.success) {
        const { user, requirePasswordReset } = data;
        console.log("✅ Login successful for user:", user?.user_id);
        return { user, requirePasswordReset };
      } else {
        console.log("❌ Login failed:", data.message || "Unknown error");
        return rejectWithValue(data.message || "Login failed");
      }
    } catch (error) {
      // Clear timeout in case of error
      if (timeoutId) clearTimeout(timeoutId);

      console.error("🔥 Login error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      // Handle different error types
      if (error.name === "AbortError") {
        console.error("⏱️ Request was aborted (timeout or cancelled)");
        return rejectWithValue(
          "Login request timed out after 30 seconds. The server might be slow or not responding. Please check if the backend is running and try again."
        );
      } else if (error.name === "TimeoutError") {
        console.error("⏱️ Request timed out");
        return rejectWithValue(
          "Login request timed out. Please check your network connection and try again."
        );
      } else if (
        error.name === "TypeError" &&
        (error.message.includes("fetch") ||
          error.message.includes("Failed to fetch"))
      ) {
        console.error("🌐 Network error - cannot reach server");
        return rejectWithValue(
          "Cannot connect to server. Please ensure:\n1. Backend server is running (npm start in tms-backend)\n2. Server is on http://localhost:5000\n3. No firewall is blocking the connection"
        );
      } else if (error.name === "SyntaxError") {
        console.error("📄 Invalid JSON response from server");
        return rejectWithValue(
          "Server returned invalid response. The backend might be experiencing issues."
        );
      }

      return rejectWithValue(
        error.message || "Login failed due to an unexpected error"
      );
    } finally {
      // Ensure timeout is always cleared
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/refresh");

      if (response.data.success) {
        const { user, token } = response.data;

        // Store new token in sessionStorage for multi-tab access
        sessionStorage.setItem("authToken", token);

        return { user, token };
      } else {
        return rejectWithValue(response.data.message || "Token refresh failed");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Token refresh failed"
      );
    }
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
        console.log("✅ Token verification successful:", {
          user: user?.user_id,
        });
        return { user };
      } else {
        console.log("❌ Token verification failed:", response.data.message);
        return rejectWithValue(
          response.data.message || "Token verification failed"
        );
      }
    } catch (error) {
      // Handle different error cases
      if (error.response?.status === 401) {
        console.log("🔒 No valid authentication token found");
      } else if (error.response?.status === 403) {
        console.log("🚫 Authentication token expired or invalid");
      } else {
        console.error("❌ Token verification error:", error);
      }

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

// Helper functions for localStorage persistence
const loadAuthFromStorage = () => {
  try {
    const authData = localStorage.getItem("tms_auth");
    if (authData) {
      const parsed = JSON.parse(authData);
      console.log("💾 Loaded auth data from localStorage:", {
        userId: parsed.user?.user_id,
        role: parsed.role,
      });
      return parsed;
    }
  } catch (error) {
    console.error("❌ Error loading auth from localStorage:", error);
    localStorage.removeItem("tms_auth");
  }
  return null;
};

const saveAuthToStorage = (user, role, permissions) => {
  try {
    const authData = {
      user,
      role,
      permissions,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("tms_auth", JSON.stringify(authData));
    console.log("💾 Saved auth data to localStorage");
  } catch (error) {
    console.error("❌ Error saving auth to localStorage:", error);
  }
};

const clearAuthFromStorage = () => {
  try {
    localStorage.removeItem("tms_auth");
    console.log("🗑️ Cleared auth data from localStorage");
  } catch (error) {
    console.error("❌ Error clearing auth from localStorage:", error);
  }
};

// Load persisted auth state if available
const persistedAuth = loadAuthFromStorage();

const initialState = {
  user: persistedAuth?.user || null,
  isAuthenticated: !!persistedAuth?.user,
  isPasswordReset: false,
  isLoading: false,
  error: null,
  permissions: persistedAuth?.permissions || [],
  role: persistedAuth?.role || null,
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
      state.permissions = user?.permissions || [];
      const role = mapUserTypeToRole(user?.user_type_id);
      state.role = role;
      // Persist to localStorage
      saveAuthToStorage(user, role, user?.permissions || []);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isPasswordReset = false;
      state.role = null;
      state.permissions = [];
      // Clear from localStorage
      clearAuthFromStorage();
    },
    setAuthInitialized: (state) => {
      state.isLoading = false;
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
        const role = mapUserTypeToRole(action.payload.user?.user_type_id);
        state.role = role;
        state.permissions = action.payload.user?.permissions || [];
        // Persist to localStorage
        saveAuthToStorage(
          action.payload.user,
          role,
          action.payload.user?.permissions || []
        );
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        const role = mapUserTypeToRole(action.payload.user?.user_type_id);
        state.role = role;
        state.permissions = action.payload.user?.permissions || [];
        // Persist to localStorage
        saveAuthToStorage(
          action.payload.user,
          role,
          action.payload.user?.permissions || []
        );
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
        state.permissions = [];
        // Clear from localStorage
        clearAuthFromStorage();
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
        state.permissions = [];
        // Clear from localStorage
        clearAuthFromStorage();
      })
      // Verify Token
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        const role = mapUserTypeToRole(action.payload.user?.user_type_id);
        state.role = role;
        state.permissions = action.payload.user?.permissions || [];
        // Persist to localStorage
        saveAuthToStorage(
          action.payload.user,
          role,
          action.payload.user?.permissions || []
        );
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.role = null;
        state.permissions = [];
        // Clear from localStorage
        clearAuthFromStorage();
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
  setAuthInitialized,
} = authSlice.actions;
export default authSlice.reducer;
