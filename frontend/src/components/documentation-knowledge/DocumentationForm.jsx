// src/components/documentation-knowledge/DocumentationForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDocumentationKnowledge } from "../../hooks/useDocumentationKnowledge";
import { useToast } from "../../hooks/useToast";
import { Button, Input, Textarea, Select, Alert, Badge } from "../common";
import DocumentTypeBadge from "./DocumentTypeBadge";
import { Save, X, Plus } from "lucide-react";

const DocumentationForm = () => {
  const { id, projectId } = useParams();
  const navigate = useNavigate();
  const {
    getDocumentationItem,
    currentDocumentation,
    createDocumentation,
    updateDocumentation,
    isLoading,
    error,
    clearError,
    isCreatingDocumentation,
    isUpdatingDocumentation,
  } = useDocumentationKnowledge();
  const { toast } = useToast();

  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    doc_type: "other",
    tags: [],
    version: 1,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (isEditing && id) {
      getDocumentationItem(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentDocumentation && isEditing) {
      setFormData({
        title: currentDocumentation.title || "",
        content: currentDocumentation.content || "",
        doc_type: currentDocumentation.doc_type || "other",
        tags: currentDocumentation.tags || [],
        version: currentDocumentation.version || 1,
      });
    }
  }, [currentDocumentation]);

  const docTypeOptions = [
    { value: "api", label: "API" },
    { value: "erd", label: "ERD" },
    { value: "flowchart", label: "Flowchart" },
    { value: "user_manual", label: "User Manual" },
    { value: "technical", label: "Technical" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    clearError();

    try {
      let result;
      if (isEditing) {
        result = await updateDocumentation(id, formData);
      } else {
        if (!projectId) {
          toast.error("Project ID is required");
          return;
        }
        result = await createDocumentation(projectId, formData);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? "Documentation updated successfully"
            : "Documentation created successfully"
        );
        navigate(`/documentation-knowledge/documentation/${result.data.id}`);
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    navigate("/documentation-knowledge");
  };

  const isSubmitting = isCreatingDocumentation || isUpdatingDocumentation;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">
          {isEditing ? "Edit Documentation" : "New Documentation"}
        </h2>
        {currentDocumentation?.doc_type && (
          <DocumentTypeBadge type={currentDocumentation.doc_type} />
        )}
      </div>

      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 space-y-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter document title"
            error={validationErrors.title}
            required
            fullWidth
          />

          <Select
            label="Document Type"
            name="doc_type"
            value={formData.doc_type}
            onChange={handleChange}
            options={docTypeOptions}
            error={validationErrors.doc_type}
            required
            fullWidth
          />

          <Textarea
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter document content..."
            rows={10}
            error={validationErrors.content}
            required
            fullWidth
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Tags
            </label>
            <div className="flex items-center space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="primary"
                  className="flex items-center space-x-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-error transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {isEditing && (
            <Input
              label="Version"
              name="version"
              type="number"
              value={formData.version}
              onChange={handleChange}
              min="1"
              disabled
              helper="Version is auto-incremented on update"
              fullWidth
            />
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "Update" : "Create"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DocumentationForm;
