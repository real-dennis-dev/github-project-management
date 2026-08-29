// src/components/techdebt/TechDebtForm.jsx
import React, { useState } from "react";
import { useTechDebt } from "../../hooks/useTechDebt";
import { useToast } from "../../hooks/useToast";
import { Button, Input, Textarea, Select, Alert } from "../common";
import TechDebtPriorityBadge from "./TechDebtPriorityBadge";
import TechDebtStatusBadge from "./TechDebtStatusBadge";

const TechDebtForm = ({ projectId, onSuccess, initialData }) => {
  const { createItem, updateItem, isLoading, error, clearError } =
    useTechDebt();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    reason: initialData?.reason || "",
    impact: initialData?.impact || "",
    priority: initialData?.priority || "medium",
    status: initialData?.status || "identified",
    estimated_effort_hours: initialData?.estimated_effort_hours || 0,
  });

  const [validationErrors, setValidationErrors] = useState({});

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const statusOptions = [
    { value: "identified", label: "Identified" },
    { value: "planned", label: "Planned" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "ignored", label: "Ignored" },
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    clearError();

    try {
      let result;
      if (initialData?.id) {
        result = await updateItem(initialData.id, formData);
      } else {
        result = await createItem(projectId, formData);
      }

      if (result.success) {
        toast.success(
          initialData?.id
            ? "Tech debt updated successfully"
            : "Tech debt created successfully"
        );
        if (onSuccess) {
          onSuccess(result.data);
        }
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter a descriptive title"
        required
        fullWidth
      />

      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Describe the technical debt in detail"
        rows={4}
        required
        fullWidth
      />

      <Textarea
        label="Reason"
        name="reason"
        value={formData.reason}
        onChange={handleChange}
        placeholder="Why does this technical debt exist?"
        rows={3}
        required
        fullWidth
      />

      <Textarea
        label="Impact"
        name="impact"
        value={formData.impact}
        onChange={handleChange}
        placeholder="What is the impact of this technical debt?"
        rows={3}
        fullWidth
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions}
            fullWidth
          />
          <div className="mt-1">
            <TechDebtPriorityBadge priority={formData.priority} />
          </div>
        </div>

        <div>
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            fullWidth
          />
          <div className="mt-1">
            <TechDebtStatusBadge status={formData.status} />
          </div>
        </div>

        <div>
          <Input
            label="Estimated Effort (hours)"
            name="estimated_effort_hours"
            type="number"
            min="0"
            value={formData.estimated_effort_hours}
            onChange={handleChange}
            fullWidth
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={isLoading}
        disabled={isLoading}
        fullWidth
      >
        {initialData?.id ? "Update Tech Debt" : "Create Tech Debt"}
      </Button>
    </form>
  );
};

export default TechDebtForm;
