/**
 * Application constants
 */

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 30000,
  appVersion: "1.0.0",
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "@auth_token",
  REFRESH_TOKEN: "@refresh_token",
  USER: "@user",
  THEME_PREFERENCE: "@theme_preference",
  LANGUAGE: "@language",
  NOTIFICATIONS: "@notifications",
  PROJECTS_CACHE: "@projects_cache",
  SETTINGS: "@settings",
};

// Project Status
export const PROJECT_STATUS = {
  PLANNING: "planning",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  COMPLETED: "completed",
  ON_HOLD: "on_hold",
  CANCELLED: "cancelled",
};

// Feature Status
export const FEATURE_STATUS = {
  BACKLOG: "backlog",
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  TESTING: "testing",
  DONE: "done",
};

// Bug Status
export const BUG_STATUS = {
  NEW: "new",
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  FIXED: "fixed",
  VERIFIED: "verified",
  REOPENED: "reopened",
  CLOSED: "closed",
};

// Bug Priority
export const BUG_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

// Risk Levels
export const RISK_LEVEL = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

// Risk Status
export const RISK_STATUS = {
  IDENTIFIED: "identified",
  ASSESSED: "assessed",
  MITIGATING: "mitigating",
  MONITORED: "monitored",
  ACCEPTED: "accepted",
  RESOLVED: "resolved",
};

// Tech Debt Priority
export const TECH_DEBT_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

// Tech Debt Status
export const TECH_DEBT_STATUS = {
  IDENTIFIED: "identified",
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  DEFERRED: "deferred",
};

// Release Status
export const RELEASE_STATUS = {
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  TESTING: "testing",
  READY: "ready",
  DEPLOYED: "deployed",
  CANCELLED: "cancelled",
};

// Milestone Status
export const MILESTONE_STATUS = {
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  DELAYED: "delayed",
  CANCELLED: "cancelled",
};

// Decision Impact
export const DECISION_IMPACT = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

// Journal Mood
export const JOURNAL_MOOD = {
  VERY_HAPPY: "very_happy",
  HAPPY: "happy",
  NEUTRAL: "neutral",
  SAD: "sad",
  VERY_SAD: "very_sad",
  ANGRY: "angry",
  TIRED: "tired",
  STRESSED: "stressed",
};

// Expense Categories
export const EXPENSE_CATEGORIES = {
  DEVELOPMENT: "development",
  INFRASTRUCTURE: "infrastructure",
  DESIGN: "design",
  MARKETING: "marketing",
  OPERATIONS: "operations",
  HARDWARE: "hardware",
  SOFTWARE: "software",
  TRAVEL: "travel",
  TRAINING: "training",
  OTHER: "other",
};

// Error Codes
export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  SERVER_ERROR: "SERVER_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  DISPLAY_TIME: "MMM dd, yyyy HH:mm",
  SHORT: "MMM dd",
  MONTH_DAY: "MMM dd",
  MONTH_YEAR: "MMMM yyyy",
  YEAR: "yyyy",
  ISO: "yyyy-MM-dd",
  ISO_TIME: "yyyy-MM-dd HH:mm:ss",
  TIME: "HH:mm",
  TIME_AMPM: "hh:mm a",
};

// Toast durations
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
};

// Animation durations
export const ANIMATION = {
  FAST: 200,
  MEDIUM: 350,
  SLOW: 500,
};

// App Routes
export const ROUTES = {
  AUTH: {
    LOGIN: "Login",
    REGISTER: "Register",
    FORGOT_PASSWORD: "ForgotPassword",
    RESET_PASSWORD: "ResetPassword",
  },
  MAIN: {
    HOME: "Home",
    PROJECTS: "Projects",
    PROFILE: "Profile",
    SETTINGS: "Settings",
  },
  PROJECT: {
    LIST: "ProjectList",
    DETAIL: "ProjectDetail",
    CREATE: "ProjectCreate",
    EDIT: "ProjectEdit",
    DASHBOARD: "Dashboard",
  },
};

// Supported Languages
export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
];

// Theme modes
export const THEME_MODES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};
