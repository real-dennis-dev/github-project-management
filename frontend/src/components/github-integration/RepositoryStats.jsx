// src/components/github-integration/RepositoryStats.jsx

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Badge,
  Alert,
  LoadingSpinner,
  IconWrapper,
  Breadcrumb,
  ProgressBar,
} from "../common";
import useGitHub from "../../hooks/useGitHub";
import {
  formatNumber,
  formatDate,
  getStateBadgeVariant,
  STATS_COLORS,
} from "./GitHubConstants";

const RepositoryStats = () => {
  const { repositoryId } = useParams();
  const navigate = useNavigate();
  const {
    repository,
    stats,
    commits,
    branches,
    pullRequests,
    issues,
    loading,
    error,
    navigateToRepository,
  } = useGitHub();

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "GitHub", href: "/github" },
    { label: "Repositories", href: "/github/repositories" },
    {
      label: repository?.repo_name || "Repository",
      href: `/github/repositories/${repositoryId}`,
    },
    { label: "Statistics", href: "" },
  ];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading statistics">
          {error}
        </Alert>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <Alert variant="warning" title="No statistics available">
          No statistics available for this repository. Try syncing the
          repository first.
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Repository Statistics</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {repository?.repo_name} · {repository?.repo_owner}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigateToRepository(repositoryId)}
        >
          <IconWrapper icon="←" size="sm" />
          Back to Repository
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 text-center">
          <div className="text-3xl font-bold text-primary-500">
            {formatNumber(stats.commits?.total || 0)}
          </div>
          <p className="text-sm text-neutral-500 mt-1">Total Commits</p>
          <div className="mt-2 text-xs text-neutral-400">
            +{formatNumber(stats.commits?.stats?.totalAdditions || 0)} additions
          </div>
          <div className="text-xs text-neutral-400">
            -{formatNumber(stats.commits?.stats?.totalDeletions || 0)} deletions
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 text-center">
          <div className="text-3xl font-bold text-info">
            {formatNumber(stats.branches?.total || 0)}
          </div>
          <p className="text-sm text-neutral-500 mt-1">Branches</p>
          {stats.branches && (
            <div className="mt-2 text-xs text-neutral-400">
              Default: {repository?.default_branch || "main"}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 text-center">
          <div className="text-3xl font-bold text-success">
            {formatNumber(stats.pullRequests?.total || 0)}
          </div>
          <p className="text-sm text-neutral-500 mt-1">Pull Requests</p>
          {stats.pullRequests && (
            <div className="mt-2 flex justify-center gap-3 text-xs">
              <span className="text-success">
                🟢 {formatNumber(stats.pullRequests.open || 0)} open
              </span>
              <span className="text-info">
                🔵 {formatNumber(stats.pullRequests.merged || 0)} merged
              </span>
              <span className="text-neutral-400">
                ⚪ {formatNumber(stats.pullRequests.closed || 0)} closed
              </span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 text-center">
          <div className="text-3xl font-bold text-error">
            {formatNumber(stats.issues?.total || 0)}
          </div>
          <p className="text-sm text-neutral-500 mt-1">Issues</p>
          {stats.issues && (
            <div className="mt-2 flex justify-center gap-3 text-xs">
              <span className="text-success">
                🟢 {formatNumber(stats.issues.open || 0)} open
              </span>
              <span className="text-neutral-400">
                ⚪ {formatNumber(stats.issues.closed || 0)} closed
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commit Activity */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Commit Activity</h2>
          {stats.commits?.stats && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Total Additions</span>
                  <span className="font-medium text-success">
                    +{formatNumber(stats.commits.stats.totalAdditions)}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Total Deletions</span>
                  <span className="font-medium text-error">
                    -{formatNumber(stats.commits.stats.totalDeletions)}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Unique Authors</span>
                  <span className="font-medium">
                    {formatNumber(stats.commits.stats.uniqueAuthors)}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Most Active Author</span>
                  <span className="font-medium truncate max-w-[150px]">
                    {stats.commits.stats.mostActiveAuthor || "-"}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Average Commit Size</span>
                  <span className="font-medium">
                    {formatNumber(stats.commits.stats.averageCommitSize || 0)}{" "}
                    lines
                  </span>
                </div>
              </div>
              {stats.commits.stats.commitsByAuthor && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="text-sm font-medium mb-2">Commits by Author</p>
                  <div className="space-y-1">
                    {Object.entries(stats.commits.stats.commitsByAuthor)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([author, count]) => (
                        <div
                          key={author}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="truncate max-w-[150px]">
                            {author}
                          </span>
                          <span className="font-medium">
                            {formatNumber(count)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pull Request Stats */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Pull Requests</h2>
          {stats.pullRequests && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Total PRs</span>
                  <span className="font-medium">
                    {formatNumber(stats.pullRequests.total)}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Open</span>
                  <span className="font-medium text-success">
                    {formatNumber(stats.pullRequests.open)}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Merged</span>
                  <span className="font-medium text-info">
                    {formatNumber(stats.pullRequests.merged)}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Closed</span>
                  <span className="font-medium text-neutral-400">
                    {formatNumber(stats.pullRequests.closed)}
                  </span>
                </div>
              </div>

              {/* Distribution */}
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-sm font-medium mb-2">Distribution</p>
                <div className="space-y-1">
                  <div>
                    <div className="flex justify-between text-xs">
                      <span>Open</span>
                      <span>
                        {Math.round(
                          (stats.pullRequests.open / stats.pullRequests.total) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <ProgressBar
                      value={stats.pullRequests.open}
                      max={stats.pullRequests.total}
                      variant="success"
                      size="sm"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs">
                      <span>Merged</span>
                      <span>
                        {Math.round(
                          (stats.pullRequests.merged /
                            stats.pullRequests.total) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <ProgressBar
                      value={stats.pullRequests.merged}
                      max={stats.pullRequests.total}
                      variant="info"
                      size="sm"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs">
                      <span>Closed</span>
                      <span>
                        {Math.round(
                          (stats.pullRequests.closed /
                            stats.pullRequests.total) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <ProgressBar
                      value={stats.pullRequests.closed}
                      max={stats.pullRequests.total}
                      variant="neutral"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Issue Stats */}
      {stats.issues && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Issues</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-2xl font-bold">
                {formatNumber(stats.issues.total)}
              </p>
              <p className="text-sm text-neutral-500">Total Issues</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-success">
                {formatNumber(stats.issues.open)}
              </p>
              <p className="text-sm text-neutral-500">Open</p>
            </div>
            <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-2xl font-bold text-neutral-400">
                {formatNumber(stats.issues.closed)}
              </p>
              <p className="text-sm text-neutral-500">Closed</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs">
              <span>Open vs Closed</span>
              <span>
                {Math.round((stats.issues.open / stats.issues.total) * 100)}%
                open
              </span>
            </div>
            <ProgressBar
              value={stats.issues.open}
              max={stats.issues.total}
              variant="success"
              size="sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryStats;
