// src/components/journal/JournalExport.jsx
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useJournal } from "../../hooks/useJournal";
import { Button, Input, Alert, Badge } from "../common";
import {
  ArrowLeft,
  Download,
  FileJson,
  FileSpreadsheet,
  Calendar,
  Filter,
} from "lucide-react";

const JournalExport = () => {
  const { projectId } = useParams();
  const { isExporting, exportEntries, getMoodLabel } = useJournal(projectId);

  const [format, setFormat] = useState("json");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setError("");
    setIsSuccess(false);

    try {
      const params = { format };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      await exportEntries(params);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to export journal entries");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/projects/${projectId}/journal`}>
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-800">
            Export Journal
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Export your journal entries in your preferred format
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {isSuccess && (
        <Alert variant="success" className="mb-6">
          Journal exported successfully! The file should start downloading
          shortly.
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Export Options */}
      <div className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-300 p-6 space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-600 mb-2">
            Export Format
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormat("json")}
              className={`
                flex items-center gap-3 px-6 py-4 rounded-lg border-2 transition-all flex-1
                ${
                  format === "json"
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-neutral-200 dark:border-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-400"
                }
              `}
            >
              <FileJson
                className={`w-6 h-6 ${
                  format === "json" ? "text-primary-500" : "text-neutral-400"
                }`}
              />
              <div className="text-left">
                <p className="font-medium text-neutral-900 dark:text-neutral-800">
                  JSON
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Raw data format
                </p>
              </div>
              {format === "json" && (
                <Badge variant="primary" size="sm" className="ml-auto">
                  Selected
                </Badge>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFormat("csv")}
              className={`
                flex items-center gap-3 px-6 py-4 rounded-lg border-2 transition-all flex-1
                ${
                  format === "csv"
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-neutral-200 dark:border-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-400"
                }
              `}
            >
              <FileSpreadsheet
                className={`w-6 h-6 ${
                  format === "csv" ? "text-primary-500" : "text-neutral-400"
                }`}
              />
              <div className="text-left">
                <p className="font-medium text-neutral-900 dark:text-neutral-800">
                  CSV
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Spreadsheet format
                </p>
              </div>
              {format === "csv" && (
                <Badge variant="primary" size="sm" className="ml-auto">
                  Selected
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-600 mb-2">
            Date Range (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-500 dark:text-neutral-400">
                From
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500 dark:text-neutral-400">
                To
              </label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Export Info */}
        <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-200">
          <p className="text-sm text-neutral-600 dark:text-neutral-500">
            <Filter className="w-4 h-4 inline mr-2" />
            This will export all journal entries. Optionally filter by date
            range.
          </p>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting}
          fullWidth
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : "Export Journal"}
        </Button>
      </div>

      {/* Help */}
      <div className="mt-6 p-4 rounded-lg bg-neutral-100 dark:bg-neutral-200">
        <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-600 mb-2">
          About Export Formats
        </h4>
        <ul className="text-sm text-neutral-600 dark:text-neutral-500 space-y-1">
          <li>
            <span className="font-medium">JSON</span> - Exports raw data in JSON
            format. Ideal for data analysis or importing into other
            applications.
          </li>
          <li>
            <span className="font-medium">CSV</span> - Exports data as a CSV
            file. Perfect for viewing in spreadsheets like Excel or Google
            Sheets.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default JournalExport;
