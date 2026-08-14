import { useState, useEffect, useCallback, useRef } from "react";
import apiService from "../services/apiService";

/**
 * Custom hook for making API calls with loading, error, and data states
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Configuration options
 * @param {string} options.method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {Object} options.params - URL parameters
 * @param {Object} options.headers - Custom headers
 * @param {boolean} options.immediate - Execute immediately
 * @param {any} options.initialData - Initial data value
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {Array} options.dependencies - Dependencies for useEffect
 * @returns {Object} { data, loading, error, refetch, setData, execute }
 */
const useApi = (endpoint, options = {}) => {
  const {
    method = "GET",
    params = null,
    headers = {},
    immediate = true,
    initialData = null,
    onSuccess = null,
    onError = null,
    dependencies = [],
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = useCallback(
    async (requestData = null, requestParams = null) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService(
          endpoint,
          method,
          requestData || null,
          requestParams || params || null,
          headers,
          {}
        );

        if (isMounted.current) {
          setData(response.data);
          if (onSuccess) {
            onSuccess(response.data);
          }
          return response.data;
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err.message || "An error occurred");
          if (onError) {
            onError(err);
          }
          throw err;
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [endpoint, method, params, headers, onSuccess, onError]
  );

  const refetch = useCallback(
    (newParams = null) => {
      return execute(null, newParams || params);
    },
    [execute, params]
  );

  // Execute immediately if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, method, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    setData,
    execute,
  };
};

export default useApi;
