// src/components/decision-risks/DecisionCreate.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input, Textarea, Select, Alert } from "../common";
import { useDecisions, IMPACT_LEVELS } from "../../hooks/useDecisionRisk";

const DecisionCreate = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { createDecision, loading, error } = useDecisions(projectId);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.decision.trim()) errors.decision = "Decision is required";
    if (!formData.reason.trim()) errors.reason = "Reason is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const data = {
      ...formData,
      decision_date: formData.decision_date || null,
    };

    const result = await createDecision(data);
    if (result) {
      navigate("/decisions");
    }
  };

  const impactOptions = IMPACT_LEVELS.map((level) => ({
    value: level,
    label: level.charAt(0).toUpperCase() + level.slice(1),
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">New Decision</h1>
        <p className="text-neutral-500">
          Document an important project decision
        </p>
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
          placeholder="Enter decision title"
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={validationErrors.description}
          placeholder="Describe the context and need for this decision"
          rows={3}
          required
        />

        <Textarea
          label="Decision"
          name="decision"
          value={formData.decision}
          onChange={handleChange}
          error={validationErrors.decision}
          placeholder="What was decided?"
          rows={2}
          required
        />

        <Textarea
          label="Reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          error={validationErrors.reason}
          placeholder="Why was this decision made?"
          rows={2}
          required
        />

        <Select
          label="Impact"
          name="impact"
          value={formData.impact}
          onChange={handleChange}
          options={impactOptions}
          helper="Select the impact level of this decision"
        />

        <Textarea
          label="Alternatives"
          name="alternatives"
          value={formData.alternatives}
          onChange={handleChange}
          placeholder="What alternatives were considered?"
          rows={2}
        />

        <Input
          label="Decision Date"
          name="decision_date"
          type="date"
          value={formData.decision_date}
          onChange={handleChange}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" loading={loading}>
            Create Decision
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/decisions")}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DecisionCreate;
