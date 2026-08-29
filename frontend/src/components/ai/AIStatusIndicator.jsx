// src/components/ai/AIStatusIndicator.jsx
import React, { useEffect } from "react";
import { useAI } from "../../hooks/useAI";
import { Badge, LoadingSpinner } from "../common";
import { CheckCircle, AlertCircle, XCircle, Loader } from "lucide-react";

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

  const getStatusIcon = () => {
    if (aiStatus.isFallback) {
      return <AlertCircle className="w-3 h-3" />;
    }
    return <CheckCircle className="w-3 h-3" />;
  };

  const getStatusVariant = () => {
    if (aiStatus.isFallback) return "warning";
    return "success";
  };

  const getStatusText = () => {
    if (aiStatus.isFallback) return "Fallback Mode";
    return "Online";
  };

  return (
    <div className="flex items-center space-x-4">
      <Badge
        variant={getStatusVariant()}
        className="flex items-center space-x-1"
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
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
