// src/components/documentation-knowledge/utils/constants.js

export const DOCUMENTATION_TYPES = [
  { value: "api", label: "API Documentation" },
  { value: "erd", label: "ERD Diagram" },
  { value: "flowchart", label: "Flowchart" },
  { value: "user_manual", label: "User Manual" },
  { value: "technical", label: "Technical Documentation" },
  { value: "other", label: "Other" },
];

export const DOCUMENTATION_TYPE_COLORS = {
  api: "primary",
  erd: "secondary",
  flowchart: "warning",
  user_manual: "success",
  technical: "info",
  other: "neutral",
};

export const DOCUMENTATION_TYPE_ICONS = {
  api: "📡",
  erd: "📊",
  flowchart: "🔄",
  user_manual: "📖",
  technical: "⚙️",
  other: "📄",
};

export const KNOWLEDGE_CATEGORIES = [
  "General",
  "Technical",
  "Design",
  "Project Management",
  "Best Practices",
  "Troubleshooting",
  "Development",
  "Operations",
  "Security",
  "Database",
  "Frontend",
  "Backend",
  "API",
  "Testing",
  "DevOps",
];

export const SORT_OPTIONS = [
  { value: "created_at_desc", label: "Newest First" },
  { value: "created_at_asc", label: "Oldest First" },
  { value: "updated_at_desc", label: "Recently Updated" },
  { value: "title_asc", label: "Title A-Z" },
  { value: "title_desc", label: "Title Z-A" },
];

export const DEFAULT_PAGINATION = {
  limit: 10,
  offset: 0,
  total: 0,
  pages: 0,
};

export const MAX_FILE_SIZE = 10; // MB
export const ALLOWED_FILE_TYPES = ["pdf", "doc", "docx", "txt", "md"];
