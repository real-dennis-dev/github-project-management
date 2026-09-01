// src/components/journal/JournalDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useJournalDashboard } from "../../hooks/useJournalDashboard";
import { useToast } from "../../hooks/useToast";
import {
  LoadingSpinner,
  Alert,
  Button,
  Badge,
  Pagination,
  Select,
} from "../common";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  FileText,
  RefreshCw,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Angry,
  Zap,
  Clock,
  Building2,
} from "lucide-react";
import JournalChart from "./JournalChart";

// Import existing components (reused with journal dashboard data)
import JournalStats from "./JournalStats";

const JournalDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const {
    stats,
    projects,
    pagination,
    isLoading,
    error,
    clearError,
    refetch,
    filters,
    setFilters,
  } = useJournalDashboard({
    page,
    limit,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Dashboard refreshed");
  };

  const handleClearFilters = () => {
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const navigateToProjectJournal = (projectId) => {
    navigate(`/projects/${projectId}/journal`);
  };

  const navigateToProjectEntry = (projectId, entryId) => {
    navigate(`/projects/${projectId}/journal/${entryId}`);
  };

  // Tabs configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: Building2 },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
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
        <BookOpen className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p className="text-neutral-500">No journal data available.</p>
        <p className="text-sm text-neutral-400 mt-1">
          Start creating journal entries to see your dashboard.
        </p>
        <Button variant="primary" className="mt-4" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const {
    projects: statsProjects,
    journal,
    completionStats,
    mood,
    streak,
    dateRange,
  } = stats;

  // Helper to get mood emoji
  const getMoodEmoji = (mood) => {
    const emojis = {
      "😊": "😊",
      "😐": "😐",
      "😔": "😔",
      "😡": "😡",
      "😴": "😴",
      "🤔": "🤔",
      "🎉": "🎉",
      "😰": "😰",
    };
    return emojis[mood] || "😐";
  };

  // Helper to get mood label
  const getMoodLabel = (mood) => {
    const labels = {
      "😊": "Happy",
      "😐": "Neutral",
      "😔": "Sad",
      "😡": "Angry",
      "😴": "Tired",
      "🤔": "Thoughtful",
      "🎉": "Celebratory",
      "😰": "Anxious",
    };
    return labels[mood] || mood || "Neutral";
  };

  // Helper to get mood color
  const getMoodColor = (mood) => {
    const colors = {
      "😊": "text-green-500",
      "😐": "text-yellow-500",
      "😔": "text-blue-400",
      "😡": "text-red-500",
      "😴": "text-gray-400",
      "🤔": "text-purple-400",
      "🎉": "text-yellow-400",
      "😰": "text-orange-400",
    };
    return colors[mood] || "text-gray-400";
  };

  // Helper to get mood bg color
  const getMoodBgColor = (mood) => {
    const colors = {
      "😊": "bg-green-500/10",
      "😐": "bg-yellow-500/10",
      "😔": "bg-blue-500/10",
      "😡": "bg-red-500/10",
      "😴": "bg-gray-500/10",
      "🤔": "bg-purple-500/10",
      "🎉": "bg-yellow-500/10",
      "😰": "bg-orange-500/10",
    };
    return colors[mood] || "bg-gray-500/10";
  };

  // Helper to get trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "declining":
        return <TrendingDown className="w-4 h-4 text-error" />;
      default:
        return <Minus className="w-4 h-4 text-neutral-400" />;
    }
  };

  // Helper to get trend label
  const getTrendLabel = (trend) => {
    switch (trend) {
      case "improving":
        return "Improving";
      case "declining":
        return "Declining";
      default:
        return "Stable";
    }
  };

  // Helper to get overall mood label
  const getOverallMoodLabel = (overall) => {
    switch (overall) {
      case "excellent":
        return "Excellent";
      case "good":
        return "Good";
      case "neutral":
        return "Neutral";
      case "poor":
        return "Poor";
      case "bad":
        return "Bad";
      default:
        return "Unknown";
    }
  };

  // Helper to get overall mood color
  const getOverallMoodColor = (overall) => {
    switch (overall) {
      case "excellent":
        return "text-success";
      case "good":
        return "text-success/70";
      case "neutral":
        return "text-warning";
      case "poor":
        return "text-error/70";
      case "bad":
        return "text-error";
      default:
        return "text-neutral-400";
    }
  };

  // Render Overview Tab
  const renderOverview = () => {
    const statCards = [
      {
        label: "Total Entries",
        value: journal?.totalEntries || 0,
        icon: BookOpen,
        color: "primary",
        description: "Across all projects",
      },
      {
        label: "Total Projects",
        value: statsProjects?.total || 0,
        icon: Building2,
        color: "info",
        description: `${statsProjects?.withEntries || 0} with entries`,
      },
      {
        label: "Current Streak",
        value: streak?.currentStreak || 0,
        icon: Zap,
        color: "warning",
        description: `Longest: ${streak?.longestStreak || 0} days`,
      },
      {
        label: "Completion Rate",
        value: `${completionStats?.withFinished || 0}%`,
        icon: CheckCircle,
        color: "success",
        description: "Entries with finished tasks",
      },
    ];

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Date Range */}
        {dateRange && (dateRange.start || dateRange.end) && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <span className="text-sm text-neutral-600">
                Journal entries from{" "}
                {dateRange.start
                  ? new Date(dateRange.start).toLocaleDateString()
                  : "N/A"}
                {dateRange.end &&
                  ` to ${new Date(dateRange.end).toLocaleDateString()}`}
              </span>
            </div>
          </div>
        )}

        {/* Mood Summary */}
        {mood && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mood Distribution */}
            <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-700 mb-3">
                Mood Distribution
              </h4>
              <div className="space-y-2">
                {Object.entries(mood.distribution || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([moodEmoji, count]) => (
                    <div
                      key={moodEmoji}
                      className="flex items-center gap-3 p-2 bg-neutral-200 rounded-lg"
                    >
                      <span className="text-xl">{moodEmoji}</span>
                      <span className="text-sm text-neutral-600 flex-1">
                        {getMoodLabel(moodEmoji)}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {count}
                      </Badge>
                    </div>
                  ))}
                {Object.keys(mood.distribution || {}).length === 0 && (
                  <p className="text-sm text-neutral-500 text-center py-4">
                    No mood data available
                  </p>
                )}
              </div>
            </div>

            {/* Mood Trend */}
            <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-700 mb-3">
                Mood Trend
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-200 rounded-lg">
                  <span className="text-sm text-neutral-600">Overall</span>
                  <span
                    className={`font-medium ${getOverallMoodColor(
                      mood.trend?.overall
                    )}`}
                  >
                    {getOverallMoodLabel(mood.trend?.overall)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-200 rounded-lg">
                  <span className="text-sm text-neutral-600">Trend</span>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(mood.trend?.trend)}
                    <span className="text-sm font-medium">
                      {getTrendLabel(mood.trend?.trend)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-200 rounded-lg">
                  <span className="text-sm text-neutral-600">Avg. Score</span>
                  <span className="text-sm font-medium">
                    {mood.trend?.averageScore?.toFixed(1) || "N/A"}
                  </span>
                </div>
                {mood.trend?.dominantMood && (
                  <div className="flex items-center justify-between p-3 bg-neutral-200 rounded-lg">
                    <span className="text-sm text-neutral-600">Dominant</span>
                    <span className="text-xl">{mood.trend.dominantMood}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Completion Stats */}
        {completionStats && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Entry Completion Stats
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-200">
                <CheckCircle className="w-5 h-5 text-success" />
                <div>
                  <p className="text-xs text-neutral-500">With Finished</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {completionStats.withFinished || 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-200">
                <AlertCircle className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-xs text-neutral-500">With Problems</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {completionStats.withProblems || 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-200">
                <ClipboardList className="w-5 h-5 text-info" />
                <div>
                  <p className="text-xs text-neutral-500">With Plans</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {completionStats.withPlans || 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-200">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-neutral-500">With Notes</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {completionStats.withNotes || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Streak Info */}
        {streak && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Streak Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-neutral-200 rounded-lg">
                <p className="text-sm text-neutral-500">Current Streak</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {streak.currentStreak || 0} days
                </p>
              </div>
              <div className="text-center p-3 bg-neutral-200 rounded-lg">
                <p className="text-sm text-neutral-500">Longest Streak</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {streak.longestStreak || 0} days
                </p>
              </div>
              <div className="text-center p-3 bg-neutral-200 rounded-lg">
                <p className="text-sm text-neutral-500">Total Days</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {streak.totalDays || 0} days
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Projects Tab
  const renderProjects = () => {
    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700">
                Date Range:
              </span>
            </div>
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
            {(fromDate || toDate) && (
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

        {/* Projects List */}
        <div className="space-y-4">
          {projects?.map((projectData) => {
            const {
              project,
              stats: projectStats,
              latestActivity,
              latestEntry,
            } = projectData;

            return (
              <div
                key={project.id}
                className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-primary-400 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4
                        className="text-lg font-semibold text-neutral-900 cursor-pointer hover:text-primary-500"
                        onClick={() => navigateToProjectJournal(project.id)}
                      >
                        {project.name}
                      </h4>
                      <Badge variant="neutral" size="sm">
                        {projectStats?.totalEntries || 0} entries
                      </Badge>
                      {projectStats?.streak?.currentStreak > 0 && (
                        <Badge
                          variant="warning"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Zap className="w-3 h-3" />
                          <span>
                            {projectStats.streak.currentStreak} day streak
                          </span>
                        </Badge>
                      )}
                    </div>

                    {project.description && (
                      <p className="text-sm text-neutral-600 mb-2">
                        {project.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {projectStats?.completion && (
                        <>
                          <span className="text-neutral-500">
                            Finished:{" "}
                            <span className="text-success font-medium">
                              {projectStats.completion.finished || 0}%
                            </span>
                          </span>
                          <span className="text-neutral-500">
                            Problems:{" "}
                            <span className="text-warning font-medium">
                              {projectStats.completion.problems || 0}%
                            </span>
                          </span>
                          <span className="text-neutral-500">
                            Plans:{" "}
                            <span className="text-info font-medium">
                              {projectStats.completion.plans || 0}%
                            </span>
                          </span>
                        </>
                      )}
                    </div>

                    {projectStats?.mood?.distribution &&
                      Object.keys(projectStats.mood.distribution).length >
                        0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-xs text-neutral-500">
                            Moods:
                          </span>
                          {Object.entries(projectStats.mood.distribution)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 4)
                            .map(([mood, count]) => (
                              <Badge
                                key={mood}
                                variant="neutral"
                                size="sm"
                                className={getMoodBgColor(mood)}
                              >
                                {mood} {count}
                              </Badge>
                            ))}
                        </div>
                      )}
                  </div>

                  <div className="flex items-center gap-2">
                    {latestEntry && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigateToProjectEntry(project.id, latestEntry.id)
                        }
                        className="flex items-center space-x-1"
                      >
                        <span>View Latest</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToProjectJournal(project.id)}
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Journal
                    </Button>
                  </div>
                </div>

                {latestActivity && (
                  <div className="mt-3 pt-3 border-t border-neutral-300 flex items-center justify-between text-xs text-neutral-500">
                    <span>
                      Latest activity:{" "}
                      {new Date(latestActivity.date).toLocaleDateString()}
                    </span>
                    {latestActivity.createdAt && (
                      <span>
                        {new Date(
                          latestActivity.createdAt
                        ).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {projects?.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              No projects found.
            </div>
          )}
        </div>

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

  // Render Analytics Tab
  const renderAnalytics = () => {
    // Use the existing JournalChart component
    // We'll pass the projectId as null to use global data
    return (
      <div className="space-y-6">
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Journal Analytics
          </h3>
          <p className="text-sm text-neutral-600 mb-4">
            Visual representation of your journal data across all projects.
          </p>
        </div>

        {/* JournalChart component - we need to make it work with global data */}
        <JournalChart projectId={null} />
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "projects":
        return renderProjects();
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
            Journal Dashboard
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Aggregated journal entries across all projects
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

export default JournalDashboard;
