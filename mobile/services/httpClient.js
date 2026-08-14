import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../config/apiConfig";

/**
 * HTTP Client with interceptors for authentication and error handling
 * @param {Object} config - Configuration object
 * @param {string} config.baseURL - Base URL for API
 * @param {Object} config.headers - Default headers
 * @param {number} config.timeout - Request timeout in ms
 * @returns {Object} Axios instance with methods
 */
const httpClient = (baseURL = API_CONFIG.baseURL, options = {}) => {
  const instance = axios.create({
    baseURL,
    timeout: options.timeout || API_CONFIG.timeout || 30000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem("@auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Add platform info
        config.headers["X-Platform"] = Platform.OS;
        config.headers["X-App-Version"] = API_CONFIG.appVersion || "1.0.0";
        return config;
      } catch (error) {
        return config;
      }
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle token refresh for 401 errors
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = await AsyncStorage.getItem("@refresh_token");
          if (refreshToken) {
            const response = await axios.post(`${baseURL}/auth/refresh`, {
              refreshToken,
            });
            const { token, refreshToken: newRefreshToken } = response.data;
            await AsyncStorage.setItem("@auth_token", token);
            await AsyncStorage.setItem("@refresh_token", newRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Logout user if refresh fails
          await AsyncStorage.multiRemove([
            "@auth_token",
            "@refresh_token",
            "@user",
          ]);
          // Navigate to login screen (will be handled by navigation context)
        }
      }

      return Promise.reject(error);
    }
  );

  // Wrapper methods with error handling
  const get = (url, params = {}, headers = {}) => {
    return instance.get(url, { params, headers });
  };

  const post = (url, data = {}, headers = {}) => {
    return instance.post(url, data, { headers });
  };

  const put = (url, data = {}, headers = {}) => {
    return instance.put(url, data, { headers });
  };

  const patch = (url, data = {}, headers = {}) => {
    return instance.patch(url, data, { headers });
  };

  const del = (url, params = {}, headers = {}) => {
    return instance.delete(url, { params, headers });
  };

  const request = (config) => {
    return instance.request(config);
  };

  return {
    instance,
    get,
    post,
    put,
    patch,
    delete: del,
    request,
  };
};

// Export a singleton instance with default config
const defaultClient = httpClient();

export default defaultClient;
export { httpClient };
