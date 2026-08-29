// src/components/github/CommitList.jsx
import React, { useEffect, useState } from "react";
import { useGithub } from "../../hooks/useGithub";
import {
  LoadingSpinner,
  Alert,
  EmptyState,
  Pagination,
  SearchBar,
  Badge,
} from "../common";
import { GitCommit, User, Calendar, Search } from "lucide-react";

const CommitList = ({ repositoryId }) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [author, setAuthor] = useState("");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const {
    getCommits,
    commits,
    pagination,
    isCommitsLoading,
    error,
    clearError,
    setFilters,
    filters,
  } = useGithub();

  const limit = 20;

  useEffect(() => {
    if (repositoryId) {
      const params = {
        page,
        limit,
        search: searchTerm || undefined,
        author: author || undefined,
        since: since || undefined,
        until: until || undefined,
      };
      getCommits(repositoryId, params);
    }
  }, [repositoryId, page, searchTerm, author, since, until]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (!repositoryId) {
    return (
      <EmptyState
        title="No repository selected"
        description="Select a repository from the list to view commits."
        icon={<GitCommit className="w-12 h-12 text-neutral-400" />}
      />
    );
  }

  if (isCommitsLoading && commits.length === 0) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (commits.length === 0) {
    return (
      <EmptyState
        title="No commits found"
        description="This repository doesn't have any commits yet."
        icon={<GitCommit className="w-12 h-12 text-neutral-400" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search commit messages..."
          className="flex-1 min-w-[200px]"
        />
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author email..."
          className="px-3 py-2 bg-neutral-200 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        <input
          type="date"
          value={since}
          onChange={(e) => setSince(e.target.value)}
          className="px-3 py-2 bg-neutral-200 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        <input
          type="date"
          value={until}
          onChange={(e) => setUntil(e.target.value)}
          className="px-3 py-2 bg-neutral-200 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        <Badge variant="info" size="lg">
          {pagination.total || commits.length} commits
        </Badge>
      </div>

      <div className="space-y-3">
        {commits.map((commit) => (
          <div
            key={commit.id}
            className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-neutral-400 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-primary-500" />
                  <span className="text-xs font-mono text-neutral-500">
                    {commit.commit_sha?.slice(0, 7)}
                  </span>
                </div>
                <p className="text-neutral-900 font-medium mt-1">
                  {commit.commit_message}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-neutral-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {commit.author_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(commit.committed_at)}
                  </span>
                  {commit.added_lines !== undefined && (
                    <span className="text-success">+{commit.added_lines}</span>
                  )}
                  {commit.removed_lines !== undefined && (
                    <span className="text-error">-{commit.removed_lines}</span>
                  )}
                </div>
              </div>
              {commit.author_email && (
                <Badge variant="secondary" size="sm">
                  {commit.author_email}
                </Badge>
              )}
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

export default CommitList;
