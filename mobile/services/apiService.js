import defaultClient from "./httpClient";
import { API_CONFIG } from "../config/apiConfig";

/**
 * API Service wrapper for consistent API calls
 * @param {string} endpoint - API endpoint (e.g., '/users')
 * @param {string} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {Object} data - Request body data
 * @param {Object} params - URL parameters
 * @param {Object} headers - Custom headers
 * @param {Object} options - Additional options
 * @returns {Promise<{ data: any, status: number, message: string, pagination: Object, metadata: Object }>}
 */
const apiService = async (
  endpoint,
  method = "GET",
  data = null,
  params = null,
  headers = {},
  options = {}
) => {
  try {
    const { client = defaultClient, timeout, retries = 0 } = options;

    // Build full URL with query params
    let url = endpoint;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url = `${endpoint}${queryString ? `?${queryString}` : ""}`;
    }

    // Make the request
    const response = await client.request({
      url,
      method,
      data,
      headers,
      timeout,
    });

    // Check if response is successful
    if (response.status >= 200 && response.status < 300) {
      // Extract pagination from headers or response
      const pagination = extractPagination(response);
      const metadata = extractMetadata(response);

      return {
        data: response.data.data || response.data,
        status: response.status,
        message: response.data.message || "Success",
        pagination,
        metadata,
        headers: response.headers,
      };
    }

    // Handle non-success responses
    throw new Error(response.data.message || "Request failed");
  } catch (error) {
    // Handle network errors
    if (error.code === "ECONNABORTED") {
      throw {
        message: "Request timed out. Please try again.",
        status: 408,
        code: "TIMEOUT",
      };
    }

    if (!error.response) {
      throw {
        message: "Network error. Please check your connection.",
        status: 0,
        code: "NETWORK_ERROR",
      };
    }

    // Handle API errors
    const errorResponse = error.response;
    throw {
      message: errorResponse.data.message || "An error occurred",
      status: errorResponse.status,
      data: errorResponse.data,
      code: errorResponse.data.code,
    };
  }
};

/**
 * Extract pagination data from response
 */
const extractPagination = (response) => {
  // Check for pagination in headers
  const total =
    parseInt(
      response.headers["x-total-count"] || response.headers["x-total"]
    ) || 0;
  const page = parseInt(response.headers["x-page"]) || 1;
  const limit =
    parseInt(response.headers["x-per-page"] || response.headers["x-limit"]) ||
    10;
  const totalPages =
    parseInt(response.headers["x-total-pages"]) || Math.ceil(total / limit);

  // Check for pagination in response body
  if (response.data.pagination) {
    return response.data.pagination;
  }

  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
};

/**
 * Extract metadata from response
 */
const extractMetadata = (response) => {
  if (response.data.metadata) {
    return response.data.metadata;
  }
  return {
    timestamp: new Date().toISOString(),
    version:
      response.headers["x-api-version"] || API_CONFIG.appVersion || "1.0.0",
  };
};

// Convenience methods
const api = {
  get: (endpoint, params = null, headers = {}, options = {}) =>
    apiService(endpoint, "GET", null, params, headers, options),

  post: (endpoint, data = null, headers = {}, options = {}) =>
    apiService(endpoint, "POST", data, null, headers, options),

  put: (endpoint, data = null, headers = {}, options = {}) =>
    apiService(endpoint, "PUT", data, null, headers, options),

  patch: (endpoint, data = null, headers = {}, options = {}) =>
    apiService(endpoint, "PATCH", data, null, headers, options),

  delete: (endpoint, params = null, headers = {}, options = {}) =>
    apiService(endpoint, "DELETE", null, params, headers, options),
};

export default api;
export { apiService };
