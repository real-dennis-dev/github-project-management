import React from "react";
import useJournal from "../hooks/useJournal";
import {
  Card,
  Badge,
  LoadingSpinner,
  ProgressBar,
  EmptyState,
} from "../../common";

const MOOD_LABELS = {
  "😊": "Happy",
  "😐": "Neutral",
  "😔": "Sad",
  "😡": "Angry",
  "😴": "Tired",
  "🤔": "Thinking",
  "🎉": "Celebrating",
  "😰": "Anxious",
};

const MOOD_COLORS = {
  "😊": "bg-green-500",
  "🎉": "bg-green-500",
  "🤔": "bg-blue-500",
  "😐": "bg-gray-500",
  "😴": "bg-yellow-500",
  "😔": "bg-orange-500",
  "😰": "bg-red-500",
  "😡": "bg-red-500",
};

const STAT_COLORS = {
  excellent: "text-green-600",
  good: "text-blue-600",
  neutral: "text-gray-600",
  poor: "text-orange-600",
  bad: "text-red-600",
};

const TREND_LABELS = {
  improving: "📈 Improving",
  declining: "📉 Declining",
  stable: "➖ Stable",
};

const JournalStats = ({ projectId }) => {
  const { stats, loading, error, fetchStats, moodOptions } =
    useJournal(projectId);

  if (loading) {
    return <LoadingSpinner size="lg" className="mx-auto my-12" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-2 text-primary-500 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <EmptyState
        title="No Statistics Available"
        description="Start creating journal entries to see your statistics here."
        className="my-8"
      />
    );
  }

  const { moodTrend, weeklySummary, streak, completionStats, totalEntries } =
    stats;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Journal Statistics</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Total Entries</div>
          <div className="text-2xl font-bold">{totalEntries || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Current Streak</div>
          <div className="text-2xl font-bold">
            {streak?.currentStreak || 0} days
          </div>
          {streak?.longestStreak && (
            <div className="text-xs text-neutral-400">
              Best: {streak.longestStreak} days
            </div>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">Overall Mood</div>
          <div
            className={`text-2xl font-bold ${
              STAT_COLORS[moodTrend?.overall] || "text-neutral-600"
            }`}
          >
            {moodTrend?.overall
              ? moodTrend.overall.charAt(0).toUpperCase() +
                moodTrend.overall.slice(1)
              : "N/A"}
          </div>
          {moodTrend?.trend && (
            <div className="text-xs text-neutral-400">
              {TREND_LABELS[moodTrend.trend] || moodTrend.trend}
            </div>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-500">This Week</div>
          <div className="text-2xl font-bold">
            {weeklySummary?.hasEntries ? "📝" : "📭"}
          </div>
          {weeklySummary?.hasEntries && (
            <div className="text-xs text-neutral-400">
              {weeklySummary.summary?.totalEntries || 0} entries
            </div>
          )}
        </Card>
      </div>

      {/* Mood Distribution */}
      {moodTrend?.distribution && (
        <Card className="p-4">
          <h3 className="text-md font-semibold mb-4">Mood Distribution</h3>
          <div className="space-y-3">
            {Object.entries(moodTrend.distribution)
              .sort((a, b) => b[1] - a[1])
              .map(([mood, count]) => {
                const total = Object.values(moodTrend.distribution).reduce(
                  (sum, c) => sum + c,
                  0
                );
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={mood} className="flex items-center gap-3">
                    <div className="w-12 text-center">
                      <span className="text-xl">{mood}</span>
                    </div>
                    <div className="flex-1">
                      <ProgressBar
                        value={percentage}
                        max={100}
                        variant="primary"
                        size="sm"
                        className="h-2"
                      />
                    </div>
                    <div className="text-sm font-medium min-w-[60px] text-right">
                      {count} ({Math.round(percentage)}%)
                    </div>
                  </div>
                );
              })}
          </div>
          {moodTrend?.dominantMood && (
            <div className="mt-4 text-sm text-neutral-500">
              Dominant Mood:{" "}
              <Badge variant="primary">
                {moodTrend.dominantMood}{" "}
                {MOOD_LABELS[moodTrend.dominantMood] || ""}
              </Badge>
            </div>
          )}
          {moodTrend?.averageScore && (
            <div className="text-sm text-neutral-500">
              Average Mood Score: {moodTrend.averageScore.toFixed(1)} / 5
            </div>
          )}
        </Card>
      )}

      {/* Completion Stats */}
      {completionStats && (
        <Card className="p-4">
          <h3 className="text-md font-semibold mb-4">Entry Quality</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {completionStats.withFinished || 0}
              </div>
              <div className="text-xs text-neutral-500">With Finished</div>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {completionStats.withProblems || 0}
              </div>
              <div className="text-xs text-neutral-500">With Problems</div>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {completionStats.withPlans || 0}
              </div>
              <div className="text-xs text-neutral-500">With Plans</div>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {completionStats.withNotes || 0}
              </div>
              <div className="text-xs text-neutral-500">With Notes</div>
            </div>
          </div>
        </Card>
      )}

      {/* Weekly Summary */}
      {weeklySummary?.hasEntries && weeklySummary.summary && (
        <Card className="p-4">
          <h3 className="text-md font-semibold mb-4">Weekly Summary</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">
                Week: {weeklySummary.summary.weekRange?.start} →{" "}
                {weeklySummary.summary.weekRange?.end}
              </Badge>
              <Badge variant="primary">
                {weeklySummary.summary.totalEntries} entries
              </Badge>
              <Badge
                variant={
                  weeklySummary.summary.completionRate >= 80
                    ? "success"
                    : "warning"
                }
              >
                {weeklySummary.summary.completionRate}% completion
              </Badge>
            </div>

            {weeklySummary.summary.keyAccomplishments?.length > 0 && (
              <div>
                <div className="text-sm font-medium text-neutral-700 mb-1">
                  ✨ Key Accomplishments
                </div>
                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-0.5">
                  {weeklySummary.summary.keyAccomplishments.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {weeklySummary.summary.keyProblems?.length > 0 && (
              <div>
                <div className="text-sm font-medium text-neutral-700 mb-1">
                  🚧 Key Problems
                </div>
                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-0.5">
                  {weeklySummary.summary.keyProblems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {weeklySummary.summary.summaryText && (
              <div className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
                {weeklySummary.summary.summaryText}
              </div>
            )}

            {weeklySummary.summary.bestDay && (
              <div className="flex gap-4 text-sm text-neutral-600">
                <span>
                  🌟 Best Day: {weeklySummary.summary.bestDay.date} (
                  {weeklySummary.summary.bestDay.mood})
                </span>
                {weeklySummary.summary.worstDay && (
                  <span>
                    😔 Worst Day: {weeklySummary.summary.worstDay.date} (
                    {weeklySummary.summary.worstDay.mood})
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default JournalStats;
