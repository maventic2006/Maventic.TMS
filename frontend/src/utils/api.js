import axios from "axios";
import store from "../redux/store";
import { logoutUser } from "../redux/slices/authSlice";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

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
  timeout: 30000, // 30 seconds default
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Create a separate instance for file uploads with longer timeout
export const createFileUploadAPI = (timeoutMs = 120000) => {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: timeoutMs, // 2 minutes for file uploads by default
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

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

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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
  (error) => {
    console.log("🔍 API Interceptor - Error caught:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });

    // ✅ CRITICAL: Skip auto-logout for specific endpoints during development
    const developmentEndpoints = ["/users", "/user-management"];
    const isDevEndpoint = developmentEndpoints.some((endpoint) =>
      error.config?.url?.includes(endpoint)
    );

    // ✅ Skip auto-logout for:
    // 1. Network errors (no response)
    // 2. 404 errors (endpoint not found)
    // 3. Development endpoints (user management)
    // 4. Server errors (5xx)
    const shouldSkipLogout =
      !error.response ||
      error.response.status === 404 ||
      error.response.status >= 500 ||
      isDevEndpoint;

    // Only trigger logout for real 401 authentication errors on production endpoints
    if (error.response?.status === 401 && !shouldSkipLogout) {
      console.log(
        "🚪 API Interceptor - Triggering logout (401 on production endpoint)"
      );
      store.dispatch(logoutUser());
    } else if (error.response?.status === 401 && shouldSkipLogout) {
      console.log(
        "⚠️ API Interceptor - Skipping logout (401 on development endpoint)"
      );
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
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.search) queryParams.append("search", params.search);
    if (params.transporterId)
      queryParams.append("transporterId", params.transporterId);
    if (params.status) queryParams.append("status", params.status);
    if (params.transportMode) {
      if (Array.isArray(params.transportMode)) {
        queryParams.append("transportMode", params.transportMode.join(","));
      } else {
        queryParams.append("transportMode", params.transportMode);
      }
    }
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const url = `/transporters${queryString ? `?${queryString}` : ""}`;

    return api.get(url);
  },

  // Get single transporter by ID
  getTransporterById: (id) => {
    return api.get(`/transporters/${id}`);
  },

  // Alias for getTransporterById (used in TransporterDetails component)
  getTransporter: (id) => {
    return api.get(`/transporters/${id}`);
  },
};

// Vehicle API functions
export const vehicleAPI = {
  // Get all vehicles with filtering and pagination
  getVehicles: (params = {}) => {
    const queryParams = new URLSearchParams();

    // Add parameters if they exist
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.search) queryParams.append("search", params.search);

    // Basic filters
    if (params.registrationNumber)
      queryParams.append("registrationNumber", params.registrationNumber);
    if (params.vehicleType)
      queryParams.append("vehicleType", params.vehicleType);
    if (params.make) queryParams.append("make", params.make);
    if (params.model) queryParams.append("model", params.model);
    if (params.yearFrom) queryParams.append("yearFrom", params.yearFrom);
    if (params.yearTo) queryParams.append("yearTo", params.yearTo);
    if (params.status) queryParams.append("status", params.status);
    if (params.registrationState)
      queryParams.append("registrationState", params.registrationState);
    if (params.fuelType) queryParams.append("fuelType", params.fuelType);
    if (params.leasingFlag)
      queryParams.append("leasingFlag", params.leasingFlag);
    if (params.gpsEnabled) queryParams.append("gpsEnabled", params.gpsEnabled);
    if (params.ownership) queryParams.append("ownership", params.ownership);
    if (params.vehicleCondition)
      queryParams.append("vehicleCondition", params.vehicleCondition);
    if (params.engineType) queryParams.append("engineType", params.engineType);
    if (params.emissionStandard)
      queryParams.append("emissionStandard", params.emissionStandard);
    if (params.bodyType) queryParams.append("bodyType", params.bodyType);
    if (params.towingCapacityMin)
      queryParams.append("towingCapacityMin", params.towingCapacityMin);
    if (params.towingCapacityMax)
      queryParams.append("towingCapacityMax", params.towingCapacityMax);

    // Date filters
    if (params.createdOnStart)
      queryParams.append("createdOnStart", params.createdOnStart);
    if (params.createdOnEnd)
      queryParams.append("createdOnEnd", params.createdOnEnd);

    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const url = `/vehicles${queryString ? `?${queryString}` : ""}`;

    return api.get(url);
  },

  // Get single vehicle by ID
  getVehicleById: (id) => {
    return api.get(`/vehicles/${id}`);
  },

  // Create new vehicle
  createVehicle: (vehicleData) => {
    return api.post("/vehicles", vehicleData);
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
    return api.get("/vehicles/master-data");
  },

  // RC Lookup API - Get vehicle details by registration number
  lookupVehicleByRC: (registrationNumber) => {
    return api.get(
      `/vehicles/rc-lookup/${encodeURIComponent(registrationNumber)}`
    );
  },

  // ==================== DRAFT WORKFLOW ENDPOINTS ====================

  // Save vehicle as draft (minimal validation)
  saveVehicleAsDraft: (vehicleData) => {
    return api.post("/vehicles/save-draft", vehicleData);
  },

  // Update existing vehicle draft (no validation)
  updateVehicleDraft: (id, vehicleData) => {
    return api.put(`/vehicles/${id}/update-draft`, vehicleData);
  },

  // Submit vehicle draft for approval (full validation, DRAFT → PENDING)
  submitVehicleDraft: (id, vehicleData) => {
    return api.put(`/vehicles/${id}/submit-draft`, vehicleData);
  },

  // Delete vehicle draft (hard delete)
  deleteVehicleDraft: (id) => {
    return api.delete(`/vehicles/${id}/delete-draft`);
  },
};

export default api;
