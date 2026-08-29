// src/components/releases/ReleaseForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReleases } from "../../hooks/useReleases";
import { Button, Input, Textarea, Select, Alert } from "../common";
import { useToast } from "../../hooks/useToast";
import { Save, X } from "lucide-react";

const ReleaseForm = ({ projectId, editMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    createRelease,
    updateRelease,
    getRelease,
    currentRelease,
    isLoading,
    error,
    clearError,
  } = useReleases();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    version: "",
    description: "",
    status: "planned",
    release_date: "",
    features: [],
  });

  const [validationErrors, setValidationErrors] = useState({});

  const statusOptions = [
    { value: "planned", label: "Planned" },
    { value: "in_progress", label: "In Progress" },
    { value: "testing", label: "Testing" },
    { value: "released", label: "Released" },
    { value: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    if (editMode && id) {
      getRelease(id);
    }
  }, [editMode, id]);

  useEffect(() => {
    if (editMode && currentRelease) {
      setFormData({
        version: currentRelease.version || "",
        description: currentRelease.description || "",
        status: currentRelease.status || "planned",
        release_date: currentRelease.release_date || "",
        features: currentRelease.features || [],
      });
    }
  }, [currentRelease, editMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
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
        result = await updateRelease(id, formData);
        if (result.success) {
          toast.success("Release updated successfully");
          navigate(`/releases/${id}`);
        }
      } else {
        result = await createRelease(projectId, formData);
        if (result.success) {
          toast.success("Release created successfully");
          navigate(`/projects/${projectId}/releases`);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Version"
            name="version"
            value={formData.version}
            onChange={handleChange}
            placeholder="e.g., 1.0.0"
            required
            error={validationErrors.version}
            helper="Must follow semantic versioning (X.Y.Z)"
          />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            required
          />
        </div>

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the release..."
          rows={4}
        />

        <Input
          label="Release Date"
          name="release_date"
          type="date"
          value={formData.release_date}
          onChange={handleChange}
        />
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
          {editMode ? "Update Release" : "Create Release"}
        </Button>
      </div>
    </form>
  );
};

export default ReleaseForm;
