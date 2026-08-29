// src/components/progress-timeline/ProgressReport.jsx
import React, { useState } from "react";
import { useProgress } from "../../hooks/useProgress";
import { useToast } from "../../hooks/useToast";
import { Button, Select, LoadingSpinner, Alert, Badge } from "../common";
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
} from "lucide-react";

const ProgressReport = ({ projectId }) => {
  const [months, setMonths] = useState(12);
  const [format, setFormat] = useState("json");
  const {
    getProgressReport,
    progressReport,
    isReportLoading,
    error,
    clearError,
  } = useProgress();
  const { toast } = useToast();

  const monthsOptions = [
    { value: 3, label: "3 Months" },
    { value: 6, label: "6 Months" },
    { value: 12, label: "12 Months" },
    { value: 24, label: "24 Months" },
  ];

  const formatOptions = [
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
    { value: "pdf", label: "PDF" },
  ];

  const handleGenerate = async () => {
    try {
      const result = await getProgressReport(projectId, { months, format });
      if (result.success) {
        toast.success("Report generated successfully");
      }
    } catch (err) {
      toast.error(err.message || "Failed to generate report");
    }
  };

  const handleDownload = () => {
    if (!progressReport) return;

    let content = "";
    let filename = `progress-report-${new Date().toISOString().slice(0, 10)}`;

    if (format === "json") {
      content = JSON.stringify(progressReport, null, 2);
      filename += ".json";
    } else if (format === "csv") {
      // Simple CSV conversion - in real app, use a proper CSV library
      const rows = [];
      if (progressReport.monthlyTimeline) {
        rows.push(["Month", "Feature", "Progress"]);
        progressReport.monthlyTimeline.forEach((entry) => {
          rows.push([entry.month, entry.feature, entry.progress]);
        });
      }
      content = rows.map((row) => row.join(",")).join("\n");
      filename += ".csv";
    } else {
      content = JSON.stringify(progressReport, null, 2);
      filename += ".pdf";
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isReportLoading) {
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
        <h2 className="text-xl font-bold text-neutral-900">Progress Report</h2>
        {progressReport && (
          <Button
            variant="secondary"
            onClick={handleDownload}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </Button>
        )}
      </div>

      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Time Period
            </label>
            <Select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              options={monthsOptions}
              fullWidth
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Output Format
            </label>
            <Select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              options={formatOptions}
              fullWidth
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          loading={isReportLoading}
          disabled={isReportLoading}
          variant="primary"
          fullWidth
          className="mt-4"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {progressReport && (
        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {progressReport.project?.name}
                </h3>
                <p className="text-sm text-neutral-500">
                  Status: {progressReport.project?.status}
                </p>
              </div>
              <Badge variant="info" size="lg">
                {progressReport.project?.completion}% Complete
              </Badge>
            </div>
            {progressReport.generatedAt && (
              <p className="text-xs text-neutral-500 mt-2">
                Generated:{" "}
                {new Date(progressReport.generatedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Summary */}
          {progressReport.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(progressReport.summary).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center"
                >
                  <p className="text-2xl font-bold text-primary-500">
                    {typeof value === "number" && key.includes("Rate")
                      ? `${value}%`
                      : value}
                  </p>
                  <p className="text-sm text-neutral-500 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Feature Breakdown */}
          {progressReport.featureBreakdown && (
            <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Feature Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(progressReport.featureBreakdown).map(
                  ([feature, data]) => {
                    const progress =
                      typeof data === "number" ? data : data?.progress || 0;
                    return (
                      <div key={feature}>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-700">{feature}</span>
                          <span className="text-neutral-900 font-medium">
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
                  }
                )}
              </div>
            </div>
          )}

          {/* Statistics */}
          {progressReport.statistics && (
            <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-500">
                    {progressReport.statistics.totalEntries}
                  </p>
                  <p className="text-sm text-neutral-500">Total Entries</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-500">
                    {progressReport.statistics.features}
                  </p>
                  <p className="text-sm text-neutral-500">Features</p>
                </div>
                {progressReport.statistics.dateRange && (
                  <>
                    <div className="text-center">
                      <p className="text-sm font-medium text-neutral-900">
                        {progressReport.statistics.dateRange.from}
                      </p>
                      <p className="text-sm text-neutral-500">From</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-neutral-900">
                        {progressReport.statistics.dateRange.to}
                      </p>
                      <p className="text-sm text-neutral-500">To</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressReport;
