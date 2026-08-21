// src/components/subscriptions/SubscriptionsConstants.js

/**
 * Release Status Options
 */
export const RELEASE_STATUSES = [
  { value: "planned", label: "Planned", color: "#2563eb", icon: "📋" },
  { value: "in_progress", label: "In Progress", color: "#f59e0b", icon: "🔄" },
  { value: "testing", label: "Testing", color: "#8b5cf6", icon: "🧪" },
  { value: "released", label: "Released", color: "#16a34a", icon: "🚀" },
  { value: "cancelled", label: "Cancelled", color: "#dc2626", icon: "❌" },
];

/**
 * Milestone Status Options
 */
export const MILESTONE_STATUSES = [
  { value: "not_started", label: "Not Started", color: "#737373", icon: "⏳" },
  { value: "in_progress", label: "In Progress", color: "#f59e0b", icon: "🔄" },
  { value: "completed", label: "Completed", color: "#16a34a", icon: "✅" },
  { value: "delayed", label: "Delayed", color: "#dc2626", icon: "⚠️" },
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
 * Get status badge variant
 */
export const getStatusBadgeVariant = (status, type = "release") => {
  const statuses = type === "release" ? RELEASE_STATUSES : MILESTONE_STATUSES;
  const found = statuses.find((s) => s.value === status);

  if (!found) return "neutral";

  const variantMap = {
    planned: "info",
    in_progress: "warning",
    testing: "secondary",
    released: "success",
    cancelled: "error",
    not_started: "neutral",
    completed: "success",
    delayed: "error",
  };

  return variantMap[status] || "neutral";
};

/**
 * Default pagination
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
};

/**
 * Default filters
 */
export const DEFAULT_FILTERS = {
  status: "",
  search: "",
};

/**
 * Release form initial values
 */
export const RELEASE_FORM_INITIAL_VALUES = {
  version: "",
  description: "",
  status: "planned",
  features: [],
  release_date: new Date().toISOString().split("T")[0],
};

/**
 * Milestone form initial values
 */
export const MILESTONE_FORM_INITIAL_VALUES = {
  name: "",
  description: "",
  status: "not_started",
  target_date: "",
  completed_date: "",
  progress_percentage: 0,
};

/**
 * Version pattern for validation
 */
export const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

/**
 * Format date
 */
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format version
 */
export const formatVersion = (version) => {
  return `v${version}`;
};
