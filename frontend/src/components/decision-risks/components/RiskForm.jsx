// src/components/decision-risks/components/RiskForm.jsx
import React, { useState, useEffect } from "react";
import { useDecisionsRisks } from "../hooks/useDecisionsRisks";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Textarea } from "../../../components/common/Textarea";
import { Alert } from "../../../components/common/Alert";

const RiskForm = ({
  projectId,
  risk = null,
  onSuccess,
  onCancel,
  isEdit = false,
}) => {
  const {
    createRisk,
    updateRisk,
    isCreatingRisk,
    isUpdatingRisk,
    error,
    clearError,
  } = useDecisionsRisks();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    risk_level: "medium",
    status: "identified",
    reason: "",
    mitigation: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (risk) {
      setFormData({
        title: risk.title || "",
        description: risk.description || "",
        risk_level: risk.risk_level || "medium",
        status: risk.status || "identified",
        reason: risk.reason || "",
        mitigation: risk.mitigation || "",
      });
    }
  }, [risk]);

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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      if (isEdit && risk) {
        response = await updateRisk(risk.id, formData);
      } else {
        response = await createRisk(projectId, formData);
      }

      if (response?.success) {
        if (onSuccess) onSuccess(response.data);
      }
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  const isLoading = isCreatingRisk || isUpdatingRisk;

  const riskLevelOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const statusOptions = [
    { value: "identified", label: "Identified" },
    { value: "monitoring", label: "Monitoring" },
    { value: "mitigated", label: "Mitigated" },
    { value: "realized", label: "Realized" },
    { value: "closed", label: "Closed" },
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
        placeholder="Enter risk title"
        fullWidth
      />

      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        error={validationErrors.description}
        placeholder="Describe the risk"
        rows={3}
        fullWidth
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Risk Level
          </label>
          <select
            name="risk_level"
            value={formData.risk_level}
            onChange={handleChange}
            className={`
              w-full px-3 py-2 rounded-lg border
              bg-neutral-50 dark:bg-neutral-800
              text-neutral-900 dark:text-neutral-100
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${
                validationErrors.risk_level
                  ? "border-error"
                  : "border-neutral-300 dark:border-neutral-600"
              }
            `}
          >
            {riskLevelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {validationErrors.risk_level && (
            <p className="mt-1 text-sm text-error">
              {validationErrors.risk_level}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`
              w-full px-3 py-2 rounded-lg border
              bg-neutral-50 dark:bg-neutral-800
              text-neutral-900 dark:text-neutral-100
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${
                validationErrors.status
                  ? "border-error"
                  : "border-neutral-300 dark:border-neutral-600"
              }
            `}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {validationErrors.status && (
            <p className="mt-1 text-sm text-error">{validationErrors.status}</p>
          )}
        </div>
      </div>

      <Textarea
        label="Reason"
        name="reason"
        value={formData.reason}
        onChange={handleChange}
        error={validationErrors.reason}
        placeholder="Why is this a risk?"
        rows={2}
        fullWidth
      />

      <Textarea
        label="Mitigation Strategy"
        name="mitigation"
        value={formData.mitigation}
        onChange={handleChange}
        error={validationErrors.mitigation}
        placeholder="How will this risk be mitigated?"
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
          {isEdit ? "Update Risk" : "Create Risk"}
        </Button>
      </div>
    </form>
  );
};

export default RiskForm;
