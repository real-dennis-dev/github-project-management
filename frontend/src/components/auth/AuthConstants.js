// src/components/auth/AuthConstants.js

/**
 * Authentication Constants
 */

// User roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  PROJECT_MANAGER: "project_manager",
};

// Auth providers
export const AUTH_PROVIDERS = {
  EMAIL: "email",
  GOOGLE: "google",
  GITHUB: "github",
};

// OAuth providers configuration
export const OAUTH_PROVIDERS = [
  {
    id: "google",
    name: "Google",
    icon: "🔵",
    color: "#4285F4",
    redirectUri:
      import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
      window.location.origin + "/auth/callback/google",

    authUrl:
      import.meta.env.VITE_GOOGLE_AUTH_URL ||
      "https://accounts.google.com/o/oauth2/v2/auth",

    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,

    scope: "email profile",
  },

  {
    id: "github",
    name: "GitHub",
    icon: "🐙",
    color: "#24292F",

    redirectUri:
      import.meta.env.VITE_GITHUB_REDIRECT_URI ||
      window.location.origin + "/auth/callback/github",

    authUrl:
      import.meta.env.VITE_GITHUB_AUTH_URL ||
      "https://github.com/login/oauth/authorize",

    clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,

    scope: "user:email",
  },
];

// Validation rules
export const LOGIN_VALIDATION = {
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  },
  password: {
    required: "Password is required",
    minLength: { value: 8, message: "Password must be at least 8 characters" },
  },
};

export const REGISTER_VALIDATION = {
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  },
  password: {
    required: "Password is required",
    minLength: { value: 8, message: "Password must be at least 8 characters" },
    pattern: {
      value:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message:
        "Password must contain at least one uppercase, lowercase, number, and special character",
    },
  },
  confirmPassword: {
    required: "Please confirm your password",
    validate: (value, formValues) =>
      value === formValues.password || "Passwords do not match",
  },
  fullName: {
    required: "Full name is required",
    minLength: { value: 2, message: "Name must be at least 2 characters" },
    maxLength: { value: 100, message: "Name must be at most 100 characters" },
  },
  username: {
    minLength: { value: 3, message: "Username must be at least 3 characters" },
    maxLength: { value: 30, message: "Username must be at most 30 characters" },
    pattern: {
      value: /^[a-zA-Z0-9_-]+$/,
      message:
        "Username can only contain letters, numbers, underscores, and hyphens",
    },
  },
};

export const FORGOT_PASSWORD_VALIDATION = {
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  },
};

export const RESET_PASSWORD_VALIDATION = {
  newPassword: {
    required: "Password is required",
    minLength: { value: 8, message: "Password must be at least 8 characters" },
    pattern: {
      value:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message:
        "Password must contain at least one uppercase, lowercase, number, and special character",
    },
  },
  confirmPassword: {
    required: "Please confirm your password",
    validate: (value, formValues) =>
      value === formValues.newPassword || "Passwords do not match",
  },
};

export const CHANGE_PASSWORD_VALIDATION = {
  currentPassword: {
    required: "Current password is required",
  },
  newPassword: {
    required: "New password is required",
    minLength: { value: 8, message: "Password must be at least 8 characters" },
    pattern: {
      value:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message:
        "Password must contain at least one uppercase, lowercase, number, and special character",
    },
  },
  confirmPassword: {
    required: "Please confirm your password",
    validate: (value, formValues) =>
      value === formValues.newPassword || "Passwords do not match",
  },
};

// Session status
export const SESSION_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  REVOKED: "revoked",
};

// Device types for session detection
export const DEVICE_TYPES = {
  DESKTOP: "desktop",
  MOBILE: "mobile",
  TABLET: "tablet",
  UNKNOWN: "unknown",
};

// Helper: Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper: Get device type from user agent
export const getDeviceType = (userAgent) => {
  if (!userAgent) return DEVICE_TYPES.UNKNOWN;
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return DEVICE_TYPES.TABLET;
  }
  if (
    /mobile|android|iphone|ipod|blackberry|windows phone|opera mini/i.test(ua)
  ) {
    return DEVICE_TYPES.MOBILE;
  }
  return DEVICE_TYPES.DESKTOP;
};

// Helper: Get session status badge variant
export const getSessionStatusVariant = (status) => {
  const variants = {
    active: "success",
    expired: "warning",
    revoked: "error",
  };
  return variants[status] || "neutral";
};
