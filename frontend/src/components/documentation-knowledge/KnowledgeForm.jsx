// src/components/documentation-knowledge/KnowledgeForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDocumentationKnowledge } from "../../hooks/useDocumentationKnowledge";
import { useToast } from "../../hooks/useToast";
import { Button, Input, Textarea, Select, Alert, Badge } from "../common";
import { Save, X, Plus, Link as LinkIcon } from "lucide-react";

const KnowledgeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getKnowledgeItem,
    currentKnowledge,
    createKnowledge,
    updateKnowledge,
    isLoading,
    error,
    clearError,
    getCategories,
    categories,
    isCreatingKnowledge,
    isUpdatingKnowledge,
  } = useDocumentationKnowledge();
  const { toast } = useToast();

  const isEditing = !!id;

  const [formData, setFormData] = useState({
    category: "",
    topic: "",
    content: "",
    tags: [],
    related_links: [],
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [linkInput, setLinkInput] = useState("");

  useEffect(() => {
    getCategories();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      getKnowledgeItem(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentKnowledge && isEditing) {
      setFormData({
        category: currentKnowledge.category || "",
        topic: currentKnowledge.topic || "",
        content: currentKnowledge.content || "",
        tags: currentKnowledge.tags || [],
        related_links: currentKnowledge.related_links || [],
      });
    }
  }, [currentKnowledge]);

  const categoryOptions = [
    ...(categories?.map((cat) => ({
      value: cat.category,
      label: `${cat.category} (${cat.count})`,
    })) || []),
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleAddLink = () => {
    const link = linkInput.trim();
    if (link && !formData.related_links.includes(link)) {
      setFormData((prev) => ({
        ...prev,
        related_links: [...prev.related_links, link],
      }));
      setLinkInput("");
    }
  };

  const handleRemoveLink = (linkToRemove) => {
    setFormData((prev) => ({
      ...prev,
      related_links: prev.related_links.filter((link) => link !== linkToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    clearError();

    try {
      let result;
      if (isEditing) {
        result = await updateKnowledge(id, formData);
      } else {
        result = await createKnowledge(formData);
      }

      if (result.success) {
        toast.success(
          isEditing
            ? "Knowledge entry updated successfully"
            : "Knowledge entry created successfully"
        );
        navigate(`/documentation-knowledge/knowledge/${result.data.id}`);
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    navigate("/documentation-knowledge/knowledge");
  };

  const isSubmitting = isCreatingKnowledge || isUpdatingKnowledge;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">
          {isEditing ? "Edit Knowledge Entry" : "New Knowledge Entry"}
        </h2>
        {currentKnowledge?.category && (
          <Badge variant="info" size="lg">
            {currentKnowledge.category}
          </Badge>
        )}
      </div>

      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categoryOptions}
              error={validationErrors.category}
              required
              fullWidth
            />

            <Input
              label="Topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="Enter topic title"
              error={validationErrors.topic}
              required
              fullWidth
            />
          </div>

          <Textarea
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter knowledge content..."
            rows={8}
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

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Related Links
            </label>
            <div className="flex items-center space-x-2">
              <Input
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://example.com..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddLink}
                disabled={!linkInput.trim()}
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.related_links.map((link) => (
                <Badge
                  key={link}
                  variant="secondary"
                  className="flex items-center space-x-1"
                >
                  <span className="max-w-xs truncate">{link}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(link)}
                    className="hover:text-error transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
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

export default KnowledgeForm;
