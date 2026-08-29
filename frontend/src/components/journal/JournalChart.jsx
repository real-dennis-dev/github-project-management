// src/components/journal/JournalChart.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useJournal } from "../../hooks/useJournal";
import { Button, LoadingSpinner, ErrorState, EmptyState } from "../common";
import {
  ArrowLeft,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
} from "lucide-react";

// Note: You'll need to install recharts: npm install recharts
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#ea580c", "#f97316", "#fb923c", "#fdba74", "#fed7aa"];

const JournalChart = () => {
  const { projectId } = useParams();
  const {
    entries,
    stats,
    isLoading,
    error,
    refetchStats,
    getMoodLabel,
    getMoodScore,
    MOODS,
  } = useJournal(projectId);

  const [chartType, setChartType] = useState("trend");
  const [chartData, setChartData] = useState([]);
  const [moodDistributionData, setMoodDistributionData] = useState([]);

  useEffect(() => {
    refetchStats();
  }, [projectId]);

  useEffect(() => {
    if (entries.length > 0) {
      // Prepare trend data (last 30 entries)
      const sorted = [...entries].sort(
        (a, b) => new Date(a.entry_date) - new Date(b.entry_date)
      );
      const recent = sorted.slice(-30);

      const trendData = recent.map((entry) => ({
        date: entry.entry_date
          ? new Date(entry.entry_date).toLocaleDateString()
          : "",
        mood: getMoodScore(entry.mood || "😐"),
        moodEmoji: entry.mood || "😐",
        moodLabel: getMoodLabel(entry.mood || "😐"),
        hasFinished: !!entry.finished_today,
        hasProblems: !!entry.problems,
        hasPlan: !!entry.tomorrow_plan,
      }));
      setChartData(trendData);
    }
  }, [entries]);

  useEffect(() => {
    if (stats?.moodDistribution) {
      const distribution = Object.entries(stats.moodDistribution).map(
        ([mood, count]) => ({
          name: mood,
          value: count,
          label: getMoodLabel(mood),
        })
      );
      setMoodDistributionData(distribution);
    }
  }, [stats]);

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
        title="Failed to load chart data"
        description={error}
        onRetry={refetchStats}
      />
    );
  }

  if (!stats || entries.length === 0) {
    return (
      <EmptyState
        title="No data available"
        description="Create some journal entries to see your mood trends and statistics."
        action={
          <Link to={`/projects/${projectId}/journal/new`}>
            <Button>Create First Entry</Button>
          </Link>
        }
      />
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case "trend":
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis domain={[0, 6]} stroke="#6b7280" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-neutral-100 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-300">
                          <p className="font-medium text-neutral-900 dark:text-neutral-800">
                            {data.date}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-500">
                            Mood: {data.moodEmoji} {data.moodLabel} ({data.mood}
                            /5)
                          </p>
                          <div className="text-xs text-neutral-400 mt-1">
                            {data.hasFinished && "✅ Finished "}
                            {data.hasProblems && "⚠️ Problems "}
                            {data.hasPlan && "📋 Plan"}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#ea580c"
                  strokeWidth={2}
                  dot={{ fill: "#ea580c", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Mood Score"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        );

      case "distribution":
        return (
          <div className="h-80 flex items-center justify-center">
            {moodDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={moodDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {moodDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-neutral-100 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-300">
                            <p className="font-medium text-neutral-900 dark:text-neutral-800">
                              {data.name} {data.label}
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-500">
                              {data.value} entries
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-400">
                No mood data available
              </p>
            )}
          </div>
        );

      case "activities":
        // Show completion stats as bar chart
        const activityData = [
          {
            name: "With Finished",
            value: stats.completionStats?.withFinished || 0,
          },
          {
            name: "With Problems",
            value: stats.completionStats?.withProblems || 0,
          },
          {
            name: "With Plans",
            value: stats.completionStats?.withPlans || 0,
          },
        ];

        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-neutral-100 p-3 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-300">
                          <p className="font-medium text-neutral-900 dark:text-neutral-800">
                            {data.name}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-500">
                            {data.value} entries
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="value" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/projects/${projectId}/journal/stats`}>
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-800">
              Journal Charts
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Visualize your journal data with interactive charts
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refetchStats}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Chart Type Selector */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button
          variant={chartType === "trend" ? "primary" : "outline"}
          size="sm"
          onClick={() => setChartType("trend")}
        >
          <LineChart className="w-4 h-4 mr-2" />
          Mood Trend
        </Button>
        <Button
          variant={chartType === "distribution" ? "primary" : "outline"}
          size="sm"
          onClick={() => setChartType("distribution")}
        >
          <PieChart className="w-4 h-4 mr-2" />
          Mood Distribution
        </Button>
        <Button
          variant={chartType === "activities" ? "primary" : "outline"}
          size="sm"
          onClick={() => setChartType("activities")}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Activity Stats
        </Button>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-300 p-6">
        {renderChart()}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm p-4 border border-neutral-200 dark:border-neutral-300">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Total Entries
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-800">
            {stats.totalEntries || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm p-4 border border-neutral-200 dark:border-neutral-300">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Current Streak
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-800">
            {stats.streak?.currentStreak || 0} days
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm p-4 border border-neutral-200 dark:border-neutral-300">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Avg. Mood Score
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-800">
            {stats.moodTrend?.averageScore?.toFixed(1) || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JournalChart;
