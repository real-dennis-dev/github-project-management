// src/components/github/IssueList.jsx
import React, { useEffect, useState } from "react";
import { useGithub } from "../../hooks/useGithub";
import {
  LoadingSpinner,
  Alert,
  EmptyState,
  Pagination,
  Badge,
} from "../common";
import { AlertCircle, User, Calendar, CheckCircle } from "lucide-react";

const IssueList = ({ repositoryId }) => {
  const [page, setPage] = useState(1);
  const [state, setState] = useState("all");
  const { getIssues, issues, pagination, isIssuesLoading, error, clearError } =
    useGithub();

  const limit = 20;

  useEffect(() => {
    if (repositoryId) {
      getIssues(repositoryId, { page, limit, state });
    }
  }, [repositoryId, page, state]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const getStateIcon = (issueState) => {
    return issueState === "open" ? (
      <AlertCircle className="w-4 h-4 text-success" />
    ) : (
      <CheckCircle className="w-4 h-4 text-neutral-400" />
    );
  };

  const getStateBadge = (issueState) => {
    return issueState === "open" ? (
      <Badge variant="success">Open</Badge>
    ) : (
      <Badge variant="secondary">Closed</Badge>
    );
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  if (!repositoryId) {
    return (
      <EmptyState
        title="No repository selected"
        description="Select a repository from the list to view issues."
        icon={<AlertCircle className="w-12 h-12 text-neutral-400" />}
      />
    );
  }

  if (isIssuesLoading && issues.length === 0) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (issues.length === 0) {
    return (
      <EmptyState
        title="No issues found"
        description="This repository doesn't have any issues."
        icon={<AlertCircle className="w-12 h-12 text-neutral-400" />}
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
          {pagination.total || issues.length} issues
        </Badge>
      </div>

      <div className="space-y-3">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-neutral-400 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getStateIcon(issue.state)}
                  <span className="text-xs font-mono text-neutral-500">
                    #{issue.issue_number}
                  </span>
                  {getStateBadge(issue.state)}
                </div>
                <p className="text-neutral-900 font-medium mt-1">
                  {issue.title}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-neutral-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {issue.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created: {formatDate(issue.created_at_github)}
                  </span>
                  {issue.closed_at && (
                    <span className="flex items-center gap-1 text-neutral-400">
                      <CheckCircle className="w-3 h-3" />
                      Closed: {formatDate(issue.closed_at)}
                    </span>
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

export default IssueList;
