// src/components/progress-timeline/ProgressOverview.jsx
import React, { useState, useEffect } from "react";
import { useProgress } from "../../hooks/useProgress";
import { LoadingSpinner, Alert, Badge, Button } from "../common";
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
} from "lucide-react";

const ProgressOverview = ({ projectId }) => {
  const [months, setMonths] = useState(12);
  const {
    getProgressOverview,
    progressOverview,
    isLoading,
    error,
    clearError,
  } = useProgress();

  useEffect(() => {
    if (projectId) {
      getProgressOverview(projectId, months);
    }
  }, [projectId, months]);

  if (isLoading) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!progressOverview) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No progress data available
      </div>
    );
  }

  const { overview, chartData, featureTrends, aggregatedData } =
    progressOverview;

  const statsCards = [
    {
      label: "Overall Progress",
      value: `${overview?.overall || 0}%`,
      icon: BarChart3,
      color: "primary",
    },
    {
      label: "Average Progress",
      value: `${overview?.average || 0}%`,
      icon: TrendingUp,
      color: "success",
    },
    {
      label: "Total Features",
      value: overview?.totalFeatures || 0,
      icon: Calendar,
      color: "info",
    },
    {
      label: "Completion Rate",
      value: `${overview?.completionRate || 0}%`,
      icon: CheckCircle,
      color: "success",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">
          Progress Overview
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={months === 6 ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMonths(6)}
          >
            6 Months
          </Button>
          <Button
            variant={months === 12 ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMonths(12)}
          >
            12 Months
          </Button>
          <Button
            variant={months === 24 ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMonths(24)}
          >
            24 Months
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
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
                <Icon className={`w-8 h-8 text-${stat.color}-500 opacity-75`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Data */}
      {chartData && chartData.labels && chartData.labels.length > 0 && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Monthly Progress Trend
          </h3>
          <div className="space-y-4">
            {chartData.labels.map((label, index) => {
              const dataset = chartData.datasets?.[0]?.data?.[index];
              const progress = dataset !== undefined ? dataset : 0;
              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">{label}</span>
                    <span className="text-neutral-700 font-medium">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature Trends */}
      {featureTrends && Object.keys(featureTrends).length > 0 && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Feature Trends
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(featureTrends).map(([feature, trend]) => {
              const trendData = Array.isArray(trend) ? trend : [trend];
              const latest = trendData[trendData.length - 1];
              const progress =
                typeof latest === "number"
                  ? latest
                  : latest?.progress_percentage || 0;
              const hasProgress = progress > 0;
              return (
                <div key={feature} className="bg-neutral-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-800 truncate">
                      {feature}
                    </span>
                    {hasProgress && (
                      <Badge
                        variant={
                          progress >= 75
                            ? "success"
                            : progress >= 50
                            ? "warning"
                            : "error"
                        }
                        size="sm"
                      >
                        {progress}%
                      </Badge>
                    )}
                  </div>
                  {trendData.length > 1 && (
                    <div className="mt-2 flex items-center space-x-1">
                      {trendData.map((point, idx) => {
                        const p =
                          typeof point === "number"
                            ? point
                            : point?.progress_percentage || 0;
                        const isActive = p > 0;
                        return (
                          <div
                            key={idx}
                            className={`h-1 flex-1 rounded-full ${
                              isActive ? "bg-primary-500" : "bg-neutral-300"
                            }`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Aggregated Data */}
      {aggregatedData && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Data Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(aggregatedData).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-2xl font-bold text-primary-500">
                  {typeof value === "number" && key.includes("percentage")
                    ? `${value}%`
                    : value}
                </p>
                <p className="text-sm text-neutral-500 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressOverview;
