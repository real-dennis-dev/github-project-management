// src/components/tech-debt/TechDebtConstants.js

/**
 * Tech Debt Priority Configuration
 */
export const PRIORITIES = [
  {
    value: "critical",
    label: "Critical",
    color: "#DC2626",
    icon: "🔴",
    rank: 4,
  },
  { value: "high", label: "High", color: "#EA580C", icon: "🟠", rank: 3 },
  { value: "medium", label: "Medium", color: "#F59E0B", icon: "🟡", rank: 2 },
  { value: "low", label: "Low", color: "#10B981", icon: "🟢", rank: 1 },
];

/**
 * Tech Debt Status Configuration
 */
export const STATUSES = [
  { value: "identified", label: "Identified", color: "#6B7280", icon: "🔍" },
  { value: "planned", label: "Planned", color: "#3B82F6", icon: "📋" },
  { value: "in_progress", label: "In Progress", color: "#F59E0B", icon: "⚡" },
  { value: "resolved", label: "Resolved", color: "#10B981", icon: "✅" },
  { value: "ignored", label: "Ignored", color: "#6B7280", icon: "🚫" },
];

/**
 * Get priority by value
 */
export const getPriority = (value) => {
  return PRIORITIES.find((p) => p.value === value) || PRIORITIES[2];
};

/**
 * Get priority label by value
 */
export const getPriorityLabel = (value) => {
  const priority = getPriority(value);
  return priority ? priority.label : value;
};

/**
 * Get priority color by value
 */
export const getPriorityColor = (value) => {
  const priority = getPriority(value);
  return priority ? priority.color : "#6B7280";
};

/**
 * Get priority icon by value
 */
export const getPriorityIcon = (value) => {
  const priority = getPriority(value);
  return priority ? priority.icon : "🟡";
};

/**
 * Get status by value
 */
export const getStatus = (value) => {
  return STATUSES.find((s) => s.value === value) || STATUSES[0];
};

/**
 * Get status label by value
 */
export const getStatusLabel = (value) => {
  const status = getStatus(value);
  return status ? status.label : value;
};

/**
 * Get status color by value
 */
export const getStatusColor = (value) => {
  const status = getStatus(value);
  return status ? status.color : "#6B7280";
};

/**
 * Get status icon by value
 */
export const getStatusIcon = (value) => {
  const status = getStatus(value);
  return status ? status.icon : "🔍";
};

/**
 * Sort options for tech debt
 */
export const SORT_OPTIONS = [
  { value: "created_at", label: "Created Date" },
  { value: "priority", label: "Priority" },
  { value: "status", label: "Status" },
  { value: "estimated_effort_hours", label: "Estimated Effort" },
];

/**
 * Sort order options
 */
export const SORT_ORDER_OPTIONS = [
  { value: "DESC", label: "Highest First" },
  { value: "ASC", label: "Lowest First" },
];

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
};

/**
 * Default filter settings
 */
export const DEFAULT_FILTERS = {
  priority: "",
  status: "",
  search: "",
};

/**
 * Tech debt form initial values
 */
export const TECH_DEBT_FORM_INITIAL_VALUES = {
  title: "",
  description: "",
  reason: "",
  impact: "",
  priority: "medium",
  status: "identified",
  estimated_effort_hours: "",
};

/**
 * Tech debt form validation rules
 */
export const TECH_DEBT_FORM_VALIDATION = {
  title: {
    required: "Title is required",
    minLength: { value: 3, message: "Title must be at least 3 characters" },
    maxLength: { value: 255, message: "Title must be at most 255 characters" },
  },
  description: {
    required: "Description is required",
    minLength: {
      value: 10,
      message: "Description must be at least 10 characters",
    },
  },
  reason: {
    required: "Reason is required",
    minLength: { value: 5, message: "Reason must be at least 5 characters" },
  },
  priority: {
    required: "Priority is required",
  },
  status: {
    required: "Status is required",
  },
  estimated_effort_hours: {
    min: { value: 0, message: "Estimated effort must be 0 or greater" },
  },
};

/**
 * Export formats
 */
export const EXPORT_FORMATS = [
  { value: "json", label: "JSON" },
  { value: "csv", label: "CSV" },
];

/**
 * Tech debt score levels
 */
export const SCORE_LEVELS = {
  low: { min: 0, max: 25, label: "Low", color: "#10B981" },
  medium: { min: 26, max: 50, label: "Medium", color: "#F59E0B" },
  high: { min: 51, max: 75, label: "High", color: "#EA580C" },
  critical: { min: 76, max: 100, label: "Critical", color: "#DC2626" },
};

/**
 * Get score level by score
 */
export const getScoreLevel = (score) => {
  for (const [key, level] of Object.entries(SCORE_LEVELS)) {
    if (score >= level.min && score <= level.max) {
      return { ...level, key };
    }
  }
  return SCORE_LEVELS.medium;
};
