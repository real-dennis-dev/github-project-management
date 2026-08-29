// src/components/github/PullRequestList.jsx
import React, { useEffect, useState } from "react";
import { useGithub } from "../../hooks/useGithub";
import {
  LoadingSpinner,
  Alert,
  EmptyState,
  Pagination,
  Badge,
} from "../common";
import {
  GitPullRequest,
  User,
  Calendar,
  GitMerge,
  XCircle,
  CheckCircle,
} from "lucide-react";

const PullRequestList = ({ repositoryId }) => {
  const [page, setPage] = useState(1);
  const [state, setState] = useState("all");
  const {
    getPullRequests,
    pullRequests,
    pagination,
    isPullRequestsLoading,
    error,
    clearError,
  } = useGithub();

  const limit = 20;

  useEffect(() => {
    if (repositoryId) {
      getPullRequests(repositoryId, { page, limit, state });
    }
  }, [repositoryId, page, state]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const getStateIcon = (prState) => {
    switch (prState) {
      case "open":
        return <GitPullRequest className="w-4 h-4 text-success" />;
      case "merged":
        return <GitMerge className="w-4 h-4 text-primary-500" />;
      case "closed":
        return <XCircle className="w-4 h-4 text-error" />;
      default:
        return <GitPullRequest className="w-4 h-4" />;
    }
  };

  const getStateBadge = (prState) => {
    switch (prState) {
      case "open":
        return <Badge variant="success">Open</Badge>;
      case "merged":
        return <Badge variant="primary">Merged</Badge>;
      case "closed":
        return <Badge variant="error">Closed</Badge>;
      default:
        return <Badge variant="secondary">{prState}</Badge>;
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  if (!repositoryId) {
    return (
      <EmptyState
        title="No repository selected"
        description="Select a repository from the list to view pull requests."
        icon={<GitPullRequest className="w-12 h-12 text-neutral-400" />}
      />
    );
  }

  if (isPullRequestsLoading && pullRequests.length === 0) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (pullRequests.length === 0) {
    return (
      <EmptyState
        title="No pull requests found"
        description="This repository doesn't have any pull requests."
        icon={<GitPullRequest className="w-12 h-12 text-neutral-400" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {["all", "open", "closed"].map((stateOption) => (
            <button
              key={stateOption}
              onClick={() => setState(stateOption)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                state === stateOption
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
              }`}
            >
              {stateOption.charAt(0).toUpperCase() + stateOption.slice(1)}
            </button>
          ))}
        </div>
        <Badge variant="info" size="lg">
          {pagination.total || pullRequests.length} pull requests
        </Badge>
      </div>

      <div className="space-y-3">
        {pullRequests.map((pr) => (
          <div
            key={pr.id}
            className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-neutral-400 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getStateIcon(pr.state)}
                  <span className="text-xs font-mono text-neutral-500">
                    #{pr.pr_number}
                  </span>
                  {getStateBadge(pr.state)}
                </div>
                <p className="text-neutral-900 font-medium mt-1">{pr.title}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-neutral-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {pr.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created: {formatDate(pr.created_at_github)}
                  </span>
                  {pr.merged_at && (
                    <span className="flex items-center gap-1 text-success">
                      <GitMerge className="w-3 h-3" />
                      Merged: {formatDate(pr.merged_at)}
                    </span>
                  )}
                  {pr.additions !== undefined && (
                    <span className="text-success">+{pr.additions}</span>
                  )}
                  {pr.deletions !== undefined && (
                    <span className="text-error">-{pr.deletions}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default PullRequestList;
