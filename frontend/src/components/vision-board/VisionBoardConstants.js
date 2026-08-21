// src/components/vision-board/VisionBoardConstants.js

/**
 * Vision Board Status Configuration
 */
export const STATUSES = [
  { value: "draft", label: "Draft", color: "#9E9E9E", icon: "📝" },
  { value: "active", label: "Active", color: "#4CAF50", icon: "✅" },
  { value: "completed", label: "Completed", color: "#2196F3", icon: "🎯" },
  { value: "archived", label: "Archived", color: "#607D8B", icon: "📦" },
];

/**
 * Priority levels
 */
export const PRIORITIES = [
  { value: 0, label: "No Priority", color: "#9E9E9E" },
  { value: 1, label: "Very Low", color: "#E8F5E9" },
  { value: 2, label: "Low", color: "#C8E6C9" },
  { value: 3, label: "Medium-Low", color: "#A5D6A7" },
  { value: 4, label: "Medium", color: "#81C784" },
  { value: 5, label: "Medium-High", color: "#66BB6A" },
  { value: 6, label: "High", color: "#4CAF50" },
  { value: 7, label: "Very High", color: "#43A047" },
  { value: 8, label: "Important", color: "#388E3C" },
  { value: 9, label: "Very Important", color: "#F57C00" },
  { value: 10, label: "Critical", color: "#D32F2F" },
];

/**
 * Get status by value
 */
export const getStatus = (value) => {
  return STATUSES.find((status) => status.value === value) || STATUSES[0];
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
  return status ? status.color : "#9E9E9E";
};

/**
 * Get status icon by value
 */
export const getStatusIcon = (value) => {
  const status = getStatus(value);
  return status ? status.icon : "📝";
};

/**
 * Get priority label by value
 */
export const getPriorityLabel = (value) => {
  const priority = PRIORITIES.find((p) => p.value === value);
  return priority ? priority.label : "No Priority";
};

/**
 * Get priority color by value
 */
export const getPriorityColor = (value) => {
  const priority = PRIORITIES.find((p) => p.value === value);
  return priority ? priority.color : "#9E9E9E";
};

/**
 * Default categories
 */
export const DEFAULT_CATEGORIES = [
  "Career",
  "Financial",
  "Health",
  "Personal Growth",
  "Relationships",
  "Spiritual",
  "Community",
  "Creative",
  "Education",
  "Lifestyle",
];

/**
 * Sort options
 */
export const SORT_OPTIONS = [
  { value: "priority", label: "Priority" },
  { value: "created_at", label: "Created Date" },
  { value: "goal", label: "Goal" },
  { value: "status", label: "Status" },
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
 * Default filters
 */
export const DEFAULT_FILTERS = {
  status: "",
  category: "",
};

/**
 * Vision goal form initial values
 */
export const VISION_GOAL_FORM_INITIAL_VALUES = {
  goal: "",
  description: "",
  target_timeline: "",
  priority: 0,
  category: "",
  status: "draft",
};

/**
 * Vision goal form validation rules
 */
export const VISION_GOAL_FORM_VALIDATION = {
  goal: {
    required: "Goal is required",
    minLength: { value: 3, message: "Goal must be at least 3 characters" },
    maxLength: { value: 500, message: "Goal must be at most 500 characters" },
  },
  description: {
    maxLength: {
      value: 1000,
      message: "Description must be at most 1000 characters",
    },
  },
  priority: {
    min: { value: 0, message: "Priority must be between 0 and 10" },
    max: { value: 10, message: "Priority must be between 0 and 10" },
  },
  status: {
    required: "Status is required",
  },
};

/**
 * Export formats
 */
export const EXPORT_FORMATS = [
  { value: "json", label: "JSON" },
  { value: "csv", label: "CSV" },
];
