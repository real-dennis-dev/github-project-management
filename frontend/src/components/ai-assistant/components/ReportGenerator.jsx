// src/components/ai-assistant/components/ReportGenerator.jsx
import React, { useState } from "react";
import { Button, Select, Checkbox, Alert, LoadingSpinner } from "../../common";
import {
  DocumentTextIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

const ReportGenerator = ({ onGenerate, report, loading = false }) => {
  const [reportType, setReportType] = useState("comprehensive");
  const [format, setFormat] = useState("json");
  const [includeCharts, setIncludeCharts] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const reportTypes = [
    { value: "executive", label: "Executive Summary" },
    { value: "technical", label: "Technical Report" },
    { value: "risk", label: "Risk Report" },
    { value: "progress", label: "Progress Report" },
    { value: "comprehensive", label: "Comprehensive Report" },
  ];

  const formats = [
    { value: "json", label: "JSON" },
    { value: "markdown", label: "Markdown" },
    { value: "html", label: "HTML" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const options = {
      type: reportType,
      format,
      includeCharts,
    };

    if (startDate || endDate) {
      options.period = { startDate, endDate };
    }

    onGenerate(reportType, options);
  };

  const handleDownload = () => {
    if (!report) return;

    const content =
      typeof report === "string" ? report : JSON.stringify(report, null, 2);

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${reportType}-${Date.now()}.${
      format === "json" ? "json" : format
    }`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderReport = () => {
    if (!report) return null;

    if (typeof report === "string") {
      return (
        <div className="bg-neutral-50 p-4 rounded-lg overflow-auto max-h-96">
          <pre className="whitespace-pre-wrap text-sm">{report}</pre>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Report sections */}
        {report.sections &&
          report.sections.map((section, index) => (
            <div key={index} className="border-b pb-3 last:border-0">
              <h4 className="font-medium text-neutral-800">{section.title}</h4>
              <p className="text-sm text-neutral-600 mt-1">{section.content}</p>
            </div>
          ))}

        {/* Summary */}
        {report.summary && (
          <div className="p-3 bg-primary-50 rounded-lg">
            <h4 className="font-medium text-primary-800">Summary</h4>
            <p className="text-sm text-primary-700">{report.summary}</p>
          </div>
        )}

        {/* Metadata */}
        {report.generatedAt && (
          <div className="text-xs text-neutral-400 text-right">
            Generated: {new Date(report.generatedAt).toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="report-generator space-y-6">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Select
          label="Report Type"
          value={reportType}
          onChange={setReportType}
          options={reportTypes}
        />
        <Select
          label="Output Format"
          value={format}
          onChange={setFormat}
          options={formats}
        />
        <div className="flex items-center mt-2">
          <Checkbox
            checked={includeCharts}
            onChange={setIncludeCharts}
            label="Include Charts"
          />
        </div>
        <div className="flex gap-3 items-end">
          <Button type="submit" loading={loading} disabled={loading}>
            {loading ? "Generating..." : "Generate Report"}
          </Button>
          {report && (
            <Button
              variant="outline"
              onClick={handleDownload}
              icon={<ArrowDownTrayIcon className="w-4 h-4" />}
            >
              Download
            </Button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-neutral-700">
            Start Date (optional)
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">
            End Date (optional)
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading && (
        <div className="py-8 flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-neutral-500">Generating report...</p>
        </div>
      )}

      {report && !loading && (
        <div className="mt-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-primary-500" />
            Generated Report
          </h3>
          {renderReport()}
        </div>
      )}

      {!report && !loading && (
        <div className="text-center py-12 text-neutral-400">
          <DocumentTextIcon className="w-12 h-12 mx-auto mb-3" />
          <p>Configure report options and click "Generate Report"</p>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
