// services/httpClient.js
import axios from "axios";
import { Platform } from "react-native";
import authStore from "./authStore";

/**
 * HTTP Client with cookie and auth support
 * @param {Object} config - { baseURL, headers, timeout }
 * @returns {Object} axios instance with interceptors
 */
const httpClient = (baseURL, options = {}) => {
  const instance = axios.create({
    baseURL,
    timeout: options.timeout || 30000,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    withCredentials: true, // Important for cookies
  });

  // Request interceptor - Add auth token
  instance.interceptors.request.use(
    async (config) => {
      // For mobile apps, we might need to manually add token
      // if cookies aren't automatically handled
      if (Platform.OS !== "web") {
        const authData = await authStore.getAuthData();
        if (authData?.tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${authData.tokens.accessToken}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Handle token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If unauthorized and we haven't tried refreshing yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh token
          const authData = await authStore.getAuthData();
          if (authData?.tokens?.refreshToken) {
            // Call refresh endpoint (your backend should handle this)
            const response = await instance.post("/api/auth/refresh-token");

            // Update stored tokens
            if (response.data.success) {
              authData.tokens = response.data.data.tokens;
              await authStore.saveAuthData(authData);

              // Retry original request
              return instance(originalRequest);
            }
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          await authStore.clearAuthData();
          // You might want to trigger a logout event here
        }
      }

      return Promise.reject(error);
    }
  );

  return {
    get: (url, config) => instance.get(url, config),
    post: (url, data, config) => instance.post(url, data, config),
    put: (url, data, config) => instance.put(url, data, config),
    patch: (url, data, config) => instance.patch(url, data, config),
    delete: (url, config) => instance.delete(url, config),
    request: (config) => instance.request(config),
  };
};

export default httpClient;
