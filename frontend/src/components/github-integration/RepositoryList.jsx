// src/components/github-integration/RepositoryList.jsx

import React, { useState } from "react";
import {
  Table,
  Button,
  SearchBar,
  Badge,
  Pagination,
  EmptyState,
  LoadingSpinner,
  Modal,
  Alert,
  IconWrapper,
} from "../common";
import useGitHub from "../../hooks/useGitHub";
import {
  formatDate,
  formatNumber,
  getStateBadgeVariant,
} from "./GitHubConstants";

const RepositoryList = () => {
  const {
    repositories,
    loading,
    error,
    pagination,
    disconnectRepository,
    syncRepository,
    navigateToRepository,
    navigateToConnect,
    hasRepositories,
  } = useGitHub();

  const [selectedRepo, setSelectedRepo] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Table headers
  const headers = [
    { key: "repo_name", label: "Repository", sortable: true },
    { key: "repo_owner", label: "Owner", sortable: true },
    { key: "default_branch", label: "Branch", sortable: true },
    { key: "stats", label: "Stats", sortable: false },
    { key: "last_synced_at", label: "Last Synced", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  // Filter repositories by search query
  const filteredRepositories = repositories.filter((repo) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      repo.repo_name.toLowerCase().includes(query) ||
      repo.repo_owner.toLowerCase().includes(query) ||
      repo.repo_url.toLowerCase().includes(query)
    );
  });

  // Handle sync
  const handleSync = async (repoId) => {
    setSyncingId(repoId);
    try {
      await syncRepository();
    } finally {
      setSyncingId(null);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedRepo) {
      try {
        await disconnectRepository(selectedRepo.id);
        setShowDeleteModal(false);
        setSelectedRepo(null);
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

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
          <h1 className="text-2xl font-bold">Repositories</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {filteredRepositories.length} repositories connected
          </p>
        </div>
        <Button variant="primary" onClick={navigateToConnect}>
          <IconWrapper icon="➕" size="sm" />
          Connect Repository
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search repositories..."
          fullWidth
        />
      </div>

      {/* Table */}
      <Table
        headers={headers}
        data={filteredRepositories}
        variant="striped"
        className="overflow-x-auto"
      >
        {(repo) => (
          <tr
            key={repo.id}
            className="hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
            onClick={() => navigateToRepository(repo.id)}
          >
            <td className="px-4 py-3">
              <div>
                <p className="font-medium truncate max-w-xs">
                  {repo.repo_name}
                </p>
                <a
                  href={repo.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-500 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View on GitHub ↗
                </a>
              </div>
            </td>
            <td className="px-4 py-3 text-sm">{repo.repo_owner}</td>
            <td className="px-4 py-3">
              <Badge variant="info" size="sm">
                {repo.default_branch || "main"}
              </Badge>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-4 text-sm">
                <span>
                  <span className="text-primary-500 font-medium">
                    {formatNumber(repo.stats?.commits || 0)}
                  </span>{" "}
                  commits
                </span>
                <span>
                  <span className="text-info font-medium">
                    {formatNumber(repo.stats?.branches || 0)}
                  </span>{" "}
                  branches
                </span>
                <span>
                  <span className="text-success font-medium">
                    {formatNumber(repo.stats?.pullRequests || 0)}
                  </span>{" "}
                  PRs
                </span>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-neutral-500">
              {repo.last_synced_at ? formatDate(repo.last_synced_at) : "Never"}
            </td>
            <td className="px-4 py-3">
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  loading={syncingId === repo.id}
                  onClick={() => handleSync(repo.id)}
                >
                  <IconWrapper icon="🔄" size="sm" />
                  Sync
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-error hover:bg-error/10"
                  onClick={() => {
                    setSelectedRepo(repo);
                    setShowDeleteModal(true);
                  }}
                >
                  🗑️
                </Button>
              </div>
            </td>
          </tr>
        )}
      </Table>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {filteredRepositories.length} of{" "}
            {pagination.total || filteredRepositories.length} repositories
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages || 1}
            onPageChange={() => {}}
            showFirstLast
          />
        </div>
      )}

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
          {selectedRepo && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-medium">{selectedRepo.repo_name}</p>
              <p className="text-sm text-neutral-500">
                {selectedRepo.repo_owner}
              </p>
            </div>
          )}
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

export default RepositoryList;
