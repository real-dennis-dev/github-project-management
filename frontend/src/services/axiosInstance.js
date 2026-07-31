import axios from "axios";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important: Send cookies with requests
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from cookie (handled automatically with withCredentials)
    // No need to manually add token as it's in the cookie
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and not a refresh request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const response = await axiosInstance.post("/auth/refresh-token");

        if (response.data.success) {
          // Retry original request
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - redirect to login
        window.dispatchEvent(new CustomEvent("auth:logout"));
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle logout on other auth errors
    if (
      error.response?.status === 401 &&
      !originalRequest.url.includes("/auth/validate")
    ) {
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
