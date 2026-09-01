// src/components/ai/AIDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAIDashboard } from "../../hooks/useAIDashboard";
import { useToast } from "../../hooks/useToast";
import {
  LoadingSpinner,
  Alert,
  Button,
  Badge,
  SearchBar,
  Pagination,
  Select,
} from "../common";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  FileText,
  Lightbulb,
  TrendingUp,
  Bot,
  Clock,
  Zap,
  RefreshCw,
  ChevronRight,
  Calendar,
  Filter,
} from "lucide-react";

// Import existing components (reused with AI data)
import AIStatusIndicator from "./AIStatusIndicator";
import AIResponseDisplay from "./AIResponseDisplay";
import ConversationHistory from "./ConversationHistory";

const AIDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [typeFilter, setTypeFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(null);

  const {
    getStats,
    stats,
    activities,
    pagination,
    isLoading,
    error,
    clearError,
    refetch,
    filters,
    setFilters,
  } = useAIDashboard();

  // Get unique project IDs from activities for filter
  const uniqueProjects = React.useMemo(() => {
    if (!activities) return [];
    const projectMap = new Map();
    activities.forEach((activity) => {
      if (activity.projectId && !projectMap.has(activity.projectId)) {
        projectMap.set(activity.projectId, {
          id: activity.projectId,
          name: activity.projectName || "Unknown Project",
        });
      }
    });
    return Array.from(projectMap.values());
  }, [activities]);

  useEffect(() => {
    const params = {
      page,
      limit,
      type: typeFilter || undefined,
      projectId: projectFilter || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    };
    getStats(params);
  }, [page, limit, typeFilter, projectFilter, fromDate, toDate]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Dashboard refreshed");
  };

  const handleClearFilters = () => {
    setTypeFilter("");
    setProjectFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
    // If it has a conversationId, we could fetch the full conversation
    if (activity.conversationId) {
      // Navigate to conversation detail or expand
      toast.info(`Viewing: ${activity.title}`);
    }
  };

  // Tabs configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "activities", label: "Activities", icon: MessageSquare },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "ask_question", label: "Questions" },
    { value: "analyze_project", label: "Analyses" },
    { value: "generate_report", label: "Reports" },
    { value: "summarize_text", label: "Summaries" },
    { value: "suggest_next_actions", label: "Actions" },
    { value: "analyze_trends", label: "Trends" },
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
        <Bot className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p className="text-neutral-500">No AI activity data available.</p>
        <Button variant="primary" className="mt-4" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const {
    stats: metrics,
    activities: activityList,
    pagination: pageInfo,
  } = stats;

  // Render Overview Tab
  const renderOverview = () => {
    const statCards = [
      {
        label: "Total Interactions",
        value: metrics?.totalInteractions || 0,
        icon: MessageSquare,
        color: "primary",
        description: "All AI activities",
      },
      {
        label: "Total Projects",
        value: metrics?.totalProjects || 0,
        icon: LayoutDashboard,
        color: "info",
        description: "Projects with AI usage",
      },
      {
        label: "Questions",
        value: metrics?.questions || 0,
        icon: MessageSquare,
        color: "neutral",
        description: "Questions asked",
      },
      {
        label: "Analyses",
        value: metrics?.analyses || 0,
        icon: BarChart3,
        color: "warning",
        description: "Project analyses",
      },
      {
        label: "Reports",
        value: metrics?.reports || 0,
        icon: FileText,
        color: "info",
        description: "Reports generated",
      },
      {
        label: "Summaries",
        value: metrics?.summaries || 0,
        icon: FileText,
        color: "success",
        description: "Text summaries",
      },
    ];

    const actionCards = [
      {
        label: "Actions Suggested",
        value: metrics?.actions || 0,
        icon: Lightbulb,
        color: "warning",
      },
      {
        label: "Trend Analyses",
        value: metrics?.trends || 0,
        icon: TrendingUp,
        color: "info",
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

        {/* Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actionCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-neutral-100 border border-neutral-300 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {stat.value}
                    </p>
                  </div>
                  <Icon
                    className={`w-6 h-6 text-${stat.color}-500 opacity-50`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Last Activity */}
        {metrics?.lastActivityAt && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-neutral-500" />
              <span className="text-sm text-neutral-600">
                Last Activity:{" "}
                {new Date(metrics.lastActivityAt).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        {activityList && activityList.length > 0 && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Recent Activities
            </h4>
            <div className="space-y-2">
              {activityList.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex flex-wrap items-center justify-between p-3 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition-colors cursor-pointer"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant="info" size="sm">
                      {activity.type?.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-sm text-neutral-800">
                      {activity.title}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {activity.projectName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-neutral-400">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Activities Tab
  const renderActivities = () => {
    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700">
                Filters:
              </span>
            </div>

            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={typeOptions}
              className="w-48"
            />

            <Select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              options={[
                { value: "", label: "All Projects" },
                ...uniqueProjects.map((p) => ({
                  value: p.id,
                  label: p.name,
                })),
              ]}
              className="w-48"
            />

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2 py-1.5 bg-neutral-200 border border-neutral-300 rounded text-sm"
              />
              <span className="text-neutral-500">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2 py-1.5 bg-neutral-200 border border-neutral-300 rounded text-sm"
              />
            </div>

            {(typeFilter || projectFilter || fromDate || toDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {activityList?.map((activity) => (
            <div
              key={activity.id}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-primary-400 transition-colors cursor-pointer"
              onClick={() => handleActivityClick(activity)}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="info" size="sm">
                      {activity.type?.replace(/_/g, " ")}
                    </Badge>
                    <h4 className="font-medium text-neutral-900">
                      {activity.title}
                    </h4>
                    <Badge variant="neutral" size="sm">
                      {activity.projectName}
                    </Badge>
                  </div>
                  {activity.question && (
                    <p className="text-sm text-neutral-600 mt-1">
                      <span className="font-medium">Q:</span>{" "}
                      {activity.question}
                    </p>
                  )}
                  {activity.answer && (
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                      <span className="font-medium">A:</span>{" "}
                      {typeof activity.answer === "string"
                        ? activity.answer
                        : JSON.stringify(activity.answer).slice(0, 200)}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-500">
                    <span>{new Date(activity.createdAt).toLocaleString()}</span>
                    {activity.metadata?.action && (
                      <Badge variant="neutral" size="sm">
                        {activity.metadata.action}
                      </Badge>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-2" />
              </div>
            </div>
          ))}

          {activityList?.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              No activities found matching your filters.
            </div>
          )}
        </div>

        {pageInfo?.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pageInfo.totalPages || 1}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    );
  };

  // Render Analytics Tab
  const renderAnalytics = () => {
    // Calculate distribution of activity types
    const typeDistribution = {};
    activityList?.forEach((activity) => {
      const type = activity.type || "unknown";
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    const typeColors = {
      ask_question: "primary",
      analyze_project: "warning",
      generate_report: "info",
      summarize_text: "success",
      suggest_next_actions: "error",
      analyze_trends: "secondary",
    };

    const typeLabels = {
      ask_question: "Questions",
      analyze_project: "Analyses",
      generate_report: "Reports",
      summarize_text: "Summaries",
      suggest_next_actions: "Actions",
      analyze_trends: "Trends",
    };

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            Activity Summary
          </h3>
          <p className="text-neutral-700">
            Total of <strong>{metrics?.totalInteractions || 0}</strong> AI
            interactions across <strong>{metrics?.totalProjects || 0}</strong>{" "}
            projects.
          </p>
        </div>

        {/* Type Distribution */}
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Activity Type Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(typeDistribution).map(([type, count]) => (
              <div
                key={type}
                className="bg-neutral-200 rounded-lg p-4 text-center"
              >
                <p className="text-2xl font-bold text-neutral-900">{count}</p>
                <Badge variant={typeColors[type] || "neutral"} size="sm">
                  {typeLabels[type] || type}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Most Active Project</p>
            {uniqueProjects.length > 0 ? (
              <p className="text-lg font-semibold text-neutral-900">
                {uniqueProjects[0]?.name || "N/A"}
              </p>
            ) : (
              <p className="text-neutral-500">No projects</p>
            )}
          </div>
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Most Used Feature</p>
            <p className="text-lg font-semibold text-neutral-900">
              {Object.entries(typeDistribution).length > 0
                ? typeLabels[
                    Object.keys(typeDistribution).reduce((a, b) =>
                      typeDistribution[a] > typeDistribution[b] ? a : b
                    )
                  ] || "N/A"
                : "N/A"}
            </p>
          </div>
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Last Activity</p>
            <p className="text-lg font-semibold text-neutral-900">
              {metrics?.lastActivityAt
                ? new Date(metrics.lastActivityAt).toLocaleDateString()
                : "Never"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "activities":
        return renderActivities();
      case "analytics":
        return renderAnalytics();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            AI Assistant Dashboard
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Aggregated AI activity across all projects
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <AIStatusIndicator />
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

export default AIDashboard;
