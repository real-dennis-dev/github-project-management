// src/components/github-integration/RepositoryDetail.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Badge,
  Alert,
  LoadingSpinner,
  IconWrapper,
  Modal,
  Breadcrumb,
  Tabs,
} from "../common";
import useGitHub from "../../hooks/useGitHub";
import {
  formatDate,
  formatNumber,
  getStateBadgeVariant,
  getStateColor,
} from "./GitHubConstants";

const RepositoryDetail = () => {
  const { repositoryId } = useParams();
  const navigate = useNavigate();
  const {
    repository,
    commits,
    branches,
    pullRequests,
    issues,
    stats,
    loading,
    error,
    syncing,
    syncRepository,
    disconnectRepository,
    navigateToStats,
    navigateToWebhook,
    navigateToRepositories,
  } = useGitHub();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "GitHub", href: "/github" },
    { label: "Repositories", href: "/github/repositories" },
    { label: repository?.repo_name || "Repository", href: "" },
  ];

  // Handle sync
  const handleSync = async () => {
    try {
      await syncRepository();
    } catch (err) {
      // Error handled by hook
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await disconnectRepository(repositoryId);
      navigate("/github/repositories");
    } catch (err) {
      // Error handled by hook
    }
  };

  if (loading && !repository) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading repository">
          {error}
        </Alert>
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="p-6">
        <Alert variant="warning" title="Repository not found">
          The repository you're looking for doesn't exist or has been
          disconnected.
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
          <h1 className="text-2xl font-bold">{repository.repo_name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-sm text-neutral-500">
              {repository.repo_owner}
            </span>
            <Badge variant="success" size="sm">
              Connected
            </Badge>
            <a
              href={repository.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-500 hover:underline"
            >
              View on GitHub ↗
            </a>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigateToStats(repositoryId)}
          >
            <IconWrapper icon="📊" size="sm" />
            Statistics
          </Button>
          <Button
            variant="outline"
            onClick={() => navigateToWebhook(repositoryId)}
          >
            <IconWrapper icon="🔔" size="sm" />
            Webhook
          </Button>
          <Button variant="outline" onClick={handleSync} loading={syncing}>
            <IconWrapper icon="🔄" size="sm" />
            Sync
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            🗑️ Disconnect
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
            <p className="text-2xl font-bold text-primary-500">
              {formatNumber(stats.commits?.total || 0)}
            </p>
            <p className="text-sm text-neutral-500">Commits</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
            <p className="text-2xl font-bold text-info">
              {formatNumber(stats.branches?.total || 0)}
            </p>
            <p className="text-sm text-neutral-500">Branches</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
            <p className="text-2xl font-bold text-success">
              {formatNumber(stats.pullRequests?.total || 0)}
            </p>
            <p className="text-sm text-neutral-500">Pull Requests</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
            <p className="text-2xl font-bold text-error">
              {formatNumber(stats.issues?.total || 0)}
            </p>
            <p className="text-sm text-neutral-500">Issues</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="border-b border-neutral-200 dark:border-neutral-700 px-4">
          <div className="flex gap-4 overflow-x-auto">
            {["overview", "commits", "branches", "pull-requests", "issues"].map(
              (tab) => (
                <button
                  key={tab}
                  className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-primary-500 text-primary-500"
                      : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "overview" && "Overview"}
                  {tab === "commits" &&
                    `Commits (${formatNumber(commits.length)})`}
                  {tab === "branches" &&
                    `Branches (${formatNumber(branches.length)})`}
                  {tab === "pull-requests" &&
                    `PRs (${formatNumber(pullRequests.length)})`}
                  {tab === "issues" &&
                    `Issues (${formatNumber(issues.length)})`}
                </button>
              )
            )}
          </div>
        </div>

        <div className="p-4">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">
                    Repository Info
                  </h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Name</dt>
                      <dd className="font-medium">{repository.repo_name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Owner</dt>
                      <dd className="font-medium">{repository.repo_owner}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Default Branch</dt>
                      <dd className="font-mono">
                        {repository.default_branch || "main"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Last Synced</dt>
                      <dd>
                        {repository.last_synced_at
                          ? formatDate(repository.last_synced_at)
                          : "Never"}
                      </dd>
                    </div>
                  </dl>
                </div>
                {stats?.commits && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 mb-2">
                      Commit Activity
                    </h3>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-neutral-500">Total Commits</dt>
                        <dd className="font-medium">
                          {formatNumber(stats.commits.total)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-500">Unique Authors</dt>
                        <dd className="font-medium">
                          {formatNumber(stats.commits.uniqueAuthors)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-500">Most Active Author</dt>
                        <dd className="font-medium truncate max-w-[150px]">
                          {stats.commits.mostActiveAuthor || "-"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-neutral-500">
                          Average Commit Size
                        </dt>
                        <dd className="font-medium">
                          {formatNumber(stats.commits.averageCommitSize || 0)}{" "}
                          lines
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Commits Tab */}
          {activeTab === "commits" && (
            <div className="space-y-2">
              {commits.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">
                  No commits found
                </p>
              ) : (
                commits.map((commit) => (
                  <div
                    key={commit.id}
                    className="flex items-start gap-4 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {commit.commit_message}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                        <span>{commit.author_name}</span>
                        <span>•</span>
                        <span>{formatDate(commit.committed_at)}</span>
                        <span>•</span>
                        <span className="font-mono text-xs">
                          {commit.commit_sha?.substring(0, 7)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-success">
                        +{commit.added_lines || 0}
                      </span>
                      <span className="text-error">
                        -{commit.removed_lines || 0}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Branches Tab */}
          {activeTab === "branches" && (
            <div className="space-y-2">
              {branches.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">
                  No branches found
                </p>
              ) : (
                branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🌿</span>
                      <span className="font-medium">{branch.branch_name}</span>
                      {branch.is_default && (
                        <Badge variant="info" size="sm">
                          Default
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-neutral-500 font-mono">
                      {branch.last_commit_sha?.substring(0, 7)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pull Requests Tab */}
          {activeTab === "pull-requests" && (
            <div className="space-y-2">
              {pullRequests.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">
                  No pull requests found
                </p>
              ) : (
                pullRequests.map((pr) => (
                  <div
                    key={pr.id}
                    className="flex items-start gap-4 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{pr.title}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                        <Badge
                          variant={getStateBadgeVariant(pr.state)}
                          size="sm"
                        >
                          {pr.state}
                        </Badge>
                        <span>#{pr.pr_number}</span>
                        <span>by {pr.author}</span>
                        <span>•</span>
                        <span>{formatDate(pr.created_at_github)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-success">+{pr.additions || 0}</span>
                      <span className="text-error">-{pr.deletions || 0}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Issues Tab */}
          {activeTab === "issues" && (
            <div className="space-y-2">
              {issues.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">
                  No issues found
                </p>
              ) : (
                issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start gap-4 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{issue.title}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                        <Badge
                          variant={getStateBadgeVariant(issue.state)}
                          size="sm"
                        >
                          {issue.state}
                        </Badge>
                        <span>#{issue.issue_number}</span>
                        <span>by {issue.author}</span>
                        <span>•</span>
                        <span>{formatDate(issue.created_at_github)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Disconnect Repository"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to disconnect this repository? This will
            remove all associated data.
          </p>
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="font-medium">{repository.repo_name}</p>
            <p className="text-sm text-neutral-500">{repository.repo_owner}</p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Disconnect
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RepositoryDetail;
