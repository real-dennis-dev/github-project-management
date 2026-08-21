import React, { useState } from "react";
import useJournal from "../hooks/useJournal";
import {
  Button,
  Input,
  Card,
  Alert,
  LoadingSpinner,
  Radio,
  Badge,
} from "../../common";

const JournalExport = ({ projectId }) => {
  const { exportEntries, loading, error, clearError } = useJournal(projectId);

  const [format, setFormat] = useState("json");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    setExportSuccess(false);
    clearError();

    const dateRange = {};
    if (fromDate) dateRange.fromDate = fromDate;
    if (toDate) dateRange.toDate = toDate;

    try {
      const result = await exportEntries(format, dateRange);
      if (result !== false) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 5000);
      }
    } catch (err) {
      // Error handled by hook
      console.error("Export failed:", err);
    }
  };

  const handleFormatChange = (value) => {
    setFormat(value);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Export Journal Entries</h2>

      {error && (
        <Alert variant="error" className="mb-4" onClose={clearError}>
          {error}
        </Alert>
      )}

      {exportSuccess && (
        <Alert
          variant="success"
          className="mb-4"
          onClose={() => setExportSuccess(false)}
        >
          {format === "json"
            ? "Journal entries exported successfully as JSON"
            : "Journal entries exported successfully as CSV"}
        </Alert>
      )}

      <Card className="p-6 space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Export Format
          </label>
          <div className="flex gap-4">
            <Radio
              name="format"
              value="json"
              checked={format === "json"}
              onChange={(e) => handleFormatChange(e.target.value)}
              label={
                <span>
                  JSON{" "}
                  <Badge variant="neutral" size="sm" className="ml-1">
                    Structured
                  </Badge>
                </span>
              }
            />
            <Radio
              name="format"
              value="csv"
              checked={format === "csv"}
              onChange={(e) => handleFormatChange(e.target.value)}
              label={
                <span>
                  CSV{" "}
                  <Badge variant="neutral" size="sm" className="ml-1">
                    Spreadsheet
                  </Badge>
                </span>
              }
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            helper="Optional: Filter entries from this date"
          />
          <Input
            label="To Date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            helper="Optional: Filter entries up to this date"
          />
        </div>

        {/* Export Info */}
        <div className="bg-neutral-50 p-4 rounded-lg text-sm text-neutral-600 space-y-1">
          <p>📋 This will export all journal entries for this project.</p>
          <p>
            💾 {format === "json" ? "JSON format" : "CSV format"} will be
            downloaded.
          </p>
          {format === "csv" && (
            <p>📊 CSV includes: Date, Mood, Finished, Problems, Plan, Notes</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="primary"
            onClick={handleExport}
            loading={loading}
            disabled={loading}
          >
            {loading ? "Exporting..." : `Export as ${format.toUpperCase()}`}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setFromDate("");
              setToDate("");
              clearError();
            }}
            disabled={loading}
          >
            Reset Filters
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-sm text-neutral-500">
              Preparing your export...
            </span>
          </div>
        )}
      </Card>

      {/* Export Tips */}
      <Card className="p-4 mt-4 bg-blue-50 border-blue-200">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">
          💡 Export Tips
        </h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Use date filters to export specific time periods</li>
          <li>JSON format is best for data analysis and integration</li>
          <li>CSV format works well with Excel and Google Sheets</li>
          <li>All entries include mood, content, and metadata</li>
        </ul>
      </Card>
    </div>
  );
};

export default JournalExport;
