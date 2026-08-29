// src/components/decision-risks/components/DecisionForm.jsx
import React, { useState, useEffect } from "react";
import { useDecisionsRisks } from "../hooks/useDecisionsRisks";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Textarea } from "../../../components/common/Textarea";
import { Checkbox } from "../../../components/common/Checkbox";
import { Alert } from "../../../components/common/Alert";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import { Calendar, X } from "lucide-react";

const DecisionForm = ({
  projectId,
  decision = null,
  onSuccess,
  onCancel,
  isEdit = false,
}) => {
  const {
    createDecision,
    updateDecision,
    isCreatingDecision,
    isUpdatingDecision,
    error,
    clearError,
  } = useDecisionsRisks();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    decision: "",
    reason: "",
    impact: "medium",
    alternatives: "",
    decision_date: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (decision) {
      setFormData({
        title: decision.title || "",
        description: decision.description || "",
        decision: decision.decision || "",
        reason: decision.reason || "",
        impact: decision.impact || "medium",
        alternatives: decision.alternatives || "",
        decision_date: decision.decision_date || "",
      });
    }
  }, [decision]);

  useEffect(() => {
    if (error && submitted) {
      try {
        const parsed = JSON.parse(error);
        setValidationErrors(parsed);
      } catch {
        // Not a validation error
      }
    }
  }, [error, submitted]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setValidationErrors({});

    try {
      let response;
      if (isEdit && decision) {
        response = await updateDecision(decision.id, formData);
      } else {
        response = await createDecision(projectId, formData);
      }

      if (response?.success) {
        if (onSuccess) onSuccess(response.data);
      }
    } catch (err) {
      // Error is handled by the hook
      console.error("Form submission error:", err);
    }
  };

  const isLoading = isCreatingDecision || isUpdatingDecision;

  const impactOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && !validationErrors && <Alert variant="error">{error}</Alert>}

      <Input
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={validationErrors.title}
        required
        placeholder="Enter decision title"
        fullWidth
      />

      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={validationErrors.description}
        required
        placeholder="Describe the decision context"
        rows={3}
        fullWidth
      />

      <Textarea
        label="Decision"
        name="decision"
        value={formData.decision}
        onChange={handleChange}
        error={validationErrors.decision}
        required
        placeholder="What was decided?"
        rows={2}
        fullWidth
      />

      <Textarea
        label="Reason"
        name="reason"
        value={formData.reason}
        onChange={handleChange}
        error={validationErrors.reason}
        required
        placeholder="Why was this decision made?"
        rows={2}
        fullWidth
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Impact Level
          </label>
          <select
            name="impact"
            value={formData.impact}
            onChange={handleChange}
            className={`
              w-full px-3 py-2 rounded-lg border
              bg-neutral-50 dark:bg-neutral-800
              text-neutral-900 dark:text-neutral-100
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${
                validationErrors.impact
                  ? "border-error"
                  : "border-neutral-300 dark:border-neutral-600"
              }
            `}
          >
            {impactOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {validationErrors.impact && (
            <p className="mt-1 text-sm text-error">{validationErrors.impact}</p>
          )}
        </div>

        <Input
          label="Decision Date"
          name="decision_date"
          type="date"
          value={formData.decision_date}
          onChange={handleChange}
          error={validationErrors.decision_date}
          fullWidth
        />
      </div>

      <Textarea
        label="Alternatives Considered"
        name="alternatives"
        value={formData.alternatives}
        onChange={handleChange}
        error={validationErrors.alternatives}
        placeholder="List any alternatives that were considered"
        rows={2}
        fullWidth
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          {isEdit ? "Update Decision" : "Create Decision"}
        </Button>
      </div>
    </form>
  );
};

export default DecisionForm;
