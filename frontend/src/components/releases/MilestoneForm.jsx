// src/components/releases/MilestoneForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReleases } from "../../hooks/useReleases";
import { Button, Input, Textarea, Select, Alert } from "../common";
import { useToast } from "../../hooks/useToast";
import { Save, X } from "lucide-react";

const MilestoneForm = ({ projectId, editMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    createMilestone,
    updateMilestone,
    getMilestone,
    currentMilestone,
    isLoading,
    error,
    clearError,
  } = useReleases();

  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "not_started",
    target_date: "",
    completed_date: "",
    progress_percentage: 0,
  });

  const [validationErrors, setValidationErrors] = useState({});

  const statusOptions = [
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "delayed", label: "Delayed" },
  ];

  useEffect(() => {
    if (editMode && id) {
      getMilestone(id);
    }
  }, [editMode, id]);

  useEffect(() => {
    if (editMode && currentMilestone) {
      setFormData({
        name: currentMilestone.name || "",
        description: currentMilestone.description || "",
        status: currentMilestone.status || "not_started",
        target_date: currentMilestone.target_date || "",
        completed_date: currentMilestone.completed_date || "",
        progress_percentage: currentMilestone.progress_percentage || 0,
      });
    }
  }, [currentMilestone, editMode]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      let result;
      if (editMode && id) {
        result = await updateMilestone(id, formData);
        if (result.success) {
          toast.success("Milestone updated successfully");
          navigate(`/milestones/${id}`);
        }
      } else {
        result = await createMilestone(projectId, formData);
        if (result.success) {
          toast.success("Milestone created successfully");
          navigate(`/projects/${projectId}/milestones`);
        }
      }
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 space-y-4">
        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter milestone name"
          required
          error={validationErrors.name}
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the milestone..."
          rows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />
          <Input
            label="Progress Percentage"
            name="progress_percentage"
            type="number"
            min="0"
            max="100"
            value={formData.progress_percentage}
            onChange={handleChange}
            helper="0-100%"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Target Date"
            name="target_date"
            type="date"
            value={formData.target_date}
            onChange={handleChange}
            required
            error={validationErrors.target_date}
          />
          <Input
            label="Completed Date"
            name="completed_date"
            type="date"
            value={formData.completed_date}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          {editMode ? "Update Milestone" : "Create Milestone"}
        </Button>
      </div>
    </form>
  );
};

export default MilestoneForm;
