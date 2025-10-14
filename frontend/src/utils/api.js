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

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

      // For cookie-based auth, only redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
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
    .then(() => console.log("✅ Backend connectivity test: SUCCESS"))
    .catch((err) =>
      console.error("❌ Backend connectivity test: FAILED", err.message)
    );
}

export default api;
