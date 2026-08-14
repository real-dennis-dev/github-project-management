/**
 * Format utilities
 */
const formatUtils = {
  /**
   * Truncate string to specified length
   * @param {string} str - String to truncate
   * @param {number} length - Maximum length
   * @param {string} suffix - Suffix to add (default: '...')
   * @returns {string}
   */
  truncateString: (str, length = 50, suffix = "...") => {
    if (!str) return "";
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },

  /**
   * Create URL slug from string
   * @param {string} str - String to slugify
   * @returns {string}
   */
  slugify: (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  /**
   * Capitalize string
   * @param {string} str - String to capitalize
   * @param {boolean} allWords - Capitalize all words (default: false)
   * @returns {string}
   */
  capitalize: (str, allWords = false) => {
    if (!str) return "";
    if (allWords) {
      return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: 'USD')
   * @param {string} locale - Locale (default: 'en-US')
   * @returns {string}
   */
  formatCurrency: (amount, currency = "USD", locale = "en-US") => {
    if (amount === null || amount === undefined) return "";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Format percentage
   * @param {number} value - Value to format
   * @param {number} decimalPlaces - Number of decimal places (default: 1)
   * @returns {string}
   */
  formatPercentage: (value, decimalPlaces = 1) => {
    if (value === null || value === undefined) return "";
    return `${value.toFixed(decimalPlaces)}%`;
  },

  /**
   * Extract text from HTML
   * @param {string} html - HTML string
   * @returns {string}
   */
  extractTextFromHTML: (html) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();
  },

  /**
   * Format number with commas
   * @param {number} number - Number to format
   * @param {string} locale - Locale (default: 'en-US')
   * @returns {string}
   */
  formatNumber: (number, locale = "en-US") => {
    if (number === null || number === undefined) return "";
    return new Intl.NumberFormat(locale).format(number);
  },

  /**
   * Format file size
   * @param {number} bytes - File size in bytes
   * @param {number} decimalPlaces - Number of decimal places (default: 1)
   * @returns {string}
   */
  formatFileSize: (bytes, decimalPlaces = 1) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = (bytes / Math.pow(k, i)).toFixed(decimalPlaces);
    return `${value} ${sizes[i]}`;
  },

  /**
   * Format phone number
   * @param {string} phone - Phone number
   * @param {string} format - Format pattern (default: '(XXX) XXX-XXXX')
   * @returns {string}
   */
  formatPhone: (phone, format = "(XXX) XXX-XXXX") => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    let result = format;
    let digitIndex = 0;

    for (let i = 0; i < result.length; i++) {
      if (result[i] === "X") {
        if (digitIndex < digits.length) {
          result =
            result.substring(0, i) +
            digits[digitIndex] +
            result.substring(i + 1);
          digitIndex++;
        } else {
          result = result.substring(0, i) + result.substring(i + 1);
          i--;
        }
      }
    }

    return result;
  },

  /**
   * Format compact number (e.g., 1.2K, 3.4M)
   * @param {number} number - Number to format
   * @param {string} locale - Locale (default: 'en-US')
   * @returns {string}
   */
  formatCompactNumber: (number, locale = "en-US") => {
    if (number === null || number === undefined) return "";
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      compactDisplay: "short",
    }).format(number);
  },

  /**
   * Format relative time (short version)
   * @param {Date|string} date - Date to format
   * @returns {string}
   */
  formatRelativeTime: (date) => {
    const now = new Date();
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";

    const diff = Math.floor((now - d) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)}w`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo`;
    return `${Math.floor(diff / 31536000)}y`;
  },

  /**
   * Generate initials from name
   * @param {string} name - Full name
   * @param {number} maxInitials - Maximum initials (default: 2)
   * @returns {string}
   */
  getInitials: (name, maxInitials = 2) => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    const initials = words
      .slice(0, maxInitials)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
    return initials;
  },

  /**
   * Mask sensitive data
   * @param {string} str - String to mask
   * @param {number} visibleChars - Number of visible characters (default: 4)
   * @param {string} maskChar - Mask character (default: '*')
   * @returns {string}
   */
  maskString: (str, visibleChars = 4, maskChar = "*") => {
    if (!str) return "";
    if (str.length <= visibleChars) return str;
    const visible = str.slice(-visibleChars);
    const masked = maskChar.repeat(str.length - visibleChars);
    return masked + visible;
  },

  /**
   * Convert string to camelCase
   * @param {string} str - String to convert
   * @returns {string}
   */
  toCamelCase: (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
  },

  /**
   * Convert string to kebab-case
   * @param {string} str - String to convert
   * @returns {string}
   */
  toKebabCase: (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  /**
   * Convert string to snake_case
   * @param {string} str - String to convert
   * @returns {string}
   */
  toSnakeCase: (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  },
};

export default formatUtils;
