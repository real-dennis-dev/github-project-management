// src/components/decision-risks/RiskCreate.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input, Textarea, Select, Alert } from "../common";
import {
  useRisks,
  RISK_LEVELS,
  RISK_STATUSES,
} from "../../hooks/useDecisionRisk";

const RiskCreate = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { createRisk, loading, error } = useRisks(projectId);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    risk_level: "medium",
    status: "identified",
    reason: "",
    mitigation: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const result = await createRisk(formData);
    if (result) {
      navigate("/risks");
    }
  };

  const levelOptions = RISK_LEVELS.map((level) => ({
    value: level,
    label: level.charAt(0).toUpperCase() + level.slice(1),
  }));

  const statusOptions = RISK_STATUSES.map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">New Risk</h1>
        <p className="text-neutral-500">Identify and document a project risk</p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={validationErrors.title}
          placeholder="Enter risk title"
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the risk in detail"
          rows={3}
        />

        <Select
          label="Risk Level"
          name="risk_level"
          value={formData.risk_level}
          onChange={handleChange}
          options={levelOptions}
          helper="How severe is this risk?"
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          helper="Current status of this risk"
        />

        <Textarea
          label="Reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Why is this a risk?"
          rows={2}
        />

        <Textarea
          label="Mitigation Strategy"
          name="mitigation"
          value={formData.mitigation}
          onChange={handleChange}
          placeholder="How can this risk be mitigated?"
          rows={2}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" loading={loading}>
            Create Risk
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/risks")}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RiskCreate;
