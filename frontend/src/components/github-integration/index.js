// src/components/github-integration/index.js

// Main exports
export { default as GitHubService } from "../../services/GitHubService";
export { default as GitHubRoutes } from "../../routes/GitHubRoutes";
export { default as useGitHub } from "../../hooks/useGitHub";

// Component exports
export { default as GitHubDashboard } from "./GitHubDashboard";
export { default as RepositoryList } from "./RepositoryList";
export { default as RepositoryDetail } from "./RepositoryDetail";
export { default as ConnectRepository } from "./ConnectRepository";
export { default as RepositoryStats } from "./RepositoryStats";
export { default as WebhookSettings } from "./WebhookSettings";

// Constants exports
export * from "./GitHubConstants";

// Combined export object
const GitHubModule = {
  GitHubService: require("../../services/GitHubService").default,
  GitHubRoutes: require("../../routes/GitHubRoutes").default,
  useGitHub: require("../../hooks/useGitHub").default,
  GitHubDashboard: require("./GitHubDashboard").default,
  RepositoryList: require("./RepositoryList").default,
  RepositoryDetail: require("./RepositoryDetail").default,
  ConnectRepository: require("./ConnectRepository").default,
  RepositoryStats: require("./RepositoryStats").default,
  WebhookSettings: require("./WebhookSettings").default,
  ...require("./GitHubConstants"),
};

export default GitHubModule;
