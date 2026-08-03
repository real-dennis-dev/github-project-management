// src/components/github-integration/GitHubConstants.js

/**
 * GitHub Integration Constants
 */

// Repository connection status
export const REPOSITORY_STATUS = {
  CONNECTED: "connected",
  SYNCING: "syncing",
  ERROR: "error",
  DISCONNECTED: "disconnected",
};

// Webhook event types
export const WEBHOOK_EVENTS = [
  { value: "push", label: "Push" },
  { value: "pull_request", label: "Pull Request" },
  { value: "issues", label: "Issues" },
  { value: "create", label: "Create" },
  { value: "delete", label: "Delete" },
  { value: "release", label: "Release" },
  { value: "watch", label: "Watch" },
];

// Pull request states
export const PR_STATES = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "merged", label: "Merged" },
];

// Issue states
export const ISSUE_STATES = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

// Content types for webhooks
export const WEBHOOK_CONTENT_TYPES = [
  { value: "json", label: "JSON" },
  { value: "form", label: "Form" },
];

// Default pagination
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
};

// Default filters
export const DEFAULT_FILTERS = {
  state: "all",
  since: "",
  until: "",
  author: "",
  search: "",
  labels: "",
};

// Default webhook config
export const DEFAULT_WEBHOOK_CONFIG = {
  webhookUrl: "",
  events: ["push", "pull_request", "issues"],
  active: true,
  contentType: "json",
};

// Form validation rules
export const CONNECT_REPO_VALIDATION = {
  repoUrl: {
    required: "Repository URL is required",
    pattern: {
      value: /^https:\/\/github\.com\/[\w-]+\/[\w-]+$/,
      message: "Please enter a valid GitHub repository URL",
    },
  },
  accessToken: {
    minLength: { value: 1, message: "Access token is required" },
  },
};

// Repository statistics colors
export const STATS_COLORS = {
  commits: "#ea580c",
  branches: "#2563eb",
  pullRequests: "#16a34a",
  issues: "#dc2626",
};

// Format number with commas
export const formatNumber = (num) => {
  if (num === undefined || num === null) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Format date
export const formatDate = (dateString) => {
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

// Get state badge variant
export const getStateBadgeVariant = (state) => {
  const variants = {
    open: "success",
    closed: "neutral",
    merged: "info",
  };
  return variants[state] || "neutral";
};

// Get state color
export const getStateColor = (state) => {
  const colors = {
    open: "#16a34a",
    closed: "#737373",
    merged: "#2563eb",
  };
  return colors[state] || "#737373";
};
