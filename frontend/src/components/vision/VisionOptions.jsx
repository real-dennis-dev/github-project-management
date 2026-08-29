// src/components/vision/VisionOptions.jsx
import React, { useEffect } from "react";
import { useVision } from "../../hooks/useVision";
import { LoadingSpinner, Alert, Badge } from "../common";

const VisionOptions = () => {
  const { getOptions, options, isOptionsLoading, error, clearError } =
    useVision();

  useEffect(() => {
    getOptions();
  }, []);

  if (isOptionsLoading && !options) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!options) {
    return null;
  }

  const { statuses, priorities, categories } = options;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-neutral-700 mb-2">
          Status Options
        </h4>
        <div className="flex flex-wrap gap-2">
          {statuses?.map((status) => (
            <Badge key={status.value} variant={status.color || "neutral"}>
              {status.label || status.value}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-neutral-700 mb-2">
          Priority Options
        </h4>
        <div className="flex flex-wrap gap-2">
          {priorities?.map((priority) => (
            <Badge
              key={priority.value}
              variant={
                priority.value >= 8
                  ? "error"
                  : priority.value >= 5
                  ? "warning"
                  : "neutral"
              }
            >
              {priority.label || priority.value}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-neutral-700 mb-2">
          Categories
        </h4>
        <div className="flex flex-wrap gap-2">
          {categories?.map((category) => (
            <Badge key={category} variant="secondary">
              {category}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisionOptions;
