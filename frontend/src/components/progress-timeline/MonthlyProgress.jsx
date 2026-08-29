// src/components/progress-timeline/MonthlyProgress.jsx
import React, { useState, useEffect } from "react";
import { useProgress } from "../../hooks/useProgress";
import { LoadingSpinner, Alert, Badge, Button, Select } from "../common";
import { Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";

const MonthlyProgress = ({ projectId }) => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [featureFilter, setFeatureFilter] = useState("");
  const { getMonthlyProgress, monthlyProgress, isLoading, error, clearError } =
    useProgress();

  useEffect(() => {
    // Set default month to current month
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-01`;
    setSelectedMonth(defaultMonth);
  }, []);

  useEffect(() => {
    if (projectId && selectedMonth) {
      const params = { month: selectedMonth };
      if (featureFilter) params.feature_name = featureFilter;
      getMonthlyProgress(projectId, params);
    }
  }, [projectId, selectedMonth, featureFilter]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-success" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-error" />;
    return <Minus className="w-4 h-4 text-neutral-500" />;
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Monthly Progress</h2>
        <div className="flex items-center space-x-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="px-3 py-2 bg-neutral-200 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {monthlyProgress?.features && monthlyProgress.features.length > 0 && (
            <Select
              value={featureFilter}
              onChange={(e) => setFeatureFilter(e.target.value)}
              options={[
                { value: "", label: "All Features" },
                ...monthlyProgress.features.map((f) => ({
                  value: f,
                  label: f,
                })),
              ]}
              className="w-48"
            />
          )}
        </div>
      </div>

      {!monthlyProgress ? (
        <div className="text-center py-8 text-neutral-500">
          No data available for the selected month
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary-500">
                {monthlyProgress.stats?.total || 0}
              </p>
              <p className="text-sm text-neutral-500">Total Entries</p>
            </div>
            <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary-500">
                {monthlyProgress.stats?.average || 0}%
              </p>
              <p className="text-sm text-neutral-500">Average Progress</p>
            </div>
            <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-1">
                {getChangeIcon(monthlyProgress.stats?.change || 0)}
                <p className="text-2xl font-bold text-neutral-900">
                  {Math.abs(monthlyProgress.stats?.change || 0)}%
                </p>
              </div>
              <p className="text-sm text-neutral-500">Change from Previous</p>
            </div>
            <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-neutral-900">
                {monthlyProgress.stats?.changePercentage || 0}%
              </p>
              <p className="text-sm text-neutral-500">Change Percentage</p>
            </div>
          </div>

          {/* Entries */}
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg overflow-hidden">
            <div className="p-4 bg-neutral-200 border-b border-neutral-300">
              <h3 className="font-semibold text-neutral-900">
                {monthlyProgress.monthYear}
              </h3>
            </div>
            <div className="divide-y divide-neutral-300">
              {monthlyProgress.entries?.map((entry, index) => (
                <div
                  key={index}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-neutral-900">
                      {entry.feature_name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      Updated:{" "}
                      {new Date(
                        entry.updated_at || entry.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32">
                      <div className="flex justify-between text-xs text-neutral-500 mb-1">
                        <span>Progress</span>
                        <span>{entry.progress_percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: `${entry.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                    <Badge
                      variant={
                        entry.progress_percentage >= 75
                          ? "success"
                          : entry.progress_percentage >= 50
                          ? "warning"
                          : entry.progress_percentage > 0
                          ? "info"
                          : "neutral"
                      }
                    >
                      {entry.progress_percentage >= 75
                        ? "On Track"
                        : entry.progress_percentage >= 50
                        ? "In Progress"
                        : entry.progress_percentage > 0
                        ? "Started"
                        : "Not Started"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aggregated */}
          {monthlyProgress.aggregated && (
            <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Aggregated Data
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(monthlyProgress.aggregated).map(
                  ([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-xl font-bold text-primary-500">
                        {typeof value === "number" && key.includes("percentage")
                          ? `${value}%`
                          : value}
                      </p>
                      <p className="text-sm text-neutral-500 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlyProgress;
