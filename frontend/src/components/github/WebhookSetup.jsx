// src/components/github/WebhookSetup.jsx
import React, { useState } from "react";
import { useGithub } from "../../hooks/useGithub";
import { useToast } from "../../hooks/useToast";
import {
  Button,
  Input,
  Checkbox,
  Alert,
  LoadingSpinner,
  EmptyState,
} from "../common";
import { Settings, Webhook, CheckCircle } from "lucide-react";

const WebhookSetup = ({ repositoryId }) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [events, setEvents] = useState(["push", "pull_request", "issues"]);
  const [active, setActive] = useState(true);
  const [contentType, setContentType] = useState("json");
  const [validationErrors, setValidationErrors] = useState({});
  const { setupWebhook, webhookConfig, isSettingWebhook, error, clearError } =
    useGithub();
  const { toast } = useToast();

  const eventOptions = [
    { id: "push", label: "Push" },
    { id: "pull_request", label: "Pull Requests" },
    { id: "issues", label: "Issues" },
    { id: "create", label: "Create" },
    { id: "delete", label: "Delete" },
    { id: "release", label: "Releases" },
    { id: "watch", label: "Watch" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    clearError();

    const data = {
      webhookUrl,
      events,
      active,
      contentType,
    };

    try {
      const result = await setupWebhook(repositoryId, data);
      if (result.success) {
        toast.success("Webhook setup successfully");
      }
    } catch (err) {
      // Errors handled by hook
    }
  };

  const handleEventToggle = (eventId) => {
    setEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    );
  };

  if (!repositoryId) {
    return (
      <EmptyState
        title="No repository selected"
        description="Select a repository from the list to set up webhooks."
        icon={<Webhook className="w-12 h-12 text-neutral-400" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Webhook Configuration
          </h3>
        </div>

        {error && (
          <Alert variant="error" onClose={clearError} className="mb-4">
            {error}
          </Alert>
        )}

        {webhookConfig && (
          <Alert variant="success" className="mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Webhook is already configured for this repository.</span>
            </div>
            <div className="mt-2 text-sm text-neutral-600">
              <p>Webhook ID: {webhookConfig.id}</p>
              <p>URL: {webhookConfig.url}</p>
              <p>Events: {webhookConfig.events?.join(", ")}</p>
              <p>Status: {webhookConfig.active ? "Active" : "Inactive"}</p>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Webhook URL"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://api.example.com/webhooks/github"
              error={validationErrors.webhookUrl}
              helper="The URL where GitHub will send webhook events"
              required
              fullWidth
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Events to listen for
            </label>
            <div className="flex flex-wrap gap-3">
              {eventOptions.map((option) => (
                <Checkbox
                  key={option.id}
                  id={`event-${option.id}`}
                  label={option.label}
                  checked={events.includes(option.id)}
                  onChange={() => handleEventToggle(option.id)}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Select which GitHub events should trigger this webhook
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-200 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="json">JSON</option>
                <option value="form">Form</option>
              </select>
            </div>
            <div className="flex items-end">
              <Checkbox
                id="active"
                label="Active"
                checked={active}
                onChange={() => setActive(!active)}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={isSettingWebhook}
            disabled={!webhookUrl.trim() || isSettingWebhook}
            fullWidth
            className="flex items-center justify-center gap-2"
          >
            <Webhook className="w-4 h-4" />
            {webhookConfig ? "Update Webhook" : "Setup Webhook"}
          </Button>
        </form>
      </div>

      {isSettingWebhook && <LoadingSpinner size="md" className="my-4" />}
    </div>
  );
};

export default WebhookSetup;
