// src/components/expenses/ExpenseExport.jsx
import React, { useState } from "react";
import { Button, Select, Input, Alert } from "../common";
import { useExpenses } from "../../hooks/useExpenses";
import { useToast } from "../../hooks/useToast";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";

const ExpenseExport = ({ projectId }) => {
  const [format, setFormat] = useState("json");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const { exportExpenses } = useExpenses();
  const { toast } = useToast();

  const formatOptions = [
    { value: "json", label: "JSON", icon: FileJson },
    { value: "csv", label: "CSV", icon: FileSpreadsheet },
  ];

  const handleExport = async () => {
    setError(null);
    setIsExporting(true);

    try {
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      params.format = format;

      const result = await exportExpenses(projectId, params);

      if (result.success) {
        let content = "";
        let filename = `expenses-${new Date().toISOString().slice(0, 10)}`;

        if (format === "json") {
          content = JSON.stringify(result.data, null, 2);
          filename += ".json";
        } else if (format === "csv") {
          // Convert expenses to CSV
          const expenses = result.data?.expenses || [];
          if (expenses.length > 0) {
            const headers = [
              "Date",
              "Description",
              "Category",
              "Vendor",
              "Amount",
              "Recurring",
            ];
            const rows = expenses.map((exp) => [
              exp.expense_date || "",
              exp.description || "",
              exp.category || "",
              exp.vendor || "",
              exp.amount || 0,
              exp.recurring ? "Yes" : "No",
            ]);
            content = [
              headers.join(","),
              ...rows.map((row) => row.join(",")),
            ].join("\n");
          }
          filename += ".csv";
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

        toast.success(`Expenses exported as ${format.toUpperCase()}`);
      }
    } catch (err) {
      setError(err.message || "Failed to export expenses");
      toast.error(err.message || "Failed to export expenses");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900">
        Export Expenses
      </h3>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Export Format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          options={formatOptions.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
        />

        <Input
          label="From Date"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <Input
          label="To Date"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      <Button
        onClick={handleExport}
        loading={isExporting}
        disabled={isExporting}
        variant="primary"
        className="flex items-center space-x-2"
      >
        <Download className="w-4 h-4" />
        <span>Export {format.toUpperCase()}</span>
      </Button>
    </div>
  );
};

export default ExpenseExport;
