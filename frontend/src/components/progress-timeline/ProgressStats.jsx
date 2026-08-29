// src/components/progress-timeline/ProgressStats.jsx
import React from "react";
import { useProgress } from "../../hooks/useProgress";
import { LoadingSpinner, Alert, Badge } from "../common";
import { BarChart3, TrendingUp, CheckCircle, Clock } from "lucide-react";

const ProgressStats = ({ projectId }) => {
  const {
    getProgressOverview,
    progressOverview,
    isLoading,
    error,
    clearError,
  } = useProgress();

  React.useEffect(() => {
    if (projectId) {
      getProgressOverview(projectId);
    }
  }, [projectId]);

  if (isLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!progressOverview?.overview) {
    return (
      <div className="text-center py-4 text-neutral-500">
        No progress data available
      </div>
    );
  }

  const { overview } = progressOverview;

  const stats = [
    {
      label: "Overall Progress",
      value: `${overview.overall || 0}%`,
      icon: BarChart3,
      color: "primary",
    },
    {
      label: "Features",
      value: overview.totalFeatures || 0,
      icon: CheckCircle,
      color: "success",
      sub: `${overview.completedFeatures || 0} completed`,
    },
    {
      label: "Completion Rate",
      value: `${overview.completionRate || 0}%`,
      icon: TrendingUp,
      color: "info",
    },
    {
      label: "Avg. Progress",
      value: `${overview.average || 0}%`,
      icon: Clock,
      color: "warning",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
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
                {stat.sub && (
                  <p className="text-xs text-neutral-500 mt-1">{stat.sub}</p>
                )}
              </div>
              <Icon className={`w-8 h-8 text-${stat.color}-500 opacity-75`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressStats;
