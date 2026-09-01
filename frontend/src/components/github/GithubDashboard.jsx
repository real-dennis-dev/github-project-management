// src/components/github/GithubDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGithubDashboard } from "../../hooks/useGithubDashboard";
import { useToast } from "../../hooks/useToast";
import {
  LoadingSpinner,
  Alert,
  Button,
  Badge,
  SearchBar,
  Pagination,
} from "../common";
import {
  LayoutDashboard,
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  Building2,
} from "lucide-react";

// Import existing components (reused with dashboard data)
import {
  RepositoryStats,
  CommitList,
  PullRequestList,
  IssueList,
} from "./index";

const GithubDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    getStats,
    stats,
    activity,
    pagination,
    isLoading,
    error,
    clearError,
    refetch,
  } = useGithubDashboard();

  useEffect(() => {
    getStats({ page, limit });
  }, [page, limit]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Dashboard refreshed");
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  const formatRelativeTime = (date) => {
    if (!date) return "N/A";
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  // Tabs configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "activity", label: "Activity", icon: Clock },
    { id: "repositories", label: "Repositories", icon: GitBranch },
  ];

  if (isLoading && !stats) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
        <Button variant="primary" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <GitBranch className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p className="text-neutral-500">No GitHub data available.</p>
        <Button variant="primary" className="mt-4" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const { summary, projects, activity: activityData } = stats;

  // Get icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case "commit":
        return <GitCommit className="w-4 h-4 text-primary-500" />;
      case "pull_request":
        return <GitPullRequest className="w-4 h-4 text-success" />;
      case "issue":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-500" />;
    }
  };

  const getActivityBadge = (type) => {
    switch (type) {
      case "commit":
        return (
          <Badge variant="primary" size="sm">
            Commit
          </Badge>
        );
      case "pull_request":
        return (
          <Badge variant="success" size="sm">
            PR
          </Badge>
        );
      case "issue":
        return (
          <Badge variant="warning" size="sm">
            Issue
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            {type}
          </Badge>
        );
    }
  };

  // Render Overview Tab
  const renderOverview = () => {
    const statCards = [
      {
        label: "Projects",
        value: summary?.projects || 0,
        icon: Building2,
        color: "info",
      },
      {
        label: "Repositories",
        value: summary?.repositories || 0,
        icon: GitBranch,
        color: "primary",
      },
      {
        label: "Commits",
        value: summary?.commits || 0,
        icon: GitCommit,
        color: "primary",
        detail: `${summary?.totalAdditions || 0} additions, ${
          summary?.totalDeletions || 0
        } deletions`,
      },
      {
        label: "Pull Requests",
        value: summary?.pullRequests || 0,
        icon: GitPullRequest,
        color: "success",
        detail: `${summary?.openPullRequests || 0} open, ${
          summary?.mergedPullRequests || 0
        } merged`,
      },
      {
        label: "Issues",
        value: summary?.issues || 0,
        icon: AlertCircle,
        color: "warning",
        detail: `${summary?.openIssues || 0} open, ${
          summary?.closedIssues || 0
        } closed`,
      },
      {
        label: "Total Changes",
        value: summary?.totalChanges?.toLocaleString() || 0,
        icon: TrendingUp,
        color: "neutral",
        detail: `+${summary?.totalAdditions || 0} / -${
          summary?.totalDeletions || 0
        }`,
      },
    ];

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-primary-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-500 truncate">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {stat.value}
                    </p>
                    {stat.detail && (
                      <p className="text-xs text-neutral-400 mt-0.5 truncate">
                        {stat.detail}
                      </p>
                    )}
                  </div>
                  <Icon
                    className={`w-6 h-6 text-${stat.color}-500 opacity-50 flex-shrink-0`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Projects with GitHub Integration */}
        {projects && projects.length > 0 && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Projects with GitHub Integration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.map((project) => (
                <div
                  key={project.projectId}
                  className="flex items-center justify-between p-3 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition-colors cursor-pointer"
                  onClick={() => navigate(`/github/${project.projectId}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {project.projectName}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {project.stats.repositories} repos ·{" "}
                      {project.stats.commits} commits
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.latestActivityAt && (
                      <span className="text-xs text-neutral-400">
                        {formatRelativeTime(project.latestActivityAt)}
                      </span>
                    )}
                    <Badge variant="info" size="sm">
                      {project.stats.pullRequests + project.stats.issues}{" "}
                      activity
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Preview */}
        {activityData && activityData.length > 0 && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-neutral-700">
                Recent Activity
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("activity")}
              >
                View All →
              </Button>
            </div>
            <div className="space-y-2">
              {activityData.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition-colors cursor-pointer"
                  onClick={() => {
                    if (
                      item.navigation?.projectId &&
                      item.navigation?.repositoryId
                    ) {
                      navigate(`/github/${item.navigation.projectId}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getActivityIcon(item.type)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {getActivityBadge(item.type)}
                        <span className="text-sm text-neutral-800 truncate">
                          {item.type === "commit"
                            ? item.data?.message || "Commit"
                            : item.data?.title || "Activity"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span>{item.repository?.name}</span>
                        <span>·</span>
                        <span>{item.project?.name}</span>
                        {item.data?.author && (
                          <>
                            <span>·</span>
                            <span>{item.data.author}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400 flex-shrink-0">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Activity Tab
  const renderActivity = () => {
    const filteredActivity = activity?.filter((item) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        item.data?.message?.toLowerCase().includes(searchLower) ||
        item.data?.title?.toLowerCase().includes(searchLower) ||
        item.repository?.name?.toLowerCase().includes(searchLower) ||
        item.project?.name?.toLowerCase().includes(searchLower) ||
        item.data?.author?.toLowerCase().includes(searchLower)
      );
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activity..."
            className="flex-1 min-w-[200px]"
          />
          <Badge variant="info" size="lg">
            {pagination?.total || activity?.length || 0} activities
          </Badge>
        </div>

        <div className="space-y-3">
          {filteredActivity?.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-neutral-400 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getActivityIcon(item.type)}
                    {getActivityBadge(item.type)}
                    <span className="text-xs text-neutral-500 font-mono">
                      #
                      {item.type === "commit"
                        ? item.data?.sha?.slice(0, 7)
                        : item.data?.number}
                    </span>
                    {item.data?.state && (
                      <Badge
                        variant={
                          item.data.state === "open"
                            ? "success"
                            : item.data.state === "merged"
                            ? "primary"
                            : "neutral"
                        }
                        size="sm"
                      >
                        {item.data.state}
                      </Badge>
                    )}
                  </div>

                  <p className="text-neutral-900 font-medium mt-1">
                    {item.type === "commit"
                      ? item.data?.message
                      : item.data?.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {item.project?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      {item.repository?.name}
                    </span>
                    {item.data?.author && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {item.data.author}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.timestamp)}
                    </span>
                    {item.type === "commit" && (
                      <>
                        <span className="text-success">
                          +{item.data?.additions || 0}
                        </span>
                        <span className="text-error">
                          -{item.data?.deletions || 0}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {item.repository?.url && (
                    <a
                      href={item.repository.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-primary-500 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {item.navigation?.projectId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/github/${item.navigation.projectId}`)
                      }
                    >
                      View →
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivity?.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            No activity found matching your search.
          </div>
        )}

        {pagination?.pages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.pages || 1}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    );
  };

  // Render Repositories Tab
  const renderRepositories = () => {
    // Flatten all repositories from projects
    const allRepos =
      projects?.flatMap((project) =>
        project.repositories?.map((repo) => ({
          ...repo,
          projectName: project.projectName,
          projectId: project.projectId,
        }))
      ) || [];

    const filteredRepos = allRepos.filter((repo) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        repo.name?.toLowerCase().includes(searchLower) ||
        repo.owner?.toLowerCase().includes(searchLower) ||
        repo.projectName?.toLowerCase().includes(searchLower)
      );
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search repositories..."
            className="flex-1 min-w-[200px]"
          />
          <Badge variant="info" size="lg">
            {filteredRepos.length} repositories
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map((repo) => (
            <div
              key={repo.repositoryId}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-primary-400 transition-colors cursor-pointer"
              onClick={() => navigate(`/github/${repo.projectId}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <h4 className="font-medium text-neutral-900 truncate">
                      {repo.name}
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {repo.owner} · {repo.projectName}
                  </p>
                  {repo.defaultBranch && (
                    <Badge variant="neutral" size="sm" className="mt-1">
                      {repo.defaultBranch}
                    </Badge>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <GitCommit className="w-3 h-3" />
                      {repo.stats?.commits || 0}
                    </Badge>
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <GitPullRequest className="w-3 h-3" />
                      {repo.stats?.pullRequests || 0}
                    </Badge>
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {repo.stats?.issues || 0}
                    </Badge>
                  </div>
                </div>
                {repo.url && (
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-primary-500 transition-colors flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              {repo.lastSyncedAt && (
                <p className="text-xs text-neutral-400 mt-2">
                  Synced: {formatRelativeTime(repo.lastSyncedAt)}
                </p>
              )}
            </div>
          ))}
        </div>

        {filteredRepos.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            No repositories found matching your search.
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "activity":
        return renderActivity();
      case "repositories":
        return renderRepositories();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            GitHub Dashboard
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Aggregated view across all projects
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {stats?.generatedAt && (
            <Badge variant="neutral" size="sm">
              Updated: {new Date(stats.generatedAt).toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </div>

      <div className="border-b border-neutral-300">
        <nav className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-500 text-white"
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">{renderContent()}</div>
    </div>
  );
};

export default GithubDashboard;
