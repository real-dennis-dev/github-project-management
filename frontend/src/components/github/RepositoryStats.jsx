// src/components/github/RepositoryStats.jsx
import React, { useEffect } from "react";
import { useGithub } from "../../hooks/useGithub";
import { LoadingSpinner, Alert, EmptyState, Badge } from "../common";
import {
  BarChart3,
  GitCommit,
  GitBranch,
  GitPullRequest,
  AlertCircle,
  Users,
  Calendar,
} from "lucide-react";

const RepositoryStats = ({ repositoryId }) => {
  const {
    getRepositoryStats,
    repositoryStats,
    isStatsLoading,
    error,
    clearError,
  } = useGithub();

  useEffect(() => {
    if (repositoryId) {
      getRepositoryStats(repositoryId);
    }
  }, [repositoryId]);

  if (!repositoryId) {
    return (
      <EmptyState
        title="No repository selected"
        description="Select a repository from the list to view statistics."
        icon={<BarChart3 className="w-12 h-12 text-neutral-400" />}
      />
    );
  }

  if (isStatsLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!repositoryStats) {
    return (
      <EmptyState
        title="No statistics available"
        description="Sync the repository to generate statistics."
        icon={<BarChart3 className="w-12 h-12 text-neutral-400" />}
      />
    );
  }

  const { repository, commits, branches, pullRequests, issues } =
    repositoryStats;

  const statCards = [
    {
      label: "Total Commits",
      value: commits?.total || 0,
      icon: GitCommit,
      color: "primary",
      detail: `${commits?.stats?.totalAdditions || 0} additions, ${
        commits?.stats?.totalDeletions || 0
      } deletions`,
    },
    {
      label: "Branches",
      value: branches?.total || 0,
      icon: GitBranch,
      color: "secondary",
    },
    {
      label: "Pull Requests",
      value: pullRequests?.total || 0,
      icon: GitPullRequest,
      color: "success",
      detail: `${pullRequests?.open || 0} open, ${
        pullRequests?.merged || 0
      } merged, ${pullRequests?.closed || 0} closed`,
    },
    {
      label: "Issues",
      value: issues?.total || 0,
      icon: AlertCircle,
      color: "error",
      detail: `${issues?.open || 0} open, ${issues?.closed || 0} closed`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Repository Info */}
      {repository && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {repository.name}
              </h3>
              <p className="text-sm text-neutral-500">
                Owner: {repository.owner} | Default Branch:{" "}
                {repository.defaultBranch}
              </p>
            </div>
            {repository.lastSyncedAt && (
              <Badge
                variant="info"
                size="sm"
                className="flex items-center gap-1"
              >
                <Calendar className="w-3 h-3" />
                Synced: {new Date(repository.lastSyncedAt).toLocaleString()}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-${stat.color}-500/10`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-500`} />
                </div>
                <span className="text-2xl font-bold text-neutral-900">
                  {stat.value}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-600">{stat.label}</p>
              {stat.detail && (
                <p className="mt-1 text-xs text-neutral-500">{stat.detail}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Commit Stats */}
      {commits?.stats && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="font-medium text-neutral-900 mb-3">Commit Activity</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-neutral-500">Unique Authors</p>
              <p className="text-xl font-semibold text-neutral-900">
                {commits.stats.uniqueAuthors || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Most Active Author</p>
              <p className="text-sm font-medium text-neutral-900 truncate">
                {commits.stats.mostActiveAuthor || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Avg Commit Size</p>
              <p className="text-xl font-semibold text-neutral-900">
                {commits.stats.averageCommitSize || 0}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm text-neutral-500">Contributors</p>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-neutral-400" />
                  <span className="text-xl font-semibold text-neutral-900">
                    {commits.stats.uniqueAuthors || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {commits.stats.commitsByAuthor && (
            <div className="mt-3 pt-3 border-t border-neutral-300">
              <p className="text-sm text-neutral-500 mb-2">Commits by Author</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(commits.stats.commitsByAuthor).map(
                  ([author, count]) => (
                    <Badge key={author} variant="secondary" size="sm">
                      {author}: {count}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RepositoryStats;
