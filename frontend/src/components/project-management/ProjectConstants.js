// src/components/project-management/ProjectConstants.js

/**
 * Project Status Options
 */
export const PROJECT_STATUSES = [
  { value: "planning", label: "Planning", color: "#9E9E9E", icon: "📋" },
  { value: "in_progress", label: "In Progress", color: "#2196F3", icon: "🚀" },
  { value: "paused", label: "Paused", color: "#FF9800", icon: "⏸️" },
  { value: "completed", label: "Completed", color: "#4CAF50", icon: "✅" },
  { value: "archived", label: "Archived", color: "#607D8B", icon: "📦" },
];

/**
 * Project Priority Options
 */
export const PROJECT_PRIORITIES = [
  { value: "low", label: "Low", color: "#4CAF50", icon: "🟢" },
  { value: "medium", label: "Medium", color: "#FF9800", icon: "🟡" },
  { value: "high", label: "High", color: "#F44336", icon: "🔴" },
  { value: "critical", label: "Critical", color: "#9C27B0", icon: "🟣" },
];

/**
 * Feature Status Options
 */
export const FEATURE_STATUSES = [
  { value: "planned", label: "Planned", color: "#9E9E9E", icon: "📝" },
  { value: "in_progress", label: "In Progress", color: "#2196F3", icon: "⚡" },
  { value: "completed", label: "Completed", color: "#4CAF50", icon: "✅" },
  { value: "blocked", label: "Blocked", color: "#F44336", icon: "🚫" },
  { value: "cancelled", label: "Cancelled", color: "#607D8B", icon: "❌" },
];

/**
 * Feature Difficulty Options
 */
export const FEATURE_DIFFICULTIES = [
  { value: "easy", label: "Easy", color: "#4CAF50", icon: "😊" },
  { value: "medium", label: "Medium", color: "#FF9800", icon: "🤔" },
  { value: "hard", label: "Hard", color: "#F44336", icon: "😤" },
  { value: "expert", label: "Expert", color: "#9C27B0", icon: "🧠" },
];

/**
 * Bug Status Options
 */
export const BUG_STATUSES = [
  { value: "reported", label: "Reported", color: "#9E9E9E", icon: "📢" },
  {
    value: "investigating",
    label: "Investigating",
    color: "#FF9800",
    icon: "🔍",
  },
  { value: "in_progress", label: "In Progress", color: "#2196F3", icon: "🔧" },
  { value: "fixed", label: "Fixed", color: "#4CAF50", icon: "✅" },
  { value: "verified", label: "Verified", color: "#8BC34A", icon: "✔️" },
  { value: "closed", label: "Closed", color: "#607D8B", icon: "🔒" },
];

/**
 * Bug Priority Options
 */
export const BUG_PRIORITIES = [
  { value: "low", label: "Low", color: "#4CAF50", icon: "🟢" },
  { value: "medium", label: "Medium", color: "#FF9800", icon: "🟡" },
  { value: "high", label: "High", color: "#F44336", icon: "🔴" },
  { value: "critical", label: "Critical", color: "#9C27B0", icon: "🟣" },
];

/**
 * Get status by value
 */
export const getStatus = (statuses, value) => {
  return statuses.find((s) => s.value === value) || statuses[0];
};

/**
 * Get project status
 */
export const getProjectStatus = (value) => {
  return getStatus(PROJECT_STATUSES, value);
};

/**
 * Get project priority
 */
export const getProjectPriority = (value) => {
  return getStatus(PROJECT_PRIORITIES, value);
};

/**
 * Get feature status
 */
export const getFeatureStatus = (value) => {
  return getStatus(FEATURE_STATUSES, value);
};

/**
 * Get feature difficulty
 */
export const getFeatureDifficulty = (value) => {
  return getStatus(FEATURE_DIFFICULTIES, value);
};

/**
 * Get bug status
 */
export const getBugStatus = (value) => {
  return getStatus(BUG_STATUSES, value);
};

/**
 * Get bug priority
 */
export const getBugPriority = (value) => {
  return getStatus(BUG_PRIORITIES, value);
};

/**
 * Project form initial values
 */
export const PROJECT_FORM_INITIAL_VALUES = {
  name: "",
  description: "",
  status: "planning",
  priority: "medium",
  completion_percentage: 0,
  tech_stack: [],
  repository_url: "",
  start_date: new Date().toISOString().split("T")[0],
  target_completion_date: "",
};

/**
 * Feature form initial values
 */
export const FEATURE_FORM_INITIAL_VALUES = {
  title: "",
  description: "",
  status: "planned",
  difficulty: "medium",
  estimated_days: "",
};

/**
 * Bug form initial values
 */
export const BUG_FORM_INITIAL_VALUES = {
  title: "",
  description: "",
  status: "reported",
  priority: "medium",
  cause: "",
  possible_fix: "",
  assigned_to: "",
};

/**
 * Subtask form initial values
 */
export const SUBTASK_FORM_INITIAL_VALUES = {
  title: "",
  is_completed: false,
};

/**
 * Sort options for projects
 */
export const PROJECT_SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "start_date", label: "Start Date" },
  { value: "target_completion_date", label: "Target Completion" },
  { value: "completion_percentage", label: "Progress" },
  { value: "created_at", label: "Created At" },
];

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 12,
};

/**
 * Default project filters
 */
export const DEFAULT_PROJECT_FILTERS = {
  status: "",
  priority: "",
  search: "",
};

/**
 * Tech stack options
 */
export const TECH_STACK_OPTIONS = [
  "React",
  "Vue",
  "Angular",
  "Node.js",
  "Python",
  "Django",
  "Flask",
  "Ruby on Rails",
  "PHP",
  "Laravel",
  "Spring Boot",
  "Go",
  "Rust",
  "Java",
  "C#",
  ".NET",
  "TypeScript",
  "JavaScript",
  "HTML/CSS",
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
  "Ant Design",
  "GraphQL",
  "REST API",
  "WebSocket",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Elasticsearch",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Firebase",
  "Supabase",
  "Stripe",
  "PayPal",
  "Twilio",
  "SendGrid",
];
