import { Platform, Dimensions, PixelRatio } from "react-native";

/**
 * General helper functions
 */
const helpers = {
  /**
   * Generate unique ID
   * @param {string} prefix - ID prefix
   * @returns {string} Unique ID
   */
  generateId: (prefix = "") => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}${timestamp}_${random}`;
  },

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  debounce: (func, delay = 300) => {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  /**
   * Throttle function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle: (func, limit = 300) => {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Deep clone object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  deepClone: (obj) => {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      console.error("Deep clone error:", error);
      return obj;
    }
  },

  /**
   * Merge objects deeply
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   */
  deepMerge: (target, source) => {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          source[key] &&
          typeof source[key] === "object" &&
          !Array.isArray(source[key])
        ) {
          result[key] = helpers.deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  },

  /**
   * Group array by key
   * @param {Array} array - Array to group
   * @param {string} key - Key to group by
   * @returns {Object} Grouped object
   */
  groupBy: (array, key) => {
    return array.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  },

  /**
   * Sort array by key
   * @param {Array} array - Array to sort
   * @param {string} key - Key to sort by
   * @param {string} order - Order (asc/desc)
   * @returns {Array} Sorted array
   */
  sortBy: (array, key, order = "asc") => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  },

  /**
   * Format phone number
   * @param {string} phone - Phone number
   * @returns {string} Formatted phone number
   */
  formatPhone: (phone) => {
    if (!phone) return "";

    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, "");

    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    } else if (cleaned.length === 11) {
      return `${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(
        4,
        7
      )}-${cleaned.slice(7)}`;
    }

    return phone;
  },

  /**
   * Get random color
   * @param {number} opacity - Opacity (0-1)
   * @returns {string} Random color
   */
  getRandomColor: (opacity = 1) => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }

    if (opacity < 1) {
      const alpha = Math.round(opacity * 255).toString(16);
      return `${color}${alpha}`;
    }

    return color;
  },

  /**
   * Convert object to query string
   * @param {Object} params - Parameters object
   * @returns {string} Query string
   */
  toQueryString: (params) => {
    return Object.keys(params)
      .filter((key) => params[key] !== undefined && params[key] !== null)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
      )
      .join("&");
  },

  /**
   * Parse query string to object
   * @param {string} query - Query string
   * @returns {Object} Parsed object
   */
  parseQueryString: (query) => {
    const params = {};
    const search = query.replace(/^\?/, "");

    if (!search) return params;

    search.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      params[decodeURIComponent(key)] = decodeURIComponent(value || "");
    });

    return params;
  },

  /**
   * Check if object is empty
   * @param {Object} obj - Object to check
   * @returns {boolean} Is empty
   */
  isEmpty: (obj) => {
    if (obj === null || obj === undefined) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    return Object.keys(obj).length === 0;
  },

  /**
   * Pick specific keys from object
   * @param {Object} obj - Source object
   * @param {Array<string>} keys - Keys to pick
   * @returns {Object} New object with picked keys
   */
  pick: (obj, keys) => {
    return keys.reduce((result, key) => {
      if (obj && key in obj) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  },

  /**
   * Omit specific keys from object
   * @param {Object} obj - Source object
   * @param {Array<string>} keys - Keys to omit
   * @returns {Object} New object without omitted keys
   */
  omit: (obj, keys) => {
    const result = { ...obj };
    keys.forEach((key) => delete result[key]);
    return result;
  },

  /**
   * Retry async operation
   * @param {Function} fn - Async function
   * @param {number} maxAttempts - Maximum attempts
   * @param {number} delay - Delay between attempts
   * @returns {Promise<any>} Operation result
   */
  retry: async (fn, maxAttempts = 3, delay = 1000) => {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt}/${maxAttempts} failed`);

        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError;
  },

  /**
   * Get platform-specific value
   * @param {any} ios - iOS value
   * @param {any} android - Android value
   * @param {any} web - Web value
   * @returns {any} Platform-specific value
   */
  platformValue: (ios, android, web = null) => {
    if (Platform.OS === "ios") return ios;
    if (Platform.OS === "android") return android;
    return web || ios || android;
  },

  /**
   * Responsive sizing
   * @param {number} size - Base size
   * @param {number} factor - Scale factor
   * @returns {number} Responsive size
   */
  responsiveSize: (size, factor = 1) => {
    const { width, height } = Dimensions.get("window");
    const baseWidth = 375;
    const baseHeight = 812;

    const widthScale = width / baseWidth;
    const heightScale = height / baseHeight;

    const scale = Math.min(widthScale, heightScale);
    return size * scale * factor;
  },

  /**
   * Copy to clipboard (web)
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success
   */
  copyToClipboard: async (text) => {
    if (Platform.OS === "web") {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.error("Clipboard error:", error);
        return false;
      }
    }
    // For native, you'd use Clipboard module
    // For this example, we're just logging
    console.log("Copy to clipboard:", text);
    return true;
  },

  /**
   * Download file (web)
   * @param {string} url - File URL
   * @param {string} filename - File name
   * @returns {Promise<void>}
   */
  downloadFile: async (url, filename) => {
    if (Platform.OS === "web") {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error("Download error:", error);
        throw error;
      }
    }
    // For native, use FileSystem
    console.log("Download file:", url, filename);
  },
};

export default helpers;
