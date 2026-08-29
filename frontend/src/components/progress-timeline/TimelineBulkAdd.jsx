// src/components/progress-timeline/TimelineBulkAdd.jsx
import React, { useState } from "react";
import { useProgress } from "../../hooks/useProgress";
import { useToast } from "../../hooks/useToast";
import { Button, Input, Textarea, Alert, Badge } from "../common";
import { Plus, Trash2, Upload } from "lucide-react";

const TimelineBulkAdd = ({ projectId, onSuccess }) => {
  const [entries, setEntries] = useState([
    { month_year: "", feature_name: "", progress_percentage: 0 },
  ]);
  const [validationErrors, setValidationErrors] = useState({});
  const { bulkAddTimelineEntries, isLoading, error, clearError } =
    useProgress();
  const { toast } = useToast();

  const addEntry = () => {
    setEntries([
      ...entries,
      { month_year: "", feature_name: "", progress_percentage: 0 },
    ]);
  };

  const removeEntry = (index) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: field === "progress_percentage" ? Number(value) : value,
    };
    setEntries(newEntries);
    // Clear validation error for this entry
    if (validationErrors[`entries[${index}].${field}`]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`entries[${index}].${field}`];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    clearError();

    // Filter out empty entries
    const validEntries = entries.filter(
      (e) =>
        e.month_year && e.feature_name && e.progress_percentage !== undefined
    );

    if (validEntries.length === 0) {
      toast.error("Please add at least one valid entry");
      return;
    }

    try {
      const result = await bulkAddTimelineEntries(projectId, {
        entries: validEntries,
      });
      if (result.success) {
        toast.success(
          `${
            result.data?.count || validEntries.length
          } entries added successfully`
        );
        setEntries([
          { month_year: "", feature_name: "", progress_percentage: 0 },
        ]);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      // Errors handled by useProgress hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div
            key={index}
            className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Badge variant="info" size="sm">
                Entry #{index + 1}
              </Badge>
              {entries.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEntry(index)}
                  className="text-error hover:text-error"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Month
                </label>
                <Input
                  type="month"
                  value={entry.month_year}
                  onChange={(e) =>
                    updateEntry(index, "month_year", e.target.value)
                  }
                  placeholder="YYYY-MM"
                  fullWidth
                  disabled={isLoading}
                  error={validationErrors[`entries[${index}].month_year`]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Feature Name
                </label>
                <Input
                  type="text"
                  value={entry.feature_name}
                  onChange={(e) =>
                    updateEntry(index, "feature_name", e.target.value)
                  }
                  placeholder="Enter feature name"
                  fullWidth
                  disabled={isLoading}
                  error={validationErrors[`entries[${index}].feature_name`]}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Progress (%)
                </label>
                <Input
                  type="number"
                  value={entry.progress_percentage}
                  onChange={(e) =>
                    updateEntry(index, "progress_percentage", e.target.value)
                  }
                  min="0"
                  max="100"
                  placeholder="0-100"
                  fullWidth
                  disabled={isLoading}
                  error={
                    validationErrors[`entries[${index}].progress_percentage`]
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={addEntry}
          disabled={isLoading || entries.length >= 50}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Entry
        </Button>
        <div className="flex space-x-3">
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading || entries.length === 0}
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Add
          </Button>
        </div>
      </div>

      {entries.length >= 50 && (
        <p className="text-xs text-warning">Maximum 50 entries per batch</p>
      )}
    </form>
  );
};

export default TimelineBulkAdd;
