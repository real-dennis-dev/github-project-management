// src/components/decision-risks/components/DecisionStats.jsx
import React from "react";
import { Badge } from "../../../components/common/Badge";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import { BarChart3, Calendar, TrendingUp, PieChart } from "lucide-react";

const DecisionStats = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const impactColors = {
    low: "success",
    medium: "warning",
    high: "warning",
    critical: "error",
  };

  const impactLabels = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  };

  const total = stats.total || 0;
  const byImpact = stats.byImpact || {};
  const impactDistribution = stats.impactDistribution || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">Total</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
            {total}
          </div>
        </div>

        {Object.entries(byImpact).map(([impact, count]) => (
          <div
            key={impact}
            className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center gap-2">
              <Badge variant={impactColors[impact] || "neutral"} size="sm">
                {impactLabels[impact] || impact}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              {count}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {total > 0 ? Math.round((count / total) * 100) : 0}%
            </div>
          </div>
        ))}
      </div>

      {impactDistribution.length > 0 && (
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Impact Distribution
          </h4>
          <div className="space-y-2">
            {impactDistribution.map((item) => (
              <div key={item.impact} className="flex items-center gap-3">
                <span className="text-sm text-neutral-600 dark:text-neutral-400 w-20 capitalize">
                  {item.impact}
                </span>
                <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-${
                      impactColors[item.impact] || "neutral"
                    }-500 rounded-full transition-all`}
                    style={{ width: `${item.percentage || 0}%` }}
                  />
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 w-16 text-right">
                  {item.count} ({item.percentage || 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.recentDecisions && stats.recentDecisions.length > 0 && (
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recent Decisions
          </h4>
          <div className="space-y-2">
            {stats.recentDecisions.slice(0, 5).map((decision) => (
              <div
                key={decision.id}
                className="flex justify-between items-center py-1 border-b border-neutral-200 dark:border-neutral-700 last:border-0"
              >
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {decision.title}
                </span>
                <Badge
                  variant={impactColors[decision.impact] || "neutral"}
                  size="sm"
                >
                  {impactLabels[decision.impact] || decision.impact}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionStats;
