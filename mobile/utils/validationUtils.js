/**
 * Validation utilities
 */
const validationUtils = {
  /**
   * Validate email address
   * @param {string} email - Email address
   * @returns {boolean}
   */
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {boolean}
   */
  validateURL: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate UUID
   * @param {string} uuid - UUID to validate
   * @returns {boolean}
   */
  validateUUID: (uuid) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  /**
   * Validate enum value
   * @param {any} value - Value to validate
   * @param {Array} enumType - Array of allowed values
   * @returns {boolean}
   */
  validateEnum: (value, enumType) => {
    return enumType.includes(value);
  },

  /**
   * Validate phone number
   * @param {string} phone - Phone number
   * @returns {boolean}
   */
  validatePhone: (phone) => {
    const phoneRegex =
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate required field
   * @param {any} value - Value to validate
   * @returns {boolean}
   */
  validateRequired: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return true;
  },

  /**
   * Validate minimum length
   * @param {string} value - String to validate
   * @param {number} min - Minimum length
   * @returns {boolean}
   */
  validateMinLength: (value, min) => {
    if (!value) return false;
    return value.length >= min;
  },

  /**
   * Validate maximum length
   * @param {string} value - String to validate
   * @param {number} max - Maximum length
   * @returns {boolean}
   */
  validateMaxLength: (value, max) => {
    if (!value) return true;
    return value.length <= max;
  },

  /**
   * Validate number range
   * @param {number} value - Number to validate
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {boolean}
   */
  validateRange: (value, min, max) => {
    if (value === null || value === undefined) return false;
    const num = Number(value);
    if (isNaN(num)) return false;
    return num >= min && num <= max;
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @param {Object} options - Validation options
   * @param {number} options.minLength - Minimum length (default: 8)
   * @param {boolean} options.requireUppercase - Require uppercase (default: true)
   * @param {boolean} options.requireLowercase - Require lowercase (default: true)
   * @param {boolean} options.requireNumber - Require number (default: true)
   * @param {boolean} options.requireSpecial - Require special character (default: true)
   * @returns {Object} { isValid, errors }
   */
  validatePassword: (password, options = {}) => {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumber = true,
      requireSpecial = true,
    } = options;

    const errors = [];

    if (!password || password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (requireNumber && !/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate credit card number
   * @param {string} cardNumber - Credit card number
   * @returns {boolean}
   */
  validateCreditCard: (cardNumber) => {
    // Luhn algorithm
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  },

  /**
   * Validate date
   * @param {string} date - Date string
   * @returns {boolean}
   */
  validateDate: (date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  },

  /**
   * Validate date format
   * @param {string} date - Date string
   * @param {string} format - Expected format
   * @returns {boolean}
   */
  validateDateFormat: (date, format = "YYYY-MM-DD") => {
    // Simple format validation
    if (format === "YYYY-MM-DD") {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(date)) return false;
      const d = new Date(date);
      return !isNaN(d.getTime());
    }
    return true;
  },

  /**
   * Validate file type
   * @param {string} fileType - File MIME type
   * @param {Array<string>} allowedTypes - Array of allowed MIME types
   * @returns {boolean}
   */
  validateFileType: (fileType, allowedTypes) => {
    return allowedTypes.includes(fileType);
  },

  /**
   * Validate file size
   * @param {number} fileSize - File size in bytes
   * @param {number} maxSize - Maximum size in bytes
   * @returns {boolean}
   */
  validateFileSize: (fileSize, maxSize) => {
    return fileSize <= maxSize;
  },
};

export default validationUtils;
