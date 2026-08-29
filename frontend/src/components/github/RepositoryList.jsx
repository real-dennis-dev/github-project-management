// src/components/github/RepositoryList.jsx
import React, { useEffect, useState } from "react";
import { useGithub } from "../../hooks/useGithub";
import { useToast } from "../../hooks/useToast";
import {
  Button,
  Badge,
  LoadingSpinner,
  Alert,
  EmptyState,
  Modal,
} from "../common";
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Trash2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

const RepositoryList = ({
  projectId,
  onSelectRepository,
  selectedRepositoryId,
}) => {
  const {
    getRepositories,
    repositories,
    isRepositoriesLoading,
    error,
    clearError,
    disconnectRepository,
    syncRepository,
    isDisconnecting,
    isSyncing,
    syncStatus,
  } = useGithub();
  const { toast } = useToast();
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [repositoryToDisconnect, setRepositoryToDisconnect] = useState(null);

  useEffect(() => {
    if (projectId) {
      getRepositories(projectId);
    }
  }, [projectId]);

  const handleDisconnect = async () => {
    if (!repositoryToDisconnect) return;
    try {
      await disconnectRepository(repositoryToDisconnect.id);
      toast.success("Repository disconnected successfully");
      setShowDisconnectModal(false);
      setRepositoryToDisconnect(null);
    } catch (err) {
      toast.error(err.message || "Failed to disconnect repository");
    }
  };

  const handleSync = async (repositoryId) => {
    try {
      await syncRepository(repositoryId);
      toast.success("Repository synced successfully");
    } catch (err) {
      toast.error(err.message || "Failed to sync repository");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  if (isRepositoriesLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (repositories.length === 0) {
    return (
      <EmptyState
        title="No repositories connected"
        description="Connect a GitHub repository to get started with integration."
        icon={<GitBranch className="w-12 h-12 text-neutral-400" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            className={`bg-neutral-100 border rounded-lg p-4 transition-colors cursor-pointer ${
              selectedRepositoryId === repo.id
                ? "border-primary-500 ring-2 ring-primary-500 ring-opacity-50"
                : "border-neutral-300 hover:border-neutral-400"
            }`}
            onClick={() => onSelectRepository(repo.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {repo.repo_owner}/{repo.repo_name}
                  </h3>
                  <a
                    href={repo.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-primary-500 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Badge variant="info" size="sm">
                    {repo.default_branch || "main"}
                  </Badge>
                  {repo.stats && (
                    <>
                      <Badge
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <GitCommit className="w-3 h-3" />
                        {repo.stats.commits || 0}
                      </Badge>
                      <Badge
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <GitBranch className="w-3 h-3" />
                        {repo.stats.branches || 0}
                      </Badge>
                      <Badge
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <GitPullRequest className="w-3 h-3" />
                        {repo.stats.pullRequests || 0}
                      </Badge>
                      <Badge
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {repo.stats.issues || 0}
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Last synced: {formatDate(repo.last_synced_at)}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSync(repo.id);
                  }}
                  loading={isSyncing && syncStatus.isSyncing}
                  disabled={isSyncing}
                  className="flex items-center gap-1"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRepositoryToDisconnect(repo);
                    setShowDisconnectModal(true);
                  }}
                  className="text-error hover:text-error hover:bg-error/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        title="Disconnect Repository"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Are you sure you want to disconnect{" "}
            <span className="font-semibold">
              {repositoryToDisconnect?.repo_owner}/
              {repositoryToDisconnect?.repo_name}
            </span>
            ? This will remove all synced data.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowDisconnectModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDisconnect}
              loading={isDisconnecting}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RepositoryList;
