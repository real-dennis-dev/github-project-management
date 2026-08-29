// src/components/subscription/FeatureAccessCheck.jsx
import React, { useState } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import { useToast } from "../../hooks/useToast";
import { Button, Input, Alert, Badge } from "../common";
import { CheckCircle, XCircle, AlertCircle, Loader } from "lucide-react";

const FeatureAccessCheck = () => {
  const { checkFeatureAccess, isCheckingFeature, error, clearError } =
    useSubscription();
  const { toast } = useToast();
  const [featureName, setFeatureName] = useState("");
  const [accessResult, setAccessResult] = useState(null);

  const handleCheck = async () => {
    if (!featureName.trim()) {
      toast.error("Please enter a feature name");
      return;
    }

    try {
      const result = await checkFeatureAccess(featureName.trim());
      setAccessResult(result.data);
      if (result.data.allowed) {
        toast.success(`Feature "${featureName}" is accessible`);
      } else {
        toast.warning(`Feature "${featureName}" is not accessible`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to check feature access");
    }
  };

  const handleClear = () => {
    setFeatureName("");
    setAccessResult(null);
    clearError();
  };

  const getAccessIcon = () => {
    if (!accessResult) return null;
    if (accessResult.allowed) {
      return <CheckCircle className="w-12 h-12 text-success" />;
    }
    return <XCircle className="w-12 h-12 text-error" />;
  };

  const getAccessVariant = () => {
    if (!accessResult) return "neutral";
    return accessResult.allowed ? "success" : "error";
  };

  const getAccessLabel = () => {
    if (!accessResult) return "";
    return accessResult.allowed ? "Access Granted" : "Access Denied";
  };

  const getUsageStatus = () => {
    if (!accessResult) return null;
    if (accessResult.unlimited) {
      return <Badge variant="success">Unlimited</Badge>;
    }
    if (accessResult.maxCount === 0) {
      return <Badge variant="neutral">Not Available</Badge>;
    }
    const remaining = accessResult.remaining || 0;
    if (remaining <= 0) {
      return <Badge variant="error">Exhausted</Badge>;
    }
    if (remaining <= accessResult.maxCount * 0.2) {
      return <Badge variant="warning">Low: {remaining} remaining</Badge>;
    }
    return <Badge variant="info">{remaining} remaining</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Feature Access Check
        </h2>
        <p className="text-sm text-neutral-500 mb-4">
          Check if you have access to a specific feature based on your current
          subscription.
        </p>

        {error && (
          <Alert variant="error" onClose={clearError}>
            {error}
          </Alert>
        )}

        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              label="Feature Name"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              placeholder="e.g., projects, team_members, api_access"
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              fullWidth
            />
          </div>
          <Button
            onClick={handleCheck}
            loading={isCheckingFeature}
            disabled={isCheckingFeature || !featureName.trim()}
            variant="primary"
            className="mb-0.5"
          >
            Check Access
          </Button>
          {accessResult && (
            <Button onClick={handleClear} variant="ghost" className="mb-0.5">
              Clear
            </Button>
          )}
        </div>
      </div>

      {accessResult && (
        <div
          className={`bg-neutral-100 border-2 rounded-lg p-6 ${
            accessResult.allowed ? "border-success" : "border-error"
          }`}
        >
          <div className="flex items-start space-x-4">
            {getAccessIcon()}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-neutral-900">
                  {getAccessLabel()}
                </h3>
                <Badge variant={getAccessVariant()} size="lg">
                  {accessResult.allowed ? "Allowed" : "Not Allowed"}
                </Badge>
              </div>

              {accessResult.message && (
                <p className="mt-2 text-neutral-600">{accessResult.message}</p>
              )}

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Used</p>
                  <p className="text-lg font-medium text-neutral-900">
                    {accessResult.usage || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Max</p>
                  <p className="text-lg font-medium text-neutral-900">
                    {accessResult.unlimited ? "∞" : accessResult.maxCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Remaining</p>
                  <p className="text-lg font-medium text-neutral-900">
                    {accessResult.unlimited ? "∞" : accessResult.remaining || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Status</p>
                  <div className="mt-1">{getUsageStatus()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-neutral-200 rounded-lg p-4">
        <p className="text-sm text-neutral-500">
          <strong>Common feature names:</strong> projects, team_members,
          storage_gb, api_calls, api_access, advanced_analytics,
          team_collaboration, custom_domains, priority_support
        </p>
      </div>
    </div>
  );
};

export default FeatureAccessCheck;
