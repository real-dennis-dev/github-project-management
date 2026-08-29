import React, { useState } from "react";
import { Button, Select, Checkbox, LoadingSpinner, Alert } from "../common";
import { useAI } from "../../hooks/useAI";
import { useToast } from "../../hooks/useToast";
import { FileText, Download } from "lucide-react";

const ReportGenerator = ({ projectId }) => {
  const [reportType, setReportType] = useState("comprehensive");
  const [format, setFormat] = useState("json");
  const [includeCharts, setIncludeCharts] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const {
    generateReport,
    currentReport,
    isGeneratingReport,
    error,
    clearError,
  } = useAI();
  const { toast } = useToast();

  const reportTypes = [
    { value: "executive", label: "Executive" },
    { value: "technical", label: "Technical" },
    { value: "risk", label: "Risk" },
    { value: "progress", label: "Progress" },
    { value: "comprehensive", label: "Comprehensive" },
  ];

  const formats = [
    { value: "json", label: "JSON" },
    { value: "markdown", label: "Markdown" },
    { value: "html", label: "HTML" },
  ];

  const handleGenerate = async () => {
    const data = {
      type: reportType,
      format,
      includeCharts,
    };

    if (startDate || endDate) {
      data.period = {};
      if (startDate) data.period.startDate = startDate;
      if (endDate) data.period.endDate = endDate;
    }

    try {
      const result = await generateReport(projectId, data);
      if (result.success) {
        toast.success("Report generated successfully");
      }
    } catch (err) {
      toast.error(err.message || "Failed to generate report");
    }
  };

  const handleDownload = () => {
    if (!currentReport) return;

    let content = "";
    let filename = `report-${reportType}-${new Date()
      .toISOString()
      .slice(0, 10)}`;

    if (format === "json") {
      content = JSON.stringify(currentReport, null, 2);
      filename += ".json";
    } else if (format === "markdown") {
      content =
        typeof currentReport === "string"
          ? currentReport
          : JSON.stringify(currentReport, null, 2);
      filename += ".md";
    } else if (format === "html") {
      content =
        typeof currentReport === "string"
          ? currentReport
          : JSON.stringify(currentReport, null, 2);
      filename += ".html";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Generate Report</h2>
        {currentReport && (
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

      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Report Type
            </label>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={reportTypes}
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
              options={formats}
              fullWidth
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-200 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-200 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <Checkbox
            id="includeCharts"
            label="Include charts and visualizations"
            checked={includeCharts}
            onChange={() => setIncludeCharts(!includeCharts)}
          />
        </div>

        <Button
          onClick={handleGenerate}
          loading={isGeneratingReport}
          disabled={isGeneratingReport}
          variant="primary"
          fullWidth
          className="mt-4"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {isGeneratingReport && <LoadingSpinner size="lg" className="my-8" />}

      {currentReport && !isGeneratingReport && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">
              Generated Report
            </h3>
            {currentReport.summary && (
              <div className="mb-4">
                <p className="text-sm text-neutral-500">Summary</p>
                <p className="text-neutral-700">{currentReport.summary}</p>
              </div>
            )}
            {currentReport.sections && (
              <div className="space-y-4">
                {currentReport.sections.map((section, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-neutral-800">
                      {section.title}
                    </h4>
                    <p className="text-neutral-600 mt-1">{section.content}</p>
                  </div>
                ))}
              </div>
            )}
            {currentReport.metrics && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(currentReport.metrics).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-2xl font-bold text-primary-500">
                      {value}
                    </p>
                    <p className="text-sm text-neutral-500 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {currentReport.generatedAt && (
              <p className="mt-4 text-xs text-neutral-500">
                Generated:{" "}
                {new Date(currentReport.generatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
