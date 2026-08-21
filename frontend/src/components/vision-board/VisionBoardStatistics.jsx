// src/components/vision-board/VisionBoardStatistics.jsx

import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  LoadingSpinner,
  Alert,
  IconWrapper,
  ProgressBar,
  EmptyState,
} from "../common";
import useVisionBoard from "./useVisionBoard";
import {
  getStatus,
  getStatusLabel,
  getStatusColor,
} from "./VisionBoardConstants";

const VisionBoardStatistics = () => {
  const {
    statistics,
    goals,
    categories,
    loading,
    error,
    fetchStatistics,
    navigateToNew,
    navigateToKanban,
  } = useVisionBoard();

  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoadingStats(true);
    try {
      await fetchStatistics();
    } catch (err) {
      // Error handled by hook
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || loadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading statistics">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Vision Board Statistics</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Detailed analytics for your vision board
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={navigateToKanban}>
            <IconWrapper icon="📋" size="sm" />
            Kanban View
          </Button>
          <Button variant="primary" onClick={navigateToNew}>
            <IconWrapper icon="➕" size="sm" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Total Goals
            </p>
            <p className="text-2xl font-bold text-primary-500">
              {statistics.total || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Active Goals
            </p>
            <p className="text-2xl font-bold text-success">
              {statistics.activeCount || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Completed
            </p>
            <p className="text-2xl font-bold text-info">
              {statistics.completedCount || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Draft
            </p>
            <p className="text-2xl font-bold text-warning">
              {statistics.draftCount || 0}
            </p>
          </div>
        </div>
      )}

      {/* Status Breakdown */}
      {statistics && statistics.byStatus && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Status Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(statistics.byStatus).map(([status, count]) => {
              const statusInfo = getStatus(status);
              const percentage =
                statistics.total > 0
                  ? Math.round((count / statistics.total) * 100)
                  : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{statusInfo?.icon}</span>
                      <span>{statusInfo?.label}</span>
                    </span>
                    <span className="font-medium">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <ProgressBar
                    value={percentage}
                    max={100}
                    variant={
                      status === "completed"
                        ? "success"
                        : status === "active"
                        ? "primary"
                        : status === "draft"
                        ? "warning"
                        : "neutral"
                    }
                    size="sm"
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {statistics &&
        statistics.byCategory &&
        Object.keys(statistics.byCategory).length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(statistics.byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => {
                  const percentage =
                    statistics.total > 0
                      ? Math.round((count / statistics.total) * 100)
                      : 0;
                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between p-2 border-b border-neutral-100 dark:border-neutral-800"
                    >
                      <span className="text-sm">{category}</span>
                      <span className="text-sm font-medium">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

      {/* Quick Stats */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
            <p className="text-2xl font-bold text-primary-500">
              {statistics.averagePriority?.toFixed(1) || 0}
            </p>
            <p className="text-sm text-neutral-500">Average Priority</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
            <p className="text-2xl font-bold">
              {statistics.averageProgress || 0}%
            </p>
            <p className="text-sm text-neutral-500">Average Progress</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
            <p className="text-2xl font-bold text-success">
              {statistics.total > 0
                ? Math.round(
                    (statistics.completedCount / statistics.total) * 100
                  )
                : 0}
              %
            </p>
            <p className="text-sm text-neutral-500">Completion Rate</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisionBoardStatistics;
