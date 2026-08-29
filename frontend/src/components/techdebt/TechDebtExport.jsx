// src/components/techdebt/TechDebtExport.jsx
import React, { useState } from "react";
import { useTechDebt } from "../../hooks/useTechDebt";
import { useToast } from "../../hooks/useToast";
import { Button, Select, Alert, LoadingSpinner } from "../common";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";

const TechDebtExport = ({ projectId }) => {
  const [format, setFormat] = useState("json");
  const [isExporting, setIsExporting] = useState(false);
  const { error, clearError } = useTechDebt();
  const { toast } = useToast();

  const formatOptions = [
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    clearError();

    try {
      const response = await fetch(
        `/api/projects/${projectId}/tech-debt/export?format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const data = await response.json();

      if (data.success) {
        // Create download
        const blob = new Blob(
          [
            format === "json"
              ? JSON.stringify(data.data, null, 2)
              : convertToCSV(data.data),
          ],
          { type: format === "json" ? "application/json" : "text/csv" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tech-debt-export-${new Date()
          .toISOString()
          .slice(0, 10)}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Export completed successfully");
      }
    } catch (err) {
      toast.error(err.message || "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const rows = data.map((item) =>
      headers
        .map((header) => {
          const value = item[header];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value || "";
        })
        .join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  };

  return (
    <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Download className="w-6 h-6 text-primary-500" />
        <h3 className="text-lg font-semibold text-neutral-900">
          Export Tech Debt
        </h3>
      </div>

      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <Select
            label="Export Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={formatOptions}
            fullWidth
          />
        </div>

        <Button
          onClick={handleExport}
          loading={isExporting}
          disabled={isExporting}
          variant="primary"
          className="flex items-center space-x-2"
        >
          {format === "json" ? (
            <FileJson className="w-4 h-4" />
          ) : (
            <FileSpreadsheet className="w-4 h-4" />
          )}
          <span>Export {format.toUpperCase()}</span>
        </Button>
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        Exports all tech debt items for this project in the selected format.
      </p>
    </div>
  );
};

export default TechDebtExport;
