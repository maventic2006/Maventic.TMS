


//  import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../../utils/api";


// // Async thunks
// export const loginUser = createAsyncThunk(
//   "auth/loginUser",
//   async (credentials, { rejectWithValue }) => {
//     const controller = new AbortController();
//     let timeoutId;


//     try {
//       console.log("📡 Starting login attempt:", {
//         user_id: credentials.user_id,
//       });
//       console.log("🌐 API Base URL:", import.meta.env.VITE_API_BASE_URL);


//       const loginUrl = `${
//         import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
//       }/auth/login`;
//       console.log("🔗 Login URL:", loginUrl);


//       // First, check if backend is reachable with a quick health check
//       console.log("🏥 Checking backend health...");
//       try {
//         const healthCheck = await fetch(
//           loginUrl.replace("/auth/login", "/health"),
//           {
//             method: "GET",
//             signal: AbortSignal.timeout(3000), // 3 second timeout for health check
//           }
//         );
//         console.log("✅ Backend is reachable");
//       } catch (healthError) {
//         console.error("❌ Backend health check failed:", healthError);
//         if (
//           healthError.name === "TimeoutError" ||
//           healthError.name === "AbortError"
//         ) {
//           return rejectWithValue(
//             "Backend server is not responding. Please ensure the server is running on http://localhost:5000"
//           );
//         }
//         // Continue anyway - health endpoint might not exist
//       }


//       console.log("🚀 Making login request...");


//       // Set a longer timeout for actual login (30 seconds)
//       timeoutId = setTimeout(() => {
//         console.warn("⏱️ Login request timeout triggered after 30 seconds");
//         controller.abort();
//       }, 30000);


//       const response = await fetch(loginUrl, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include", // Include cookies
//         body: JSON.stringify(credentials),
//         signal: controller.signal,
//       });


//       // Clear timeout on successful response
//       clearTimeout(timeoutId);


//       console.log("📨 Fetch response received:", {
//         status: response.status,
//         statusText: response.statusText,
//         ok: response.ok,
//       });


//       const data = await response.json();
//       console.log("📦 Response data:", data);


//       if (response.ok && data.success) {
//         const { user, requirePasswordReset } = data;
//         console.log("✅ Login successful for user:", user?.user_id);
//         return { user, requirePasswordReset };
//       } else {
//         console.log("❌ Login failed:", data.message || "Unknown error");
//         return rejectWithValue(data.message || "Login failed");
//       }
//     } catch (error) {
//       // Clear timeout in case of error
//       if (timeoutId) clearTimeout(timeoutId);


//       console.error("🔥 Login error details:", {
//         name: error.name,
//         message: error.message,
//         stack: error.stack,
//       });


//       // Handle different error types
//       if (error.name === "AbortError") {
//         console.error("⏱️ Request was aborted (timeout or cancelled)");
//         return rejectWithValue(
//           "Login request timed out after 30 seconds. The server might be slow or not responding. Please check if the backend is running and try again."
//         );
//       } else if (error.name === "TimeoutError") {
//         console.error("⏱️ Request timed out");
//         return rejectWithValue(
//           "Login request timed out. Please check your network connection and try again."
//         );
//       } else if (
//         error.name === "TypeError" &&
//         (error.message.includes("fetch") ||
//           error.message.includes("Failed to fetch"))
//       ) {
//         console.error("🌐 Network error - cannot reach server");
//         return rejectWithValue(
//           "Cannot connect to server. Please ensure:\n1. Backend server is running (npm start in tms-backend)\n2. Server is on http://localhost:5000\n3. No firewall is blocking the connection"
//         );
//       } else if (error.name === "SyntaxError") {
//         console.error("📄 Invalid JSON response from server");
//         return rejectWithValue(
//           "Server returned invalid response. The backend might be experiencing issues."
//         );
//       }


//       return rejectWithValue(
//         error.message || "Login failed due to an unexpected error"
//       );
//     } finally {
//       // Ensure timeout is always cleared
//       if (timeoutId) clearTimeout(timeoutId);
//     }
//   }
// );


// export const refreshToken = createAsyncThunk(
//   "auth/refreshToken",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await api.post("/auth/refresh");


//       if (response.data.success) {
//         const { user, token } = response.data;


//         // Store new token in sessionStorage for multi-tab access
//         sessionStorage.setItem("authToken", token);


//         return { user, token };
//       } else {
//         return rejectWithValue(response.data.message || "Token refresh failed");
//       }
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Token refresh failed"
//       );
//     }
//   }
// );


// export const logoutUser = createAsyncThunk(
//   "auth/logoutUser",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await api.post("/auth/logout");
//       // Cookie will be cleared by the server


//       if (response.data.success) {
//         return {};
//       } else {
//         return rejectWithValue(response.data.message || "Logout failed");
//       }
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || "Logout failed");
//     }
//   }
// );


// export const verifyToken = createAsyncThunk(
//   "auth/verifyToken",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await api.get("/auth/verify");


//       if (response.data.success) {
//         const { user } = response.data;
//         console.log("✅ Token verification successful:", {
//           user: user?.user_id,
//         });
//         return { user };
//       } else {
//         console.log("❌ Token verification failed:", response.data.message);
//         return rejectWithValue(
//           response.data.message || "Token verification failed"
//         );
//       }
//     } catch (error) {
//       // Handle different error cases
//       if (error.response?.status === 401) {
//         console.log("🔒 No valid authentication token found");
//       } else if (error.response?.status === 403) {
//         console.log("🚫 Authentication token expired or invalid");
//       } else {
//         console.error("❌ Token verification error:", error);
//       }


//       return rejectWithValue(
//         error.response?.data?.message || "Token verification failed"
//       );
//     }
//   }
// );


// export const resetPassword = createAsyncThunk(
//   "auth/resetPassword",
//   async ({ userId, newPassword }, { rejectWithValue }) => {
//     try {
//       const response = await api.post("/auth/reset-password", {
//         user_id: userId,
//         newPassword: newPassword,
//       });


//       if (response.data.success) {
//         return response.data;
//       } else {
//         return rejectWithValue(
//           response.data.message || "Password reset failed"
//         );
//       }
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data?.message || "Password reset failed"
//       );
//     }
//   }
// );


// // Simple synchronous role mapping
// const mapUserTypeToRole = (userTypeId) => {
//   const roleMapping = {
//     UT001: "product_owner",
//     UT002: "transporter",
//     UT003: "transporter",
//     UT004: "transporter",
//     UT005: "transporter",
//     UT006: "consignor",
//     UT007: "driver",
//     UT008: "consignor",
//   };
//   return roleMapping[userTypeId] || "user";
// };


// // Helper functions for localStorage persistence
// const loadAuthFromStorage = () => {
//   try {
//     const authData = localStorage.getItem("tms_auth");
//     if (authData) {
//       const parsed = JSON.parse(authData);
//       console.log("💾 Loaded auth data from localStorage:", {
//         userId: parsed.user?.user_id,
//         role: parsed.role,
//       });
//       return parsed;
//     }
//   } catch (error) {
//     console.error("❌ Error loading auth from localStorage:", error);
//     localStorage.removeItem("tms_auth");
//   }
//   return null;
// };


// const saveAuthToStorage = (user, role, permissions) => {
//   try {
//     const authData = {
//       user,
//       role,
//       permissions,
//       timestamp: new Date().toISOString(),
//     };
//     localStorage.setItem("tms_auth", JSON.stringify(authData));
//     console.log("💾 Saved auth data to localStorage");
//   } catch (error) {
//     console.error("❌ Error saving auth to localStorage:", error);
//   }
// };


// const clearAuthFromStorage = () => {
//   try {
//     localStorage.removeItem("tms_auth");
//     console.log("🗑️ Cleared auth data from localStorage");
//   } catch (error) {
//     console.error("❌ Error clearing auth from localStorage:", error);
//   }
// };


// // Load persisted auth state if available
// const persistedAuth = loadAuthFromStorage();


// const initialState = {
//   user: persistedAuth?.user || null,
//   isAuthenticated: !!persistedAuth?.user,
//   isPasswordReset: false,
//   isLoading: false,
//   error: null,
//   permissions: persistedAuth?.permissions || [],
//   role: persistedAuth?.role || null,
// };


// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     },
//     setCredentials: (state, action) => {
//       const { user } = action.payload;
//       state.user = user;
//       state.isAuthenticated = true;
//       state.permissions = user?.permissions || [];
//       const role = mapUserTypeToRole(user?.user_type_id);
//       state.role = role;
//       // Persist to localStorage
//       saveAuthToStorage(user, role, user?.permissions || []);
//     },
//     clearCredentials: (state) => {
//       state.user = null;
//       state.isAuthenticated = false;
//       state.isPasswordReset = false;
//       state.role = null;
//       state.permissions = [];
//       // Clear from localStorage
//       clearAuthFromStorage();
//     },
//     setAuthInitialized: (state) => {
//       state.isLoading = false;
//     },
//     setPasswordReset: (state, action) => {
//       state.isPasswordReset = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Login
//       .addCase(loginUser.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.user = action.payload.user;
//         state.isAuthenticated = true;
//         const role = mapUserTypeToRole(action.payload.user?.user_type_id);
//         state.role = role;
//         state.permissions = action.payload.user?.permissions || [];
//         // Persist to localStorage
//         saveAuthToStorage(
//           action.payload.user,
//           role,
//           action.payload.user?.permissions || []
//         );
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//         state.isAuthenticated = false;
//       })
//       // Refresh Token
//       .addCase(refreshToken.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(refreshToken.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.user = action.payload.user;
//         state.isAuthenticated = true;
//         const role = mapUserTypeToRole(action.payload.user?.user_type_id);
//         state.role = role;
//         state.permissions = action.payload.user?.permissions || [];
//         // Persist to localStorage
//         saveAuthToStorage(
//           action.payload.user,
//           role,
//           action.payload.user?.permissions || []
//         );
//       })
//       // .addCase(refreshToken.rejected, (state) => {
//       //   state.user = null;
//       //   state.isAuthenticated = false;
//       //   state.role = null;
//       //   state.permissions = [];
//       //   // Clear from localStorage
//       //   clearAuthFromStorage();
//       // })
// // change made here --------------------------------------
//       .addCase(refreshToken.rejected, (state) => {
//     state.isLoading = false;
//     // Do NOT logout here — allow user to retry or login manually
// })

//       // Logout
//       .addCase(logoutUser.fulfilled, (state) => {
//         state.user = null;
//         state.isAuthenticated = false;
//         state.role = null;
//         state.permissions = [];
//         // Clear from localStorage
//         clearAuthFromStorage();
//       })
//       // Verify Token
//       .addCase(verifyToken.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(verifyToken.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.user = action.payload.user;
//         state.isAuthenticated = true;
//         const role = mapUserTypeToRole(action.payload.user?.user_type_id);
//         state.role = role;
//         state.permissions = action.payload.user?.permissions || [];
//         // Persist to localStorage
//         saveAuthToStorage(
//           action.payload.user,
//           role,
//           action.payload.user?.permissions || []
//         );
//       })
//       // .addCase(verifyToken.rejected, (state) => {
//       //   state.isLoading = false;
//       //   state.user = null;
//       //   state.isAuthenticated = false;
//       //   state.role = null;
//       //   state.permissions = [];
//       //   // Clear from localStorage
//       //   clearAuthFromStorage();
//       // })
// /// change made here --------------------------------------
//       .addCase(verifyToken.rejected, (state) => {
//     state.isLoading = false;
//     // DO NOT LOGOUT HERE
//     // Let refreshToken handle token expiration
// })

//       // Reset Password
//       .addCase(resetPassword.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(resetPassword.fulfilled, (state) => {
//         state.isLoading = false;
//         state.error = null;
//         state.isPasswordReset = true; // Mark password as reset
//       })
//       .addCase(resetPassword.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       });
//   },
// });


// export const {
//   clearError,
//   setCredentials,
//   clearCredentials,
//   setPasswordReset,
//   setAuthInitialized,
// } = authSlice.actions;
// export default authSlice.reducer;


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

/* ============================================================
   LOGIN USER
============================================================ */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const loginUrl = `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
      }/auth/login`;

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          user: data.user,
          requirePasswordReset: data.requirePasswordReset || false
        };
      } else {
        return rejectWithValue(data.message || "Login failed");
      }
    } catch (error) {
      return rejectWithValue("Unable to reach server");
    }
  }
);

/* ============================================================
   REFRESH TOKEN
============================================================ */
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/refresh");

      if (res.data.success) {
        const { user, token } = res.data;

        // Store access token in sessionStorage (your existing logic)
        sessionStorage.setItem("authToken", token);

        return { user, token };
      } else {
        return rejectWithValue("Token refresh failed");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Token refresh failed"
      );
    }
  }
);

/* ============================================================
   LOGOUT
============================================================ */
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/logout");
      if (res.data.success) return {};
      return rejectWithValue("Logout failed");
    } catch (error) {
      return rejectWithValue("Logout failed");
    }
  }
);

/* ============================================================
   VERIFY TOKEN (NO LOGOUT ON FAILURE)
============================================================ */
export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/verify");

      if (res.data.success) {
        return { user: res.data.user };
      } else {
        return rejectWithValue("Token verification failed");
      }
    } catch (error) {
      return rejectWithValue("Token verification failed");
    }
  }
);

/* ============================================================
   RESET PASSWORD
============================================================ */
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ userId, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/reset-password", {
        user_id: userId,
        newPassword
      });

      if (response.data.success) return response.data;

      return rejectWithValue("Password reset failed");
    } catch (error) {
      return rejectWithValue("Password reset failed");
    }
  }
);

/* ============================================================
   ROLE MAPPING
============================================================ */
const mapUserTypeToRole = (id) => {
  const roleMapping = {
    UT001: "product_owner",
    UT002: "transporter", 
    UT003: "transporter",
    UT004: "transporter",
    UT005: "transporter",
    UT006: "consignor",
    UT007: "driver",
    UT008: "consignor",
    // Special user ID mappings
    PO001: "product_owner",
    admin: "product_owner",
  };
  
  // Handle user IDs that start with specific prefixes
  if (id && typeof id === 'string') {
    if (id.toLowerCase().startsWith('po')) {
      return "product_owner";
    }
    if (id.toLowerCase().includes('admin')) {
      return "product_owner";
    }
    if (id.toLowerCase().includes('test')) {
      return "product_owner";
    }
  }
  
  return roleMapping[id] || "product_owner"; // Default to product_owner for development
};

/* ============================================================
   LOCAL STORAGE HELPERS
============================================================ */
const loadAuthFromStorage = () => {
  try {
    const raw = localStorage.getItem("tms_auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem("tms_auth");
    return null;
  }
};

const saveAuthToStorage = (user, role, permissions) => {
  try {
    localStorage.setItem(
      "tms_auth",
      JSON.stringify({ user, role, permissions, timestamp: new Date().toISOString() })
    );
  } catch {}
};

const clearAuthFromStorage = () => {
  localStorage.removeItem("tms_auth");
};

/* ============================================================
   INITIAL STATE
============================================================ */
const persisted = loadAuthFromStorage();

const initialState = {
  user: persisted?.user || null,
  isAuthenticated: !!persisted?.user,
  isPasswordReset: false,
  isLoading: false,
  error: null,
  permissions: persisted?.permissions || [],
  role: persisted?.role || null,
};

/* ============================================================
   SLICE
============================================================ */
const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearError: (state) => { state.error = null; },

    setCredentials: (state, action) => {
      const { user } = action.payload;
      const role = mapUserTypeToRole(user?.user_type_id);

      state.user = user;
      state.isAuthenticated = true;
      state.role = role;
      state.permissions = user?.permissions || [];

      saveAuthToStorage(user, role, state.permissions);
    },

    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isPasswordReset = false;
      state.role = null;
      state.permissions = [];
      clearAuthFromStorage();
    },

    setAuthInitialized: (state) => { state.isLoading = false; },

    setPasswordReset: (state, action) => {
      state.isPasswordReset = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder
      /* LOGIN */
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;

        const { user } = action.payload;
        const role = mapUserTypeToRole(user?.user_type_id);

        state.user = user;
        state.isAuthenticated = true;
        state.role = role;
        state.permissions = user?.permissions || [];

        saveAuthToStorage(user, role, state.permissions);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      /* REFRESH TOKEN */
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = false; // DO NOT BLOCK UI
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        const { user } = action.payload;

        const role = mapUserTypeToRole(user?.user_type_id);

        state.user = user;
        state.isAuthenticated = true;
        state.role = role;
        state.permissions = user?.permissions || [];

        saveAuthToStorage(user, role, state.permissions);
      })
      .addCase(refreshToken.rejected, (state) => {
        // DO NOT LOGOUT — allows user to continue browsing login page safely
        state.isLoading = false;
      })

      /* VERIFY TOKEN */
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;

        const { user } = action.payload;
        const role = mapUserTypeToRole(user?.user_type_id);

        state.user = user;
        state.isAuthenticated = true;
        state.role = role;
        state.permissions = user?.permissions || [];

        saveAuthToStorage(user, role, state.permissions);
      })
      .addCase(verifyToken.rejected, (state) => {
        // Important: Do NOT clear state
        state.isLoading = false;
      })

      /* RESET PASSWORD */
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isPasswordReset = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      /* LOGOUT */
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isPasswordReset = false;
        state.role = null;
        state.permissions = [];
        clearAuthFromStorage();
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        // Even if logout fails on server, clear local state
        state.user = null;
        state.isAuthenticated = false;
        state.isPasswordReset = false;
        state.role = null;
        state.permissions = [];
        clearAuthFromStorage();
      });
  },
});

export const {
  clearError,
  setCredentials,
  clearCredentials,
  setPasswordReset,
  setAuthInitialized
} = authSlice.actions;

export default authSlice.reducer;

