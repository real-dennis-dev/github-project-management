// src/components/techdebt/AllTechDebtDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAllTechDebt } from "../../hooks/useAllTechDebt";
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
  AlertTriangle,
  Lightbulb,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Zap,
  Building2,
} from "lucide-react";

// Import existing components (reused with allTechDebt data)
import TechDebtPriorityBadge from "./TechDebtPriorityBadge";
import TechDebtStatusBadge from "./TechDebtStatusBadge";
import TechDebtCard from "./TechDebtCard";
import TechDebtFilters from "./TechDebtFilters";
import RefactoringSuggestions from "./RefactoringSuggestions";
import TechDebtExport from "./TechDebtExport";

const AllTechDebtDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ priority: "", status: "" });

  const queryParams = {
    page,
    limit,
    search: searchTerm || undefined,
    priority: filters.priority || undefined,
    status: filters.status || undefined,
  };

  const {
    stats,
    latestItems,
    pagination,
    isLoading,
    error,
    clearError,
    refetch,
  } = useAllTechDebt(queryParams);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Dashboard refreshed");
  };

  // Tabs configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "list", label: "All Items", icon: List },
    { id: "statistics", label: "Statistics", icon: BarChart3 },
    { id: "suggestions", label: "Suggestions", icon: Lightbulb },
    { id: "export", label: "Export", icon: Download },
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
        <AlertTriangle className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p className="text-neutral-500">No tech debt data available.</p>
        <Button variant="primary" className="mt-4" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const { stats: metrics, distributions, projects, highestImpactItems } = stats;

  // Render Overview Tab
  const renderOverview = () => {
    const statCards = [
      {
        label: "Total Items",
        value: metrics?.totalItems || 0,
        icon: AlertTriangle,
        color: "neutral",
        description: "Across all projects",
      },
      {
        label: "Total Projects",
        value: metrics?.totalProjects || 0,
        icon: Building2,
        color: "info",
        description: "With tech debt",
      },
      {
        label: "Resolution Rate",
        value: `${metrics?.resolutionRate || 0}%`,
        icon: CheckCircle,
        color: metrics?.resolutionRate > 50 ? "success" : "warning",
        description: `${metrics?.resolvedItems || 0} resolved`,
      },
      {
        label: "Total Cost",
        value: `$${metrics?.totalCost?.toLocaleString() || 0}`,
        icon: Zap,
        color: "warning",
        description: "Estimated business cost",
      },
      {
        label: "Total Effort",
        value: `${Math.round(metrics?.estimatedEffortHours || 0)}h`,
        icon: Clock,
        color: "info",
        description: "Estimated hours",
      },
      {
        label: "Score",
        value: metrics?.score || 0,
        icon: TrendingUp,
        color:
          metrics?.score <= 25
            ? "success"
            : metrics?.score <= 50
            ? "info"
            : metrics?.score <= 75
            ? "warning"
            : "error",
        description: `Level: ${metrics?.level || "N/A"}`,
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

        {/* Priority and Status Distributions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority Distribution */}
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Priority Distribution
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {distributions?.byPriority &&
                Object.entries(distributions.byPriority).map(
                  ([priority, count]) => (
                    <div key={priority} className="flex items-center space-x-2">
                      <TechDebtPriorityBadge priority={priority} size="sm" />
                      <span className="text-xl font-bold text-neutral-900">
                        {count}
                      </span>
                    </div>
                  )
                )}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Status Distribution
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {distributions?.byStatus &&
                Object.entries(distributions.byStatus).map(
                  ([status, count]) => (
                    <div key={status} className="flex items-center space-x-2">
                      <TechDebtStatusBadge status={status} size="sm" />
                      <span className="text-xl font-bold text-neutral-900">
                        {count}
                      </span>
                    </div>
                  )
                )}
            </div>
          </div>
        </div>

        {/* Highest Impact Items */}
        {highestImpactItems && highestImpactItems.length > 0 && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Highest Impact Items
            </h4>
            <div className="space-y-2">
              {highestImpactItems.slice(0, 5).map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between p-3 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition-colors cursor-pointer"
                  onClick={() =>
                    navigate(`/tech-debt/${item.projectId}/${item.id}`)
                  }
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-neutral-500">
                      #{index + 1}
                    </span>
                    <span className="text-sm text-neutral-800">
                      {item.title}
                    </span>
                    <span className="text-xs text-neutral-500">
                      ({item.projectName})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TechDebtPriorityBadge priority={item.priority} size="sm" />
                    <TechDebtStatusBadge status={item.status} size="sm" />
                    <Badge variant="warning" size="sm">
                      Score: {item.impact?.score || 0}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Summary */}
        {projects && projects.length > 0 && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Project Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.slice(0, 6).map((project) => (
                <div
                  key={project.projectId}
                  className="flex items-center justify-between p-3 bg-neutral-200 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {project.projectName}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {project.total} items · {project.unresolved} unresolved
                    </p>
                  </div>
                  <Badge
                    variant={project.critical > 0 ? "error" : "neutral"}
                    size="sm"
                  >
                    {project.critical > 0
                      ? `${project.critical} critical`
                      : "OK"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render List Tab
  const renderList = () => {
    const filteredItems = latestItems?.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority =
        !filters.priority || item.priority === filters.priority;
      const matchesStatus = !filters.status || item.status === filters.status;
      return matchesSearch && matchesPriority && matchesStatus;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search tech debt..."
            className="flex-1"
          />
          <TechDebtFilters onFilterChange={handleFilterChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems?.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 hover:border-primary-400 transition-all flex flex-col cursor-pointer"
              onClick={() =>
                navigate(`/tech-debt/${item.projectId}/${item.id}`)
              }
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-neutral-900 flex-1">
                  {item.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <TechDebtPriorityBadge priority={item.priority} />
                <TechDebtStatusBadge status={item.status} />
                {item.estimatedEffortHours > 0 && (
                  <Badge
                    variant="neutral"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Clock className="w-3 h-3" />
                    <span>{item.estimatedEffortHours}h</span>
                  </Badge>
                )}
                <Badge variant="info" size="sm">
                  Score: {item.impactScore}
                </Badge>
              </div>

              <p className="text-sm text-neutral-600 flex-1">
                {item.description?.length > 100
                  ? `${item.description.substring(0, 100)}...`
                  : item.description}
              </p>

              <div className="mt-4 pt-4 border-t border-neutral-300 flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  {item.project?.name || "Unknown Project"}
                </span>
                <Button variant="ghost" size="sm">
                  View →
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems?.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            No tech debt items found matching your filters.
          </div>
        )}

        {pagination?.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages || 1}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    );
  };

  // Render Statistics Tab
  const renderStatistics = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Total Items</p>
            <p className="text-2xl font-bold text-neutral-900">
              {metrics?.totalItems || 0}
            </p>
          </div>
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Resolution Rate</p>
            <p className="text-2xl font-bold text-success">
              {metrics?.resolutionRate || 0}%
            </p>
          </div>
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Average Impact</p>
            <p className="text-2xl font-bold text-warning">
              {metrics?.averageImpact || 0}
            </p>
          </div>
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Total Cost</p>
            <p className="text-2xl font-bold text-error">
              ${metrics?.totalCost?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Cost Breakdown */}
        {metrics?.costBreakdown && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Cost Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-neutral-200 rounded-lg">
                <p className="text-sm text-neutral-500">Direct Cost</p>
                <p className="text-xl font-bold text-neutral-900">
                  $
                  {Math.round(
                    metrics.costBreakdown.directCost || 0
                  ).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-3 bg-neutral-200 rounded-lg">
                <p className="text-sm text-neutral-500">Indirect Cost</p>
                <p className="text-xl font-bold text-neutral-900">
                  $
                  {Math.round(
                    metrics.costBreakdown.indirectCost || 0
                  ).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-3 bg-neutral-200 rounded-lg">
                <p className="text-sm text-neutral-500">Total Cost</p>
                <p className="text-xl font-bold text-error">
                  $
                  {Math.round(
                    metrics.costBreakdown.totalCost || 0
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Projects Table */}
        {projects && projects.length > 0 && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Projects Overview
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-300">
                    <th className="text-left py-2 px-3 text-neutral-500">
                      Project
                    </th>
                    <th className="text-center py-2 px-3 text-neutral-500">
                      Total
                    </th>
                    <th className="text-center py-2 px-3 text-neutral-500">
                      Unresolved
                    </th>
                    <th className="text-center py-2 px-3 text-neutral-500">
                      Critical
                    </th>
                    <th className="text-center py-2 px-3 text-neutral-500">
                      High
                    </th>
                    <th className="text-center py-2 px-3 text-neutral-500">
                      Effort (h)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.projectId}
                      className="border-b border-neutral-200 hover:bg-neutral-200 cursor-pointer"
                      onClick={() =>
                        navigate(`/tech-debt/${project.projectId}`)
                      }
                    >
                      <td className="py-2 px-3 font-medium text-neutral-800">
                        {project.projectName}
                      </td>
                      <td className="text-center py-2 px-3">{project.total}</td>
                      <td className="text-center py-2 px-3 text-warning">
                        {project.unresolved}
                      </td>
                      <td className="text-center py-2 px-3 text-error">
                        {project.critical}
                      </td>
                      <td className="text-center py-2 px-3 text-warning">
                        {project.high}
                      </td>
                      <td className="text-center py-2 px-3">
                        {Math.round(project.estimatedEffort)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Suggestions Tab
  const renderSuggestions = () => {
    // Get suggestions from latest items with refactoringSuggestion
    const suggestions = latestItems
      ?.filter((item) => item.refactoringSuggestion)
      .map((item) => ({
        id: item.id,
        title: item.title,
        suggestion: item.refactoringSuggestion,
        effort: item.estimatedEffortHours || 0,
        projectId: item.projectId,
      }));

    if (!suggestions?.length) {
      return (
        <div className="text-center py-8 text-neutral-500">
          No refactoring suggestions available.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            Refactoring Suggestions
          </h3>
          <Badge variant="info" size="sm">
            {suggestions.length} suggestions
          </Badge>
        </div>

        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-primary-400 transition-colors cursor-pointer"
              onClick={() =>
                navigate(`/tech-debt/${suggestion.projectId}/${suggestion.id}`)
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-warning" />
                    <h4 className="font-medium text-neutral-900">
                      {suggestion.title}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {typeof suggestion.suggestion === "string" ? (
                      <p className="text-sm text-neutral-600">
                        {suggestion.suggestion}
                      </p>
                    ) : (
                      <>
                        {suggestion.suggestion?.recommendedAction && (
                          <div>
                            <p className="text-sm font-medium text-neutral-700">
                              Recommended Action:
                            </p>
                            <p className="text-sm text-neutral-600">
                              {suggestion.suggestion.recommendedAction}
                            </p>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-3 text-sm">
                          {suggestion.suggestion?.priority && (
                            <div className="flex items-center space-x-1">
                              <span className="text-neutral-500">
                                Priority:
                              </span>
                              <TechDebtPriorityBadge
                                priority={suggestion.suggestion.priority}
                                size="sm"
                              />
                            </div>
                          )}
                          {suggestion.suggestion?.urgency !== undefined && (
                            <div className="flex items-center space-x-1">
                              <span className="text-neutral-500">Urgency:</span>
                              <Badge variant="warning" size="sm">
                                {suggestion.suggestion.urgency}/10
                              </Badge>
                            </div>
                          )}
                          {suggestion.suggestion?.estimatedTimeframe && (
                            <div className="flex items-center space-x-1">
                              <span className="text-neutral-500">
                                Timeframe:
                              </span>
                              <Badge variant="info" size="sm">
                                {suggestion.suggestion.estimatedTimeframe}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {suggestion.effort > 0 && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Clock className="w-4 h-4 text-neutral-500" />
                        <span className="text-neutral-500">
                          Estimated Effort:
                        </span>
                        <span className="text-neutral-700">
                          {suggestion.effort}h
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <span>View</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Export Tab
  const renderExport = () => {
    return <TechDebtExport projectId={null} />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "list":
        return renderList();
      case "statistics":
        return renderStatistics();
      case "suggestions":
        return renderSuggestions();
      case "export":
        return renderExport();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Technical Debt Dashboard
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
          {stats?.lastUpdated && (
            <Badge variant="neutral" size="sm">
              Updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
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

export default AllTechDebtDashboard;
