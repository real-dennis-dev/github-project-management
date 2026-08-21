// src/components/process/ProgressDashboard.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Card, Button, IconWrapper, Badge } from "../common";
import useProcess from "./useProcess";

const ProgressDashboard = () => {
  const {
    totalProgress,
    averageProgress,
    completedFeatures,
    hasEntries,
    navigateToTimeline,
    navigateToOverview,
    navigateToReport,
    navigateToNew,
    timelineEntries,
  } = useProcess();

  // Get recent entries
  const recentEntries = timelineEntries.slice(0, 5);

  // Dashboard cards
  const cards = [
    {
      title: "Timeline",
      description: "View and manage all timeline entries",
      icon: "📋",
      path: "/process/timeline",
      color: "primary",
    },
    {
      title: "Progress Overview",
      description: "See comprehensive progress analytics",
      icon: "📊",
      path: "/process/overview",
      color: "success",
    },
    {
      title: "Generate Report",
      description: "Create detailed progress reports",
      icon: "📄",
      path: "/process/report",
      color: "info",
    },
    {
      title: "Add Entry",
      description: "Track progress for a new feature",
      icon: "➕",
      path: "/process/timeline/new",
      color: "warning",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Process Dashboard</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Track and manage project progress and timelines
        </p>
      </div>

      {/* Quick Stats */}
      {hasEntries && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500">Total Entries</p>
            <p className="text-2xl font-bold">{timelineEntries.length}</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500">Average Progress</p>
            <p className="text-2xl font-bold text-primary-500">
              {averageProgress}%
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500">Completed Features</p>
            <p className="text-2xl font-bold text-success">
              {completedFeatures}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500">Overall Progress</p>
            <p className="text-2xl font-bold">{totalProgress}%</p>
          </div>
        </div>
      )}

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.path} to={card.path} className="block">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-md transition-all hover:border-primary-300 dark:hover:border-primary-700">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl mb-2">{card.icon}</div>
                  <h3 className="font-semibold">{card.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {card.description}
                  </p>
                </div>
                <Badge variant={card.color} className="text-xs">
                  →
                </Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Entries */}
      {hasEntries && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Entries</h2>
            <Button variant="ghost" size="sm" onClick={navigateToTimeline}>
              View All →
            </Button>
          </div>
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                onClick={() => navigateToTimeline()}
              >
                <div>
                  <p className="font-medium">{entry.feature_name}</p>
                  <p className="text-sm text-neutral-500">
                    {new Date(entry.month_year).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <div className="h-1.5 bg-neutral-200 dark:bg-neutral-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${entry.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-primary-500 min-w-[40px] text-right">
                    {entry.progress_percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasEntries && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-bold mb-2">No Timeline Entries Yet</h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
            Start tracking your project progress by adding your first timeline
            entry.
          </p>
          <Button variant="primary" onClick={navigateToNew}>
            <IconWrapper icon="➕" size="sm" />
            Add Your First Entry
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;
