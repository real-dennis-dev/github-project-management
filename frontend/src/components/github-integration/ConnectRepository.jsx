// src/components/github-integration/ConnectRepository.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Alert,
  LoadingSpinner,
  Switch,
  IconWrapper,
} from "../common";
import useGitHub from "../../hooks/useGitHub";
import { CONNECT_REPO_VALIDATION, WEBHOOK_EVENTS } from "./GitHubConstants";

const ConnectRepository = () => {
  const navigate = useNavigate();
  const { connectRepository, loading, error } = useGitHub();

  const [formData, setFormData] = useState({
    repoUrl: "",
    defaultBranch: "main",
    accessToken: "",
    setupWebhook: true,
    webhookEvents: ["push", "pull_request", "issues"],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle webhook events toggle
  const handleEventToggle = (event) => {
    setFormData((prev) => {
      const events = prev.webhookEvents.includes(event)
        ? prev.webhookEvents.filter((e) => e !== event)
        : [...prev.webhookEvents, event];
      return { ...prev, webhookEvents: events };
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const rules = CONNECT_REPO_VALIDATION;

    // Check repoUrl
    if (rules.repoUrl.required && !formData.repoUrl) {
      newErrors.repoUrl = rules.repoUrl.required;
    } else if (formData.repoUrl && rules.repoUrl.pattern) {
      if (!rules.repoUrl.pattern.value.test(formData.repoUrl)) {
        newErrors.repoUrl = rules.repoUrl.pattern.message;
      }
    }

    // Check accessToken
    if (rules.accessToken.minLength && !formData.accessToken) {
      newErrors.accessToken = "Access token is required";
    } else if (formData.accessToken && rules.accessToken.minLength) {
      if (formData.accessToken.length < rules.accessToken.minLength.value) {
        newErrors.accessToken = rules.accessToken.minLength.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        repoUrl: formData.repoUrl,
        defaultBranch: formData.defaultBranch,
        accessToken: formData.accessToken,
      };

      await connectRepository(data);

      // Navigate to repositories list on success
      navigate("/github/repositories");
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/github/repositories");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Connect GitHub Repository</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Connect a GitHub repository to your project
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Repository URL */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Repository URL <span className="text-error">*</span>
          </label>
          <Input
            name="repoUrl"
            type="url"
            value={formData.repoUrl}
            onChange={handleChange}
            placeholder="https://github.com/username/repository"
            error={errors.repoUrl}
            helper="Enter the full GitHub repository URL"
            fullWidth
          />
        </div>

        {/* Default Branch */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Default Branch
          </label>
          <Input
            name="defaultBranch"
            value={formData.defaultBranch}
            onChange={handleChange}
            placeholder="main"
            helper="The default branch of the repository (usually 'main' or 'master')"
            fullWidth
          />
        </div>

        {/* Access Token */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Personal Access Token <span className="text-error">*</span>
          </label>
          <Input
            name="accessToken"
            type="password"
            value={formData.accessToken}
            onChange={handleChange}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            error={errors.accessToken}
            helper={
              <span>
                Create a token with <strong>repo</strong> scope at{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline"
                >
                  GitHub Settings
                </a>
              </span>
            }
            fullWidth
          />
        </div>

        {/* Webhook Settings */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Setup Webhook</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Automatically setup webhook for real-time updates
              </p>
            </div>
            <Switch
              checked={formData.setupWebhook}
              onChange={(checked) =>
                setFormData((prev) => ({ ...prev, setupWebhook: checked }))
              }
              id="setupWebhook"
            />
          </div>

          {formData.setupWebhook && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Select events to listen for:
              </p>
              <div className="flex flex-wrap gap-2">
                {WEBHOOK_EVENTS.map((event) => (
                  <button
                    key={event.value}
                    type="button"
                    className={`px-3 py-1 text-sm rounded-full border transition-all ${
                      formData.webhookEvents.includes(event.value)
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 hover:border-primary-500"
                    }`}
                    onClick={() => handleEventToggle(event.value)}
                  >
                    {event.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="error" title="Connection Error">
            {error}
          </Alert>
        )}

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting || loading}
            disabled={isSubmitting || loading}
          >
            Connect Repository
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting || loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConnectRepository;
