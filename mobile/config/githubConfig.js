/**
 * GitHub Integration Configuration
 */
export const GITHUB_CONFIG = {
  clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || "",
  clientSecret: process.env.EXPO_PUBLIC_GITHUB_CLIENT_SECRET || "",
  redirectUri:
    process.env.EXPO_PUBLIC_GITHUB_REDIRECT_URI ||
    "com.your.app://oauth/github",
  apiBaseURL: "https://api.github.com",
  webhookSecret: process.env.EXPO_PUBLIC_GITHUB_WEBHOOK_SECRET || "",

  // Scopes
  scopes: [
    "repo",
    "repo:status",
    "read:repo_hook",
    "write:repo_hook",
    "admin:repo_hook",
    "read:user",
    "user:email",
  ].join(" "),

  // Default repositories to show
  defaultRepos: [],

  // Sync settings
  sync: {
    autoSync: false,
    syncInterval: 3600000, // 1 hour
    maxCommitsPerSync: 100,
    maxPRsPerSync: 50,
    maxIssuesPerSync: 50,
  },
};

export default GITHUB_CONFIG;
