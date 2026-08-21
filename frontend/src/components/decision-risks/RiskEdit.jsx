// src/components/decision-risks/RiskEdit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Input,
  Textarea,
  Select,
  Alert,
  LoadingSpinner,
} from "../common";
import {
  useRisks,
  RISK_LEVELS,
  RISK_STATUSES,
} from "../../hooks/useDecisionRisk";

const RiskEdit = () => {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const { getRisk, updateRisk, loading, error } = useRisks(projectId);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    risk_level: "medium",
    status: "identified",
    reason: "",
    mitigation: "",
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const response = await getRisk(id);
        if (response.success && response.data) {
          const data = response.data;
          setFormData({
            title: data.title || "",
            description: data.description || "",
            risk_level: data.risk_level || "medium",
            status: data.status || "identified",
            reason: data.reason || "",
            mitigation: data.mitigation || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch risk:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchRisk();
  }, [id, getRisk]);

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

    const result = await updateRisk(id, formData);
    if (result) {
      navigate("/risks");
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-neutral-900">Edit Risk</h1>
        <p className="text-neutral-500">Update risk details</p>
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
            Update Risk
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

export default RiskEdit;
