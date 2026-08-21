// src/components/project-management/ProjectDashboard.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Badge,
  Alert,
  LoadingSpinner,
  IconWrapper,
  Breadcrumb,
  ProgressBar,
} from "../common";
import useProjects from "./useProjects";
import {
  PROJECT_STATUSES,
  FEATURE_STATUSES,
  BUG_STATUSES,
  getFeatureStatus,
  getBugStatus,
} from "./ProjectConstants";

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    project,
    features,
    bugs,
    statistics,
    dashboard,
    loading,
    error,
    fetchDashboard,
    navigateToProject,
    navigateToBoard,
  } = useProjects();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Refresh dashboard data
  const refreshData = () => {
    fetchDashboard();
  };

  // Get current year and previous years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Projects", href: "/projects" },
    { label: project?.name || "Project", href: `/projects/${projectId}` },
    { label: "Dashboard", href: "" },
  ];

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading dashboard">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Project Dashboard</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Overview of project progress and metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <IconWrapper icon="🔄" size="sm" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => navigateToBoard(projectId)}>
            <IconWrapper icon="📋" size="sm" />
            Board
          </Button>
          <Button
            variant="outline"
            onClick={() => navigateToProject(projectId)}
          >
            <IconWrapper icon="📋" size="sm" />
            Details
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Total Features
            </p>
            <p className="text-2xl font-bold text-primary-500">
              {statistics.featureCount || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Completed Features
            </p>
            <p className="text-2xl font-bold text-success">
              {statistics.completedFeatures || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Total Bugs
            </p>
            <p className="text-2xl font-bold text-error">
              {statistics.bugCount || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Open Bugs
            </p>
            <p className="text-2xl font-bold text-warning">
              {statistics.openBugs || 0}
            </p>
          </div>
        </div>
      )}

      {/* Feature Status Breakdown */}
      {features && features.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">
            Feature Status Breakdown
          </h2>
          <div className="space-y-3">
            {FEATURE_STATUSES.map((status) => {
              const count = features.filter(
                (f) => f.status === status.value
              ).length;
              const percentage =
                features.length > 0 ? (count / features.length) * 100 : 0;
              return (
                <div key={status.value} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{status.icon}</span>
                      <span>{status.label}</span>
                      <span className="text-xs text-neutral-400">
                        ({count})
                      </span>
                    </span>
                    <span className="font-medium">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={percentage}
                    max={100}
                    variant="primary"
                    size="sm"
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bug Status Breakdown */}
      {bugs && bugs.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Bug Status Breakdown</h2>
          <div className="space-y-3">
            {BUG_STATUSES.map((status) => {
              const count = bugs.filter(
                (b) => b.status === status.value
              ).length;
              const percentage =
                bugs.length > 0 ? (count / bugs.length) * 100 : 0;
              return (
                <div key={status.value} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{status.icon}</span>
                      <span>{status.label}</span>
                      <span className="text-xs text-neutral-400">
                        ({count})
                      </span>
                    </span>
                    <span className="font-medium">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={percentage}
                    max={100}
                    variant={
                      status.value === "closed" || status.value === "fixed"
                        ? "success"
                        : "warning"
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

      {/* Recent Activity */}
      {dashboard?.recentActivity && dashboard.recentActivity.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {dashboard.recentActivity.slice(0, 5).map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
                  {activity.type === "feature" ? "⚡" : "🐛"}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    {activity.action}{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-neutral-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
