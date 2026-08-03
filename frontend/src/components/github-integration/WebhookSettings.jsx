// src/components/github-integration/WebhookSettings.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Switch,
  Alert,
  LoadingSpinner,
  IconWrapper,
  Breadcrumb,
  Badge,
} from "../common";
import useGitHub from "../../hooks/useGitHub";
import {
  WEBHOOK_EVENTS,
  WEBHOOK_CONTENT_TYPES,
  DEFAULT_WEBHOOK_CONFIG,
} from "./GitHubConstants";

const WebhookSettings = () => {
  const { repositoryId } = useParams();
  const navigate = useNavigate();
  const { repository, loading, error, setupWebhook, navigateToRepository } =
    useGitHub();

  const [config, setConfig] = useState(DEFAULT_WEBHOOK_CONFIG);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [webhookData, setWebhookData] = useState(null);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "GitHub", href: "/github" },
    { label: "Repositories", href: "/github/repositories" },
    {
      label: repository?.repo_name || "Repository",
      href: `/github/repositories/${repositoryId}`,
    },
    { label: "Webhook Settings", href: "" },
  ];

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setConfig((prev) => ({ ...prev, [name]: val }));
  };

  // Handle event toggle
  const handleEventToggle = (event) => {
    setConfig((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await setupWebhook(config);
      setSuccess(true);
      setWebhookData(data);
    } catch (err) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigateToRepository(repositoryId);
  };

  if (loading && !repository) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Webhook Settings</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Configure GitHub webhooks for {repository?.repo_name}
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert variant="success" title="Webhook Setup Successful">
          <p>Webhook has been successfully configured for this repository.</p>
          {webhookData && (
            <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm">
              <p>
                <span className="font-medium">Webhook ID:</span>{" "}
                {webhookData.id}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <Badge variant={webhookData.active ? "success" : "neutral"}>
                  {webhookData.active ? "Active" : "Inactive"}
                </Badge>
              </p>
              <p>
                <span className="font-medium">Events:</span>{" "}
                {webhookData.events?.join(", ")}
              </p>
            </div>
          )}
          <div className="mt-4 flex items-center gap-2">
            <Button variant="primary" onClick={handleCancel}>
              View Repository
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false);
                setConfig(DEFAULT_WEBHOOK_CONFIG);
              }}
            >
              Setup Another
            </Button>
          </div>
        </Alert>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Webhook URL <span className="text-error">*</span>
            </label>
            <Input
              name="webhookUrl"
              type="url"
              value={config.webhookUrl}
              onChange={handleChange}
              placeholder="https://api.example.com/webhooks/github"
              helper="The URL that will receive GitHub webhook events"
              fullWidth
              required
            />
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Content Type
            </label>
            <select
              name="contentType"
              value={config.contentType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {WEBHOOK_CONTENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div>
              <p className="font-medium">Active</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Enable or disable the webhook
              </p>
            </div>
            <Switch
              checked={config.active}
              onChange={(checked) =>
                setConfig((prev) => ({ ...prev, active: checked }))
              }
              id="webhookActive"
            />
          </div>

          {/* Events Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Events</label>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Select which events to listen for
            </p>
            <div className="flex flex-wrap gap-2">
              {WEBHOOK_EVENTS.map((event) => (
                <button
                  key={event.value}
                  type="button"
                  className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                    config.events.includes(event.value)
                      ? "bg-primary-500 text-white border-primary-500"
                      : "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 hover:border-primary-500"
                  }`}
                  onClick={() => handleEventToggle(event.value)}
                >
                  {event.label}
                </button>
              ))}
            </div>
            {config.events.length === 0 && (
              <p className="text-xs text-error">
                Please select at least one event
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="error" title="Setup Error">
              {error}
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={
                isSubmitting || config.events.length === 0 || !config.webhookUrl
              }
            >
              Setup Webhook
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WebhookSettings;
