// src/components/ai/AIStatusIndicator.jsx
import React, { useEffect } from "react";
import { useAI } from "../../hooks/useAI";
import { Badge, LoadingSpinner } from "../common";
import { CheckCircle, AlertCircle } from "lucide-react";

const AIStatusIndicator = () => {
  const { getStatus, aiStatus, isStatusLoading, error } = useAI();

  useEffect(() => {
    getStatus();
  }, []);

  if (isStatusLoading) {
    return <LoadingSpinner size="sm" />;
  }

  if (error || !aiStatus) {
    return (
      <Badge variant="error" className="flex items-center space-x-1">
        <AlertCircle className="w-3 h-3" />
        <span>AI Unavailable</span>
      </Badge>
    );
  }

  const isFallback = Boolean(aiStatus.isFallback);

  return (
    <div className="flex items-center space-x-4">
      <Badge
        variant={isFallback ? "warning" : "success"}
        className="flex items-center space-x-1"
      >
        {isFallback ? (
          <AlertCircle className="w-3 h-3" />
        ) : (
          <CheckCircle className="w-3 h-3" />
        )}

        <span>{isFallback ? "Fallback Mode" : "Online"}</span>
      </Badge>

      {aiStatus.model && (
        <span className="text-sm text-neutral-500">{aiStatus.model}</span>
      )}

      {aiStatus.provider && (
        <span className="text-xs text-neutral-400">({aiStatus.provider})</span>
      )}
    </div>
  );
};

export default AIStatusIndicator;
