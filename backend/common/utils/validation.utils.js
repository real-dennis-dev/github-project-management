class ValidationUtils {
  // Validates email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validates URL
  validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validates UUID
  validateUUID(uuid) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Validates enum value
  validateEnum(value, enumType) {
    return Object.values(enumType).includes(value);
  }

  // Validates phone number
  validatePhone(phone) {
    const phoneRegex =
      /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  }

  // Validates password strength
  validatePassword(password) {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      valid:
        hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial,
      requirements: {
        minLength: hasMinLength,
        uppercase: hasUppercase,
        lowercase: hasLowercase,
        number: hasNumber,
        special: hasSpecial,
      },
    };
  }

  // Validates date
  validateDate(date) {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  }

  // Validates number range
  validateNumberRange(value, min, max) {
    if (typeof value !== "number") return false;
    return value >= min && value <= max;
  }

  // Validates required fields
  validateRequired(data, requiredFields) {
    const missing = [];
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0 && data[field] !== false) {
        missing.push(field);
      }
    }
    return {
      valid: missing.length === 0,
      missing,
    };
  }

  // Validates data type
  validateType(value, type) {
    const types = {
      string: (v) => typeof v === "string",
      number: (v) => typeof v === "number" && !isNaN(v),
      boolean: (v) => typeof v === "boolean",
      array: (v) => Array.isArray(v),
      object: (v) => typeof v === "object" && v !== null && !Array.isArray(v),
      date: (v) => v instanceof Date,
      null: (v) => v === null,
      undefined: (v) => v === undefined,
    };
    return types[type] ? types[type](value) : false;
  }
}

const validationUtils = new ValidationUtils();

module.exports = validationUtils;
module.exports.ValidationUtils = validationUtils;
