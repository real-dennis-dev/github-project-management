// src/components/releases/ReleasesDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAllReleases } from "../../hooks/useAllReleases";
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
  List,
  BarChart3,
  Calendar,
  GitBranch,
  Flag,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertTriangle,
  Tag,
  Users,
} from "lucide-react";

// Import existing components (reused with allReleases data)
import ReleaseCard from "./ReleaseCard";
import MilestoneCard from "./MilestoneCard";
import ReleaseStats from "./ReleaseStats";
import MilestoneStats from "./MilestoneStats";

const ReleasesDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'release', 'milestone'

  const queryParams = {
    page,
    limit,
    search: searchTerm || undefined,
    type: filterType === "all" ? undefined : filterType,
  };

  // Hook receives query parameters at the top level
  const {
    statistics,
    items,
    pagination,
    isLoading,
    error,
    clearError,
    refetch,
    setParams,
  } = useAllReleases(queryParams);

  // Sync state changes with query parameters
  useEffect(() => {
    setParams(queryParams);
  }, [page, limit, searchTerm, filterType]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Dashboard refreshed");
  };

  // Tabs configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "releases", label: "Releases", icon: Tag },
    { id: "milestones", label: "Milestones", icon: Flag },
    { id: "stats", label: "Statistics", icon: BarChart3 },
  ];

  if (isLoading && !statistics) {
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

  // if (!statistics) {
  //   return (
  //     <div className="text-center py-12">
  //       <AlertTriangle className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
  //       <p className="text-neutral-500">
  //         No release or milestone data available.
  //       </p>
  //       <Button variant="primary" className="mt-4" onClick={handleRefresh}>
  //         <RefreshCw className="w-4 h-4 mr-2" />
  //         Refresh
  //       </Button>
  //     </div>
  //   );
  // }

  const {
    total_items,
    total_releases,
    total_milestones,
    completed_items,
    active_items,
    completion_rate,
  } = statistics;

  // Render Overview Tab
  const renderOverview = () => {
    const statCards = [
      {
        label: "Total Items",
        value: total_items || 0,
        icon: LayoutDashboard,
        color: "primary",
        description: "Releases + Milestones",
      },
      {
        label: "Releases",
        value: total_releases || 0,
        icon: Tag,
        color: "info",
        description: "All versions",
      },
      {
        label: "Milestones",
        value: total_milestones || 0,
        icon: Flag,
        color: "warning",
        description: "All milestones",
      },
      {
        label: "Completed",
        value: completed_items || 0,
        icon: CheckCircle,
        color: "success",
        description: `${completion_rate || 0}% completion rate`,
      },
      {
        label: "Active",
        value: active_items || 0,
        icon: Clock,
        color: "warning",
        description: "In progress",
      },
      {
        label: "Completion Rate",
        value: `${completion_rate || 0}%`,
        icon: TrendingUp,
        color: completion_rate > 50 ? "success" : "warning",
        description: "Overall progress",
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
                    {stat.description && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {stat.description}
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

        {/* Release Statistics */}
        {statistics.releases && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Release Status Breakdown
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {statistics.releases.byStatus &&
                Object.entries(statistics.releases.byStatus).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="text-center p-2 bg-neutral-200 rounded-lg"
                    >
                      <p className="text-sm font-medium text-neutral-700 capitalize">
                        {status.replace("_", " ")}
                      </p>
                      <p className="text-2xl font-bold text-neutral-900">
                        {count}
                      </p>
                    </div>
                  )
                )}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-500">
              {statistics.releases.latestRelease && (
                <span>
                  Latest Release:{" "}
                  <strong className="text-neutral-700">
                    {statistics.releases.latestRelease.version}
                  </strong>
                </span>
              )}
              {statistics.releases.nextRelease && (
                <span>
                  Next Release:{" "}
                  <strong className="text-neutral-700">
                    {statistics.releases.nextRelease.version}
                  </strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Milestone Statistics */}
        {statistics.milestones && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
              <Flag className="w-4 h-4 mr-2" />
              Milestone Status Breakdown
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {statistics.milestones.byStatus &&
                Object.entries(statistics.milestones.byStatus).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="text-center p-2 bg-neutral-200 rounded-lg"
                    >
                      <p className="text-sm font-medium text-neutral-700 capitalize">
                        {status.replace("_", " ")}
                      </p>
                      <p className="text-2xl font-bold text-neutral-900">
                        {count}
                      </p>
                    </div>
                  )
                )}
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-500">
              <span>
                Average Progress:{" "}
                <strong className="text-neutral-700">
                  {statistics.milestones.averageProgress || 0}%
                </strong>
              </span>
              <span>
                Completion Rate:{" "}
                <strong className="text-neutral-700">
                  {statistics.milestones.completionRate || 0}%
                </strong>
              </span>
              {statistics.milestones.overdueCount > 0 && (
                <span className="text-error">
                  Overdue: <strong>{statistics.milestones.overdueCount}</strong>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Releases Tab
  const renderReleases = () => {
    const releaseItems = items?.filter((item) => item.type === "release") || [];

    if (releaseItems.length === 0) {
      return (
        <div className="text-center py-8 text-neutral-500">
          No releases found.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {releaseItems.map((release) => (
          <ReleaseCard key={release.id} release={release} />
        ))}
      </div>
    );
  };

  // Render Milestones Tab
  const renderMilestones = () => {
    const milestoneItems =
      items?.filter((item) => item.type === "milestone") || [];

    if (milestoneItems.length === 0) {
      return (
        <div className="text-center py-8 text-neutral-500">
          No milestones found.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {milestoneItems.map((milestone) => (
          <MilestoneCard key={milestone.id} milestone={milestone} />
        ))}
      </div>
    );
  };

  // Render Stats Tab
  const renderStats = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2 text-primary-500" />
              Release Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-300 pb-2">
                <span className="text-neutral-600">Total Releases</span>
                <span className="text-2xl font-bold text-neutral-900">
                  {statistics?.releases?.total || 0}
                </span>
              </div>
              {statistics?.releases?.byStatus &&
                Object.entries(statistics.releases.byStatus).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex justify-between items-center"
                    >
                      <span className="text-neutral-600 capitalize">
                        {status.replace("_", " ")}
                      </span>
                      <Badge
                        variant={
                          status === "released"
                            ? "success"
                            : status === "in_progress"
                            ? "warning"
                            : status === "testing"
                            ? "info"
                            : status === "cancelled"
                            ? "error"
                            : "neutral"
                        }
                      >
                        {count}
                      </Badge>
                    </div>
                  )
                )}
            </div>
          </div>

          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Flag className="w-5 h-5 mr-2 text-warning" />
              Milestone Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-300 pb-2">
                <span className="text-neutral-600">Total Milestones</span>
                <span className="text-2xl font-bold text-neutral-900">
                  {statistics?.milestones?.total || 0}
                </span>
              </div>
              {statistics?.milestones?.byStatus &&
                Object.entries(statistics.milestones.byStatus).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex justify-between items-center"
                    >
                      <span className="text-neutral-600 capitalize">
                        {status.replace("_", " ")}
                      </span>
                      <Badge
                        variant={
                          status === "completed"
                            ? "success"
                            : status === "in_progress"
                            ? "warning"
                            : status === "delayed"
                            ? "error"
                            : "neutral"
                        }
                      >
                        {count}
                      </Badge>
                    </div>
                  )
                )}
              <div className="flex justify-between items-center border-t border-neutral-300 pt-2">
                <span className="text-neutral-600">Average Progress</span>
                <span className="text-xl font-bold text-neutral-900">
                  {statistics?.milestones?.averageProgress || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Overdue</span>
                <Badge
                  variant={
                    statistics?.milestones?.overdueCount > 0
                      ? "error"
                      : "success"
                  }
                >
                  {statistics?.milestones?.overdueCount || 0}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        {items && items.length > 0 && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-neutral-500" />
              Recent Activity
            </h3>
            <div className="space-y-2">
              {items.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition-colors cursor-pointer"
                  onClick={() => {
                    if (item.type === "release") {
                      navigate(`/releases/${item.id}`);
                    } else {
                      navigate(`/milestones/${item.id}`);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {item.type === "release" ? (
                      <Tag className="w-4 h-4 text-primary-500" />
                    ) : (
                      <Flag className="w-4 h-4 text-warning" />
                    )}
                    <span className="text-sm text-neutral-800">
                      {item.title || item.name}
                    </span>
                    <Badge
                      variant={item.type === "release" ? "info" : "warning"}
                      size="sm"
                    >
                      {item.type}
                    </Badge>
                    <Badge
                      variant={
                        item.status === "released" ||
                        item.status === "completed"
                          ? "success"
                          : item.status === "in_progress"
                          ? "warning"
                          : item.status === "delayed" ||
                            item.status === "cancelled"
                          ? "error"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {item.status?.replace("_", " ") || "Unknown"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.progress !== undefined && (
                      <span className="text-xs text-neutral-500">
                        {item.progress}%
                      </span>
                    )}
                    <span className="text-xs text-neutral-400">
                      {item.updated_at
                        ? new Date(item.updated_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "releases":
        return renderReleases();
      case "milestones":
        return renderMilestones();
      case "stats":
        return renderStats();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Releases & Milestones Dashboard
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
          {statistics?.lastUpdated && (
            <Badge variant="neutral" size="sm">
              Updated: {new Date(statistics.lastUpdated).toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search releases and milestones..."
          className="flex-1 min-w-[200px]"
        />
        <div className="flex items-center space-x-2">
          <Button
            variant={filterType === "all" ? "primary" : "ghost"}
            size="sm"
            onClick={() => handleFilterChange("all")}
          >
            All
          </Button>
          <Button
            variant={filterType === "release" ? "primary" : "ghost"}
            size="sm"
            onClick={() => handleFilterChange("release")}
          >
            <Tag className="w-4 h-4 mr-1" />
            Releases
          </Button>
          <Button
            variant={filterType === "milestone" ? "primary" : "ghost"}
            size="sm"
            onClick={() => handleFilterChange("milestone")}
          >
            <Flag className="w-4 h-4 mr-1" />
            Milestones
          </Button>
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

      {items &&
        items.length > 0 &&
        pagination?.totalPages > 1 &&
        activeTab !== "stats" && (
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages || 1}
            onPageChange={handlePageChange}
          />
        )}
    </div>
  );
};

export default ReleasesDashboard;
