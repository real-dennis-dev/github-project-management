// src/components/progress-timeline/ProgressTimelineDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProgressTimeline } from "../../hooks/useProgressTimeline";
import { useToast } from "../../hooks/useToast";
import {
  LoadingSpinner,
  Alert,
  Button,
  Badge,
  SearchBar,
  Pagination,
  Table,
} from "../common";
import {
  LayoutDashboard,
  List,
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Calendar,
  Building2,
  RefreshCw,
  Download,
  Eye,
  ChevronRight,
} from "lucide-react";

// Import existing components (reused with timeline data)
import ProgressStats from "./ProgressStats";

const ProgressTimelineDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [months, setMonths] = useState(12);
  const [sortBy, setSortBy] = useState("latest_activity");
  const [sortOrder, setSortOrder] = useState("desc");

  const {
    fetchStats, // replace getStats with fetchStats
    globalStats,
    projects,
    chartData,
    meta,
    isLoading,
    error,
    clearError,
    refetch,
  } = useProgressTimeline();

  useEffect(() => {
    const params = {
      months,
      page,
      limit,
      sort_by: sortBy,
      sort_order: sortOrder,
      search: searchTerm || undefined,
    };
    fetchStats(params);
  }, [months, page, limit, sortBy, sortOrder, searchTerm]);
  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Dashboard refreshed");
  };

  const handleMonthsChange = (value) => {
    setMonths(value);
    setPage(1);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // Tabs configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: Building2 },
    { id: "chart", label: "Chart View", icon: BarChart3 },
  ];

  // Helper: Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper: Get status badge
  const getStatusBadge = (status) => {
    const configs = {
      completed: { label: "Completed", variant: "success" },
      in_progress: { label: "In Progress", variant: "warning" },
      planned: { label: "Planned", variant: "info" },
      on_hold: { label: "On Hold", variant: "neutral" },
      cancelled: { label: "Cancelled", variant: "error" },
    };
    const config = configs[status] || configs.planned;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Helper: Get progress status
  const getProgressStatus = (progress) => {
    if (progress >= 100) return { label: "Complete", variant: "success" };
    if (progress >= 75) return { label: "On Track", variant: "info" };
    if (progress >= 50) return { label: "In Progress", variant: "warning" };
    if (progress > 0) return { label: "Started", variant: "warning" };
    return { label: "Not Started", variant: "neutral" };
  };

  // Helper: Get trend icon
  const getTrendIcon = (value, comparison) => {
    if (value > comparison)
      return <TrendingUp className="w-4 h-4 text-success" />;
    if (value < comparison)
      return <TrendingDown className="w-4 h-4 text-error" />;
    return <Clock className="w-4 h-4 text-neutral-500" />;
  };

  // Render Overview Tab
  const renderOverview = () => {
    const statCards = [
      {
        label: "Total Projects",
        value: globalStats?.totalProjects || 0,
        icon: Building2,
        color: "info",
        description: "With progress data",
      },
      {
        label: "Total Entries",
        value: globalStats?.totalEntries || 0,
        icon: Calendar,
        color: "primary",
        description: "Timeline records",
      },
      {
        label: "Total Features",
        value: globalStats?.totalFeatures || 0,
        icon: List,
        color: "neutral",
        description: "Across all projects",
      },
      {
        label: "Completed Features",
        value: globalStats?.completedFeatures || 0,
        icon: CheckCircle,
        color: "success",
        description: `${globalStats?.completionRate || 0}% completion rate`,
      },
      {
        label: "Overall Progress",
        value: `${Math.round(globalStats?.overallAverageProgress || 0)}%`,
        icon: TrendingUp,
        color:
          (globalStats?.overallAverageProgress || 0) >= 75
            ? "success"
            : (globalStats?.overallAverageProgress || 0) >= 50
            ? "warning"
            : "error",
        description: `Avg: ${Math.round(
          globalStats?.overallAverageProgress || 0
        )}%`,
      },
    ];

    return (
      <div className="space-y-6">
        {/* Date Range */}
        {globalStats?.dateRange && (
          <div className="flex items-center space-x-4 text-sm text-neutral-500">
            <span>
              📅 {globalStats.dateRange.from} → {globalStats.dateRange.to}
            </span>
            <Badge variant="info" size="sm">
              {months} months
            </Badge>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                      <p className="text-xs text-neutral-400 mt-0.5 truncate">
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

        {/* Recent Activity */}
        {projects && projects.length > 0 && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-neutral-700">
                Recent Activity
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("projects")}
              >
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => {
                const status = getProgressStatus(
                  project.stats?.overallProgress || 0
                );
                return (
                  <div
                    key={project.project.id}
                    className="flex flex-wrap items-center justify-between p-3 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(`/projects/${project.project.id}/timeline`)
                    }
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="text-sm font-medium text-neutral-800 truncate">
                        {project.project.name}
                      </span>
                      <span className="text-xs text-neutral-500 truncate">
                        {project.stats?.totalFeatures || 0} features
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all"
                            style={{
                              width: `${project.stats?.overallProgress || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-neutral-600">
                          {Math.round(project.stats?.overallProgress || 0)}%
                        </span>
                      </div>
                      <Badge variant={status.variant} size="sm">
                        {status.label}
                      </Badge>
                      {project.latestActivity && (
                        <span className="text-xs text-neutral-400">
                          {formatDate(project.latestActivity.date)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Meta Info */}
        {meta && (
          <div className="text-xs text-neutral-400 text-right">
            {meta.returned} of {meta.totalProjectsMatched} projects shown
          </div>
        )}
      </div>
    );
  };

  // Render Projects Tab
  const renderProjects = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search projects..."
            className="flex-1"
          />
          <div className="flex items-center space-x-2">
            <select
              value={months}
              onChange={(e) => handleMonthsChange(Number(e.target.value))}
              className="px-3 py-2 bg-neutral-200 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={3}>3 Months</option>
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
              <option value={24}>24 Months</option>
            </select>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            {searchTerm
              ? "No projects match your search"
              : "No project data available"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              headers={[
                "Project",
                "Status",
                "Features",
                "Completed",
                "Completion Rate",
                "Overall Progress",
                "Latest Activity",
                "Actions",
              ]}
              data={projects}
              variant="striped"
              renderRow={(project) => {
                const status = getProgressStatus(
                  project.stats?.overallProgress || 0
                );
                const latestFeature = project.latestActivity?.feature || "N/A";
                const latestProgress = project.latestActivity?.progress || 0;

                return (
                  <tr
                    key={project.project.id}
                    className="border-b border-neutral-300 hover:bg-neutral-200 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(`/projects/${project.project.id}/timeline`)
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-neutral-500" />
                        <span className="font-medium text-neutral-800">
                          {project.project.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(project.project.status)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {project.stats?.totalFeatures || 0}
                    </td>
                    <td className="px-4 py-3 text-center text-success">
                      {project.stats?.completedFeatures || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={
                          (project.stats?.completionRate || 0) >= 75
                            ? "success"
                            : (project.stats?.completionRate || 0) >= 50
                            ? "warning"
                            : "error"
                        }
                        size="sm"
                      >
                        {Math.round(project.stats?.completionRate || 0)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all"
                            style={{
                              width: `${project.stats?.overallProgress || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-neutral-600">
                          {Math.round(project.stats?.overallProgress || 0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3 text-neutral-500" />
                        <span className="text-sm text-neutral-600">
                          {formatDate(project.latestActivity?.date)}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400">
                        {latestFeature} ({Math.round(latestProgress)}%)
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${project.project.id}/progress`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              }}
            />
          </div>
        )}

        {meta && meta.totalProjectsMatched > limit && (
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(meta.totalProjectsMatched / limit)}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    );
  };

  // Render Chart Tab
  const renderChart = () => {
    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
      return (
        <div className="text-center py-8 text-neutral-500">
          No chart data available
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Progress Timeline
            </h3>
            <Badge variant="info" size="sm">
              {chartData.labels.length} data points
            </Badge>
          </div>

          {/* Chart - Bar Chart Style */}
          <div className="space-y-4">
            {chartData.labels.map((label, index) => {
              const value = chartData.datasets?.[0]?.data?.[index] || 0;
              const isComplete = value >= 100;
              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">{label}</span>
                    <span className="text-neutral-700 font-medium">
                      {Math.round(value)}%
                      {isComplete && (
                        <CheckCircle className="w-4 h-4 text-success inline ml-1" />
                      )}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isComplete
                          ? "bg-success"
                          : value >= 75
                          ? "bg-primary-500"
                          : value >= 50
                          ? "bg-warning"
                          : value >= 25
                          ? "bg-info"
                          : "bg-neutral-400"
                      }`}
                      style={{ width: `${Math.min(value, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features List */}
        {chartData.features && chartData.features.length > 0 && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Features Overview
            </h3>
            <div className="flex flex-wrap gap-2">
              {chartData.features.map((feature) => (
                <Badge key={feature} variant="info" size="sm">
                  {feature}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-neutral-500 mt-2">
              {chartData.features.length} unique features tracked
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "projects":
        return renderProjects();
      case "chart":
        return renderChart();
      default:
        return renderOverview();
    }
  };

  if (isLoading && !globalStats) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Progress & Timeline Dashboard
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Global progress tracking across all projects
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
          {globalStats?.dateRange && (
            <Badge variant="neutral" size="sm">
              📅 {globalStats.dateRange.from}
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

export default ProgressTimelineDashboard;
