// src/components/releases-milestone/ReleasesMilestoneConstants.js

/**
 * Release Statuses
 */
export const RELEASE_STATUSES = [
  { value: "planned", label: "Planned", color: "#3B82F6", icon: "📝" },
  { value: "in_progress", label: "In Progress", color: "#F59E0B", icon: "🔄" },
  { value: "testing", label: "Testing", color: "#8B5CF6", icon: "🧪" },
  { value: "released", label: "Released", color: "#10B981", icon: "🚀" },
  { value: "cancelled", label: "Cancelled", color: "#EF4444", icon: "❌" },
];

/**
 * Milestone Statuses
 */
export const MILESTONE_STATUSES = [
  { value: "not_started", label: "Not Started", color: "#6B7280", icon: "⏳" },
  { value: "in_progress", label: "In Progress", color: "#F59E0B", icon: "🔄" },
  { value: "completed", label: "Completed", color: "#10B981", icon: "✅" },
  { value: "delayed", label: "Delayed", color: "#EF4444", icon: "⚠️" },
];

/**
 * Milestone Priorities
 */
export const MILESTONE_PRIORITIES = [
  { value: "low", label: "Low", color: "#6B7280" },
  { value: "medium", label: "Medium", color: "#F59E0B" },
  { value: "high", label: "High", color: "#EF4444" },
  { value: "critical", label: "Critical", color: "#DC2626" },
  { value: "completed", label: "Completed", color: "#10B981" },
];

/**
 * Release Readiness Levels
 */
export const READINESS_LEVELS = [
  { value: "low", label: "Low", color: "#EF4444" },
  { value: "medium", label: "Medium", color: "#F59E0B" },
  { value: "high", label: "High", color: "#10B981" },
  { value: "ready", label: "Ready", color: "#3B82F6" },
];

/**
 * Get release status by value
 */
export const getReleaseStatus = (value) => {
  return RELEASE_STATUSES.find((s) => s.value === value) || RELEASE_STATUSES[0];
};

/**
 * Get milestone status by value
 */
export const getMilestoneStatus = (value) => {
  return (
    MILESTONE_STATUSES.find((s) => s.value === value) || MILESTONE_STATUSES[0]
  );
};

/**
 * Get milestone priority by value
 */
export const getMilestonePriority = (value) => {
  return (
    MILESTONE_PRIORITIES.find((p) => p.value === value) ||
    MILESTONE_PRIORITIES[0]
  );
};

/**
 * Get readiness level by value
 */
export const getReadinessLevel = (value) => {
  return READINESS_LEVELS.find((r) => r.value === value) || READINESS_LEVELS[0];
};

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
};

/**
 * Default filters for releases
 */
export const DEFAULT_RELEASE_FILTERS = {
  status: "",
  search: "",
};

/**
 * Default filters for milestones
 */
export const DEFAULT_MILESTONE_FILTERS = {
  status: "",
  priority: "",
  search: "",
};

/**
 * Release form initial values
 */
export const RELEASE_FORM_INITIAL_VALUES = {
  version: "",
  description: "",
  status: "planned",
  release_date: new Date().toISOString().split("T")[0],
  features: [],
};

/**
 * Milestone form initial values
 */
export const MILESTONE_FORM_INITIAL_VALUES = {
  name: "",
  description: "",
  status: "not_started",
  target_date: new Date().toISOString().split("T")[0],
  completed_date: "",
  progress_percentage: 0,
};

/**
 * Release form validation rules
 */
export const RELEASE_FORM_VALIDATION = {
  version: {
    required: "Version is required",
    pattern: {
      value: /^\d+\.\d+\.\d+$/,
      message: "Version must be in semantic versioning format (e.g., 1.0.0)",
    },
  },
  description: {
    maxLength: {
      value: 500,
      message: "Description must be at most 500 characters",
    },
  },
  status: {
    required: "Status is required",
  },
  release_date: {
    required: "Release date is required",
  },
};

/**
 * Milestone form validation rules
 */
export const MILESTONE_FORM_VALIDATION = {
  name: {
    required: "Name is required",
    minLength: { value: 3, message: "Name must be at least 3 characters" },
    maxLength: { value: 255, message: "Name must be at most 255 characters" },
  },
  description: {
    maxLength: {
      value: 500,
      message: "Description must be at most 500 characters",
    },
  },
  status: {
    required: "Status is required",
  },
  target_date: {
    required: "Target date is required",
  },
  progress_percentage: {
    min: { value: 0, message: "Progress must be between 0 and 100" },
    max: { value: 100, message: "Progress must be between 0 and 100" },
  },
};

/**
 * Sort options for releases
 */
export const RELEASE_SORT_OPTIONS = [
  { value: "created_at", label: "Created Date" },
  { value: "release_date", label: "Release Date" },
  { value: "version", label: "Version" },
  { value: "status", label: "Status" },
];

/**
 * Sort options for milestones
 */
export const MILESTONE_SORT_OPTIONS = [
  { value: "target_date", label: "Target Date" },
  { value: "created_at", label: "Created Date" },
  { value: "status", label: "Status" },
  { value: "progress_percentage", label: "Progress" },
];

/**
 * Sort order options
 */
export const SORT_ORDER_OPTIONS = [
  { value: "DESC", label: "Newest First" },
  { value: "ASC", label: "Oldest First" },
];
