// src/components/subscription/FeatureUsageList.jsx
import React, { useEffect } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import { LoadingSpinner, Alert, ProgressBar, Badge } from "../common";
import { useToast } from "../../hooks/useToast";

const FeatureUsageList = () => {
  const { getFeatureUsage, featureUsage, isLoading, error, clearError } =
    useSubscription();
  const { toast } = useToast();

  useEffect(() => {
    getFeatureUsage();
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (featureUsage.length === 0) {
    return (
      <div className="text-center py-6 text-neutral-500">
        No feature usage data available.
      </div>
    );
  }

  const getUsagePercentage = (used, max) => {
    if (max === -1) return 100;
    if (!max || max === 0) return 0;
    return Math.min((used / max) * 100, 100);
  };

  const getVariant = (used, max) => {
    if (max === -1) return "success";
    const percentage = getUsagePercentage(used, max);
    if (percentage >= 90) return "error";
    if (percentage >= 70) return "warning";
    return "primary";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Feature Usage
        </h3>
        <Badge variant="info" size="sm">
          {featureUsage.length} features
        </Badge>
      </div>

      <div className="space-y-4">
        {featureUsage.map((usage) => {
          const { feature_name, used_count, max_count, reset_at } = usage;
          const percentage = getUsagePercentage(used_count, max_count);
          const isUnlimited = max_count === -1;

          return (
            <div key={feature_name} className="bg-neutral-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-neutral-800">
                  {feature_name.replace(/_/g, " ")}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-500">
                    {used_count} / {isUnlimited ? "∞" : max_count}
                  </span>
                  {isUnlimited && (
                    <Badge variant="success" size="sm">
                      Unlimited
                    </Badge>
                  )}
                </div>
              </div>
              <ProgressBar
                value={percentage}
                variant={getVariant(used_count, max_count)}
                size="sm"
              />
              {reset_at && (
                <p className="mt-1 text-xs text-neutral-500">
                  Resets: {new Date(reset_at).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureUsageList;
