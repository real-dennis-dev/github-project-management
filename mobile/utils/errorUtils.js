/**
 * Error utility functions
 */
const errorUtils = {
  /**
   * Parse error message from various error types
   * @param {Error|Object|string} error - Error object
   * @param {Object} options - Options
   * @param {boolean} options.showStackTrace - Include stack trace
   * @returns {string} Formatted error message
   */
  parseErrorMessage: (error, options = {}) => {
    if (!error) {
      return "An unknown error occurred";
    }

    // If error is a string
    if (typeof error === "string") {
      return error;
    }

    // Check for common error structures
    if (error.response) {
      // API error
      const { data, status } = error.response;

      if (data && data.message) {
        return data.message;
      }

      if (data && data.errors) {
        // Validation errors
        const errorMessages = Object.values(data.errors).flat();
        return errorMessages.join(", ");
      }

      return `Server error (${status})`;
    }

    if (error.request) {
      // Network error
      return "Network error. Please check your connection.";
    }

    if (error.message) {
      // Standard Error object
      if (options.showStackTrace && error.stack) {
        return `${error.message}\n\n${error.stack}`;
      }
      return error.message;
    }

    if (error.code) {
      // Custom error with code
      return `${error.code}: ${error.message || "Unknown error"}`;
    }

    // Fallback
    return "An unexpected error occurred";
  },

  /**
   * Get error type
   * @param {Error|Object} error - Error object
   * @returns {string} Error type
   */
  getErrorType: (error) => {
    if (!error) return "UNKNOWN";

    if (error.response) {
      const { status } = error.response;
      if (status === 401) return "UNAUTHORIZED";
      if (status === 403) return "FORBIDDEN";
      if (status === 404) return "NOT_FOUND";
      if (status === 422) return "VALIDATION_ERROR";
      if (status >= 500) return "SERVER_ERROR";
      return "CLIENT_ERROR";
    }

    if (error.request) {
      return "NETWORK_ERROR";
    }

    if (error.code === "TIMEOUT" || error.message?.includes("timeout")) {
      return "TIMEOUT";
    }

    return "UNKNOWN";
  },

  /**
   * Handle error and return user-friendly message
   * @param {Error|Object} error - Error object
   * @param {Object} options - Options
   * @param {boolean} options.silent - Don't show error UI
   * @param {Function} options.onError - Custom error handler
   * @returns {Object} Error handling result
   */
  handleError: (error, options = {}) => {
    const { silent = false, onError = null } = options;

    const errorType = errorUtils.getErrorType(error);
    const message = errorUtils.parseErrorMessage(error);

    // Log error
    if (!silent) {
      console.error("[Error]", {
        type: errorType,
        message,
        error,
        timestamp: new Date().toISOString(),
      });
    }

    // Custom error handler
    if (onError && typeof onError === "function") {
      onError({ type: errorType, message, error });
    }

    // Return processed error
    return {
      type: errorType,
      message,
      error,
      userMessage: errorUtils.getUserFriendlyMessage(errorType, message),
    };
  },

  /**
   * Get user-friendly error message
   * @param {string} errorType - Error type
   * @param {string} originalMessage - Original error message
   * @returns {string} User-friendly message
   */
  getUserFriendlyMessage: (errorType, originalMessage) => {
    const messages = {
      NETWORK_ERROR: "Please check your internet connection and try again.",
      UNAUTHORIZED: "Your session has expired. Please login again.",
      FORBIDDEN: "You don't have permission to perform this action.",
      NOT_FOUND: "The requested resource was not found.",
      VALIDATION_ERROR: "Please check the form for errors.",
      SERVER_ERROR:
        "Something went wrong on our servers. Please try again later.",
      TIMEOUT: "Request timed out. Please try again.",
      UNKNOWN: "An unexpected error occurred. Please try again.",
    };

    // Try to return more specific message
    if (
      originalMessage &&
      !originalMessage.includes("error") &&
      !originalMessage.includes("Error")
    ) {
      // If original message seems user-friendly, use it
      return originalMessage;
    }

    return messages[errorType] || messages.UNKNOWN;
  },

  /**
   * Extract validation errors from API response
   * @param {Object} response - API response
   * @returns {Object} Validation errors
   */
  extractValidationErrors: (response) => {
    if (response && response.data && response.data.errors) {
      return response.data.errors;
    }

    if (response && response.errors) {
      return response.errors;
    }

    return null;
  },

  /**
   * Create custom error
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {Object} details - Additional details
   * @returns {Object} Custom error object
   */
  createError: (message, code = "CUSTOM_ERROR", details = {}) => {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    return error;
  },

  /**
   * Format error for logging
   * @param {Error|Object} error - Error object
   * @returns {Object} Formatted error for logging
   */
  formatForLogging: (error) => {
    const errorType = errorUtils.getErrorType(error);
    const message = errorUtils.parseErrorMessage(error);

    return {
      type: errorType,
      message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      context: error?.context || {},
      response: error?.response?.data || null,
      status: error?.response?.status || null,
    };
  },
  /**
   * Check if error is authentication related
   * @param {Error} error - Axios error object
   * @returns {boolean}
   */
  isAuthError: (error) => {
    return error.response?.status === 401 || error.response?.status === 403;
  },

  /**
   * Check if error is network related
   * @param {Error} error - Axios error object
   * @returns {boolean}
   */
  isNetworkError: (error) => {
    return !error.response && error.request;
  },

  /**
   * Create error boundary handler
   * @param {Function} onError - Error handler
   * @returns {Function} Error boundary handler
   */
  createErrorBoundaryHandler: (onError) => {
    return (error, errorInfo) => {
      console.error("Error Boundary:", {
        error,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
      });

      if (onError && typeof onError === "function") {
        onError(error, errorInfo);
      }
    };
  },
};

export default errorUtils;
