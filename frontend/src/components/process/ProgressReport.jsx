// src/components/process/ProgressReport.jsx

import React, { useState } from "react";
import {
  Button,
  LoadingSpinner,
  Alert,
  IconWrapper,
  Badge,
  Breadcrumb,
  Modal,
  ProgressBar,
} from "../common";
import useProcess from "./useProcess";
import { EXPORT_FORMATS, getProgressStatus } from "./ProcessConstants";

const ProgressReport = () => {
  const {
    reportData,
    generatingReport,
    generateReport,
    error,
    navigateToOverview,
    navigateToTimeline,
  } = useProcess();

  const [months, setMonths] = useState(12);
  const [format, setFormat] = useState("json");
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Process", href: "/process" },
    { label: "Report", href: "" },
  ];

  // Handle generate report
  const handleGenerateReport = async () => {
    await generateReport({ months, format });
    if (!error) {
      setShowExportOptions(true);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!reportData) return;

    let content = "";
    let mimeType = "";
    let extension = "";

    if (format === "json") {
      content = JSON.stringify(reportData, null, 2);
      mimeType = "application/json";
      extension = "json";
    } else if (format === "csv") {
      // Convert to CSV
      const headers = [
        "Feature",
        "Month",
        "Progress %",
        "Status",
        "Created At",
        "Updated At",
      ];
      const rows =
        reportData.monthlyTimeline?.map((entry) => [
          entry.feature_name || "",
          entry.month_year || "",
          entry.progress_percentage || 0,
          getProgressStatus(entry.progress_percentage)?.label || "",
          entry.created_at || "",
          entry.updated_at || "",
        ]) || [];
      content = [headers.join(","), ...rows.map((row) => row.join(","))].join(
        "\n"
      );
      mimeType = "text/csv";
      extension = "csv";
    } else if (format === "pdf") {
      // For PDF, we'd need a PDF library - for now, fallback to JSON
      content = JSON.stringify(reportData, null, 2);
      mimeType = "application/json";
      extension = "json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `progress_report_${
      new Date().toISOString().split("T")[0]
    }.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format month
  const formatMonth = (monthYear) => {
    if (!monthYear) return "";
    const date = new Date(monthYear);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Progress Report</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Generate and export detailed progress reports
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={navigateToOverview}>
            <IconWrapper icon="📊" size="sm" />
            Overview
          </Button>
          <Button variant="outline" onClick={navigateToTimeline}>
            <IconWrapper icon="📋" size="sm" />
            Timeline
          </Button>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Report Configuration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Months to Include
            </label>
            <input
              type="number"
              min="1"
              max="36"
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Export Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {EXPORT_FORMATS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <Button
            variant="primary"
            onClick={handleGenerateReport}
            loading={generatingReport}
            disabled={generatingReport}
            className="w-full sm:w-auto"
          >
            <IconWrapper icon="📊" size="sm" />
            {generatingReport ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="error" title="Error generating report">
          {error}
        </Alert>
      )}

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6">
          {/* Report Summary */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold">Report Summary</h2>
              <Badge variant="success" className="text-sm">
                Generated {formatDate(reportData.generatedAt)}
              </Badge>
            </div>

            {/* Project Info */}
            {reportData.project && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Project</p>
                  <p className="font-medium">{reportData.project.name}</p>
                </div>
                <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Status</p>
                  <p className="font-medium">{reportData.project.status}</p>
                </div>
                <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-500">Completion</p>
                  <p className="font-medium text-primary-500">
                    {reportData.project.completion}%
                  </p>
                </div>
              </div>
            )}

            {/* Summary Stats */}
            {reportData.summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-500">
                    {reportData.summary.overallProgress}%
                  </p>
                  <p className="text-xs text-neutral-500">Overall Progress</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {reportData.summary.totalFeatures}
                  </p>
                  <p className="text-xs text-neutral-500">Total Features</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">
                    {reportData.summary.completedFeatures}
                  </p>
                  <p className="text-xs text-neutral-500">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {reportData.summary.completionRate}%
                  </p>
                  <p className="text-xs text-neutral-500">Completion Rate</p>
                </div>
              </div>
            )}
          </div>

          {/* Statistics */}
          {reportData.statistics && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
              <h2 className="text-lg font-semibold mb-4">Statistics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Total Entries</p>
                  <p className="text-xl font-bold">
                    {reportData.statistics.totalEntries}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Date Range</p>
                  <p className="text-sm">
                    {formatMonth(reportData.statistics.dateRange?.from)} -{" "}
                    {formatMonth(reportData.statistics.dateRange?.to)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Unique Features</p>
                  <p className="text-xl font-bold">
                    {reportData.statistics.features}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Feature Breakdown */}
          {reportData.featureBreakdown && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
              <h2 className="text-lg font-semibold mb-4">Feature Breakdown</h2>
              <div className="space-y-3">
                {Object.entries(reportData.featureBreakdown).map(
                  ([feature, progress]) => (
                    <div key={feature} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{feature}</span>
                        <span className="text-primary-500 font-medium">
                          {progress}%
                        </span>
                      </div>
                      <ProgressBar
                        value={progress}
                        max={100}
                        variant={getProgressStatus(progress).class}
                        size="sm"
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Monthly Timeline */}
          {reportData.monthlyTimeline && (
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
              <h2 className="text-lg font-semibold mb-4">Monthly Timeline</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="text-left py-2 font-medium text-neutral-500">
                        Feature
                      </th>
                      <th className="text-left py-2 font-medium text-neutral-500">
                        Month
                      </th>
                      <th className="text-right py-2 font-medium text-neutral-500">
                        Progress
                      </th>
                      <th className="text-right py-2 font-medium text-neutral-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.monthlyTimeline
                      .slice(0, 20)
                      .map((entry, index) => (
                        <tr
                          key={index}
                          className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                          <td className="py-2 font-medium">
                            {entry.feature_name}
                          </td>
                          <td className="py-2">
                            {formatMonth(entry.month_year)}
                          </td>
                          <td className="py-2 text-right font-medium text-primary-500">
                            {entry.progress_percentage}%
                          </td>
                          <td className="py-2 text-right">
                            <Badge
                              variant={
                                getProgressStatus(entry.progress_percentage)
                                  ?.class || "neutral"
                              }
                              className="text-xs"
                            >
                              {
                                getProgressStatus(entry.progress_percentage)
                                  ?.label
                              }
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {reportData.monthlyTimeline.length > 20 && (
                  <p className="text-xs text-neutral-500 mt-2">
                    Showing first 20 of {reportData.monthlyTimeline.length}{" "}
                    entries
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Download Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={handleDownload}>
              <IconWrapper icon="📥" size="sm" />
              Download Report ({format.toUpperCase()})
            </Button>
            <Button variant="outline" onClick={() => handleGenerateReport()}>
              <IconWrapper icon="🔄" size="sm" />
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressReport;
