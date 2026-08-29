// src/components/journal/JournalStats.jsx
import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useJournal } from "../../hooks/useJournal";
import {
  Button,
  Badge,
  LoadingSpinner,
  ErrorState,
  EmptyState,
  ProgressBar,
} from "../common";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  FileText,
  BarChart3,
} from "lucide-react";

const JournalStats = () => {
  const { projectId } = useParams();
  const {
    stats,
    isLoading,
    error,
    refetchStats,
    getMoodLabel,
    getMoodColor,
    getMoodBgColor,
    MOODS,
  } = useJournal(projectId);

  useEffect(() => {
    refetchStats();
  }, [projectId]);

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load statistics"
        description={error}
        onRetry={refetchStats}
      />
    );
  }

  if (!stats) {
    return (
      <EmptyState
        title="No statistics available"
        description="Start creating journal entries to see your statistics."
        action={
          <Link to={`/projects/${projectId}/journal/new`}>
            <Button>Create First Entry</Button>
          </Link>
        }
      />
    );
  }

  const {
    totalEntries,
    dateRange,
    completionStats,
    moodDistribution,
    moodTrend,
    streak,
    weeklySummary,
  } = stats;

  // Helper to get trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-5 h-5 text-success" />;
      case "declining":
        return <TrendingDown className="w-5 h-5 text-error" />;
      default:
        return <Minus className="w-5 h-5 text-neutral-400" />;
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

  // Get color for overall mood
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/projects/${projectId}/journal`}>
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-800">
              Journal Statistics
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Analytics and insights from your journal entries
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/projects/${projectId}/journal/charts`}>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Charts
            </Button>
          </Link>
          <Link to={`/projects/${projectId}/journal/export`}>
            <Button variant="outline" size="sm">
              Export Data
            </Button>
          </Link>
        </div>
      </div>

      {/* Date Range */}
      {dateRange && (
        <div className="bg-neutral-100 dark:bg-neutral-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-neutral-600 dark:text-neutral-500">
            <Calendar className="w-4 h-4 inline mr-2" />
            {dateRange.start} - {dateRange.end} ({dateRange.days} days)
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm p-4 border border-neutral-200 dark:border-neutral-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Total Entries
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-800">
                {totalEntries || 0}
              </p>
            </div>
            <FileText className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm p-4 border border-neutral-200 dark:border-neutral-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Current Streak
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-800">
                {streak?.currentStreak || 0} days
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Longest: {streak?.longestStreak || 0} days
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm p-4 border border-neutral-200 dark:border-neutral-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Overall Mood
              </p>
              <p
                className={`text-2xl font-bold ${getOverallMoodColor(
                  moodTrend?.overall
                )}`}
              >
                {getOverallMoodLabel(moodTrend?.overall)}
              </p>
            </div>
            {moodTrend?.trend && getTrendIcon(moodTrend.trend)}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {getTrendLabel(moodTrend?.trend || "stable")} trend
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm p-4 border border-neutral-200 dark:border-neutral-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Avg. Mood Score
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-800">
                {moodTrend?.averageScore?.toFixed(1) || "N/A"}
              </p>
            </div>
            {moodTrend?.dominantMood && (
              <span className="text-2xl">{moodTrend.dominantMood}</span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Dominant: {getMoodLabel(moodTrend?.dominantMood) || "N/A"}
          </p>
        </div>
      </div>

      {/* Mood Distribution */}
      {moodDistribution && Object.keys(moodDistribution).length > 0 && (
        <div className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-300 p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-800 mb-4">
            Mood Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(moodDistribution).map(([mood, count]) => (
              <div key={mood} className="flex items-center gap-3">
                <span className="text-xl w-10 text-center">{mood}</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-500 w-24">
                  {getMoodLabel(mood)}
                </span>
                <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-300 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      mood === "😊" || mood === "🎉"
                        ? "bg-success"
                        : mood === "😐" || mood === "🤔"
                        ? "bg-warning"
                        : mood === "😔" || mood === "😴"
                        ? "bg-info"
                        : "bg-error"
                    }`}
                    style={{
                      width: `${
                        totalEntries > 0 ? (count / totalEntries) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm text-neutral-500 dark:text-neutral-400 w-12 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Summary */}
      {weeklySummary && weeklySummary.hasEntries && weeklySummary.summary && (
        <div className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-300 p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-800 mb-4">
            Weekly Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-500">
                Week: {weeklySummary.summary.weekRange?.start} -{" "}
                {weeklySummary.summary.weekRange?.end}
              </p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-500">
                    Completion Rate
                  </span>
                  <span className="text-sm font-medium">
                    {weeklySummary.summary.completionRate || 0}%
                  </span>
                </div>
                <ProgressBar
                  value={weeklySummary.summary.completionRate || 0}
                  max={100}
                  size="sm"
                />
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-500">
                    Avg. Mood
                  </span>
                  <span className="font-medium">
                    {weeklySummary.summary.averageMood?.toFixed(1) || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-500">
                    Dominant Mood
                  </span>
                  <span>{weeklySummary.summary.dominantMood || "N/A"}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-600 mb-2">
                Key Accomplishments
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {weeklySummary.summary.keyAccomplishments?.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="text-sm text-neutral-600 dark:text-neutral-500"
                    >
                      {item}
                    </li>
                  )
                )}
                {(!weeklySummary.summary.keyAccomplishments ||
                  weeklySummary.summary.keyAccomplishments.length === 0) && (
                  <li className="text-sm text-neutral-400">
                    No accomplishments recorded
                  </li>
                )}
              </ul>
            </div>
          </div>
          {weeklySummary.summary.summaryText && (
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-300">
              <p className="text-sm text-neutral-600 dark:text-neutral-500">
                {weeklySummary.summary.summaryText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Completion Stats */}
      {completionStats && (
        <div className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-300 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-800 mb-4">
            Entry Completion Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-200">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  With Finished
                </p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-800">
                  {completionStats.withFinished || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-200">
              <AlertCircle className="w-5 h-5 text-warning" />
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  With Problems
                </p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-800">
                  {completionStats.withProblems || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-200">
              <ClipboardList className="w-5 h-5 text-info" />
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  With Plans
                </p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-800">
                  {completionStats.withPlans || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalStats;
