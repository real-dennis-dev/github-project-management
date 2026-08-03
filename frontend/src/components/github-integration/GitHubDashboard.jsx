// src/components/github-integration/GitHubDashboard.jsx

import React, { useState } from "react";
import {
  Button,
  Card,
  Badge,
  Alert,
  LoadingSpinner,
  EmptyState,
  IconWrapper,
  ProgressBar,
} from "../common";
import useGitHub from "../../hooks/useGitHub";
import {
  REPOSITORY_STATUS,
  formatNumber,
  formatDate,
  STATS_COLORS,
} from "./GitHubConstants";

const GitHubDashboard = () => {
  const {
    repositories,
    stats,
    loading,
    error,
    hasRepositories,
    navigateToRepository,
    navigateToConnect,
    navigateToStats,
  } = useGitHub();

  const [selectedRepo, setSelectedRepo] = useState(null);

  if (loading && !repositories.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !repositories.length) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading repositories">
          {error}
        </Alert>
      </div>
    );
  }

  if (!hasRepositories) {
    return (
      <div className="p-6">
        <EmptyState
          title="No GitHub repositories connected"
          description="Connect your GitHub repositories to track commits, branches, pull requests, and issues directly from your project."
          icon="🔗"
          action={
            <Button variant="primary" onClick={navigateToConnect}>
              <IconWrapper icon="➕" size="sm" />
              Connect Repository
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">GitHub Integration</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {repositories.length} connected repositories
          </p>
        </div>
        <Button variant="primary" onClick={navigateToConnect}>
          <IconWrapper icon="➕" size="sm" />
          Connect Repository
        </Button>
      </div>

      {/* Repository Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigateToRepository(repo.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">
                  {repo.repo_name}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                  {repo.repo_owner}
                </p>
              </div>
              <Badge variant="success" size="sm">
                Connected
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Default Branch</span>
                <span className="font-mono">
                  {repo.default_branch || "main"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Last Synced</span>
                <span>
                  {repo.last_synced_at
                    ? formatDate(repo.last_synced_at)
                    : "Never"}
                </span>
              </div>
            </div>

            {repo.stats && (
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-primary-500">
                      {formatNumber(repo.stats.commits)}
                    </p>
                    <p className="text-xs text-neutral-500">Commits</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-info">
                      {formatNumber(repo.stats.branches)}
                    </p>
                    <p className="text-xs text-neutral-500">Branches</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-success">
                      {formatNumber(repo.stats.pullRequests)}
                    </p>
                    <p className="text-xs text-neutral-500">PRs</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToStats(repo.id);
                }}
                className="flex-1"
              >
                View Stats
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Overview */}
      {stats && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Repository Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-2xl font-bold text-primary-500">
                {formatNumber(stats.commits?.total || 0)}
              </p>
              <p className="text-sm text-neutral-500">Total Commits</p>
            </div>
            <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-2xl font-bold text-info">
                {formatNumber(stats.branches?.total || 0)}
              </p>
              <p className="text-sm text-neutral-500">Total Branches</p>
            </div>
            <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-2xl font-bold text-success">
                {formatNumber(stats.pullRequests?.total || 0)}
              </p>
              <p className="text-sm text-neutral-500">Total PRs</p>
            </div>
            <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-2xl font-bold text-error">
                {formatNumber(stats.issues?.total || 0)}
              </p>
              <p className="text-sm text-neutral-500">Total Issues</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubDashboard;
