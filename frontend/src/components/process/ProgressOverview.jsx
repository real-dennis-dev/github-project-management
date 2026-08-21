// src/components/process/ProgressOverview.jsx

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Button,
  LoadingSpinner,
  Alert,
  IconWrapper,
  ProgressBar,
  Badge,
  Breadcrumb,
} from "../common";
import useProcess from "./useProcess";
import { getProgressStatus, CHART_COLORS } from "./ProcessConstants";

const ProgressOverview = () => {
  const { projectId } = useParams();
  const {
    overview,
    monthlyProgress,
    loading,
    error,
    fetchOverview,
    fetchMonthlyProgress,
    selectedMonth,
    changeMonth,
    navigateToNew,
    navigateToReport,
    navigateToTimeline,
  } = useProcess();

  const [selectedFeature, setSelectedFeature] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchOverview(12);
      fetchMonthlyProgress(selectedMonth);
    }
  }, [projectId, selectedMonth]);

  // Handle month change
  const handleMonthChange = (e) => {
    changeMonth(e.target.value);
  };

  // Format month display
  const formatMonthDisplay = (monthYear) => {
    if (!monthYear) return "";
    const date = new Date(monthYear);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Get current month options
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }
    return options;
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Process", href: "/process" },
    { label: "Overview", href: "" },
  ];

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading overview">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Progress Overview</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Comprehensive view of project progress and feature completion
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={navigateToReport}>
            <IconWrapper icon="📊" size="sm" />
            Generate Report
          </Button>
          <Button variant="outline" onClick={navigateToTimeline}>
            <IconWrapper icon="📋" size="sm" />
            Timeline
          </Button>
          <Button variant="primary" onClick={navigateToNew}>
            <IconWrapper icon="➕" size="sm" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Project Overview */}
      {overview?.project && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{overview.project.name}</h2>
              <p className="text-sm text-neutral-500">
                Project Status: {overview.project.status}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-500">
                  {overview.project.completion_percentage}%
                </p>
                <p className="text-xs text-neutral-500">Overall Completion</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-success">
                  {overview.overview?.completedFeatures || 0}
                </p>
                <p className="text-xs text-neutral-500">Completed Features</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      {overview?.overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500">Total Features</p>
            <p className="text-2xl font-bold">
              {overview.overview.totalFeatures}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500">Completion Rate</p>
            <p className="text-2xl font-bold text-success">
              {overview.overview.completionRate}%
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500">Average Progress</p>
            <p className="text-2xl font-bold text-primary-500">
              {overview.overview.average}%
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500">Overall</p>
            <p className="text-2xl font-bold">{overview.overview.overall}%</p>
          </div>
        </div>
      )}

      {/* Feature Trends */}
      {overview?.featureTrends && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold mb-4">
            Feature Progress Trends
          </h2>
          <div className="space-y-4">
            {Object.entries(overview.featureTrends)
              .slice(0, 10)
              .map(([feature, data], index) => (
                <div key={feature} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{feature}</span>
                    <span className="text-primary-500 font-medium">
                      {data}%
                    </span>
                  </div>
                  <ProgressBar
                    value={data}
                    max={100}
                    variant={getProgressStatus(data).class}
                    size="sm"
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Monthly Progress */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">Monthly Progress</h2>
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            {getMonthOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {monthlyProgress?.entries?.length > 0 ? (
          <div className="space-y-4">
            {/* Stats */}
            {monthlyProgress.stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Total Features</p>
                  <p className="text-lg font-bold">
                    {monthlyProgress.stats.total}
                  </p>
                </div>
                <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Average Progress</p>
                  <p className="text-lg font-bold text-primary-500">
                    {monthlyProgress.stats.average}%
                  </p>
                </div>
                <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">
                    Change from Previous
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      monthlyProgress.stats.change >= 0
                        ? "text-success"
                        : "text-error"
                    }`}
                  >
                    {monthlyProgress.stats.change >= 0 ? "+" : ""}
                    {monthlyProgress.stats.change}%
                  </p>
                </div>
                <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Total Progress</p>
                  <p className="text-lg font-bold">
                    {monthlyProgress.stats.totalProgress}%
                  </p>
                </div>
              </div>
            )}

            {/* Entries */}
            <div className="space-y-3">
              {monthlyProgress.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{entry.feature_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          getProgressStatus(entry.progress_percentage).class
                        }
                        className="text-xs"
                      >
                        {getProgressStatus(entry.progress_percentage).icon}{" "}
                        {getProgressStatus(entry.progress_percentage).label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                    <ProgressBar
                      value={entry.progress_percentage}
                      max={100}
                      variant={
                        getProgressStatus(entry.progress_percentage).class
                      }
                      size="sm"
                      className="flex-1 sm:w-32"
                    />
                    <span className="text-sm font-bold text-primary-500 min-w-[40px] text-right">
                      {entry.progress_percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-500">
            <p>No entries found for this month</p>
            <Button
              variant="outline"
              size="sm"
              onClick={navigateToNew}
              className="mt-2"
            >
              Add Entry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressOverview;
