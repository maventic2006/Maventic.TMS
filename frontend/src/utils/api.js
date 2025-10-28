import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Debug logging (can be removed in production)
if (import.meta.env.NODE_ENV === 'development') {
  console.log("🔧 API Configuration:", {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    API_BASE_URL: API_BASE_URL,
    NODE_ENV: import.meta.env.NODE_ENV
  });
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging
    console.log("🚀 Making API Request:", {
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      method: config.method,
      data: config.data
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
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // For now, redirect to login since refresh endpoint is not implemented
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle different error types
    if (error.response?.status === 403) {
      // Access denied
      console.error("Access denied:", error.response.data.message);
    } else if (error.response?.status >= 500) {
      // Server error
      console.error("Server error:", error.response.data.message);
    } else if (error.code === "ECONNABORTED") {
      // Timeout error
      console.error("Request timeout");
    } else if (!error.response) {
      // Network error
      console.error("🔥 Network error details:", {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      });
    }

    return Promise.reject(error);
  }
);

// Test connectivity on module load
if (typeof window !== 'undefined') {
  api.get('/health')
    .then(() => console.log('✅ Backend connectivity test: SUCCESS'))
    .catch(err => console.error('❌ Backend connectivity test: FAILED', err.message));
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

export default api;
