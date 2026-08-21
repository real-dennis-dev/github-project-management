// src/components/process/ProcessConstants.js

/**
 * Progress status configurations
 */
export const PROGRESS_STATUSES = {
  COMPLETED: {
    label: "Completed",
    class: "success",
    icon: "✅",
    min: 100,
  },
  NEAR_COMPLETE: {
    label: "Near Complete",
    class: "info",
    icon: "🟦",
    min: 75,
  },
  ON_TRACK: {
    label: "On Track",
    class: "primary",
    icon: "🟩",
    min: 50,
  },
  IN_PROGRESS: {
    label: "In Progress",
    class: "warning",
    icon: "🟨",
    min: 25,
  },
  JUST_STARTED: {
    label: "Just Started",
    class: "neutral",
    icon: "⬜",
    min: 0,
  },
};

/**
 * Get progress status based on percentage
 */
export const getProgressStatus = (percentage) => {
  if (percentage >= 100) return PROGRESS_STATUSES.COMPLETED;
  if (percentage >= 75) return PROGRESS_STATUSES.NEAR_COMPLETE;
  if (percentage >= 50) return PROGRESS_STATUSES.ON_TRACK;
  if (percentage >= 25) return PROGRESS_STATUSES.IN_PROGRESS;
  return PROGRESS_STATUSES.JUST_STARTED;
};

/**
 * Get status class for styling
 */
export const getStatusClass = (percentage) => {
  const status = getProgressStatus(percentage);
  return status.class;
};

/**
 * Get status icon
 */
export const getStatusIcon = (percentage) => {
  const status = getProgressStatus(percentage);
  return status.icon;
};

/**
 * Get status label
 */
export const getStatusLabel = (percentage) => {
  const status = getProgressStatus(percentage);
  return status.label;
};

/**
 * Sort options for timeline
 */
export const SORT_OPTIONS = [
  { value: "month_year", label: "Month" },
  { value: "feature_name", label: "Feature" },
  { value: "progress_percentage", label: "Progress" },
  { value: "created_at", label: "Created At" },
];

/**
 * Sort order options
 */
export const SORT_ORDER_OPTIONS = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
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
  from_date: "",
  to_date: "",
  feature_name: "",
};

/**
 * Timeline form initial values
 */
export const TIMELINE_FORM_INITIAL_VALUES = {
  month_year: new Date().toISOString().split("T")[0],
  feature_name: "",
  progress_percentage: 0,
};

/**
 * Timeline form validation rules
 */
export const TIMELINE_FORM_VALIDATION = {
  month_year: {
    required: "Month is required",
  },
  feature_name: {
    required: "Feature name is required",
    maxLength: {
      value: 255,
      message: "Feature name must be at most 255 characters",
    },
  },
  progress_percentage: {
    required: "Progress percentage is required",
    min: { value: 0, message: "Progress must be between 0 and 100" },
    max: { value: 100, message: "Progress must be between 0 and 100" },
  },
};

/**
 * Color palette for chart datasets
 */
export const CHART_COLORS = [
  "#ea580c",
  "#fb923c",
  "#f97316",
  "#c2410c",
  "#9a3412",
  "#ffedd5",
  "#fed7aa",
];

/**
 * Progress ranges for filtering
 */
export const PROGRESS_RANGES = [
  { value: "0-25", label: "0% - 25% (Just Started)" },
  { value: "26-50", label: "26% - 50% (In Progress)" },
  { value: "51-75", label: "51% - 75% (On Track)" },
  { value: "76-99", label: "76% - 99% (Near Complete)" },
  { value: "100", label: "100% (Completed)" },
];

/**
 * Export formats
 */
export const EXPORT_FORMATS = [
  { value: "json", label: "JSON" },
  { value: "csv", label: "CSV" },
  { value: "pdf", label: "PDF" },
];

/**
 * Monthly progress default values
 */
export const DEFAULT_MONTHLY_PROGRESS = {
  entries: [],
  stats: {
    total: 0,
    average: 0,
    totalProgress: 0,
    previousMonth: { average: 0, entries: 0 },
    change: 0,
    changePercentage: 0,
  },
  features: [],
  aggregated: {},
};
