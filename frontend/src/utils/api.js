import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Debug logging (can be removed in production)
if (import.meta.env.NODE_ENV === "development") {
  console.log("🔧 API Configuration:", {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    API_BASE_URL: API_BASE_URL,
    NODE_ENV: import.meta.env.NODE_ENV,
  });
}

/**
 * IMPORTANT: API Endpoint Usage Guidelines
 *
 * The base URL is already set to "http://localhost:5000/api"
 *
 * ✅ CORRECT usage:
 * - api.get("/transporter")           → http://localhost:5000/api/transporter
 * - api.get("/auth/login")           → http://localhost:5000/api/auth/login
 * - api.post("/users")               → http://localhost:5000/api/users
 *
 * ❌ INCORRECT usage (will cause 404 errors):
 * - api.get("/api/transporter")      → http://localhost:5000/api/api/transporter
 * - api.get("/api/auth/login")       → http://localhost:5000/api/api/auth/login
 *
 * Always use relative paths without the "/api" prefix!
 */

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds (increased from 10s for file uploads and bulk operations)
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Debug logging
    console.log("🚀 Making API Request:", {
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      method: config.method,
      data: config.data,
    });

    return config;
  },
  (error) => {
    console.error("🔥 Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't log 401 errors for auth verification - they're expected
      if (!originalRequest.url?.includes("/auth/verify")) {
        console.log("🔒 Authentication required - redirecting to login");
        // For cookie-based auth, redirect to login if not already there
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }

    // Handle different error types
    if (error.response?.status === 403) {
      // Access denied
      console.error("Access denied:", error.response.data.message);
    } else if (error.response?.status >= 500) {
      // Server error
      console.error("Server error:", error.response.data.message);
    } else if (error.code === "ECONNABORTED" || error.message?.includes('timeout')) {
      // Timeout error - provide helpful message
      console.error("⏱️ Request timeout error:", {
        url: error.config?.url,
        timeout: error.config?.timeout || 'default (30s)',
        message: error.message,
        suggestion: 'The request took too long. For file uploads, this may indicate a large file or slow network.'
      });
    } else if (!error.response) {
      // Network error
      console.error("🔥 Network error details:", {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
        },
      });
    }

    return Promise.reject(error);
  }
);

// Test connectivity on module load
if (typeof window !== "undefined") {
  api
    .get("/health")
    .then(() => {
      console.log("✅ Backend connectivity test: SUCCESS");

      // Add a global test function for debugging
      window.debugLogin = async (
        credentials = { user_id: "POWNER001", password: "Powner@123" }
      ) => {
        try {
          console.log("🧪 Debug login test started:", credentials);
          const response = await api.post("/auth/login", credentials);
          console.log("✅ Debug login success:", response.data);
          return response.data;
        } catch (error) {
          console.error("❌ Debug login failed:", error);
          return { error: error.message };
        }
      };
    })
    .catch((err) =>
      console.error("❌ Backend connectivity test: FAILED", err.message)
    );
}

// Transporter API functions
export const transporterAPI = {
  // Get all transporters with filtering and pagination
  getTransporters: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add parameters if they exist
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.transporterId) queryParams.append('transporterId', params.transporterId);
    if (params.status) queryParams.append('status', params.status);
    if (params.transportMode) {
      if (Array.isArray(params.transportMode)) {
        queryParams.append('transportMode', params.transportMode.join(','));
      } else {
        queryParams.append('transportMode', params.transportMode);
      }
    }
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = `/transporters${queryString ? `?${queryString}` : ''}`;
    
    return api.get(url);
  },
  
  // Get single transporter by ID
  getTransporterById: (id) => {
    return api.get(`/transporters/${id}`);
  },

  // Alias for getTransporterById (used in TransporterDetails component)
  getTransporter: (id) => {
    return api.get(`/transporters/${id}`);
  }
};

// Vehicle API functions
export const vehicleAPI = {
  // Get all vehicles with filtering and pagination
  getVehicles: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add parameters if they exist
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.vehicleType) queryParams.append('vehicleType', params.vehicleType);
    if (params.status) queryParams.append('status', params.status);
    if (params.fuelType) queryParams.append('fuelType', params.fuelType);
    if (params.ownership) queryParams.append('ownership', params.ownership);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = `/vehicles${queryString ? `?${queryString}` : ''}`;
    
    return api.get(url);
  },
  
  // Get single vehicle by ID
  getVehicleById: (id) => {
    return api.get(`/vehicles/${id}`);
  },

  // Create new vehicle
  createVehicle: (vehicleData) => {
    return api.post('/vehicles', vehicleData);
  },

  // Update existing vehicle
  updateVehicle: (id, vehicleData) => {
    return api.put(`/vehicles/${id}`, vehicleData);
  },

  // Delete vehicle (soft delete)
  deleteVehicle: (id) => {
    return api.delete(`/vehicles/${id}`);
  },

  // Get master data for dropdowns
  getMasterData: () => {
    return api.get('/vehicles/master-data');
  }
};

export default api;
